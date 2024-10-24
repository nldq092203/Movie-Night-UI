// ChatBox.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from '@mantine/core';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import { useAbly } from 'ably/react';
import Header from '../navigations/Header';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ChatChannelList from './ChatChannelList';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ChatInput from './ChatInput';
import RightSidebar from './RightSidebar';
import SearchDrawer from './SearchDrawer';

dayjs.extend(relativeTime);

const ChatBox = ({ clientId, theme, toggleTheme }) => {
  const colorScheme = theme.colorScheme;
  const ably = useAbly();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const currentUserEmail = clientId;
  const scrollRef = useRef(null);
  const messageGroupingThreshold = 5 * 60 * 1000;
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Search term state
  const [searchResults, setSearchResults] = useState([]); // Store search results
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(false);



  // Fetch channel details
  const fetchChatGroupDetail = async (channelName) => {
    if (!channelName) return;
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/chat-group/${channelName}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setChannelInfo(response.data);
      setLoading(false); // Stop loading once the data is fetched
    } catch (error) {
      console.error('Error fetching channel info:', error);
      setLoading(false); // Stop loading in case of error
    }
  };

  // Fetch messages
  const fetchMessages = async (channelName, pageNumber) => {
    if (!channelName || !pageNumber) return;

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/v1/chat-group/${channelName}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          params: { page: pageNumber },
        }
      );

      if (Array.isArray(response.data.results)) {
        const fetchedMessages = response.data.results.map((msg) => ({
          clientId: msg.author,
          data: msg.body,
          timestamp: msg.created,
        }));
        setMessages((prevMessages) => [...fetchedMessages.reverse(), ...prevMessages]);
        setHasMore(response.data.next !== null);
      } else {
        console.error('Invalid data format:', response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/v1/chat-group/${selectedChannel.group_name}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          params: { body: searchTerm },
        }
      );
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
// Scroll to the message when clicked
const handleScrollToMessage = (messageTimestamp) => {
  setSelectedMessageId(messageTimestamp);
  const messageElement = document.getElementById(`message-${messageTimestamp}`);
  
  // Ensure the message element exists and the scroll area reference is available
  if (messageElement && scrollRef.current) {
    const scrollArea = scrollRef.current;
    
    // Calculate the position of the message element relative to the scroll area
    const scrollTop = messageElement.offsetTop - scrollArea.scrollTop;

    // Scroll the scroll area viewport to the calculated position
    scrollArea.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }
};


  // Handle channel selection
  useEffect(() => {
    if (selectedChannel) {
      setMessages([]);
      setChannelInfo(null);
      setPage(1);
      fetchChatGroupDetail(selectedChannel.group_name);
    }
  }, [selectedChannel]);

  // Handle page changes
  useEffect(() => {
    if (selectedChannel && page) {
      fetchMessages(selectedChannel.group_name, page);
    }
  }, [page, selectedChannel]);

  // Handle auto-scroll to the bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load more messages when reaching the top
  const handleScroll = () => {
      if (scrollRef.current.scrollTop === 0 && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
  };


  // Handle sending a file through Ably
  const sendFile = async (file) => {
    if (selectedChannel && file) {
      const channel = ably.channels.get(selectedChannel.group_name);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const fileData = e.target.result;
        channel.publish({ name: 'file-transfer', data: { fileName: file.name, fileData } });
      };

      reader.readAsDataURL(file); // Convert file to base64 for transfer
    }
  };

  // Handle receiving a file
  const handleFileReceived = (message) => {
    const { fileName, fileData } = message.data;
    const fileBlob = new Blob([fileData], { type: 'application/octet-stream' });
    saveAs(fileBlob, fileName); // Automatically download the received file
  };
  
  // Ably subscription for real-time messages
  useEffect(() => {
    if (!selectedChannel || !ably) return;

    const channel = ably.channels.get(selectedChannel.group_name);

    const onMessage = (message) => {
      const newMessage = {
        clientId: message.clientId || message.connectionId,
        data: message.data,
        timestamp: message.timestamp || new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    channel.subscribe(onMessage);

    return () => {
      channel.unsubscribe(onMessage);
    };
  }, [selectedChannel, ably]);

  // Send message
  const sendMessage = () => {
    if (messageText.trim() && selectedChannel) {
      const channel = ably.channels.get(selectedChannel.group_name);
      channel.publish({ name: 'new-message', data: messageText });
      setMessageText('');
    }
  };

  // Group messages by user and timestamp
  const groupedMessages = [];
  let lastSender = null;
  let lastTime = null;
  let currentGroup = [];

  messages.forEach((msg, index) => {
    const senderEmail = msg.clientId || msg.author;
    const messageTime = new Date(msg.timestamp || msg.created);
    const isNewGroup =
      senderEmail !== lastSender ||
      (lastTime && messageTime - lastTime > messageGroupingThreshold);

    if (isNewGroup && currentGroup.length > 0) {
      groupedMessages.push({ sender: lastSender, time: lastTime, messages: currentGroup });
      currentGroup = [];
    }

    lastSender = senderEmail;
    lastTime = messageTime;
    currentGroup.push(msg);

    if (index === messages.length - 1) {
      groupedMessages.push({ sender: senderEmail, time: messageTime, messages: currentGroup });
    }
  });

  // Derive channel name based on members (excluding current user) if private
  const getChannelName = () => {
    if (!channelInfo || !channelInfo.is_private) {
      return channelInfo?.groupchat_name || "Unknown Channel";
    }

    const otherMembers = channelInfo.members?.filter(member => member.user !== currentUserEmail);
    if (otherMembers.length === 0) return "Private Chat";

    const otherMember = otherMembers[0];
    return otherMember.nickname || otherMember.name || otherMember.user;
  };
  const toggleDrawer = () => {
    setDrawerOpened(!drawerOpened); // Toggle the drawer on and off
  };
  const toggleSearchDrawer = () => {
    console.log(searchDrawerOpen)
    setSearchDrawerOpen(!searchDrawerOpen);
  };

  const drawerBackgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const dimmedTextColor = colorScheme === 'dark' ? '#cbcbcb' : '#555';

  // Format the timestamp (relative time)
  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).fromNow(); // Use dayjs to format the timestamp
  };

  const updateNickname = async (groupName, memberEmail, newNickname) => {
    console.log(memberEmail + newNickname)
    try {
      await axios.put(
        `${apiBaseUrl}/api/v1/membership/${groupName}/`,
        { member_email: memberEmail, nickname: newNickname },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      console.log('Nickname updated successfully');
    } catch (error) {
      console.error('Failed to update nickname:', error);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5',
      }}
    >
      {/* Header */}
      <div style={{ position: 'fixed', width: '100%', zIndex: 10 }}>
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Body */}
      <div
        className="overflow-hidden block pt-[90px] w-full h-screen"
        style={{ display: 'flex', flexGrow: 1 }}
      >
        {/* Sidebar */}
        <Box
          style={{
            width: '300px',
            backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#FFFFFF',
            borderRight: `1px solid ${colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'}`,
            padding: '1rem',
            height: '100%',
          }}
        >
          <ChatChannelList
            currentUserEmail={currentUserEmail}
            theme={theme}
            clientId={clientId}
            onSelectChannel={setSelectedChannel}
          />
        </Box>

        {/* Main Content */}
        {!selectedChannel ? (
          <Box
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colorScheme === 'dark' ? '#ffffff' : '#000',
              }}
            >
              Select a channel to start chatting
            </Text>
          </Box>
        ) : (
          <Box style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <ChatHeader
              selectedChannel={selectedChannel}
              getChannelName={getChannelName}
              colorScheme={colorScheme}
              toggleDrawer={toggleDrawer}
            />

            {/* Right Sidebar Drawer */}
            {channelInfo ? (
              <RightSidebar
                currentUserEmail={currentUserEmail}
                updateNickname={updateNickname}
                channelInfo={channelInfo}
                drawerOpened={drawerOpened}
                toggleDrawer={toggleDrawer}
                drawerBackgroundColor={drawerBackgroundColor}
                textColor={textColor}
                dimmedTextColor={dimmedTextColor}
                getChannelName={getChannelName}
                colorScheme={colorScheme}
                toggleSearchDrawer={toggleSearchDrawer}
              />
            ) : (
              <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : '#000' }}>Loading...</Text>
            )}

            {/* Search Drawer */}
            <SearchDrawer
              toggleDrawer={toggleDrawer}
              searchDrawerOpen={searchDrawerOpen}
              toggleSearchDrawer={toggleSearchDrawer}
              drawerBackgroundColor={drawerBackgroundColor}
              textColor={textColor}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              searchResults={searchResults}
              handleScrollToMessage={handleScrollToMessage}
              colorScheme={colorScheme}
              dimmedTextColor={dimmedTextColor}
              formatTimestamp={formatTimestamp}
              currentUserEmail={currentUserEmail}
            />

            {/* Messages Area */}
            <MessagesList
              groupedMessages={groupedMessages}
              selectedMessageId={selectedMessageId}
              currentUserEmail={currentUserEmail}
              colorScheme={colorScheme}
              scrollRef={scrollRef}
              handleScroll={handleScroll}
            />

            {/* Chat Input */}
            <ChatInput
              messageText={messageText}
              setMessageText={setMessageText}
              sendMessage={sendMessage}
              colorScheme={colorScheme}
            />
          </Box>
        )}
      </div>
    </div>
  );
};

export default ChatBox;