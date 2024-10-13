
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Modal, Button, Group, TextInput, Alert, Text, Box, Image, Accordion, Select, Card } from '@mantine/core';
import { IconClock, IconUser, IconTrash} from '@tabler/icons-react';
import Clock from '../utilities/Clock';
import Header from '../navigations/Header';
import { apiBaseUrl } from '../../config';

function MovieNightDetails({ theme, toggleTheme }) {
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
  const [showConfirmInvitation, setShowConfirmInvitation] = useState(false)
  const [inviteError, setInviteError] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/auth/users/`, {
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
      const response = await axios.get(`${apiBaseUrl}/api/v1/movie-nights/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMovieNight(response.data);
      setNewStartTime(response.data.start_time);
      setNewNotificationTime(response.data.start_notification_before);
      setShowConfirmInvitation(response.data.invitation_status.is_invited && !response.data.invitation_status.attendance_confirmed)
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
        const response = await axios.get(`${apiBaseUrl}/api/v1/movies/${movieNight.movie}/`, {
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
        `${apiBaseUrl}/api/v1/movie-nights/${id}/`,
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
      await axios.delete(`${apiBaseUrl}/api/v1/movie-nights/${id}/`, {
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
        `${apiBaseUrl}/api/v1/movie-nights/${id}/invite/`,
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

  const handleInvitationResponse = async (isAttending) => {
    try {
      await axios.patch(
        `${apiBaseUrl}/api/v1/movienight-invitations/${id}/`,
        {
          is_attending: isAttending,
          attendance_confirmed: true,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setMovieNight((prevMovieNight) => {
        let updatedParticipants = [...prevMovieNight.participants];
        let updatedPendingInvitees = [...prevMovieNight.pending_invitees];

        if (isAttending) {
          if (!updatedParticipants.includes(userEmail)) {
            updatedParticipants.push(userEmail);
          }
          updatedPendingInvitees = updatedPendingInvitees.filter(
            (invitee) => invitee !== userEmail
          );
        } else {
          updatedParticipants = updatedParticipants.filter(
            (participant) => participant !== userEmail
          );
        }

        return {
          ...prevMovieNight,
          participants: updatedParticipants,
          pending_invitees: updatedPendingInvitees,
        };
      });

      setShowConfirmInvitation(false) // To hide the invitation banner
    } catch (error) {
      console.error("Failed to respond to the invitation:", error);
      setInviteError('Failed to respond to the invitation');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!movieNight) return null;
  const isCreator = userEmail === movieNight.creator

  const isDarkMode = theme.colorScheme === 'dark';
  return (
    <div  className={`min-h-screen flex flex-col items-center justify-center ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`}>
      {/* Fixed Header */}
      <div className="fixed w-full top-0 bg-transparent py-4 z-50">
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className={`min-h-screen flex flex-col items-center pt-40 justify-center ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`}>
        {/* Invitation Response Banner */}
        {showConfirmInvitation && (
          <Card shadow="md" padding="lg" radius="md"  className={`w-full max-w-4xl mb-6 ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'shadow-lg bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'} bg-opacity-90 rounded-lg shadow-lg`}>
            <Text size="lg" weight={500}>
              You have been invited to this movie night. Would you like to attend?
            </Text>
            <Group position="center" spacing="md" mt="sm">
              <Button
                onClick={() => handleInvitationResponse(true)}
                color="green"
                radius="md"
                variant="filled"
              >
                Accept
              </Button>
              <Button
                onClick={() => handleInvitationResponse(false)}
                color="red"
                radius="md"
                variant="filled"
              >
                Decline
              </Button>
            </Group>
            {inviteError && (
              <Alert color="red" mt="md" radius="md">
                {inviteError}
              </Alert>
            )}
          </Card>
        )}
        <Box className={`max-w-6xl w-full p-4 m-10 ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'shadow-lg bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'} bg-opacity-90 rounded-lg shadow-lg`}>
          <Clock startTime={movieNight.start_time} theme={theme}/>
          <Box className={`bg-${isDarkMode ? 'black' : 'transparent'} text-white p-6 flex flex-row items-center`}>
            {/* Poster Section */}
            <Group position="center" mt="lg" >
              {movieDetails && movieDetails.url_poster ? (
                <Image src={movieDetails.url_poster} alt={movieDetails.title} radius="md" />
              ) : (
                <Box
                  sx={{
                    backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text c="dimmed">No poster available</Text>
                </Box>
              )}
            </Group>

            <Box className={`flex-1 p-6 bg-transparent ${isDarkMode ? 'text-white' : 'text-black'}`} ml="5em" shadow="sm">
              {/* Movie Title */}
              <Text size="xl" weight={700} style={{ fontWeight: "bold", fontSize: '2.5rem', lineHeight: 1.2 }}>
                {movieDetails?.title || 'Movie Night'}
              </Text>

              {/* Creator */}
              <Text mb="2em" style={{ color: 'gray', fontSize: '1.5rem'}}>
                <strong>Creator</strong>: {movieNight.creator}
              </Text>

              {/* Accordion Section */}
              <Group mb="3em" spacing="lg">
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
                {isCreator &&
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
                }
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
              modal: { backgroundColor: isDarkMode ? '#000' : '#fff', border: 'none' },
              header: { color: isDarkMode ? '#fff' : '#000', backgroundColor: isDarkMode ? '#000' : '#fff' },
              body: { backgroundColor: isDarkMode ? '#1f1f1f' : '#f0f0f0', color: isDarkMode ? '#e0e0e0' : '#000' }
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
              modal: { backgroundColor: isDarkMode ? '#000' : '#fff', border: 'none' },
              header: { color: isDarkMode ? '#fff' : '#000', backgroundColor: isDarkMode ? '#000' : '#fff' },
              body: { backgroundColor: isDarkMode ? '#1f1f1f' : '#f0f0f0', color: isDarkMode ? '#e0e0e0' : '#000' }
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
              modal: { backgroundColor: isDarkMode ? '#000' : '#fff', border: 'none' },
              header: { color: isDarkMode ? '#fff' : '#000', backgroundColor: isDarkMode ? '#000' : '#fff' },
              body: { backgroundColor: isDarkMode ? '#1f1f1f' : '#f0f0f0', color: isDarkMode ? '#e0e0e0' : '#000' }
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
    </div>
  );
}

export default MovieNightDetails;