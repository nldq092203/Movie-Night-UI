import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/forms/Login';
import Register from './components/forms/Register';
import MovieDetails from './components/layouts/MovieDetails';
import MovieSearch from './components/layouts/MovieSearch';
import HomePage from './components/layouts/HomePage';
import MovieNightDetails from './components/layouts/MovieNightDetails';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

function App() {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<MovieSearch />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movie-nights/:id" element={<MovieNightDetails />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;

