import React, { useState, useEffect } from 'react';
import { Loader, Box } from '@mantine/core';
import Header from '../navigations/Header';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import AvatarModals from './AvatarModals';
import EditProfileModal from './EditProfileModal';
import FindFriendModal from './FindFriendModal';
import ProfileTabs from './ProfileTabs';

const Profile = ({ theme, toggleTheme }) => {
  const [user, setUser] = useState({ email: '', bio: '', gender: '', customGender: '', name: '', avatar_url: '' });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [findFriendOpen, setFindFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [findFriendError, setFindFriendError] = useState('');
  const [updatedUser, setUpdatedUser] = useState(user);
  const [loading, setLoading] = useState(true);
  const [myEmail, setMyEmail] = useState(null);
  const accessToken = localStorage.getItem('access_token');
  const { email } = useParams();
  const navigate = useNavigate();
  const [messageError, setMessageError] = useState('');
  const [avatarOptionsOpen, setAvatarOptionsOpen] = useState(false);
  const [viewAvatarOpen, setViewAvatarOpen] = useState(false);
  const [uploadAvatarOpen, setUploadAvatarOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userEmailResponse = await axios.get(`${apiBaseUrl}/auth/users/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const loggedInEmail = userEmailResponse.data.email;
        setMyEmail(loggedInEmail);

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
            customGender: profileData.custom_gender || '',
            avatar_url: profileData.avatar_url || ''
          });
          setUpdatedUser({ ...profileData });
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken, email]);

  const handleChatGroup = async () => {
    setMessageError('');
    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/v1/chat-group/`,
        {
          is_private: true,
          member_emails: [myEmail, email]
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      navigate(`/chat`);
    } catch (error) {
      console.error('Failed to create chat group:', error);
      setMessageError('Failed to create a chat group. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setUpdatedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleFindFriend = async (e) => {
    e.preventDefault();
    setFindFriendError('');
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/profiles/${friendEmail}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      navigate(`/profiles/${friendEmail}`);
      setFindFriendOpen(false);
    } catch (error) {
      setFindFriendError("User's email does not exist.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBaseUrl}/api/v1/profiles/${email}/`, updatedUser, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(updatedUser);
      setEditProfileOpen(false);
    } catch (error) {
      console.error('Failed to update user profile:', error.response?.data || error.message);
    }
  };

  const handleAvatarClick = () => {
    setAvatarOptionsOpen(true);
  };

  const handleAvatarUpload = async (formData) => {

    try {
        const response = await axios.post(`${apiBaseUrl}/api/v1/profiles/upload-avt/`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setUser((prevUser) => ({ ...prevUser, avatar_url: response.data.avatar_url }));
        setUploadAvatarOpen(false);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" color={theme.colorScheme === 'dark' ? 'white' : 'black'} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`}>
      <div className="fixed w-full top-0 bg-transparent z-50">
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>
      <div className={`flex-grow w-full flex flex-col items-center justify-center ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`} style={{ paddingTop: '6rem' }}>
        <Box className="w-full max-w-7xl pt-8" style={{ margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
          <ProfileHeader
            user={user}
            myEmail={myEmail}
            email={email}
            handleAvatarClick={handleAvatarClick}
            setEditProfileOpen={setEditProfileOpen}
            setFindFriendOpen={setFindFriendOpen}
            handleChatGroup={handleChatGroup}
            messageError={messageError}
          />
          <AvatarModals
            avatarOptionsOpen={avatarOptionsOpen}
            setAvatarOptionsOpen={setAvatarOptionsOpen}
            viewAvatarOpen={viewAvatarOpen}
            setViewAvatarOpen={setViewAvatarOpen}
            uploadAvatarOpen={uploadAvatarOpen}
            setUploadAvatarOpen={setUploadAvatarOpen}
            handleAvatarUpload={handleAvatarUpload}
            user={user}
          />
          <ProfileTabs theme={theme} myEmail={myEmail} email={email} />
          <EditProfileModal
            editProfileOpen={editProfileOpen}
            setEditProfileOpen={setEditProfileOpen}
            updatedUser={updatedUser}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
          <FindFriendModal
            findFriendOpen={findFriendOpen}
            setFindFriendOpen={setFindFriendOpen}
            friendEmail={friendEmail}
            setFriendEmail={setFriendEmail}
            findFriendError={findFriendError}
            handleFindFriend={handleFindFriend}
          />
        </Box>
      </div>
    </div>
  );
};

export default Profile;