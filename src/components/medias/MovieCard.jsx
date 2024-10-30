import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Image, Text, Group } from '@mantine/core';
import { FaStar } from 'react-icons/fa';
import placeholderImage from '../../assets/Image_not_available.png';
import { AuthContext } from '../../context/AuthContext';

function MovieCard({ movie, theme }) {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Prevent navigation
      navigate('/login'); // Redirect to login page
    }
  };

  const isDarkMode = theme.colorScheme === 'dark';
  const cardBackgroundColor = isDarkMode
    ? 'bg-white bg-opacity-10 p-4 rounded-lg'
    : 'bg-transparent shadow-lg';
  const textColor = isDarkMode ? '#f0f0f0' : '#333';
  const shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <Link to={isAuthenticated ? `/movies/${movie.id}` : '#'} onClick={handleCardClick} className="block">
      <Card
        shadow="md"
        radius="md"
        p="sm"
        className={`hover:scale-105 transform transition-all ${cardBackgroundColor} duration-300 cursor-pointer`}
        style={{
          width: '240px',
          height: '400px',
          boxShadow: `0 4px 8px ${shadowColor}`,
        }}
      >
        <Card.Section>
          <Image
            src={movie.url_poster !== 'N/A' ? movie.url_poster : placeholderImage}
            alt={movie.title}
            h={280}
            radius="md"
            fit="cover"
          />
        </Card.Section>
        <Card.Section m="2">
          <Text
            align="left"
            fw={450}
            size="lg"
            mt="md"
            style={{
              color: textColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {movie.title}
          </Text>
          <Group position="center" spacing="xs" mt="xs">
            <FaStar color={isDarkMode ? '#fbbf24' : '#1e3a8a'} size={12} />
            <Text size="sm" c={textColor}>
              {movie.imdb_rating}
            </Text>
            <Text size="sm" c={textColor}>
              •
            </Text>
            <Text size="sm" c={textColor}>
              {movie.year}
            </Text>
          </Group>
        </Card.Section>
      </Card>
    </Link>
  );
}

export default MovieCard;