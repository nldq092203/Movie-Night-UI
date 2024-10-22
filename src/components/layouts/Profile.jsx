import React, { useState, useEffect } from 'react';
import { Avatar, Text, Group, Flex, Box, Button, Divider, Tabs, Modal, TextInput, Textarea, Select, Loader, ActionIcon } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import Header from '../navigations/Header';
import axios from "axios";
import { apiBaseUrl } from '../../config';
import MovieNightSchedule from '../medias/MovieNightSchedule';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Profile = ({ theme, toggleTheme }) => {
  const [user, setUser] = useState({ email: '', bio: '', gender: '', customGender: '', name: '' });
  const [editProfileOpen, setEditProfileOpen] = useState(false); // Modal open state
  const [findFriendOpen, setFindFriendOpen] = useState(false); // Modal for Find Friend
  const [friendEmail, setFriendEmail] = useState(''); // Store friend's email input
  const [findFriendError, setFindFriendError] = useState(''); // Error message for friend search
  const [updatedUser, setUpdatedUser] = useState(user); // Store form updates
  const [loading, setLoading] = useState(true); // Loading state
  const [myEmail, setMyEmail] = useState(null); // Store the fetched email of the logged-in user
  const accessToken = localStorage.getItem('access_token');
  const { email } = useParams();
  const navigate = useNavigate(); // Use navigate hook to change routes
  const [messageError, setMessageError] = useState(''); // Error for creating chat group

  // Fetch user email and profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch the logged-in user's email
        const userEmailResponse = await axios.get(`${apiBaseUrl}/auth/users/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const loggedInEmail = userEmailResponse.data.email;
        setMyEmail(loggedInEmail); // Store logged-in user's email in state

        if (email) {
          const profileResponse = await axios.get(`${apiBaseUrl}/api/v1/profiles/${email}/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const profileData = profileResponse.data;
          setUser({
            email: profileData.user || '',
            name: profileData.name || 'Not known',
            bio: profileData.bio || '🌞',
            gender: profileData.gender || '',
            customGender: profileData.customGender || '',
          });
          setUpdatedUser({
            ...profileData,
          });
        }
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setLoading(false); // Stop loading even if there is an error
      }
    };

    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken, email]);

    // Function to create a new chat group without request body content
    const handleChatGroup = async () => {
      setMessageError(''); // Reset any previous errors
  
      try {
        const response = await axios.post(
          `${apiBaseUrl}/api/v1/chat-group/`, // API endpoint
          {
            is_private: true,
            member_emails : [myEmail, email]
          }, 
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(response.data)
        
        navigate(`/chat`);
      } catch (error) {
        console.error('Failed to create chat group:', error);
        setMessageError('Failed to create a chat group. Please try again.');
      }
    };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setUpdatedUser((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Find Friend form submission
  const handleFindFriend = async (e) => {
    e.preventDefault();
    setFindFriendError(''); // Reset any previous errors

    try {
      // Fetch the friend's profile using the entered email
      const response = await axios.get(`${apiBaseUrl}/api/v1/profiles/${friendEmail}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // If the profile exists, navigate to the friend's profile page
      navigate(`/profiles/${friendEmail}`);
      setFindFriendOpen(false); // Close the modal
    } catch (error) {
      console.error('Failed to find friend:', error);
      // If the email does not exist, show an error message
      setFindFriendError("User's email does not exist.");
    }
  };

  // Submit form data to the server
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      await axios.put(`${apiBaseUrl}/api/v1/profiles/${email}/`, updatedUser, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(updatedUser); // Update the user profile in the state
      setEditProfileOpen(false); // Close modal after successful update
    } catch (error) {
      console.error('Failed to update user profile:', error.response?.data || error.message); // Log detailed error
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" color={theme.colorScheme === 'dark' ? 'white' : 'black'} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start ${
        theme.colorScheme === 'dark'
          ? 'bg-black text-white'
          : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'
      }`}
    >
      {/* Fixed Header */}
      <div className="fixed w-full top-0 bg-transparent z-50">
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main profile container */}
      <div
        className={`flex-grow w-full flex flex-col items-center justify-center ${
          theme.colorScheme === 'dark'
            ? 'bg-black text-white'
            : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'
        }`}
        style={{
          paddingTop: '6rem', // Adjust padding to account for the fixed header
        }}
      >
        <Box
          className={`w-full max-w-7xl pt-8`} // Full width but constrained to a max width for larger screens
          style={{
            margin: '0 auto',
            textAlign: 'center',
            padding: '2rem', // Adjust padding for more spacing
          }}
        >
          {/* Profile Header Section */}
          <Flex align="center" justify="center" direction="row" spacing="xl" style={{ marginBottom: '2rem', width: '100%' }}>
            {/* Avatar Section */}
            <Group position="center" p="lg" style={{ marginRight: '2rem' }}>
              <Avatar
                src={user.profilePicture || 'https://i.pravatar.cc/300'} // Replace with profile image source
                size={200} // Increased avatar size
                radius="100%"
                alt="Profile Image"
              />
            </Group>

            {/* Name and Info Section */}
            <Flex direction="column" style={{ flex: 1 }} p="lg">
              {/* Name and Bio */}
              <Text fw={700} size="xl" style={{ textAlign: 'left' }}>
                {user.email || 'User Name'}
              </Text>
              <Text size="lg" c="dimmed" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                {user.bio || 'User bio goes here.'}
              </Text>

              {/* Name and Gender Section */}
              <Group mt="lg" spacing="md">
                <Text size="lg" fw={700}>
                  <strong>Name: </strong>
                </Text>
                <Text size="lg" c="dimmed">
                  {user.name || 'No email available.'}
                </Text>

                <Divider my="lg" />

                <Text size="lg" fw={700}>
                  <strong>Gender:</strong>
                </Text>
                <Text size="lg" c="dimmed">
                  {user.gender === 'Custom' && user.customGender ? user.customGender : user.gender || 'Not specified'}
                </Text>
              </Group>

              {/* Edit and Archive Buttons */}
              {myEmail === email &&(
                <Group mt="lg" spacing="lg">   
                    <Button variant="outline" size="md" onClick={() => setEditProfileOpen(true)}> {/* Increased button size */}
                      Edit profile
                    </Button>
                    <Button variant="outline" size="md" onClick={() => setFindFriendOpen(true)}> {/* Increased button size */}
                      Find Friend
                    </Button>
                </Group>
              )}
              {/* Message Icon for Creating a Chat */}
              {myEmail !== email && (
                <Group mt="lg" spacing="lg">   
                  <ActionIcon size="lg" variant="outline" onClick={handleChatGroup}>
                    <IconMessageCircle size={30} />
                  </ActionIcon>
                  {messageError && (
                    <Text c="red" size="sm">
                      {messageError}
                    </Text>
                  )}
                </Group>
              )}
            </Flex>
          </Flex>

          <Divider my="lg" />

          {/* Tabs Section */}
         {myEmail === email && (
          <Tabs defaultValue="events" mt="xl" variant="outline" position="center">
            <Tabs.List>
              <Tabs.Tab value="events">Events</Tabs.Tab>
              <Tabs.Tab value="emotions">Emotions</Tabs.Tab>
              <Tabs.Tab value="liked">Liked</Tabs.Tab>
            </Tabs.List>

            {/* Tab content for Events */}
            <Tabs.Panel value="events" pt="xs">
              <div
                style={{
                  width: '100%', // Full width of parent container
                  height: 'auto', // Adjust height automatically
                  padding: '1rem', // Add padding if needed
                }}
              >
                <MovieNightSchedule theme={theme} style={{ width: '100%', height: 'auto' }} /> {/* Ensure full width */}
              </div>
            </Tabs.Panel>
          </Tabs>
          )}

          {/* Modal for Editing Profile */}
          <Modal
            opened={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            title="Edit Profile"
            size="lg"
          >
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Name"
                value={updatedUser.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
                required
              />
              <Textarea
                label="Bio"
                value={updatedUser.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Your bio"
              />
              <Select
                label="Gender"
                value={updatedUser.gender}
                onChange={(value) => handleInputChange('gender', value)}
                data={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Custom', label: 'Custom' },
                ]}
              />
              {updatedUser.gender === 'Custom' && (
                <TextInput
                  label="Custom Gender"
                  value={updatedUser.customGender}
                  onChange={(e) => handleInputChange('customGender', e.target.value)}
                  placeholder="Specify your gender"
                />
              )}
              <Button fullWidth mt="md" type="submit">
                Save
              </Button>
            </form>
          </Modal>

          {/* Modal for Finding Friend */}
          <Modal
            opened={findFriendOpen}
            onClose={() => setFindFriendOpen(false)}
            title="Find Friend"
            size="lg"
          >
            <form onSubmit={handleFindFriend}>
              <TextInput
                label="Enter friend's email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="friend@example.com"
                required
              />
              {findFriendError && (
                <Text color="red" size="sm" mt="sm">
                  {findFriendError}
                </Text>
              )}
              <Button fullWidth mt="md" type="submit">
                Find
              </Button>
            </form>
          </Modal>
        </Box>
      </div>
    </div>
  );
};

export default Profile;