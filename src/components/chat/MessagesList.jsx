// MessagesList.js
import React from 'react';
import { Box, Text, Avatar, ScrollArea } from '@mantine/core';
import MessageBubble from './MessageBubble';

const MessagesList = ({
  groupedMessages,
  selectedMessageId,
  currentUserEmail,
  colorScheme,
  scrollRef,
  handleScroll,
}) => {
  return (
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
  );
};

export default MessagesList;