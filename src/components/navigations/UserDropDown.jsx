import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Avatar, Text, Group, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconHome, IconUser, IconLogout, IconLogin, IconUserPlus } from '@tabler/icons-react';

function UserDropdown() {
  const { isAuthenticated, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dummy user details for illustration
  const user = {
    name: 'Sarah J',
    status: 'Premium',
    profilePicture: 'https://i.pravatar.cc/300', // Replace with actual user image URL
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group spacing="xs">
            <Avatar src={user.profilePicture} radius="xl" size="lg" />
            <div style={{ flex: 1 }}>
              <Text size="sm" weight={500} color="white">{user.name}</Text>
              <Text size="xs" color="gray">{user.status}</Text>
            </div>
            <IconChevronDown size={18} color="white" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item icon={<IconHome size={16} />} onClick={() => navigate('/')}>
          Home
        </Menu.Item>

        {isAuthenticated ? (
          <>
            <Menu.Item icon={<IconUser size={16} />} onClick={() => navigate('/profile')}>
              Profile
            </Menu.Item>
            <Menu.Item
              icon={<IconLogout size={16} />}
              onClick={handleLogout}
              color="red"
            >
              Sign Out
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item icon={<IconLogin size={16} />} onClick={() => navigate('/login')}>
              Login
            </Menu.Item>
            <Menu.Item icon={<IconUserPlus size={16} />} onClick={() => navigate('/register')}>
              Register
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserDropdown;