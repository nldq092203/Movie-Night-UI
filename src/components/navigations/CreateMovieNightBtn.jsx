import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import { Button, Modal, TextInput, Select, Divider, Paper, Center, ActionIcon } from '@mantine/core';
import { IconPlus, IconChevronDown, IconX } from '@tabler/icons-react';

function CreateMovieNightBtn({ movieId, theme }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [notificationTime, setNotificationTime] = useState('PT5M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movieNights, setMovieNights] = useState([]);
  const dropdownRef = useRef(null);

  const isDarkMode = theme.colorScheme === 'dark';

  const fetchMovieNights = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const now = new Date().toISOString();
      console.log(movieId)
      const response = await axios.get(
        `${apiBaseUrl}/api/v1/movies/${movieId}/my-movie-nights/`,
        {
          params: { 
            ordering: 'movieId',
            start_from: now,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setMovieNights(response.data.results);
      console.log(response.data.results)
    } catch (err) {
      console.error('Error fetching movie nights:', err);
      setError('Failed to fetch movie nights.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      const notificationInSeconds = convertDurationToSeconds(notificationTime);
      const response = await axios.post(
        `${apiBaseUrl}/api/v1/movies/${movieId}/my-movie-nights/`,
        {
          movie: movieId,
          start_time: startTime,
          start_notification_before: notificationInSeconds,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        fetchMovieNights();
        setIsFormOpen(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.start_time?.[0] || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const convertDurationToSeconds = (duration) => {
    if (duration.includes('H')) {
      const hours = parseInt(duration.replace('PT', '').replace('H', ''), 10);
      return hours * 3600;
    }
    if (duration.includes('M')) {
      const minutes = parseInt(duration.replace('PT', '').replace('M', ''), 10);
      return minutes * 60;
    }
    return 0;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) fetchMovieNights();
  };

  return (
    <div className="relative create-movie-night">
      <div className="flex items-center">
        <Button
          onClick={() => setIsFormOpen(true)}
          color={isDarkMode ? 'yellow' : 'blue'}
          radius="md"
          style={{ borderRadius: '0.5rem 0 0 0.5rem' }}
          leftSection={<IconPlus className={isDarkMode ? 'text-black' : 'text-white'} />}
          styles={{ label: { color: isDarkMode ? 'black' : 'white' } }}
        >
          Create Movie Night
        </Button>

        <Button
          onClick={toggleDropdown}
          color={isDarkMode ? 'yellow' : 'blue'}
          radius="md"
          style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
        >
          <IconChevronDown className={isDarkMode ? 'text-black' : 'text-white'} />
        </Button>
      </div>

      {/* Modal for Movie Night List */}
      <Modal
        opened={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        centered
        size="lg"
        radius="md"
        withCloseButton={false}
        styles={{
          modal: {
            backgroundColor: theme.colorScheme === 'dark' ? '#000' : '#fff',
            border: 'none',
            color: theme.colorScheme === 'dark' ? '#fff' : '#000',
          },
          body: {
            backgroundColor: theme.colorScheme === 'dark' ? '#1f1f1f' : '#f0f0f0',
            color: theme.colorScheme === 'dark' ? '#e0e0e0' : '#333',
          }
        }}
      >
          <ActionIcon
            onClick={() => setIsDropdownOpen(false)}
            style={{ position: 'absolute', top: 10, right: 10}}
          >
            <IconX size={20} className={isDarkMode ? 'text-white' : 'text-black'}/>
          </ActionIcon>

          <div style={{ backgroundColor: isDarkMode ? '#000' : '#f0f0f0', padding: '1rem' }}>
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Your Movie Nights</h3>
          </div>

          <div style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', padding: '1rem' }}>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {movieNights.length > 0 ? (
              <ul className="space-y-2">
                {movieNights.map((night) => (
                  <li key={night.id} className={`flex justify-between items-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    <span>{new Date(night.start_time).toLocaleString()}</span>
                    <a href={`/movie-nights/${night.id}`} className={`${isDarkMode ? 'text-blue-500' : 'text-blue-800'} underline hover:text-blue-700`}>View</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${isDarkMode ? 'text-white' : 'text-black'}`}>No movie nights found for this movie.</p>
            )}
          </div>
      </Modal>
      
      <Modal
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create Movie Night"
        centered
        styles={{
          modal: { backgroundColor: isDarkMode ? '#000' : '#fff', border: 'none' }, 
          header: { color: isDarkMode ? '#ffff' : '#333', backgroundColor: isDarkMode ? '#000' : '#fff'}, 
          body: { backgroundColor: isDarkMode ? '#1f1f1f' : '#f9f9f9', color: isDarkMode ? '#e0e0e0' : '#333' } 
        }}
      >
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleFormSubmit}>
          <TextInput
            type="datetime-local"
            label="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            styles={{
              input: { backgroundColor: isDarkMode ? '#333' : '#e0e0e0', color: isDarkMode ? '#e0e0e0' : '#333', borderColor: isDarkMode ? '#444' : '#ddd' },
              label: { color: isDarkMode ? '#ffffff' : '#333' }
            }}
          />
          <Select
            label="Notify me before"
            value={notificationTime}
            onChange={(value) => setNotificationTime(value)}
            data={[
              { value: 'PT5M', label: '5 minutes before' },
              { value: 'PT15M', label: '15 minutes before' },
              { value: 'PT30M', label: '30 minutes before' },
              { value: 'PT1H', label: '1 hour before' },
              { value: 'PT2H', label: '2 hours before' },
              { value: 'PT3H', label: '3 hours before' },
              { value: 'PT6H', label: '6 hours before' },
              { value: 'PT12H', label: '12 hours before' },
              { value: 'PT24H', label: '24 hours before' },
            ]}
            styles={{
              input: { backgroundColor: isDarkMode ? '#333' : '#e0e0e0', color: isDarkMode ? '#e0e0e0' : '#333', borderColor: isDarkMode ? '#444' : '#ddd' },
              dropdown: { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', color: isDarkMode ? '#e0e0e0' : '#333' },
              label: { color: isDarkMode ? '#ffffff' : '#333' }
            }}
          />
          <Divider my="sm" color={isDarkMode ? '#444' : '#ddd'} />
          <div className="flex justify-end space-x-2">
            <Button type="submit" color="dark" styles={{ root: { backgroundColor: isDarkMode ? '#444' : '#ddd', color: isDarkMode ? '#ffffff' : '#333' } }}>
              Create
            </Button>
            <Button color="dark" onClick={() => setIsFormOpen(false)} styles={{ root: { backgroundColor: isDarkMode ? '#666' : '#ccc', color: isDarkMode ? '#ffffff' : '#333' } }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CreateMovieNightBtn;