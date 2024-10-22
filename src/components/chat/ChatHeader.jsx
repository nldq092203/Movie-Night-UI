// ChatHeader.js
import React from 'react';
import { Box, Group, Text, Avatar, ActionIcon } from '@mantine/core';
import { IconVideo, IconPhone, IconDots } from '@tabler/icons-react';

const ChatHeader = ({ selectedChannel, getChannelName, colorScheme, toggleDrawer }) => {
  return (
    <Box
      p="md"
      style={{
        borderBottom: `1px solid ${colorScheme === 'dark' ? '#4F4F4F' : '#E0E0E0'}`,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Group spacing="md" style={{ flexGrow: 1 }}>
        <Avatar src={selectedChannel.avatar || ''} radius="xl" />
        <div>
          <Text fw={900} c={colorScheme === 'dark' ? '#cbcbcb' : '#000'}>
            {getChannelName()}
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
        <ActionIcon onClick={toggleDrawer} size="lg" variant="light">
          <IconDots size={18} />
        </ActionIcon>
      </Group>
    </Box>
  );
};

export default ChatHeader;