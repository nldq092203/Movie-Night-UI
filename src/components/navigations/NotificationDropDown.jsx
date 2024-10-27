import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../config';

function NotificationDropdown({ theme }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setunseenCount] = useState(0);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); 
  const [isReadFilter, setIsReadFilter] = useState('ALL'); 
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 

  const POLLING_INTERVAL = 30000;

  const fetchNotifications = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');

      let filterParams = '';

      if (isReadFilter !== 'ALL') {
        filterParams += `&is_read=${isReadFilter === 'READ'}`;
      }
      if (filterType !== 'ALL') {
        filterParams += `&notification_type=${filterType}`;
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/notifications/?ordering=-timestamp${filterParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setNotifications(data.results || []);
      console.log(data.results)
      setunseenCount(data.unseenCount || 0);

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications.');
    } 
  };

  // Function to mark all notifications as seen
  const markAllAsSeen = async () => {
    const accessToken = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/notifications/mark-all-seen/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        // Reset the unread count
        setunseenCount(0);
      } else {
        throw new Error('Failed to mark all notifications as seen');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.notification-button')
      ) {
        setOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [filterType, isReadFilter]);

  const toggleDropdown = () => {
    setOpen(!open);
    if (!open) {
      // Mark all notifications as seen when opening the dropdown
      markAllAsSeen();
    }
  };

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    const accessToken = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/notifications/${notificationId}/mark-read/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (notification) => {
    const { id, notification_type, object_id, content_object } = notification;

    // Mark notification as read
    if(!notification.is_read){
      markAsRead(id);
    }

    // Handle navigation and actions based on notification type
    if (['REM', 'UPD'].includes(notification_type)) {
      navigate(`/movie-nights/${object_id}`);
    } else if (notification_type === 'CAN') {
      alert('This notification is a cancellation.');
    } else if (notification_type === 'RES') {
      navigate(`/movie-nights/${content_object.movie_night_id}`);
    } else if (notification_type === 'INV') {
      navigate(`/movie-nights/${content_object.movie_night_id}`);
    }
  };


  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Define theme-based styles
  const isDarkMode = theme.colorScheme === 'dark';
  const bgColor = isDarkMode ? 'bg-transparent' : 'bg-transparent text-black';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const dropdownBgColor = isDarkMode ? 'bg-black' : 'shadow-lg bg-gradient-to-br from-[#cdfcff] via-[#a5d0e7] via-[#bcd9e9] via-[#fff] to-[#95cbe7] text-black';
  const dividerColor = isDarkMode ? 'divide-gray-700' : 'divide-gray-300';

  return (
    <div className="z-50">
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className={`notification-button bg-transparent text-white rounded-full p-3 shadow-lg hover:bg-white hover:bg-opacity-20 text-white focus:outline-none' ${isDarkMode ? 'bg-transparent text-white hover:bg-white hover:bg-opacity-20' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <BellIcon className={` h-8 w-8' ${isDarkMode ? 'text-white ' : 'text-black'}`}/>
          {unseenCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unseenCount}
            </span>
          )}
        </button>

        {open && (

          <div ref={dropdownRef} className={`absolute right-0 top-full mt-4 w-96 ${dropdownBgColor} ${textColor} rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto transition-transform transform`}>            {/* Notifications Dropdown Content */}
            <div className="py-2">
            <h2 className={`text-xl font-bold px-4 mb-2 ${textColor}`}>Notifications</h2>
              <div className="px-4 flex space-x-2 mb-2">
                <select
                  className={`px-2 py-1 rounded ${bgColor} ${textColor}`}
                  value={isReadFilter}
                  onChange={(e) => setIsReadFilter(e.target.value)}
                >
                  <option value="ALL">All</option>
                  <option value="READ">Read</option>
                  <option value="UNREAD">Unread</option>
                </select>
                <select
                  className={`px-2 py-1 rounded ${bgColor} ${textColor}`}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="INV">Invites</option>
                  <option value="UPD">Updates</option>
                  <option value="REM">Reminders</option>
                  <option value="CAN">Cancels</option>
                  <option value="RES">Responses</option>
                </select>
              </div>
              <div className={`divide-y ${dividerColor}`}>
                <div className="px-4 py-2">
                  <h3 className="text-lg font-semibold mb-2">This day</h3>
                  {notifications.filter(notification => isToday(notification.timestamp)).length === 0 ? (
                    <p className="text-gray-600">No notifications today</p>
                  ) : (
                    notifications
                      .filter(notification => isToday(notification.timestamp))
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`py-2 flex justify-between items-center ${bgColor} ${
                            !notification.is_read ? 'bg-gray-800' : 'bg-gray-900'
                          } cursor-pointer`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center">
                            <img
                              src={notification.sender_avtar_url || 'https://http.cat/404'}
                              alt="User"
                              className="rounded-full h-8 w-8 mr-2"
                            />
                            <div>
                              <p className="font-semibold text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="px-4 py-2">
                  <h3 className="text-lg font-semibold mb-2">More</h3>
                  {notifications.filter(notification => !isToday(notification.timestamp)).length === 0 ? (
                    <p className="text-gray-600">No more notifications</p>
                  ) : (
                    notifications
                      .filter(notification => !isToday(notification.timestamp))
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`py-2 flex justify-between items-center ${bgColor} ${
                            !notification.is_read ? 'bg-gray-800' : 'bg-gray-900'
                          } cursor-pointer`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center">
                            <img
                              src={notification.sender_avtar_url || 'https://http.cat/404'}
                              alt="User"
                              className="rounded-full h-8 w-8 mr-2"
                            />
                            <div>
                              <p className="font-semibold text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown;