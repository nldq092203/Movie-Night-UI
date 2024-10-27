import React, { useState, useEffect } from 'react';
import { ScrollArea, Box, Input, Text, Group, ActionIcon, Modal, Button, Badge } from '@mantine/core';
import { IconSearch, IconPlus, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import ChannelItem from './ChannelItem.jsx';

const ChatChannelList = ({ currentUserEmail, theme, clientId, onSelectChannel, getChannelName }) => {
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState([currentUserEmail]);
  const [emailInput, setEmailInput] = useState(''); // Input for adding emails
  const accessToken = localStorage.getItem('access_token');

  const fetchChannels = async (query = '') => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/chat-group/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { groupchat_name_or_member_email: query },
      });
      if (Array.isArray(response.data.results)) {
        setChannels(response.data.results);
      } else {
        setChannels([]);
      }
    } catch (error) {
      setChannels([]); 
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChannels(searchTerm); 
    }, 300); 

    return () => clearTimeout(delayDebounceFn); 
  }, [searchTerm]);

  const handleAddEmail = () => {
    if (emailInput && !memberEmails.includes(emailInput)) {
      setMemberEmails((prev) => [...prev, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email) => {
    setMemberEmails((prev) => prev.filter((member) => member !== email));
  };

  const handleCreateGroupChat = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/api/v1/chat-group/`, 
        {
          groupchat_name: groupName,
          is_private: false,
          member_emails: memberEmails
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setChannels((prev) => [...prev, response.data]);
      setModalOpened(false);
      setGroupName('');
      setMemberEmails([]); 
    } catch (error) {
      console.error('Error creating group chat:', error);
    }
  };

  return (
    <Box style={{ 
        width: '300px', 
        padding: '1rem',
        color: theme.colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    }}>
      <Group position="apart" mb="sm">
        <Text size="xl" fw={700} style={{ color: theme.colorScheme === 'dark' ? '#ffffff' : '#000' }}>
          Messages
        </Text>
        <ActionIcon 
          onClick={() => setModalOpened(true)} 
          variant="light" 
          color="blue"
          size="lg"
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Group>

      <Input
        icon={<IconSearch size={16} />}
        placeholder="Search by email"
        mr="md"
        mb="md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        styles={{
          input: {
            backgroundColor: theme.colorScheme === 'dark' ? '#2c2e33' : '#fff',
            color: theme.colorScheme === 'dark' ? '#cbcbcb' : '#000',
            borderColor: theme.colorScheme === 'dark' ? '#444' : '#ccc',
          },
          icon: {
            color: theme.colorScheme === 'dark' ? '#cbcbcb' : '#000',
          },
        }}
      />
      
      <ScrollArea style={{ height: 'calc(100vh - 140px)' }}>
          {channels
          .filter((channel) => channel)
          .map((channel) => (
              <ChannelItem
              getChannelName={() => getChannelName(channel)} 
              key={channel.group_name}
              channel={channel}
              onSelectChannel={onSelectChannel}
              clientId={clientId}
              currentUserEmail={currentUserEmail}
              />
          ))}
      </ScrollArea>

      {/* Modal for creating group chat */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Create New Group Chat"
      >
        <Input
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          mb="md"
        />
        <Input
          placeholder="Add member email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
          rightSection={
            <ActionIcon onClick={handleAddEmail}>
              <IconPlus size={18} />
            </ActionIcon>
          }
          mb="md"
        />
        <Box mb="md">
          {memberEmails.map((email) => (
            <Badge
              key={email}
              variant="filled"
              color="blue"
              size="lg"
              rightSection={<IconX size={14} onClick={() => handleRemoveEmail(email)} />}
              style={{ marginRight: '8px', marginBottom: '8px', cursor: 'pointer' }}
            >
              {email}
            </Badge>
          ))}
        </Box>
        <Button onClick={handleCreateGroupChat} disabled={!groupName || memberEmails.length === 0}>
          Create Group
        </Button>
      </Modal>
    </Box>
  );
};

export default ChatChannelList;