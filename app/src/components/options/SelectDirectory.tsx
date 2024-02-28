import React from 'react';
import {
  Button,
} from '../ui/button';

const SelectDirectory = ({
  handleOpen,
  selectedDirectory,
}: {
  handleOpen: () => void;
  selectedDirectory: string | null;
}) => {
  const shortenedDirectory = selectedDirectory
    ? `/${selectedDirectory.split('/')[1]}/../${selectedDirectory.split('/').pop()}`
    : 'Select Directory';

  return (
    <Button
      className='bg-transparent text-neutral-800 dark:text-white text-sm font-normal shadow-none hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border-0 border-zinc-600 w-fit rounded-md py-1 px-3 flex items-center cursor-pointer'
      onClick={handleOpen}
    >
      {shortenedDirectory}
    </Button>
  );
};

export default SelectDirectory;
