import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { apiBaseUrl } from '../../config';
import { Button, Tooltip, Input, Divider, useMantineTheme } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';

function Filters({ filters, setFilters, ordering, setOrdering }) {
  const theme = useMantineTheme(); // Access the current theme
  const [genreOptions, setGenreOptions] = useState([]);
  const [visibleGenres, setVisibleGenres] = useState(6);
  const [isOpen, setIsOpen] = useState(false);
  const [imdbRating, setImdbRating] = useState([0, 10]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/v1/genres/`);
        setGenreOptions(response.data.results);
      } catch (err) {
        console.error('Failed to fetch genres.');
      }
    };
    fetchGenres();
  }, []);

  // Handle genre selection
  const handleGenreClick = (genre) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      genres: prevFilters.genres.includes(genre)
        ? prevFilters.genres.filter((g) => g !== genre)
        : [...prevFilters.genres, genre],
    }));
  };

  // Toggle genre visibility
  const toggleVisibleGenres = () => {
    setVisibleGenres((prev) => (prev === 6 ? genreOptions.length : 6));
  };

  // Handle general input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Handle ordering changes
  const handleOrderingChange = (e) => setOrdering(e.target.value);

  // Debounced function to update IMDb rating
  const debouncedUpdateFilters = useCallback(
    debounce((newRating) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        imdb_rating_from: newRating,
      }));
    }, 300),
    []
  );

  // Handle IMDb rating change
  const handleImdbRatingChange = (value) => {
    setImdbRating(value);
    debouncedUpdateFilters(value);
  };

  const bgColor = theme.colorScheme === 'dark' ? '#000000' : '#ffffff';

  return (
    <div style={{ backgroundColor: bgColor }} className="space-y-4 p-6 text-white rounded-lg shadow-lg max-w-xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Filters</h3>

      {/* Genres Section */}
      <div>
        <h4 className="font-bold mb-2">Genres</h4>
        <div className="flex flex-wrap gap-2">
          {genreOptions.slice(0, visibleGenres).map((genre) => (
            <Tooltip label="Select genre" position="bottom" key={genre.id}>
              <Button
                variant={filters.genres.includes(genre.name) ? 'filled' : 'outline'}
                size="xs"
                onClick={() => handleGenreClick(genre.name)}
                style={{
                  backgroundColor: filters.genres.includes(genre.name) ? '#add8e6' : 'transparent',
                  color: filters.genres.includes(genre.name) ? 'black' : '#add8e6',
                  borderColor: '#add8e6',
                }}
              >
                {genre.name}
              </Button>
            </Tooltip>
          ))}
        </div>
        {genreOptions.length > 6 && (
          <Button
            onClick={toggleVisibleGenres}
            variant="subtle"
            size="xs"
            leftIcon={visibleGenres === 6 ? <IconChevronDown /> : <IconChevronUp />}
            color="blue"
            style={{
              marginTop: '20px',
              color: '#add8e6',
              borderColor: '#add8e6',
            }}
          >
            {visibleGenres === 6 ? 'Show more' : 'Show less'}
          </Button>
        )}
      </div>

      {/* Runtime Input */}
      <Divider my="sm" color="blue" />
      <div className="space-y-2">
        <h4 className="font-bold mb-2">Runtime (minutes)</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            name="runtime_minutes_from"
            value={filters.runtime_minutes_from || ''}
            onChange={handleInputChange}
            placeholder="Min"
            variant="filled"
            styles={{ input: { borderColor: 'blue' } }}
          />
          <Input
            type="number"
            name="runtime_minutes_to"
            value={filters.runtime_minutes_to || ''}
            onChange={handleInputChange}
            placeholder="Max"
            variant="filled"
            styles={{ input: { borderColor: 'blue' } }}
          />
        </div>
      </div>

      {/* IMDb Rating */}
      <Divider my="sm" color="blue" />
      <div>
        <h4 className="font-bold mb-2">Minimum IMDb Rating</h4>
        <input
          type="range"
          name="imdb_rating_from"
          min="0"
          max="10"
          step="0.1"
          value={imdbRating}
          onChange={(e) => handleImdbRatingChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-blue-300 rounded-lg appearance-none"
        />
        <div className="text-center mt-2 text-blue-300">Selected Rating: {imdbRating}</div>
      </div>

      {/* Year Range */}
      <Divider my="sm" color="blue" />
      <div>
        <h4 className="font-bold mb-2">Year Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            name="published_from"
            value={filters.published_from || ''}
            onChange={handleInputChange}
            placeholder="From"
            variant="filled"
            styles={{ input: { borderColor: 'blue' } }}
          />
          <Input
            type="number"
            name="published_to"
            value={filters.published_to || ''}
            onChange={handleInputChange}
            placeholder="To"
            variant="filled"
            styles={{ input: { borderColor: 'blue' } }}
          />
        </div>
      </div>

      {/* Clear All Button */}
      <Button
        variant="outline"
        color="red"
        className="mt-4 border border-red"
        leftIcon={<IconX />}
        onClick={() => {
          setFilters({
            genres: [],
            runtime_minutes_from: '',
            runtime_minutes_to: '',
            imdb_rating_from: '',
            published_from: '',
            published_to: '',
          });
          setOrdering('');
          setImdbRating([0, 10]);
          setVisibleGenres(6);
        }}
      >
        Clear All
      </Button>
    </div>
  );
}

export default Filters;