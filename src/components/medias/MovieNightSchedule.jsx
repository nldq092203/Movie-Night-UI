import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Text } from '@mantine/core';
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { apiBaseUrl } from '../../config';

const localizer = momentLocalizer(moment);

const MovieNightSchedule = ({ theme }) => {
  const [events, setEvents] = useState([]);
  const accessToken = localStorage.getItem('access_token');
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/auth/users/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserEmail(response.data.email);
      } catch (error) {
        console.error('Failed to fetch user email:', error);
      }
    };
    fetchUserEmail();
  }, []);

  useEffect(() => {
    if (userEmail) {
      axios.get(`${apiBaseUrl}/api/v1/participating-movie-nights/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const movieNightData = response.data;

          // Map over movie nights and extract the necessary data
          const movieNightEvents = movieNightData.map((night) => ({
            id: night.id, // Store the movie night ID for navigation
            movieId: night.id, // Store the movie ID
            title: night.movie.title, // Movie title
            start: new Date(night.start_time), // Start time
            end: new Date(moment(night.start_time).add(night.movie.runtime_minutes, 'minutes').toISOString()),
            isMyEvent: night.creator === userEmail // Check if the user is the creator
          }));

          setEvents(movieNightEvents);
        })
        .catch(error => console.error(error));
    }
  }, [userEmail]); // Depend on userEmail to trigger only when it's set

  // Handle event click to navigate to the MovieNightDetail page
  const handleSelectEvent = (event) => {
    navigate(`/movie-nights/${event.movieId}`); // Navigate to the MovieNightDetail page with the movie ID
  };

  // Custom function to assign colors based on whether it's the user's own event
  const eventStyleGetter = (event) => {
    const isDarkMode = theme.colorScheme === 'dark';
    const backgroundColor = event.isMyEvent
      ? isDarkMode ? '#4682B4' : '#1C3448'  // Dark mode: steel blue, Light mode: gold for my events
      : isDarkMode ? '#1C3448' : '#ADD8E6';  // Dark mode: darker blue, Light mode: light blue for other events

    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  const calendarStyle = {
    backgroundColor: theme.colorScheme === 'dark' ? '#2C2E33' : '#ffffff', // Dark mode: dark background, light mode: white background
    color: theme.colorScheme === 'dark' ? '#ffffff' : '#000000', // Text color for calendar
    borderRadius: '8px',
    padding: '10px',
  };

  return (
    <div style={calendarStyle}>
      <Text size="xl" fw={900} style={{ color: theme.colorScheme === 'dark' ? '#ffffff' : '#000000' }}>
        Movie Night Schedule
      </Text>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 1000 }}
        defaultView="week"
        views={["week", "day", "month"]}
        selectable
        popup
        onSelectEvent={handleSelectEvent} // Handle event clicks
        eventPropGetter={eventStyleGetter} // Apply different colors based on ownership
      />
    </div>
  );
};

export default MovieNightSchedule;