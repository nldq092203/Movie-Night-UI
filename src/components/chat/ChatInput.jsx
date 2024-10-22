// ChatInput.js
import React from 'react';
import { Group, Input, ActionIcon } from '@mantine/core';
import { IconCamera, IconMicrophone, IconPlus, IconSend } from '@tabler/icons-react';

const ChatInput = ({ messageText, setMessageText, sendMessage, colorScheme }) => {
  return (
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
  );
};

export default ChatInput;