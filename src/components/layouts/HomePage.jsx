import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import MovieCard from '../medias/MovieCard';
import FilterDrawer from '../navigations/FilterDrawer';
import GenreSection from '../medias/GenreFilters';
import Header from '../navigations/Header';
import { Box, Text } from '@mantine/core';

function HomePage({ theme, toggleTheme }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(`${apiBaseUrl}/api/v1/movies/`);
  const [hasMore, setHasMore] = useState(true);
  const [showHeader, setShowHeader] = useState(true);

  const [filters, setFilters] = useState({
    genres: [],
    country: '',
    year: '',
    runtime_minutes: '',
    imdb_rating_from: '',
    runtime_minutes_from: '',
    runtime_minutes_to: '',
    published_from: '',
    published_to: '',
  });
  const [ordering, setOrdering] = useState('');

  const fetchMovies = async (url) => {
    if (!url || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(url, {
        params: {
          genres: filters.genres.length > 0 ? filters.genres.join(',') : undefined,
          country: filters.country,
          year: filters.year,
          runtime_minutes: filters.runtime,
          imdb_rating_from: filters.imdb_rating_from,
          runtime_minutes_from: filters.runtime_minutes_from,
          runtime_minutes_to: filters.runtime_minutes_to,
          ordering,
          published_from: filters.published_from,
          published_to: filters.published_to,
        },
      });

      setMovies((prevMovies) => [...prevMovies, ...response.data.results]);
      setNextPageUrl(response.data.next || null);
      setHasMore(!!response.data.next);
    } catch (err) {
      console.error(err);
      setError('No results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMovies([]);
    setNextPageUrl(`${apiBaseUrl}/api/v1/movies/`);
    setHasMore(true);
    fetchMovies(`${apiBaseUrl}/api/v1/movies/`);
  }, [filters, ordering]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      if (!loading && hasMore) {
        fetchMovies(nextPageUrl);
      }
    }

    setShowHeader(document.documentElement.scrollTop <= 150);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [nextPageUrl, hasMore, loading]);

  return (
    <div className={`min-h-screen relative px-1 py-5 ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`}>
      
      {/* Fixed Header */}
      <div className="fixed w-full top-0 bg-transparent py-4 z-50">
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      {/* Main Content with top padding to avoid overlap */}
      <Box mt={4} mb={8} className='pt-40'>
        <GenreSection theme={theme} apiBaseUrl={apiBaseUrl} filters={filters} setFilters={setFilters} />
      </Box>
      
      <div className="flex justify-end space-x-2 mb-8">
        <FilterDrawer
          filters={filters}
          setFilters={setFilters}
          ordering={ordering}
          setOrdering={setOrdering}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          theme={theme}
        />
      </div>
      
      <div className="container mx-auto px-10 py-10">
        {loading && !movies.length ? (
          <Text align="center" c="dimmed">Loading...</Text>
        ) : error ? (
          <Text align="center" c="red">{error}</Text>
        ) : !movies.length ? (
          <Text align="center" c="dimmed">No movies found. Please search for a movie.</Text>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {movies.map((movie) => (
              <MovieCard theme={theme} key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;