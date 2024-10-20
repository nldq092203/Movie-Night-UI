import React, { useState, useEffect, useRef } from 'react';
import {
  Avatar,
  Text,
  Group,
  Box,
  ScrollArea,
  Input,
  ActionIcon,
} from '@mantine/core';
import {
  IconSend,
  IconSearch,
  IconCamera,
  IconMicrophone,
  IconPlus,
  IconVideo,
  IconPhone,
  IconDots,
  IconSun,
  IconMoonStars,
} from '@tabler/icons-react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import ChatChannelList from './ChatChannelList';
import { useAbly } from 'ably/react';
import Header from '../navigations/Header';

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
  
    // Function to fetch messages
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
  
    // useEffect hooks
    useEffect(() => {
      if (selectedChannel) {
        setMessages([]);
        setPage(1);
      }
    }, [selectedChannel]);
  
    useEffect(() => {
      if (selectedChannel && page) {
        fetchMessages(selectedChannel.group_name, page);
      }
    }, [page, selectedChannel]);
  
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
  
    // Ably subscription
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

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5', // Custom colors for dark and light mode
        }}
      >
        {/* Header */}
        <div style={{ position: 'fixed', width: '100%', zIndex: 10 }}>
          <Header theme={theme} toggleTheme={toggleTheme} />
        </div>
    
        {/* Body */}
        <div className="overflow-hidden block pt-[90px] w-full h-screen" style={{ display: 'flex', flexGrow: 1 }}>
          {/* Sidebar */}
          <Box
            style={{
              width: '300px',
              backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#FFFFFF', // Custom sidebar color
              borderRight: `1px solid ${
                colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'
              }`,
              padding: '1rem',
              height: '100%',
            }}
          >
            <ChatChannelList theme={theme} clientId={clientId} onSelectChannel={setSelectedChannel} />
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
              <Box
                p="md"
                style={{
                  borderBottom: `1px solid ${
                    colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'
                  }`,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Group spacing="md" style={{ flexGrow: 1 }}>
                  <Avatar src={selectedChannel.avatar || ''} radius="xl" />
                  <div>
                  <Text 
                    fw={900} 
                    c={colorScheme === 'dark' ? '#cbcbcb' : '#000'}
                  >
                    {selectedChannel.groupchat_name || 'Channel Name'}
                  </Text>
                  </div>
                </Group>
    
                <Group spacing="xs">
                  <ActionIcon size="lg" variant="light">
                    <IconVideo size={18} />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="light">
                    <IconPhone size={18} />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="light">
                    <IconDots size={18} />
                  </ActionIcon>
                </Group>
              </Box>
    
              {/* Messages Area */}
              <ScrollArea
                style={{
                  flex: 1,
                  padding: '1rem',
                  overflowY: 'auto',
                }}
                onScroll={handleScroll}
                viewportRef={scrollRef}
              >
                {groupedMessages.map((group, index) => {
                  const isCurrentUser = group.sender === currentUserEmail;
                  return (
                    <Box
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        marginBottom: '1rem',
                        alignItems: 'center',
                      }}
                    >
                      {!isCurrentUser && (
                        <Avatar
                          color="blue"
                          radius="xl"
                          style={{
                            marginRight: isCurrentUser ? '0' : '0.5rem',
                            marginLeft: isCurrentUser ? '0.5rem' : '0',
                          }}
                        >
                          {group.sender.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
    
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                        }}
                      >
                        {group.messages.map((msg, idx) => (
                          <Box
                            key={idx}
                            style={{
                              backgroundColor: isCurrentUser
                                ? '#1976D2' // Custom blue color for sent messages
                                : colorScheme === 'dark'
                                ? '#cbcbcb'
                                : '#F0F0F0', // Custom color for received messages
                              color: isCurrentUser ? '#FFFFFF' : '#000000',
                              padding: '0.75rem 1rem',
                              borderRadius: '15px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              marginBottom: '0.5rem',
                              width: 'fit-content',
                              maxWidth: '100%',
                              wordBreak: 'break-word',
                            }}
                          >
                            <Text size="sm">{msg.data}</Text>
                          </Box>
                        ))}
                        {!isNaN(new Date(group.time)) && (
                          <Text
                            size="xs"
                            c="dimmed"
                            align={isCurrentUser ? 'right' : 'left'}
                            style={{ marginTop: '0.25rem' }}
                          >
                            {new Date(group.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </ScrollArea>
    
              {/* Chat Input */}
              <Group
                style={{
                  padding: '0.5rem',
                  borderTop: `1px solid ${
                    colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'
                  }`,
                }}
              >
                <Input
                  placeholder="Type a message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  radius="xl"
                  styles={{
                    input: {
                      backgroundColor: colorScheme === 'dark' ? '#2c2e33' : '#fff',
                      color: colorScheme === 'dark' ? '#cbcbcb' : '#000',
                      borderColor: colorScheme === 'dark' ? '#444' : '#ccc',
                    },
                  }}
                  style={{ flex: 1 }}
                />
                <Group spacing="xs">
                  <ActionIcon variant="light">
                    <IconCamera size={18} />
                  </ActionIcon>
                  <ActionIcon variant="light">
                    <IconMicrophone size={18} />
                  </ActionIcon>
                  <ActionIcon variant="light">
                    <IconPlus size={18} />
                  </ActionIcon>
                </Group>
                <ActionIcon onClick={sendMessage} variant="filled" color="blue" size="lg">
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </Box>
          )}
        </div>
      </div>
    );
};

export default ChatBox;