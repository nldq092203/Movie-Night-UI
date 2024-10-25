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
import { storage } from './firebase';

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
  const messageGroupingThreshold = 5 * 60 * 1000; // 5 minutes
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileTransfers, setFileTransfers] = useState(''); // State for ongoing file transfers

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
          type: 'text', // Assuming historical messages are text
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

    if (messageElement && scrollRef.current) {
      const scrollArea = scrollRef.current;
      const scrollTop = messageElement.offsetTop - scrollArea.scrollTop;
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

  // Function to convert Base64 string to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Ably subscription for real-time messages
  useEffect(() => {
    if (!selectedChannel || !ably) return;

    const channelName = selectedChannel.group_name;
    const channel = ably.channels.get(channelName);

    const onMessage = (message) => {
      if (message.name === 'new-message') {
        const newMessage = {
          clientId: message.clientId || message.connectionId,
          data: message.data,
          timestamp: message.timestamp || new Date().toISOString(),
          type: 'text',
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else if (message.name === 'file-transfer') {
        const [fileName, fileType, base64Data, chunkIndex, totalChunks, fileId] = message.data;

        setFileTransfers((prevTransfers) => {
          const transfer = prevTransfers[fileId] || {
            fileName,
            fileType,
            totalChunks: Number(totalChunks),
            chunks: {},
            clientId: message.clientId || message.connectionId,
            timestamp: message.timestamp || new Date().toISOString(),
          };

          transfer.chunks[Number(chunkIndex)] = base64Data;

          // Check if all chunks have been received
          if (Object.keys(transfer.chunks).length === transfer.totalChunks) {
            // Assemble the file
            const chunkKeys = Object.keys(transfer.chunks)
              .map(Number)
              .sort((a, b) => a - b);
            const completeBase64Data = chunkKeys
              .map((key) => transfer.chunks[key])
              .join('');

            const arrayBuffer = base64ToArrayBuffer(completeBase64Data);
            const blob = new Blob([arrayBuffer], { type: transfer.fileType });
            const blobUrl = URL.createObjectURL(blob);

            // Create a new message with the assembled file
            const newMessage = {
              clientId: transfer.clientId,
              data: {
                fileName: transfer.fileName,
                fileType: transfer.fileType,
                fileUrl: blobUrl,
              },
              timestamp: transfer.timestamp,
              type: 'file', // Custom type for assembled file
            };
            

            setMessages((prevMessages) => [...prevMessages, newMessage]);

            // Clean up the completed transfer
            const { [fileId]: _, ...restTransfers } = prevTransfers;
            return restTransfers;
          } else {
            return {
              ...prevTransfers,
              [fileId]: transfer,
            };
          }
        });
      }
    };

    channel.subscribe(onMessage);

    return () => {
      channel.unsubscribe(onMessage);
      channel.detach(() => {
        ably.channels.release(channelName);
      });
    };
  }, [selectedChannel?.group_name, ably]);

  const uploadBlobToFirebase = async (blob, fileName) => {
    try {
      const storageRef = storage.ref();
      const uniqueFileName = `${Date.now()}_${fileName}`;
      const fileRef = storageRef.child(`chat_files/${uniqueFileName}`);
  
      // Upload the Blob to Firebase
      await fileRef.put(blob);
  
      // Get and return the download URL
      return await fileRef.getDownloadURL();
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      throw error;
    }
  };

  // Send message
  const sendMessage = () => {
    if (messageText.trim() && selectedChannel) {
      const channel = ably.channels.get(selectedChannel.group_name);
      channel.publish({ name: 'new-message', data: messageText });
      setMessageText('');
    }
  };

  const MAX_BYTE_SIZE = 45000; // A safer limit for file chunks after Base64 encoding

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 5000) {
      const chunk = bytes.subarray(i, i + 5000);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  };

  const sendFileInChunks = async (file) => {
    if (selectedChannel && file) {
      const channel = ably.channels.get(selectedChannel.group_name);

      // Check if the channel is attached before sending
      if (channel.state !== 'attached') {
        await channel.attach(); // Ensure channel is attached before sending
      }

      const arrayBuffer = await file.arrayBuffer();
      const totalSize = arrayBuffer.byteLength;
      const totalChunks = Math.ceil(totalSize / MAX_BYTE_SIZE);
      const fileId = Date.now().toString(); // Generate a unique file ID

      let chunkIndex = 0;
      let offset = 0;

      while (offset < totalSize) {
        const chunkSize = Math.min(MAX_BYTE_SIZE, totalSize - offset);
        const chunk = arrayBuffer.slice(offset, offset + chunkSize);

        const base64Chunk = arrayBufferToBase64(chunk);

        try {
          await channel.publish({
            name: 'file-transfer',
            data: [
              file.name, // fileName
              file.type, // fileType
              base64Chunk, // Chunk data (Base64)
              chunkIndex, // Current chunk index
              totalChunks, // Total number of chunks
              fileId, // Unique file identifier
            ],
          });
          console.log(`Sent chunk ${chunkIndex + 1} of ${totalChunks}`);
        } catch (error) {
          console.error('Error sending chunk:', error);
          return; // Stop sending if an error occurs
        }

        chunkIndex++;
        offset += chunkSize;
      }

      console.log('All chunks sent!');
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
  const getChannelName = () => {
    if (!channelInfo || !channelInfo.is_private) {
      return channelInfo?.groupchat_name || 'Unknown Channel';
    }

    const otherMembers = channelInfo.members?.filter(
      (member) => member.user !== currentUserEmail
    );
    if (otherMembers.length === 0) return 'Private Chat';

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
              scrollRef={scrollRef}
              handleScroll={handleScroll}
            />

            {/* Chat Input */}
            <ChatInput
              messageText={messageText}
              setMessageText={setMessageText}
              sendMessage={sendMessage}
              colorScheme={colorScheme}
              sendFile={sendFileInChunks}
            />
          </Box>
        )}
      </div>
    </div>
  );
};

export default ChatBox;