import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../config';
import MovieCard from '../medias/MovieCard';  // Assuming you already have this component
import { useLocation } from 'react-router-dom'; // To read query parameters
import Header from '../navigations/Header';

function MovieSearch({ theme, toggleTheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);  // To handle next page in pagination
  const [prevPage, setPrevPage] = useState(null);  // To handle previous page in pagination

  // Get the search term from the URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTermFromURL = queryParams.get('term');

  // Load search results from URL or sessionStorage on initial load
  useEffect(() => {
    const cachedResults = sessionStorage.getItem('results');
    const cachedNextPage = sessionStorage.getItem('nextPage');
    const cachedPrevPage = sessionStorage.getItem('prevPage');

    // Use the search term from the URL if available
    if (searchTermFromURL) {
      setSearchTerm(searchTermFromURL); // Set search term from the URL
      performSearch(searchTermFromURL); // Perform the search using URL term
    } else if (cachedResults) {
      // Load cached results if no search term is in the URL
      setResults(JSON.parse(cachedResults));
      setNextPage(cachedNextPage);
      setPrevPage(cachedPrevPage);
    }
  }, [searchTermFromURL]);

  // Perform search request (use this for both new search and pagination)
  const performSearch = async (term) => {
    setLoading(true);
    setError(null);

    try {
      // Perform the search request
      const response = await axios.post(`${apiBaseUrl}/api/v1/movies/search/`, {
        term: term,
      });

      if (response.status === 302) {
        window.location.href = response.headers.location;  // Handle redirection if needed
      } else {
        const data = response.data;
        setResults(data.results);
        setNextPage(data.next);  // Save next page URL
        setPrevPage(data.previous);  // Save previous page URL

        // Cache the search term, results, and pagination in sessionStorage
        sessionStorage.setItem('results', JSON.stringify(data.results));
        sessionStorage.setItem('nextPage', data.next || '');
        sessionStorage.setItem('prevPage', data.previous || '');
      }
    } catch (error) {
      setError('An error occurred while fetching results');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination (fetch next or previous page)
  const fetchPage = async (url) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(url);
      const data = response.data;

      setResults(data.results);
      setNextPage(data.next);  // Update next page URL
      setPrevPage(data.previous);  // Update previous page URL

      // Cache updated results and pagination in sessionStorage
      sessionStorage.setItem('results', JSON.stringify(data.results));
      sessionStorage.setItem('nextPage', data.next || '');
      sessionStorage.setItem('prevPage', data.previous || '');
    } catch (error) {
      setError('An error occurred while fetching paginated results');
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      performSearch(searchTerm);
    }
  };

  return (
    <div className={`min-h-screen relative px-1 py-5 ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`}>
      <div className="fixed w-full top-0 bg-transparent py-4 z-50">
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>
      {/* Search Results */}
      <div className="container mx-auto px-4 py-10 pt-40 lg:flex-row items-center lg:items-start">
        <h2 className="text-3xl font-bold mb-10">Search Results</h2>

        {loading && <p className="text-center"> Loading time can be maximum 2 minutes. Please wait ...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} theme={theme}/>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="pagination-controls mt-5 flex justify-center space-x-4">
          {prevPage && (
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => fetchPage(prevPage)}
            >
              Previous
            </button>
          )}
          {nextPage && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => fetchPage(nextPage)}
            >
              Next
            </button>
          )}
        </div>

        {/* No Results */}
        {results.length === 0 && !loading && (
          <p className="text-center">No results found.</p>
        )}
      </div>
    </div>
  );
}

export default MovieSearch;