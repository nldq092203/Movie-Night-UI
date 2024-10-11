import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Avatar, Text, Group, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconHome, IconUser, IconLogout, IconLogin, IconUserPlus } from '@tabler/icons-react';

function UserDropdown({ theme }) {
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

  // Determine text and background color based on the theme
  const isDarkMode = theme.colorScheme === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const subTextColor = isDarkMode ? 'gray' : 'gray';
  const dropdownBgColor = isDarkMode ? 'bg-black' : 'bg-transparent';
  const dropdownTextColor = isDarkMode ? 'text-white' : 'text-black';

  return (
    <Menu shadow="md" width={150} transition="pop">
      <Menu.Target>
        <UnstyledButton>
          <Group spacing="xs">
            <Avatar src={user.profilePicture} radius="xl" size="lg" />
            <div style={{ flex: 1 }}>
              <Text size="sm" weight={500} c={textColor}>{user.name}</Text>
              <Text size="xs" c={subTextColor}>{user.status}</Text>
            </div>
            <IconChevronDown size={18} color={textColor} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown className={`${dropdownBgColor} ${dropdownTextColor}`}>
        <Menu.Item icon={<IconHome size={16} />} onClick={() => navigate('/')} style={{ color: textColor }}>
          Home
        </Menu.Item>

        {isAuthenticated ? (
          <>
            <Menu.Item icon={<IconUser size={16} />} onClick={() => navigate('/profile')} style={{ color: textColor }}>
              Profile
            </Menu.Item>
            <Menu.Item
              icon={<IconLogout size={16} />}
              onClick={handleLogout}
              color="red"
              style={{ color: 'red' }}
            >
              Sign Out
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item icon={<IconLogin size={16} />} onClick={() => navigate('/login')} style={{ color: textColor }}>
              Login
            </Menu.Item>
            <Menu.Item icon={<IconUserPlus size={16} />} onClick={() => navigate('/register')} style={{ color: textColor }}>
              Register
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserDropdown;