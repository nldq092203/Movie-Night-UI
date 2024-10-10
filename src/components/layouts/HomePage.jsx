import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import MovieCard from '../medias/MovieCard';
import FilterDrawer from '../navigations/FilterDrawer';
import GenreSection from '../medias/GenreFilters';
import Header from '../navigations/Header';
import { Box} from '@mantine/core';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination states
  const [nextPageUrl, setNextPageUrl] = useState(`${apiBaseUrl}/api/v1/movies/`); // Start at the first page
  const [hasMore, setHasMore] = useState(true); // Whether there are more pages
  const [showHeader, setShowHeader] = useState(true); // For the header visibility

  // Filters and sorting state
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

  // Fetch movies from the API
  const fetchMovies = async (url) => {
    if (!url || loading) return; // Prevent multiple simultaneous requests
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(url, {
        params: {
          genres: filters.genres.length > 0 ? filters.genres.join(',') : undefined,
          country: filters.country ? filters.country : undefined,
          year: filters.year ? filters.year : undefined,
          runtime_minutes: filters.runtime ? filters.runtime : undefined,
          imdb_rating_from: filters.imdb_rating_from ? filters.imdb_rating_from : undefined,
          runtime_minutes_from: filters.runtime_minutes_from ? filters.runtime_minutes_from : undefined,
          runtime_minutes_to: filters.runtime_minutes_to ? filters.runtime_minutes_to : undefined,
          ordering: ordering ? ordering : undefined,
          published_from: filters.published_from ? filters.published_from : undefined,
          published_to: filters.published_to ? filters.published_to : undefined,
        },
      });
      
      // Append new movies to the existing list
      setMovies((prevMovies) => [...prevMovies, ...response.data.results]);

      // Check if there's more data to fetch
      if (response.data.next) {
        setNextPageUrl(response.data.next);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError('No results.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch movies on initial load and when filters or ordering change
  useEffect(() => {
    // Reset movie list and page when filters or ordering change
    setMovies([]);
    setNextPageUrl(`${apiBaseUrl}/api/v1/movies/`);
    setHasMore(true);
    fetchMovies(`${apiBaseUrl}/api/v1/movies/`);
  }, [filters, ordering]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      if (!loading && hasMore) {
        fetchMovies(nextPageUrl);
      }
    }

    // Handle header visibility
    if (document.documentElement.scrollTop > 150) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  };

  // Attach scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup on unmount
  }, [nextPageUrl, hasMore, loading]);



  return (
    <div className="min-h-screen relative px-8 py-5 bg-black">
      {/* Header section */}
      < Header />

      {/* Genre Filters */}
      <Box m={40}>
        <GenreSection
          apiBaseUrl={apiBaseUrl}
          filters={filters}
          setFilters={setFilters}
        />
      </Box>

      {/* Category Filters */}
      <div className="flex justify-end space-x-2 mb-8">
        <FilterDrawer
          filters={filters}
          setFilters={setFilters}
          ordering={ordering}
          setOrdering={setOrdering}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
      </div>

      {/* Movie List Section */}
      <div className="container mx-auto px-10 py-10">
        {loading && !movies.length ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : !movies.length ? (
          <p className="text-center text-white">No movies found. Please search for a movie.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;