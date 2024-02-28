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
    window.electronAPI.onSelectDirectory((customData) => {
      setSelectedDirectory(customData[0]);
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
      <Chat selectedDirectory={selectedDirectory} />
      <div className='border-t border-t-neutral-400 dark:border-t-neutral-700 pt-[5px] px-2'>
        <div className='flex justify-between'>
          <SelectModel selectedModel={selectedModel} handleModelChange={handleModelChange} />
          <SelectDirectory handleOpen={handleOpen} selectedDirectory={selectedDirectory} />
        </div>
      </div>
    </main>
  );
}
