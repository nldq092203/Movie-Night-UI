// RightSidebar.js
import React, { useState } from 'react';
import { Drawer, Flex, Avatar, Text, Divider, Group, Box, ActionIcon, Accordion, Modal, Button, Input } from '@mantine/core';
import { IconUser, IconSearch, IconEdit } from '@tabler/icons-react';
import { Link } from 'react-router-dom'; 
const RightSidebar = ({
  channelInfo,
  drawerOpened,
  toggleDrawer,
  drawerBackgroundColor,
  textColor,
  dimmedTextColor,
  getChannelName,
  colorScheme,
  toggleSearchDrawer,
  updateNickname,
  currentUserEmail
}) => {
  const [nicknameModalOpened, setNicknameModalOpened] = useState(false); 
  const [selectedMember, setSelectedMember] = useState(null); 
  const [newNickname, setNewNickname] = useState('');

    // Open the modal to change nickname
    const handleOpenNicknameModal = (member) => {
        setSelectedMember(member); 
        setNewNickname(member.nickname || ''); // Set the initial nickname in the input
        setNicknameModalOpened(true); // Open the modal
    };
    
    // Handle nickname change
    const handleChangeNickname = async () => {
      if (selectedMember && newNickname.trim()) {
        await updateNickname(channelInfo.group_name, selectedMember.user, newNickname);
        setNicknameModalOpened(false); // Close modal after successful update
        setSelectedMember()
      }
    };
    const otherMembers = channelInfo.members?.filter(member => member.user !== currentUserEmail);
  return (
    <Drawer
      opened={drawerOpened}
      onClose={toggleDrawer}
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
      {/* Sidebar Content */}
      <Flex direction="column" align="center" justify="center" spacing="md">
        <Avatar src="https://i.pravatar.cc/300" size={100} radius="100%" alt="User" />
        <Text size="lg" fw={700} >
          {getChannelName()}
        </Text>
        <Text size="sm" >
          Last active: 1 hour ago
        </Text>
      </Flex>

      <Divider my="lg" style={{ backgroundColor: dimmedTextColor }} />

      {/* Action Icons Section */}
      <Group align="center" direction="column" justify="center" spacing="md">
        <Flex direction="column" align="center" justify="center" spacing="md">
        <Link to={`/profiles/${otherMembers[0].user}`}> 
              <ActionIcon size="xl" variant="light">
                <IconUser size={20} />
              </ActionIcon>
              <Text size="xs">
                Profile
              </Text>
            </Link>
        </Flex>
        <Flex direction="column" align="center" justify="center" spacing="md">
          <ActionIcon size="xl" variant="light" onClick = {() => {
            toggleSearchDrawer()
            toggleDrawer()
            }}>
            <IconSearch size={20} />
          </ActionIcon>
          <Text size="xs" >
            Find Message
          </Text>
        </Flex>
      </Group>

      <Divider my="lg" style={{ backgroundColor: dimmedTextColor }} />

      {/* Chat Group Info */}
      <Box mt="lg">
        <Accordion transitionDuration={1000}>
            <Accordion.Item value="chat-info">
                <Accordion.Control >Chat Information</Accordion.Control>
                <Accordion.Panel>
                    <Text size="l" fw="700">
                            Nick Name
                    </Text>
                    {channelInfo.members.map((member) => (
                        <Flex key={member.user} align="center" justify="space-between" m="xs">
                        <Text size="sm" >
                            {member.name || member.user} {member.nickname && `(${member.nickname})`}
                        </Text>
                        <ActionIcon onClick={() => handleOpenNicknameModal(member)}>
                            <IconEdit size={16} />
                        </ActionIcon>
                        </Flex>
                    ))}
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
      </Box>

      {/* Modal for Nickname Change */}
      <Modal
        opened={nicknameModalOpened}
        onClose={() => setNicknameModalOpened(false)}
        title={`Change Nickname for ${selectedMember?.name || selectedMember?.user}`}
      >
        <Input
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          placeholder="Enter new nickname"
          mb="md"
        />
        <Button onClick={handleChangeNickname}>Save</Button>
      </Modal>


    </Drawer>
  );
};

export default RightSidebar;