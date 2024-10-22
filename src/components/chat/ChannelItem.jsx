import React, { useState, useEffect } from 'react';
import { Avatar, Group, Text, Divider, Badge } from '@mantine/core';
import { useAbly } from 'ably/react';

const ChannelItem = ({ currentUserEmail, clientId, channel, onSelectChannel }) => {
  if (!channel) {
    return null;
  }

  const [lastMessageContent, setLastMessageContent] = useState(
    channel.last_message_content || 'No messages yet...'
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const { group_name } = channel;

  const ably = useAbly();

  useEffect(() => {
    if (!group_name || !ably) return;

    const ablyChannel = ably.channels.get(group_name);

    const onMessage = (message) => {
      console.log('Received message on channel', group_name, ':', message);

      const newLastMessageContent = message.data || 'No messages yet...';

      setLastMessageContent(newLastMessageContent);
      if(message.clientId != clientId){
        setUnreadCount((prevCount) => prevCount + 1);
      }
    };

    ablyChannel.subscribe(onMessage);

    return () => {
      ablyChannel.unsubscribe(onMessage);
    };
  }, [ably, group_name]);

  // Handle selecting a channel (when a user clicks on a channel in the list)
  const handleChannelClick = () => {
    onSelectChannel(channel);
    console.log(channel)

    // Reset unread message count after the user selects the channel
    setUnreadCount(0);
  };
  const getChannelName = () => {
    if (!channel || !channel.is_private) {
      return channel?.groupchat_name || "Unknown Channel";
    }

    const otherMembers = channel.members?.filter(member => member.user !== currentUserEmail);
    if (otherMembers.length === 0) return "Private Chat";

    const otherMember = otherMembers[0];
    return otherMember.nickname || otherMember.name || otherMember.user;
  };
  return (
    <div
      onClick={handleChannelClick}
      style={{
        backgroundColor: unreadCount ? '#a5a5a5' : 'inherit',
        padding: '0.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Group position="apart" mb="sm">
        <Group>
          <Avatar src={channel.avatar || ''} radius="xl" />
          <div>
            <Text fw={unreadCount > 0 ? 900 : 700}>
              {getChannelName()}
            </Text>
            <Text size="xs" c="dimmed">
              {lastMessageContent}
            </Text>
          </div>
        </Group>
        {unreadCount > 0 && (
          <Badge color="blue" radius="xl" size="lg" variant="filled">
            {unreadCount}
          </Badge>
        )}
      </Group>
      <Divider my="sm" />
    </div>
  );
};

export default ChannelItem;