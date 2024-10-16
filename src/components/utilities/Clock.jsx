import React, { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

function Clock({ startTime, theme }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();

      // Calculate time left
      if (startTime) {
        const startDate = new Date(startTime);
        const secondsLeft = differenceInSeconds(startDate, now);

        if (secondsLeft > 0) {
          const days = Math.floor(secondsLeft / (3600 * 24));
          const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
          const minutes = Math.floor((secondsLeft % 3600) / 60);
          const seconds = secondsLeft % 60;

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('The event has started!');
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  // Function to format the time in HH:MM
  const formatTimeWithoutSeconds = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Function to format the date
  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className={`flex flex-col mb-10 items-center ${theme.colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
      {/* Display Start Time */}
      {startTime && (
        <>
          <div className="text-xl mb-2">{formatDate(new Date(startTime))}</div>
          <div className="flex space-x-2 text-6xl font-bold mb-4">
            {formatTimeWithoutSeconds(new Date(startTime)).split(':').map((num, index) => (
              <div
                key={index}
                className={`p-4 rounded-md shadow-lg ${
                  theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Countdown */}
      {startTime && (
        <div className="mt-4 text-2xl">
          <strong>Countdown:</strong> {timeLeft}
        </div>
      )}
    </div>
  );
}

export default Clock;