import React, { useState, useRef, useCallback } from 'react';
import { Modal, Button, Image, Group, Box } from '@mantine/core';
import AvatarEditor from 'react-avatar-editor';

const AvatarModals = ({
  avatarOptionsOpen,
  setAvatarOptionsOpen,
  viewAvatarOpen,
  setViewAvatarOpen,
  uploadAvatarOpen,
  setUploadAvatarOpen,
  handleAvatarUpload,
  user,
}) => {
  const [selectedImage, setSelectedImage] = useState(null); // Image selected by the user
  const [croppedImage, setCroppedImage] = useState(null); // Cropped image to be uploaded
  const editorRef = useRef(null); // Reference to the AvatarEditor component

  // Handle image file selection from the user
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Set selected image
    }
  };

  // Handle cropping the image
  const getCroppedImage = useCallback(() => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas(); // Get cropped image from editor
      canvas.toBlob((blob) => {
        setCroppedImage(blob); // Store cropped image as a blob
      }, 'image/jpeg');
    }
  }, []);

  // Upload the cropped avatar
  const handleSaveAvatar = async () => {
    if (croppedImage) {
      const formData = new FormData();
      formData.append('avatar', croppedImage); // Append cropped image to FormData
      await handleAvatarUpload(formData); // Use your handleAvatarUpload method to upload the avatar
      setUploadAvatarOpen(false); // Close upload modal
    }
  };

  return (
    <>
      {/* Avatar Options Modal */}
      <Modal
        opened={avatarOptionsOpen}
        onClose={() => setAvatarOptionsOpen(false)}
        title="Avatar Options"
        centered
      >
        <Group direction="column" spacing="md">
          <Button
            fullWidth
            variant="filled"
            color="blue"
            onClick={() => {
              setAvatarOptionsOpen(false);
              setViewAvatarOpen(true);
            }}
          >
            View Avatar
          </Button>
          <Button
            fullWidth
            variant="outline"
            color="blue"
            onClick={() => {
              setAvatarOptionsOpen(false);
              setUploadAvatarOpen(true);
            }}
          >
            Upload New Avatar
          </Button>
        </Group>
      </Modal>

      {/* View Avatar Modal */}
      <Modal
        opened={viewAvatarOpen}
        onClose={() => setViewAvatarOpen(false)}
        title="View Avatar"
        centered
      >
        <Image
          src={user.avatar_url || 'https://http.cat/404'}
          alt="Profile Avatar"
          width="100%"
          height="100%"
          fit="contain"
        />
      </Modal>

      {/* Upload and Crop New Avatar Modal */}
      <Modal
        opened={uploadAvatarOpen}
        onClose={() => setUploadAvatarOpen(false)}
        title="Upload New Avatar"
        centered
      >
        <Box mb="md">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </Box>

        {selectedImage && (
          <>
            <AvatarEditor
              ref={editorRef}
              image={selectedImage}
              width={250}
              height={250}
              border={50}
              scale={1.2} // Allow the user to zoom the image
              rotate={0}
              color={[255, 255, 255, 0.6]} // RGBA for border color
              style={{
                boxShadow: '0 0 10px #000',
                borderRadius: '50%',
              }}
            />
            <Group mt="md" spacing="md">
              <Button fullWidth variant="filled" color="blue" onClick={getCroppedImage}>
                Crop Image
              </Button>
              <Button fullWidth variant="outline" color="blue" onClick={handleSaveAvatar}>
                Save Avatar
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </>
  );
};

export default AvatarModals;