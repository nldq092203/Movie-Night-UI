import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Group, Text, Divider, Badge } from '@mantine/core';
import { useAbly } from 'ably/react';

const ChannelItem = React.memo(
  ({
    currentUserEmail,
    clientId,
    channel,
    onSelectChannel,
    getChannelName,
  }) => {
    if (!channel) {
      return null;
    }

    const ably = useAbly();
    const { group_name, groupchat_name, members, avatar } = channel;

    const [lastMessageContent, setLastMessageContent] = useState(
      channel.last_message_content || 'No messages yet...'
    );
    const [unreadCount, setUnreadCount] = useState(0);

    // Helper function to determine the display name
    const getDisplayName = useCallback(() => {
      if (getChannelName) {
        const name = getChannelName();
        if (name) return name;
      }

      if (groupchat_name) {
        return groupchat_name;
      }

      const otherMembers = members?.filter(
        (member) => member.user !== currentUserEmail
      ) || [];

      const otherMember = otherMembers[0] || {};

      return (
        otherMember.nickname ||
        otherMember.name ||
        otherMember.user ||
        'Unknown Channel'
      );
    }, [getChannelName, groupchat_name, members, currentUserEmail]);

    const channelName = getDisplayName();

    // Subscribe to Ably channel messages
    useEffect(() => {
      if (!group_name || !ably) return;

      const ablyChannel = ably.channels.get(group_name);

      const onMessage = (message) => {
        console.log('Received message on channel', group_name, ':', message);

        const newLastMessageContent =
          message.name === 'new-message' ? message.data : 'Attachment sent';

        setLastMessageContent(newLastMessageContent);

        if (message.clientId !== clientId) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
      };

      ablyChannel.subscribe(onMessage);

      return () => {
        ablyChannel.unsubscribe(onMessage);
      };
    }, [ably, group_name, clientId]);

    // Handle selecting a channel
    const handleChannelClick = useCallback(() => {
      onSelectChannel(channel);
      console.log(channel);

      setUnreadCount(0);
    }, [onSelectChannel, channel]);

    return (
      <div
        onClick={handleChannelClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleChannelClick();
          }
        }}
        role="button"
        tabIndex={0}
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
            <Avatar src={avatar || ''} radius="xl" />
            <div>
              <Text fw={unreadCount > 0 ? 900 : 700}>{channelName}</Text>
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
  }
);

ChannelItem.propTypes = {
  currentUserEmail: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
  channel: PropTypes.shape({
    group_name: PropTypes.string,
    groupchat_name: PropTypes.string,
    last_message_content: PropTypes.string,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.string,
        name: PropTypes.string,
        nickname: PropTypes.string,
      })
    ),
    avatar: PropTypes.string,
    is_private: PropTypes.bool,
  }).isRequired,
  onSelectChannel: PropTypes.func.isRequired,
  getChannelName: PropTypes.func,
};

export default ChannelItem;