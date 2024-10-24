import React from 'react';
import { Modal, TextInput, Textarea, Select, Button } from '@mantine/core';

const EditProfileModal = ({ editProfileOpen, setEditProfileOpen, updatedUser, handleInputChange, handleSubmit }) => {
  return (
    <Modal opened={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          value={updatedUser.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Your name"
          required
        />
        <Textarea
          label="Bio"
          value={updatedUser.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Your bio"
        />
        <Select
          label="Gender"
          value={updatedUser.gender}
          onChange={(value) => handleInputChange('gender', value)}
          data={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Custom', label: 'Custom' },
          ]}
        />
        {updatedUser.gender === 'Custom' && (
          <TextInput
            label="Custom Gender"
            value={updatedUser.customGender}
            onChange={(e) => handleInputChange('customGender', e.target.value)}
            placeholder="Specify your gender"
          />
        )}
        <Button fullWidth mt="md" type="submit">
          Save
        </Button>
      </form>
    </Modal>
  );
};

export default EditProfileModal;