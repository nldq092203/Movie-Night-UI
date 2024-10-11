// Header.jsx
import React from 'react';
import { Link} from 'react-router-dom';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropDown';
import UserDropdown from './UserDropDown';
import { IconMoon, IconSun } from '@tabler/icons-react';


function Header({ theme, toggleTheme }) {
    console.log(theme.colorScheme)
  // Handle search submission
  const handleSearch = (searchTerm) => {
    // Redirect to /search with the search term
    window.location.href = `/search?term=${encodeURIComponent(searchTerm)}`;
  };
  const isDarkMode = theme.colorScheme === 'dark';
  return (
    <div className={`fixed w-full px-4 top-0 py-4 z-1000 ${theme.colorScheme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black'}`}>
      <div className="flex flex-row flex-wrap items-center justify-between lg:justify-between space-y-4 lg:space-y-0">
        
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 w-full  lg:w-auto text-center lg:text-left">
          <h1
            className={`text-3xl  lg:text-4xl font-bold font-mono bg-clip-text text-transparent ${
              isDarkMode
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                : 'bg-gradient-to-r from-blue-900 to-teal-700'
            }`}
          >
            MovieDev
          </h1>
        </Link>

        {/* Search Bar */}
        <div className="flex-grow w-full lg:w-1/3 flex justify-center lg:justify-center">
          <SearchBar onSearch={handleSearch} theme />
        </div>

        {/* Notification and User Dropdown */}
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end space-x-4 items-center">
          <button onClick={toggleTheme} className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            isDarkMode ? 'bg-transparent text-white hover:bg-white hover:bg-opacity-20' : 'text-gray-800 hover:shadow-lg hover:bg-white hover:bg-opacity-20'
          }`}>
            {theme.colorScheme === 'dark' ? <IconMoon size={30} /> : <IconSun className="text-black" size={30} />}
          </button>
          <NotificationDropdown theme={theme} />
          <UserDropdown theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default Header;