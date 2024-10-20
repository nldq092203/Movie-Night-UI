import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import { apiBaseUrl } from '../../config';
import ChatBox from './ChatBox';
import React, { useEffect, useState } from 'react';

const ChatComponent = ({theme, toggleTheme}) => {
  const [client, setClient] = useState(null);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const fetchTokenRequest = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/ably/auth/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        const data = await response.json();
        console.log(data.token_request);
        setClientId(data.token_request.clientId);

        // Initialize Ably client with the token request
        const ablyClient = new Ably.Realtime({
          authCallback: (tokenParams, callback) => {
            callback(null, data.token_request);
          },
        });
        setClient(ablyClient);

      } catch (error) {
        console.error('Error fetching token request:', error);
      }
    };

    fetchTokenRequest();
  }, []);

  // Only render AblyProvider when the client is initialized
  if (!client) {
    return <p>Loading...</p>; // or any loading indicator you prefer
  }

  return (
    <AblyProvider client={client}>
      <ChatBox clientId={clientId} theme={theme}toggleTheme={toggleTheme}/>
    </AblyProvider>
  );
};

export default ChatComponent;