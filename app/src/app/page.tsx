'use client';

import React, {
  useEffect,
  useState,
} from 'react';
import Chat from '../components/chat/Chat';
import SelectDirectory from '../components/options/SelectDirectory';
import SelectModel from '../components/options/SelectModel';

export default function Home() {
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  function handleOpen() {
    if (typeof window !== 'undefined') {
      window.electronAPI.selectDirectory();
    }
  }

  useEffect(() => {
    window.electronAPI.onSelectDirectory(async (customData) => {
      setSelectedDirectory(customData[0]);
      try {
        await fetch('http://localhost:8080/api/index', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            directory: customData[0],
          }),
        });
        // TODO: spinner while indexing
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error sending message: ', error);
      }
    });
  }, []);

  const handleModelChange = (model: string | null) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined' && model) {
      window.electronAPI.startServer(model);
    }
  };

  return (
    <main className='flex flex-col'>
      <Chat />
      <div className='border-t border-t-neutral-400 dark:border-t-neutral-700 pt-[5px] px-2'>
        <div className='flex justify-between'>
          <SelectModel selectedModel={selectedModel} handleModelChange={handleModelChange} />
          <SelectDirectory handleOpen={handleOpen} selectedDirectory={selectedDirectory} />
        </div>
      </div>
    </main>
  );
}
