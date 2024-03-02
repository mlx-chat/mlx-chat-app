'use client';

import React, {
  useEffect,
  useState,
} from 'react';
import Chat from '../components/chat/Chat';
import SelectDirectory from '../components/options/SelectDirectory';
import {
  useAppDispatch,
} from '../lib/hooks';
import {
  startDirectoryIndexing,
  stopDirectoryIndexing,
} from '../lib/store';

export default function Home() {
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  function handleOpen() {
    if (typeof window !== 'undefined') {
      window.electronAPI.selectDirectory();
    }
  }

  useEffect(() => {
    window.electronAPI.onSelectDirectory(async (customData) => {
      setSelectedDirectory(customData[0]);
      try {
        dispatch(startDirectoryIndexing());
        await fetch('http://localhost:8080/api/index', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            directory: customData[0],
          }),
        });
        dispatch(stopDirectoryIndexing());
        // TODO: spinner while indexing
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error sending message: ', error);
        dispatch(stopDirectoryIndexing());
      }
    });
  }, []);

  return (
    <main className='flex flex-col'>
      <Chat />
      <div className='border-t border-t-neutral-400 dark:border-t-neutral-700 pt-[5px] px-2'>
        <div className='flex justify-end drag'>
          <SelectDirectory handleOpen={handleOpen} selectedDirectory={selectedDirectory} />
        </div>
      </div>
    </main>
  );
}
