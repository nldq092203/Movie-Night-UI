import React from 'react';
import Filters from '../medias/MovieFilters';
import { useDisclosure } from '@mantine/hooks';
import { Drawer, Button, Group } from '@mantine/core';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

function FilterDrawer({ filters, setFilters, ordering, setOrdering, theme }) {
  const [opened, { open, close }] = useDisclosure(false);

  // Determine styles based on the current theme
  const isDarkMode = theme.colorScheme === 'dark';
  const buttonBgColor = isDarkMode ? '#2c2c2c' : '#f8f9fa'; // Adjusted colors for a modern look
  const buttonTextColor = isDarkMode ? '#fff' : '#333';
  const drawerBgColor = isDarkMode ? '#000000' : '#ffffff'; // Subtle background colors
  const iconColor = isDarkMode ? '#ccc' : '#333';

  return (
    <>
      {/* Filter Button */}
      <Group position="right" mt="md">
        <Button
          onClick={open}
          style={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
            transition: 'background-color 0.3s, color 0.3s',
          }}
          variant="filled"
          size="md"
          radius="lg"
          leftIcon={<IconAdjustmentsHorizontal color={iconColor} size={18} />}
        >
          Filters
        </Button>
      </Group>

      {/* Drawer Component */}
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        size="lg" // Increased size for better usability
        position="right"
        withCloseButton={false}
        overlayOpacity={0.6}
        overlayBlur={3}
        padding="md"
        styles={{
          content: { backgroundColor: drawerBgColor, borderRadius: '16px' }, // Rounded corners for a smoother look
          header: { backgroundColor: drawerBgColor },
        }}
      >
        <Filters
          filters={filters}
          setFilters={setFilters}
          ordering={ordering}
          setOrdering={setOrdering}
        />
      </Drawer>
    </>
  );
}

export default FilterDrawer;