import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import { Button, Modal, TextInput, Select, Divider, Paper, Center, ActionIcon } from '@mantine/core';
import { IconPlus, IconChevronDown, IconX } from '@tabler/icons-react';

function CreateMovieNightBtn({ movieId }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [notificationTime, setNotificationTime] = useState('PT5M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movieNights, setMovieNights] = useState([]);
  const dropdownRef = useRef(null);

  const fetchMovieNights = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const now = new Date().toISOString();
      const response = await axios.get(
        `${apiBaseUrl}/api/v1/my-movie-nights/`,
        {
          params: { 
            ordering: 'movieId',
            start_from: now,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setMovieNights(response.data.results);
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
        `${apiBaseUrl}/api/v1/my-movie-nights/`,
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
          color="yellow"
          radius="md"
          style={{ borderRadius: '0.5rem 0 0 0.5rem' }}
          leftSection={<IconPlus className='text-black'/>} // Using leftSection instead of leftIcon
          styles={{ label: { color: 'black' } }}
        >
          Create Movie Night
        </Button>

        <Button
          onClick={toggleDropdown}
          color="yellow"
          radius="md"
          style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
        >
          <IconChevronDown className="text-black" />
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
          modal: { backgroundColor: '#000', border: 'none'}, 
          body: { backgroundColor: '#1f1f1f' } 
        }}
      >
          <ActionIcon
            onClick={() => setIsDropdownOpen(false)}
            style={{ position: 'absolute', top: 10, right: 10}}
          >
            <IconX size={20} className="bg-black"/>
          </ActionIcon>

          <div style={{ backgroundColor: '#000', padding: '1rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
            <h3 className="font-bold text-white">Your Movie Nights</h3>
          </div>

          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {movieNights.length > 0 ? (
              <ul className="space-y-2">
                {movieNights.map((night) => (
                  <li key={night.id} className="flex justify-between items-center text-white">
                    <span>{new Date(night.start_time).toLocaleString()}</span>
                    <a href={`/movie-nights/${night.id}`} className="text-blue-500 underline hover:text-blue-700">View</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white">No movie nights found for this movie.</p>
            )}
          </div>
      </Modal>
      
      <Modal
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create Movie Night"
        centered
        styles={{
          modal: { backgroundColor: '#000', border: 'none' }, 
          header: { color: '#ffff', backgroundColor: '#000'}, // Title color
          body: { backgroundColor: '#1f1f1f', color: '#e0e0e0' } // Body text color
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
              input: { backgroundColor: '#333', color: '#e0e0e0', borderColor: '#444' },
              label: { color: '#ffffff' }
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
              input: { backgroundColor: '#333', color: '#e0e0e0', borderColor: '#444' },
              dropdown: { backgroundColor: '#1a1a1a', color: '#e0e0e0' },
              label: { color: '#ffffff' }
            }}
          />
          <Divider my="sm" color="#444" />
          <div className="flex justify-end space-x-2">
            <Button type="submit" color="dark" styles={{ root: { backgroundColor: '#444', color: '#ffffff' } }}>
              Create
            </Button>
            <Button color="dark" onClick={() => setIsFormOpen(false)} styles={{ root: { backgroundColor: '#666', color: '#ffffff' } }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CreateMovieNightBtn;