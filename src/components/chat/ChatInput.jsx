import React, { useState, useEffect, useRef } from 'react';
import { Group, Input, ActionIcon, Box, Text, CloseButton, Avatar } from '@mantine/core';
import { IconCamera, IconMicrophone, IconPlus, IconSend, IconFile } from '@tabler/icons-react';

const ChatInput = ({ messageText, setMessageText, sendMessage, sendFile, colorScheme }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let previewUrl;
    if (selectedFile) {
      previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (file) {
      if (!validTypes.includes(file.type)) {
        alert('Unsupported file type');
        return;
      }
      if (file.size > maxSize) {
        alert('File is too large');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async () => {
    try {
      if (selectedFile) {
        await sendFile(selectedFile);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null; // Reset the file input's value
        }
      }
      if (messageText.trim()) {
        await sendMessage();
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset the file input's value
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Group
      style={{
        padding: '0.5rem',
        borderTop: `1px solid ${colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'}`,
        position: 'relative'
      }}
    >
      <Input
        placeholder="Type a message"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) handleSend();
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
        {/* Add file input for file selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />        
        <ActionIcon variant="light" onClick={handleFileInputClick} title="Add File">
          <IconPlus size={18} />
        </ActionIcon>
        <ActionIcon variant="light">
          <IconCamera size={18} />
        </ActionIcon>
        <ActionIcon variant="light">
          <IconMicrophone size={18} />
        </ActionIcon>
      </Group>

      <ActionIcon
        onClick={handleSend}
        variant="filled"
        color="blue"
        size="lg"
        title="Send Message"
      >
        <IconSend size={18} />
      </ActionIcon>

      {/* Display selected file information */}
      {selectedFile && (
        <Box
          style={{
            position: 'absolute',
            top: '-70px',
            left: '10px',
            padding: '10px',
            backgroundColor: colorScheme === 'dark' ? '#2c2e33' : '#fff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          {selectedFile.type.startsWith('image/') ? (
            <Avatar src={filePreview} size={40} radius="md" />
          ) : (
            <IconFile size={40} />
          )}
          <Text>{selectedFile.name}</Text>
          <CloseButton size="sm" onClick={handleRemoveFile} />
        </Box>
      )}
    </Group>
  );
};

export default ChatInput;