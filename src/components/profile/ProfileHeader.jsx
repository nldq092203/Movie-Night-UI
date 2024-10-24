import React from 'react';
import { Avatar, Flex, Group, Text, Divider, Button, ActionIcon } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';

const ProfileHeader = ({ user, myEmail, email, handleAvatarClick, setEditProfileOpen, setFindFriendOpen, handleChatGroup, messageError }) => {
  return (
    <Flex align="center" justify="center" direction="row" spacing="xl" style={{ marginBottom: '2rem', width: '100%' }}>
      <Group position="center" p="lg">
        <Avatar
          src={user.avatar_url || 'https://http.cat/404'} 
          size={200} 
          radius="100%"
          alt="Profile Image"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
        />
      </Group>
      <Flex direction="column" style={{ flex: 1 }} p="lg">
        <Text fw={700} size="xl" style={{ textAlign: 'left' }}>
          {user.email || 'User Name'}
        </Text>
        <Text size="lg" c="dimmed" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          {user.bio || 'User bio goes here.'}
        </Text>
        <Group mt="lg" spacing="md">
          <Text size="lg" fw={700}>
            <strong>Name: </strong>
          </Text>
          <Text size="lg" c="dimmed">
            {user.name || 'No name available.'}
          </Text>
          <Divider my="lg" />
          <Text size="lg" fw={700}>
            <strong>Gender: </strong>
          </Text>
          <Text size="lg" c="dimmed">
            {user.gender === 'Custom' && user.customGender ? user.customGender : user.gender || 'Not specified'}
          </Text>
        </Group>

        {myEmail === email && (
          <Group mt="lg" spacing="lg">
            <Button variant="outline" size="md" onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
            <Button variant="outline" size="md" onClick={() => setFindFriendOpen(true)}>Find Friend</Button>
          </Group>
        )}
        {myEmail !== email && (
          <Group mt="lg" spacing="lg">
            <ActionIcon size="lg" variant="outline" onClick={handleChatGroup}>
              <IconMessageCircle size={30} />
            </ActionIcon>
            {messageError && <Text c="red" size="sm">{messageError}</Text>}
          </Group>
        )}
      </Flex>
    </Flex>
  );
};

export default ProfileHeader;