import React from 'react';
import Filters from '../medias/MovieFilters';
import { useDisclosure } from '@mantine/hooks';
import { Drawer, Button } from '@mantine/core';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

function FilterDrawer({ filters, setFilters, ordering, setOrdering, theme}) {
  const [opened, { open, close }] = useDisclosure(false);
  // Determine styles based on the current theme
  const isDarkMode = theme.colorScheme === 'dark';
  const buttonBgColor = isDarkMode ? 'hover:bg-gray-100 bg-white bg-opacity-15' : 'bg-white bg-opacity-20';
  const buttonHoverBgColor = isDarkMode ? 'hover:bg-gray-100' : 'hover:bg-gray-300';
  const drawerBgColor = isDarkMode ? 'bg-black' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-black';

  return (
    <>
      {/* Filter Button */}
      <Button
        onClick={open}
        className={`border border-gray-700 rounded-lg ${textColor} ${buttonBgColor} ${buttonHoverBgColor}`}
        variant="filled"
      >
        <span className="flex items-center">
          <IconAdjustmentsHorizontal className="h-5 w-5 mr-2" />
          <span className="font-medium">Filters</span>
        </span>
      </Button>

      {/* Mantine Drawer */}
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        size="md"
        position="right"
        withCloseButton={false}
        padding={0}
        styles={{
          content: { backgroundColor: drawerBgColor },
          header: { backgroundColor: drawerBgColor },
        }}
      >
        <Filters filters={filters} setFilters={setFilters} ordering={ordering} setOrdering={setOrdering} />
      </Drawer>
    </>
  );
}

export default FilterDrawer;