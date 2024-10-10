import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { rem } from '@mantine/core';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Retrieve search terms from localStorage on mount
  useEffect(() => {
    const storedTerms = JSON.parse(localStorage.getItem('searchTerms')) || [];
    setSuggestions(storedTerms);
  }, []);

  // Detect clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update suggestions as the user types, without triggering a search
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    // Filter stored terms based on input
    const storedTerms = JSON.parse(localStorage.getItem('searchTerms')) || [];
    const filteredSuggestions = storedTerms.filter((term) =>
      term.toLowerCase().startsWith(query.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  // Handle search submission when Enter is pressed or search icon is clicked
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());

      // Save the new term to localStorage with a limit of 10 terms
      const storedTerms = JSON.parse(localStorage.getItem('searchTerms')) || [];
      const newTerm = searchTerm.trim().toLowerCase();
      if (!storedTerms.includes(newTerm)) {
        const updatedTerms = [newTerm, ...storedTerms.slice(0, 9)];
        localStorage.setItem('searchTerms', JSON.stringify(updatedTerms));
      }

      setSearchTerm(''); // Clear input
      setSuggestions([]); // Clear suggestions
      setShowSuggestions(false); // Hide suggestions
    }
  };

  // Handle suggestion click, only update the input field
  const handleSuggestionClick = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false); // Hide suggestions after clicking
  };

  // Show suggestions on input focus
  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Clear search input
  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-80" ref={wrapperRef}>
      <div className="relative">
        {/* Search Icon as Submit Button */}
        <button
          type="submit"
          className="absolute inset-y-0 left-3 flex items-center text-gray-400"
        >
          <IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search"
          className="w-full pl-10 pr-10 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-gray-500"
        />
        {/* Clear Search Icon */}
        {searchTerm && (
          <span
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
          >
            <IconX style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </span>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute w-full mt-1 bg-gray-900 text-white rounded-lg shadow-lg max-h-40 overflow-y-auto border border-gray-700 z-50" // Add z-50
          >
            {suggestions.map((term, index) => (
              <div
                key={index}
                onMouseDown={() => handleSuggestionClick(term)}
                className="p-2 cursor-pointer hover:bg-gray-700"
              >
                {term}
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchBar;