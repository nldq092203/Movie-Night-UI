// Header.jsx
import React from 'react';
import { Link} from 'react-router-dom';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropDown';
import UserDropdown from './UserDropDown';

function Header() {
  // Handle search submission
  const handleSearch = (searchTerm) => {
    // Redirect to /search with the search term
    window.location.href = `/search?term=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div className="bg-transparent px-6 py-4">
      <div className="flex flex-wrap items-center justify-between">

        {/* Logo */}
        <Link to="/" className="w-full lg:w-auto text-center lg:text-left mb-4 lg:mb-0">
          <h1 className="text-3xl lg:text-4xl font-bold font-mono bg-gradient-to-r from-indigo-500 to-cyan-500 text-transparent bg-clip-text">
            MovieDev
          </h1>
        </Link>

        {/* Search Bar */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-center mb-4 lg:mb-0">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Notification and User Dropdown */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-end space-x-4">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;