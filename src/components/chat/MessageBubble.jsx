import React from 'react';
import { Box, Text, Image, ActionIcon } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

const MessageBubble = ({ msg, isCurrentUser, isSelected, colorScheme }) => {
  const isFileMessage = msg.type === 'file';
  const isImage = isFileMessage && msg.data[1]?.startsWith('image/');

  return (
    <>
      {isFileMessage ? (
        isImage ? (
          <Image
            className="m-2"
            src={msg.data[2]}
            alt={msg.data[0]}
            radius="md"
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
            }}
          />
        ) : (
          // Display download link for non-image files
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Text             
            size="sm"
            style={{
              wordWrap: 'break-word',
              color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            }}>
              {msg.data[0]}
            </Text>
            <ActionIcon
              component="a"
              href={msg.data[2]}
              download={msg.data[0]}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              color="blue"
              size="sm"
              style={{ marginLeft: '0.5rem' }}
            >
              <IconDownload size={18} />
            </ActionIcon>
          </Box>
        )
      ) : (
        // Existing code for text messages
        <Box
          id={`message-${msg.timestamp}`}
          style={{
            backgroundColor: isSelected
              ? '#FFDD57'
              : isCurrentUser
              ? '#1976D2'
              : colorScheme === 'dark'
              ? '#8E8E8E'
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
          <Text
            size="sm"
            style={{
              wordWrap: 'break-word',
              color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            }}
          >
            {typeof msg.data === 'string' ? msg.data : 'Invalid message content'}
          </Text>
        </Box>
      )}
    </>
  );
};

export default MessageBubble;