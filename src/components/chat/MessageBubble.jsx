// MessageBubble.js
import React from 'react';
import { Box, Text } from '@mantine/core';

const MessageBubble = ({ msg, isCurrentUser, isSelected, colorScheme }) => {
  return (
    <Box
      id={`message-${msg.timestamp}`}
      style={{
        backgroundColor: isSelected
          ? '#FFDD57'
          : isCurrentUser
          ? '#1976D2'
          : colorScheme === 'dark'
          ? '#cbcbcb'
          : '#F0F0F0',
        color: isSelected ? '#000' : isCurrentUser ? '#FFFFFF' : '#000000',
        padding: '0.75rem 1rem',
        borderRadius: '15px',
        boxShadow: isSelected
          ? '0 0 10px rgba(255, 221, 87, 0.5)'
          : '0 2px 5px rgba(0, 0, 0, 0.1)',
        marginBottom: '0.5rem',
        width: 'fit-content',
        maxWidth: '100%',
        wordBreak: 'break-word',
        cursor: 'pointer',
      }}
    >
      <Text size="sm">{msg.data}</Text>
    </Box>
  );
};

export default MessageBubble;