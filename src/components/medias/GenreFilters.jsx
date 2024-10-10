import React, { useState, useEffect } from 'react';
import { Paper, Group, ScrollArea } from '@mantine/core';
import { IconFlame, IconSwords, IconHeart, IconRobot, IconGhost, IconStar, IconMoonStars } from '@tabler/icons-react';
import axios from 'axios';

const GenreSection = ({ apiBaseUrl, filters, setFilters }) => {
  const [genreOptions, setGenreOptions] = useState([]);

  // Fetch genres from the API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/v1/genres/`);
        setGenreOptions(response.data.results || []); // Ensure it’s always an array
      } catch (err) {
        console.error('Failed to fetch genres.');
        setGenreOptions([]); // Set to an empty array on error
      }
    };
    fetchGenres();
  }, [apiBaseUrl]);

  const handleGenreClick = (genre) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      genres: prevFilters.genres.includes(genre)
        ? prevFilters.genres.filter((g) => g !== genre)
        : [...prevFilters.genres, genre],
    }));
  };

  const icons = {
    Trending: <IconFlame size={24} />,
    Action: <IconSwords size={24} />,
    Romance: <IconHeart size={24} />,
    Animation: <IconRobot size={24} />,
    Horror: <IconGhost size={24} />,
    Special: <IconStar size={24} />,
    Drakor: <IconMoonStars size={24} />,
  };

  return (
    <ScrollArea type="auto" scrollbarSize={6} className="w-full mb-10">
      <Group spacing="md" className="flex-nowrap flex-row overflow-x-auto">
        {genreOptions.map((genre) => {
          const isSelected = filters.genres.includes(genre.name);
          return (
            <Paper
              key={genre.id}
              radius="lg"
              shadow="md"
              className={`flex items-center justify-center p-3 w-[200px] h-[80px] rounded-lg border m-6 transition-all duration-300 transform hover:scale-105 ${
                isSelected ? 'bg-blue-500 text-white' : 'bg-white bg-opacity-20 text-white'
              }`}
              style={{
                borderColor: isSelected ? 'blue' : 'gray',
                backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
              }}
              onClick={() => handleGenreClick(genre.name)}
            >
              <Group direction="column" align="center" spacing="xs">
                <div className={isSelected ? 'text-white' : 'text-white'}>
                  {icons[genre.name] || <IconStar size={24} />}
                </div>
                <span className="text-sm">{genre.name}</span>
              </Group>
            </Paper>
          );
        })}
      </Group>
    </ScrollArea>
  );
};

export default GenreSection;