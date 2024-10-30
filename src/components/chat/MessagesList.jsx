import React, { useEffect, useRef } from 'react';
import { Box, Text, Avatar, ScrollArea, Loader } from '@mantine/core';
import MessageBubble from './MessageBubble';

const MessagesList = ({
  groupedMessages,
  selectedMessageId,
  currentUserEmail,
  colorScheme,
  fetchMoreMessages,
  hasMore,
  loading,
  scrollRef
}) => {
  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0 && hasMore) {
      fetchMoreMessages();
    }
  };

  // Attach the scroll event listener to `scrollRef`
  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef, handleScroll]);

  // // Adjust scroll position when messages change
  // useEffect(() => {
  //   if (viewport.current) {
  //     viewport.current.scrollTop = viewport.current.scrollHeight;
  //   }
  // }, [groupedMessages]);

  return (
    <ScrollArea
      style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}
      viewportRef={scrollRef}
    >
      {loading && (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <Loader size="sm" />
        </Box>
      )}
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
                <MessageBubble
                  key={idx}
                  msg={msg}
                  isCurrentUser={isCurrentUser}
                  isSelected={msg.timestamp === selectedMessageId}
                  colorScheme={colorScheme}
                />
              ))}
              {!isNaN(new Date(group.time)) && (
                <Text
                  size="xs"
                  color="dimmed"
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
  );
};

export default MessagesList;