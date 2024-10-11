import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { rem } from '@mantine/core';

function SearchBar({ onSearch, theme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const storedTerms = JSON.parse(localStorage.getItem('searchTerms')) || [];
    setSuggestions(storedTerms);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }; 

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);


    const storedTerms = JSON.parse(localStorage.getItem('searchTerms')) || [];
    const filteredSuggestions = storedTerms.filter((term) =>
      term.toLowerCase().startsWith(query.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());


      const storedTerms = JSON.parse(localStorage.getItem('searchTerms')) || [];
      const newTerm = searchTerm.trim().toLowerCase();
      if (!storedTerms.includes(newTerm)) {
        const updatedTerms = [newTerm, ...storedTerms.slice(0, 9)];
        localStorage.setItem('searchTerms', JSON.stringify(updatedTerms));
      }
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };


  const handleSuggestionClick = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
  };

  const handleFocus = () => setShowSuggestions(true);

  
  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Define styles based on theme
  const isDarkMode = theme.colorScheme === 'dark';
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-20';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-900';
  const suggestionBgColor = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const suggestionHoverColor = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200';

  return (
    <form onSubmit={handleSubmit} className="relative w-80" ref={wrapperRef}>
      <div className="relative">
        <button type="submit" className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          <IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search"
          className={`w-full pl-10 pr-10 py-2 rounded-lg ${bgColor} border ${borderColor} focus:outline-none focus:border-indigo-500 transition-all`}
        />
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
            className={`absolute w-full mt-1 ${suggestionBgColor} text-gray-900 rounded-lg shadow-lg max-h-40 overflow-y-auto border border-gray-700 z-50`}
          >
            {suggestions.map((term, index) => (
              <div
                key={index}
                onMouseDown={() => handleSuggestionClick(term)}
                className={`p-2 cursor-pointer ${suggestionHoverColor} ${textColor}`}
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