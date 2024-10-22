// SearchDrawer.js
import React from 'react';
import { Drawer, Input, Button, ScrollArea, List, Box, Group, Avatar, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const SearchDrawer = ({
  searchDrawerOpen,
  toggleSearchDrawer,
  drawerBackgroundColor,
  textColor,
  searchTerm,
  setSearchTerm,
  handleSearch,
  searchResults,
  handleScrollToMessage,
  colorScheme,
  dimmedTextColor,
  formatTimestamp,
  currentUserEmail,
  toggleDrawer
}) => {
  return (
    <Drawer
      opened={searchDrawerOpen}
      onClose={toggleSearchDrawer}
      position="right"
      size="400px"
      padding="xl"
      styles={{
        drawer: {
          backgroundColor: drawerBackgroundColor,
          color: textColor,
        },
      }}
    >
      {/* Search Input */}
      <Input
        icon={<IconSearch size={16} />}
        placeholder="Search in chat"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb="md"
      />
      <Button onClick={handleSearch} fullWidth>
        Search
      </Button>

      {/* Display Search Results */}
      {searchResults.length > 0 && (
        <ScrollArea>
          <List spacing="sm" size="sm" center>
            {searchResults.map((message, index) => (
              <Box
                key={index}
                onClick={() => {
                  toggleSearchDrawer();
                  handleScrollToMessage(message.created);
                }}
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid #E0E0E0',
                  cursor: 'pointer',
                }}
              >
                <Group>
                  <Avatar
                    src={
                      message.author === currentUserEmail
                        ? 'https://i.pravatar.cc/300'
                        : 'https://i.pravatar.cc/300?img=3'
                    }
                    size="lg"
                    radius="xl"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text weight={700} style={{ color: colorScheme === 'dark' ? '#cbcbcb' : '#000' }}>
                      {message.author === currentUserEmail ? 'You' : 'Author Name'}
                    </Text>
                    <Text size="sm" style={{ color: colorScheme === 'dark' ? '#888' : '#555' }}>
                      {message.body}
                    </Text>
                    <Text size="xs" style={{ color: colorScheme === 'dark' ? '#888' : '#999' }}>
                      {formatTimestamp(message.created)}
                    </Text>
                  </div>
                </Group>
              </Box>
            ))}
          </List>
        </ScrollArea>
      )}
    </Drawer>
  );
};

export default SearchDrawer;