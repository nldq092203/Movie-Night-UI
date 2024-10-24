import React from 'react';
import { Tabs } from '@mantine/core';
import MovieNightSchedule from '../medias/MovieNightSchedule';

const ProfileTabs = ({ theme, myEmail, email }) => {
  return (
    <>
      {myEmail === email && (
        <Tabs defaultValue="events" mt="xl" variant="outline" position="center">
          <Tabs.List>
            <Tabs.Tab value="events">Events</Tabs.Tab>
            <Tabs.Tab value="emotions">Emotions</Tabs.Tab>
            <Tabs.Tab value="liked">Liked</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="events" pt="xs">
            <div style={{ width: '100%', height: 'auto', padding: '1rem' }}>
              <MovieNightSchedule theme={theme} style={{ width: '100%', height: 'auto' }} />
            </div>
          </Tabs.Panel>
        </Tabs>
      )}
    </>
  );
};

export default ProfileTabs;