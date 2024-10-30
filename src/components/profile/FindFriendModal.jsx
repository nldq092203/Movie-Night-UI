import React from 'react';
import { Modal, TextInput, Button, Text } from '@mantine/core';

const FindFriendModal = ({ findFriendOpen, setFindFriendOpen, friendEmail, setFriendEmail, findFriendError, handleFindFriend }) => {
  return (
    <Modal opened={findFriendOpen} onClose={() => setFindFriendOpen(false)} title="Find Friend" size="lg">
      <form onSubmit={handleFindFriend}>
        <TextInput
          label="Enter friend's email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
          placeholder="friend@example.com"
          required
        />
        {findFriendError && (
          <Text c="red" size="sm" mt="sm">
            {findFriendError}
          </Text>
        )}
        <Button fullWidth mt="md" type="submit">
          Find
        </Button>
      </form>
    </Modal>
  );
};

export default FindFriendModal;