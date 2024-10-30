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
import { uploadFileToFirebase } from '../../utils/firebase';

dayjs.extend(relativeTime);

const ChatBox = ({ clientId, theme, toggleTheme }) => {
  const colorScheme = theme.colorScheme;
  const ably = useAbly();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentUserEmail = clientId;
  const scrollRef = useRef(null);
  const messageGroupingThreshold = 5 * 60 * 1000; 
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch channel details
  const fetchChatGroupDetail = async (channelName) => {
    if (!channelName) return;
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/chat-group/${channelName}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setChannelInfo(response.data);
    } catch (error) {
      console.error('Error fetching channel info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (channelName, pageNumber) => {
    if (!channelName || !pageNumber || loading || !hasMore) return;
  
    setLoading(true);
    console.log(pageNumber)
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
        const fetchedMessages = response.data.results.map((msg) => {
          if (msg.file_url) {
            return {
              clientId: msg.author,
              data: [
                msg.file_name,
                msg.file_type,
                msg.file_url,
              ],
              timestamp: msg.created,
              type: 'file',
            };
          } else {
            return {
              clientId: msg.author,
              data: msg.body,
              timestamp: msg.created,
              type: 'text',
            };
          }
        });
  
        // Reverse the fetched messages to maintain chronological order
        fetchedMessages.reverse();
  
        // Update messages state
        setMessages((prevMessages) => [...fetchedMessages, ...prevMessages]);
  
        setHasMore(response.data.next !== null);
      } else {
        console.error('Invalid data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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


  const fetchMoreMessages = () => {
    if (selectedChannel && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const fetchAllPages = async (url) => {
    let currentUrl = url;
    let currentPage = page + 1
  
    try {
      while (currentUrl) {
        console.log("Current Url: " + currentUrl)
        console.log("CurrentPage: " + currentPage)
        const response = await axios.get(currentUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        console.log(response.data.results);
  
        if (Array.isArray(response.data.results)) {
          const fetchedMessages = response.data.results.map((msg) => {
            if (msg.file_url) {
              return {
                clientId: msg.author,
                data: [
                  msg.file_name,
                  msg.file_type,
                  msg.file_url,
                ],
                timestamp: msg.created,
                type: 'file',
              };
            } else {
              return {
                clientId: msg.author,
                data: msg.body,
                timestamp: msg.created,
                type: 'text',
              };
            }
          });
    
          // Reverse the fetched messages to maintain chronological order
          fetchedMessages.reverse();
    
          // Update messages state
          setMessages((prevMessages) => [...fetchedMessages, ...prevMessages]);
        }
        currentUrl = response.data.next; // Update to the next page URL
        setPage(++currentPage);
      }
    } catch (error) {
      console.error('Error fetching all message pages:', error);
    }
  };

  const fetchAllMessagesFromTimestamp = async (timestamp) => {
    const createdFrom = new Date(timestamp).toISOString();
    const initialUrl = `${apiBaseUrl}/api/v1/chat-group/${selectedChannel.group_name}/messages/?created_from=${createdFrom}&page=${page + 1}`;
    await fetchAllPages(initialUrl);
  };
  
  // Scroll to the message when clicked
  const handleScrollToMessage = async (messageTimestamp) => {
    setSelectedMessageId(messageTimestamp);
  
    // Wait for the state update and re-render to complete
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageTimestamp}`);
      const scrollContainer = scrollRef.current;
  
      if (messageElement && scrollContainer) {
        const messagePosition = messageElement.offsetTop - scrollContainer.offsetTop;
  
        // Smoothly scroll within the chatbox only
        scrollContainer.scrollTo({
          top: messagePosition,
          behavior: 'smooth',
        });
      } else {
        // If the message is not found, fetch the necessary page
        fetchAllMessagesFromTimestamp(messageTimestamp);
      }
    }, 0);
  };

  // useEffect(() => {
  //   if (scrollRef.current && !loading) {
  //     const scrollElement = scrollRef.current;
  //     // Only scroll to bottom if new messages are added to the end
  //     if (messages.length > 0 && messages[messages.length - 1].clientId === currentUserEmail) {
  //       scrollElement.scrollTo({
  //         top: scrollElement.scrollHeight,
  //         behavior: 'smooth',
  //       });
  //     }
  //   }
  // }, [messages, loading]);

  // Handle channel selection
  useEffect(() => {
    if (selectedChannel) {
      setMessages([]);
      setChannelInfo(null);
      setPage(1);
      setHasMore(true);
      fetchChatGroupDetail(selectedChannel.group_name);
    }
  }, [selectedChannel]);

  // Handle page changes
  useEffect(() => {
    if (selectedChannel && page) {
      fetchMessages(selectedChannel.group_name, page);
    }
  }, [page, selectedChannel]);

  // Ably subscription for real-time messages
  useEffect(() => {
    if (!selectedChannel || !ably) return;

    const channelName = selectedChannel.group_name;
    const channel = ably.channels.get(channelName);

    const onMessage = (message) => {
      let newMessage;
      const msgData = message.data;

      if (message.name === 'new-message') {
        newMessage = {
          clientId: message.clientId || message.connectionId,
          data: msgData,
          timestamp: message.timestamp || new Date().toISOString(),
          type: 'text',
        };
      } else if (message.name === 'new-file') {
        newMessage = {
          clientId: message.clientId || message.connectionId,
          data: [
            msgData[0],
            msgData[1],
            msgData[2],
          ],
          timestamp: message.timestamp || new Date().toISOString(),
          type: 'file',
        };
      }

      if (newMessage) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    channel.subscribe(onMessage);

    return () => {
      channel.unsubscribe(onMessage);
      channel.detach((err) => {
        if (err) {
          console.error("Error detaching channel:", err);
        } else {
          console.log(`Detached from ${channelName}`);
          ably.channels.release(channelName); // Release after detaching
        }
      });
    };
  }, [selectedChannel, ably]);

  // Send text message
  const sendMessage = () => {
    if (messageText.trim() && selectedChannel) {
      const channel = ably.channels.get(selectedChannel.group_name);
      channel.publish({ name: 'new-message', data: messageText });
      setMessageText('');
    }
  };

  // Send file message via API
  const sendFileMessage = async (fileTransfers) => {
    if (selectedChannel && fileTransfers) {
      try {
        const channel = ably.channels.get(selectedChannel.group_name);

        // Upload file to Firebase
        const fileUrl = await uploadFileToFirebase(fileTransfers);

        // Prepare message data
        const fileMessageData = [
          fileTransfers.name,
          fileTransfers.type,
          fileUrl,
        ];

        // Publish the file message
        channel.publish({ name: 'new-file', data: fileMessageData });
        console.log("File transfer: " + fileMessageData);
      } catch (error) {
        console.error('Error sending file message:', error);
      }
    }
  };

  // Cleanup Blob URLs when component unmounts or messages change
  useEffect(() => {
    return () => {
      messages.forEach((msg) => {
        if (msg.type === 'file' && msg.data.fileUrl) {
          URL.revokeObjectURL(msg.data.fileUrl);
        }
      });
    };
  }, [messages]);

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
      groupedMessages.push({
        sender: lastSender,
        time: lastTime,
        messages: currentGroup,
      });
      currentGroup = [];
    }

    lastSender = senderEmail;
    lastTime = messageTime;
    currentGroup.push(msg);

    if (index === messages.length - 1) {
      groupedMessages.push({
        sender: senderEmail,
        time: messageTime,
        messages: currentGroup,
      });
    }
  });

  // Derive channel name based on members (excluding current user) if private
  const getChannelName = (channel) => {
    if (!channel || !channel.is_private) {
      return channel?.groupchat_name || 'Unknown Channel';
    }

    const otherMembers = channel.members?.filter(
      (member) => member.user !== currentUserEmail
    );
    if (!otherMembers || otherMembers.length === 0) return 'Private Chat';

    const otherMember = otherMembers[0];
    return otherMember.nickname || otherMember.name || otherMember.user;
  };

  const toggleDrawer = () => {
    setDrawerOpened(!drawerOpened); // Toggle the drawer on and off
  };

  const toggleSearchDrawer = () => {
    setSearchDrawerOpen(!searchDrawerOpen);
  };

  const drawerBackgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const dimmedTextColor = colorScheme === 'dark' ? '#cbcbcb' : '#555';

  // Format the timestamp (relative time)
  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).fromNow(); // Use dayjs to format the timestamp
  };

  // Update nickname and refresh channel info
  const updateNickname = async (groupName, memberEmail, newNickname) => {
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
      await fetchChatGroupDetail(selectedChannel.group_name); 
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
            borderRight: `1px solid ${
              colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'
            }`,
            padding: '1rem',
            height: '100%',
          }}
        >
          <ChatChannelList
            currentUserEmail={currentUserEmail}
            theme={theme}
            clientId={clientId}
            onSelectChannel={setSelectedChannel}
            getChannelName={getChannelName}
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
              getChannelName={() => getChannelName(selectedChannel)}
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
                getChannelName={() => getChannelName(channelInfo)}
                colorScheme={colorScheme}
                toggleSearchDrawer={toggleSearchDrawer}
              />
            ) : (
              <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : '#000' }}>
                Loading...
              </Text>
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
              fetchMoreMessages={fetchMoreMessages}
              hasMore={hasMore}
              loading={loading}
              scrollRef={scrollRef}
            />

            {/* Chat Input */}
            <ChatInput
              messageText={messageText}
              setMessageText={setMessageText}
              sendMessage={sendMessage}
              colorScheme={colorScheme}
              sendFile={sendFileMessage} 
            />
          </Box>
        )}
      </div>
    </div>
  );
};

export default ChatBox;