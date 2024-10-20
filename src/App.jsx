import React, { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/forms/Login';
import Register from './components/forms/Register';
import MovieDetails from './components/layouts/MovieDetails';
import MovieSearch from './components/layouts/MovieSearch';
import HomePage from './components/layouts/HomePage';
import MovieNightDetails from './components/layouts/MovieNightDetails';
import ChatComponent from './components/chat/ChatComponent'
import Profile from './components/layouts/Profile'

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const themeConfig = { colorScheme: theme };

  return (
    <MantineProvider theme={themeConfig} withGlobalStyles withNormalizeCSS>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomePage theme={themeConfig} toggleTheme={toggleTheme} />} />
          <Route path="/search" element={<MovieSearch theme={themeConfig} toggleTheme={toggleTheme} />} />
          <Route path="/movies/:id" element={<MovieDetails theme={themeConfig} toggleTheme={toggleTheme}/>} />
          <Route path="/movie-nights/:id" element={<MovieNightDetails theme={themeConfig} toggleTheme={toggleTheme} />} />
          <Route path="/chat" element={<ChatComponent theme={themeConfig} toggleTheme={toggleTheme}/>} />
          <Route path="/profiles/:email" element={<Profile  theme={themeConfig} toggleTheme={toggleTheme} />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;