import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Avatar, Text, Group, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconHome, IconUser, IconLogout, IconLogin, IconUserPlus } from '@tabler/icons-react';
import axios from 'axios';
import { apiBaseUrl } from '../../config'; // Replace with your config for base API URL
import { AuthContext } from '../../context/AuthContext';

function UserDropdown({ theme }) {
  const { isAuthenticated, logoutUser } = useContext(AuthContext);
  const [user, setUser] = useState({ email: '', profilePicture: ''});
  const accessToken = localStorage.getItem('access_token');
  const navigate = useNavigate();

  // Fetch user email and profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userEmailResponse = await axios.get(`${apiBaseUrl}/auth/users/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userEmail = userEmailResponse.data.email;
        console.log(userEmail)
        if(userEmail){
          const profileResponse = await axios.get(`${apiBaseUrl}/api/v1/profiles/${userEmail}/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const profileData = profileResponse.data;
          console.log(profileData)
          setUser({
            email: profileData.user,
            name: profileData.name || 'Anonymous',
            profilePicture: profileData.avatar_url || 'https://http.cat/404',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken]);

  const handleLogout = () => {
    logoutUser();
    setUser({ email: '', profilePicture: ''})
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
              <Text size="sm" fw={500} c={textColor}>{user.email}</Text>
            </div>
            <IconChevronDown size={18} color={textColor} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown className={`${dropdownBgColor} ${dropdownTextColor}`}>
        <Menu.Item icon={<IconHome size={16} />} onClick={() => navigate('/')} style={{ color: textColor }}>
          Home
        </Menu.Item>

        {user.email ? (
          <>
            <Menu.Item icon={<IconUser size={16} />} onClick={() => navigate(`/profiles/${user.email}`)} style={{ color: textColor }}>
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