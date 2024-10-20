import React, { useState, useEffect } from 'react';
import { ScrollArea, Box, Input, Text } from '@mantine/core';
import  {IconSearch} from '@tabler/icons-react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import ChannelItem from './ChannelItem.jsx';

const ChatChannelList = ({ theme, clientId, onSelectChannel }) => {
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const accessToken = localStorage.getItem('access_token');

  const fetchChannels = async (query = '') => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/chat-group/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { group_name: query }, // Send the search query as a parameter
      });
      console.log('API response:', response.data);

      if (Array.isArray(response.data.results)) {
        setChannels(response.data.results);
      } else {
        console.error('Invalid data format:', response.data);
        setChannels([]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      setChannels([]); // Set to empty array on error
    }
  };

  // Fetch channels initially
  useEffect(() => {
    fetchChannels();
  }, []);

  // Trigger search whenever searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChannels(searchTerm); // Fetch channels with the search term
    }, 300); // Delay the search for 300ms to avoid excessive API calls

    return () => clearTimeout(delayDebounceFn); // Clear the timeout when the component is unmounted or searchTerm changes
  }, [searchTerm]);

  return (
    <Box style={{ 
        width: '300px', 
        padding: '1rem',
        color: theme.colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        }}
    >
        <Text size="xl" fw={700} mb="sm"
         style={{
              color: theme.colorScheme === 'dark' ? '#ffffff' : '#000',
            }}>
          Messages
        </Text>
        <Input
          icon={<IconSearch size={16} />}
          placeholder="Search messages"
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
            .filter((channel) => channel) // Filtering if needed
            .map((channel) => (
                <ChannelItem
                key={channel.group_name}
                channel={channel}
                onSelectChannel={onSelectChannel}
                clientId={clientId}
                />
            ))}
        </ScrollArea>
    </Box>
  );
};

export default ChatChannelList;