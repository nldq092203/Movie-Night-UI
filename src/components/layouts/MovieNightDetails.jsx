
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Modal, Button, Group, TextInput, Alert, Text, Box, Image, Accordion, Select } from '@mantine/core';
import { IconClock, IconUser, IconTrash} from '@tabler/icons-react';
import Clock from '../utilities/Clock';
import UserDropdown from '../navigations/UserDropDown';
import { useMovieNightContext } from '../../context/MovieNightContext';
import Header from '../navigations/Header';

function MovieNightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movieNight, setMovieNight] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newStartTime, setNewStartTime] = useState('');
  const [newNotificationTime, setNewNotificationTime] = useState('PT5M');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const accessToken = localStorage.getItem('access_token');
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showPendingInvitees, setShowPendingInvitees] = useState(true);
  const { invitationData } = useMovieNightContext();
  const { attendanceConfirmed, isAttending, movienight_invitation_id } = invitationData || {};

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get('http://localhost:8000/auth/users/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserEmail(response.data.results[0].email);
      } catch (error) {
        console.error('Failed to fetch user email:', error);
      }
    };
    fetchUserEmail();
  }, []);

  const fetchMovieNightDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/movie-nights/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMovieNight(response.data);
      setNewStartTime(response.data.start_time);
      setNewNotificationTime(response.data.start_notification_before);
    } catch {
      setErrors((prev) => ({ ...prev, fetch: 'Failed to fetch movie night details' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieNightDetails();
  }, [id, accessToken]);

  const fetchMovieDetails = async () => {
    if (movieNight?.movie) {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/movies/${movieNight.movie}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setMovieDetails(response.data);
      } catch (error) {
        console.error(error);
        setErrors((prev) => ({ ...prev, fetchMovie: 'Failed to fetch movie details' }));
      }
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [movieNight?.movie]);

  const handleStartTimeUpdate = async () => {
    setErrors({});
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/v1/movie-nights/${id}/`,
        { start_time: newStartTime },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMovieNight((prev) => ({ ...prev, start_time: response.data.start_time }));
      setIsUpdatingTime(false);
    } catch (error) {
      const errorMessage = error.response?.data?.start_time?.[0] || 'Failed to update start time';
      setErrors((prev) => ({ ...prev, update: errorMessage }));
    }
  };

  const handleDelete = async () => {
    setErrors({});
    try {
      await axios.delete(`http://localhost:8000/api/v1/movie-nights/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      navigate(`/movies/${movieNight.movie}/`);
    } catch {
      setErrors((prev) => ({ ...prev, delete: 'Failed to delete movie night' }));
    }
  };

  const handleInvite = async () => {
    setErrors({});
    try {
      await axios.post(
        `http://localhost:8000/api/v1/movie-nights/${id}/invite/`,
        { invitee: inviteeEmail, movie_night: id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMovieNight((prev) => ({
        ...prev,
        pending_invitees: [...(prev.pending_invitees || []), inviteeEmail],
      }));
      setInviteeEmail('');
      setIsInviting(false);
    } catch (error) {
      const errorMessage = error.response?.data?.non_field_errors?.[0] || 'Failed to send the invitation';
      setErrors((prev) => ({ ...prev, invite: errorMessage }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!movieNight) return null;

  const formattedDate = format(new Date(movieNight.start_time), 'EEEE, d MMMM yyyy');
  const formattedTime = format(new Date(movieNight.start_time), 'HH:mm');

  return (
    <div className="min-h-screen relative px-8 py-5 bg-black">
      <Header/>
      <Box className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
        
        <Clock startTime={movieNight.start_time} />


        <Box className=" bg-black text-white p-6 flex flex-row items-center">
          {/* Poster Section */}
          <Group position="center" mt="lg" >
            {movieDetails && movieDetails.url_poster ? (
              <Image src={movieDetails.url_poster} alt={movieDetails.title} radius="md" />
            ) : (
              <Box
              sx={(theme) => ({
                backgroundColor: theme.colors.dark[5],
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
              })}
              >
                <Text c="dimmed">No poster available</Text>
              </Box>
            )}
          </Group>

          <Box className="flex-1 p-6 bg-tranparent text-white" ml="5em" borderRadius="md" shadow="sm">
            {/* Movie Title */}
            <Text size="xl" weight={700} style={{ fontWeight:"bold", fontSize: '2.5rem', lineHeight: 1.2, color: 'white' }}>
              {movieDetails?.title || 'Movie Night'}
            </Text>

            {/* Creator */}
            <Text mb="2em" style={{ color: 'gray', fontSize: '1.5rem'}}>
              <strong>Creator</strong>: {movieNight.creator}
            </Text>

            {/* Accordion Section */}
            <Group mb="3em"s pacing="lg">
              {/* Participants Section */}
              <Box style={{ flex: 1 }}>
                <Button 
                  variant="subtle" 
                  color="gray" 
                  onClick={() => setShowParticipants((prev) => !prev)}
                >
                </Button>
                {showParticipants && (
                  <Accordion variant="separated" styles={{ control: { backgroundColor: '#333', color: 'white' } }}>
                    <Accordion.Item value="participants">
                      <Accordion.Control>Participants</Accordion.Control>
                      <Accordion.Panel>
                        {movieNight.participants.length > 0 ? (
                          movieNight.participants.map((participant) => (
                            <Text key={participant.id} style={{ color: 'black' }}>
                              {participant}
                            </Text>
                          ))
                        ) : (
                          <Text style={{ color: 'gray' }}>No participants</Text>
                        )}
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}
              </Box>

              {/* Pending Invitees Section */}
              <Box style={{ flex: 1 }}>
                <Button 
                  variant="subtle" 
                  color="black" 
                  onClick={() => setShowPendingInvitees((prev) => !prev)}
                >
                
                </Button>
                {showPendingInvitees && (
                  <Accordion variant="separated" styles={{ control: { backgroundColor: '#333', color: 'white' } }}>
                    <Accordion.Item value="pending-invitees">
                      <Accordion.Control>Pending Invitees</Accordion.Control>
                      <Accordion.Panel>
                        {movieNight.pending_invitees.length > 0 ? (
                          movieNight.pending_invitees.map((invitee) => (
                            <Text style={{ color: 'black' }} key={invitee} >
                              {invitee}
                            </Text>
                          ))
                        ) : (
                          <Text style={{ color: 'black' }}>No pending invitees</Text>
                        )}
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}
              </Box>
            </Group>
            <Group mt="lg" spacing="sm">
                <Button 
                color="blue" 
                radius="md"
                onClick={() => setIsUpdatingTime(true)}
                >
                  <IconClock style={{ marginRight: 8 }} />
                  Update Start Time
                </Button>
                <Button 
                color="green" 
                radius="md"
                onClick={() => setIsInviting(true)}
                >
                  <IconUser style={{ marginRight: 8 }} />
                  Invite Friends
                </Button>
                <Button 
                color="red" 
                radius="md"
                onClick={() => setIsConfirmingDelete(true)}
                >
                  <IconTrash style={{ marginRight: 8 }} />
                  Delete Movie Night
                </Button>
            </Group>
          </Box>
        </Box>  

        <Modal
          opened={isUpdatingTime}
          onClose={() => setIsUpdatingTime(false)}
          title="Update Start Time"
          centered
          styles={{
            modal: { backgroundColor: '#000', border: 'none' }, 
            header: { color: '#ffff', backgroundColor: '#000'}, // Title color
            body: { backgroundColor: '#1f1f1f', color: '#e0e0e0' } // Body text color
          }}
        >
          <TextInput
            type="datetime-local"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            error={errors.update}
          />
          <Select
            label="Notify me before"
            value={newNotificationTime}
            onChange={(value) => setNewNotificationTime(value)}
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
          />
          <Group position="right" mt="md">
            <Button color="dark" onClick={() => setIsUpdatingTime(false)}  styles={{ root: { backgroundColor: '#666', color: '#ffffff' } }}>
              Cancel
            </Button>
            <button
                onClick={handleStartTimeUpdate}
                className="bg-blue-500 px-4 py-2 text-white rounded-lg"
              >
                Save
              </button>
          </Group>
        </Modal>

        <Modal
          opened={isConfirmingDelete}
          onClose={() => setIsConfirmingDelete(false)}
          title="Confirm Delete"
          centered
          styles={{
            modal: { backgroundColor: '#000', border: 'none' }, 
            header: { color: '#ffff', backgroundColor: '#000'}, // Title color
            body: { backgroundColor: '#1f1f1f', color: '#e0e0e0' } // Body text color
          }}
        >
          <Text>Are you sure you want to delete this movie night?</Text>
          {errors.delete && <Alert color="red" mt="md">{errors.delete}</Alert>}
          <Group position="right" mt="md">
            <Button color="gray" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Modal>

        <Modal
          opened={isInviting}
          onClose={() => setIsInviting(false)}
          title="Invite a Friend"
          centered
          styles={{
            modal: { backgroundColor: '#000', border: 'none' }, 
            header: { color: '#ffff', backgroundColor: '#000'}, // Title color
            body: { backgroundColor: '#1f1f1f', color: '#e0e0e0' } // Body text color
          }}
        >
          <TextInput
            type="email"
            value={inviteeEmail}
            onChange={(e) => setInviteeEmail(e.target.value)}
            placeholder="Enter email"
            error={errors.invite}
          />
          <Group position="right" mt="md">
            <Button color="gray" onClick={() => setIsInviting(false)}>
              Cancel
            </Button>
            <Button color="green" onClick={handleInvite}>
              Send Invite
            </Button>
          </Group>
        </Modal>
      </Box>
    </div>
  );
}

export default MovieNightDetails;