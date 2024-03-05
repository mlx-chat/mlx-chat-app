'use client';

import {
  faBan,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import React, {
  useEffect,
  useState,
} from 'react';
import Chat from '../components/chat/Chat';
import SelectDirectory from '../components/options/SelectDirectory';
import {
  Button,
} from '../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import type {
  ChatMessage,
} from '../constants/chat';
import {
  useAppDispatch,
} from '../lib/hooks';
import {
  startDirectoryIndexing,
  stopDirectoryIndexing,
} from '../lib/store';

export default function Home() {
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

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

  useEffect(() => {
    window.electronAPI.onSelectDirectory(async (customData) => {
      if (chatHistory.length) {
        setChatHistory([
          ...chatHistory,
          { role: 'system', content: 'Assist' },
        ]);
      }
    });
  }, [chatHistory]);

  const handleClearHistory = () => {
    setChatHistory([]);
    if (typeof window !== 'undefined') {
      window.electronAPI.resizeWindow(99);
    }
  };

  const clearDirectory = () => {
    setSelectedDirectory(null);
    if (chatHistory.length) {
      setChatHistory([
        ...chatHistory,
        { role: 'system', content: 'Converse' },
      ]);
    }
  };

  return (
    <main className='flex flex-col'>
      <Chat
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        selectedDirectory={selectedDirectory}
      />
      <div className='border-t border-t-neut
      ral-400 dark:border-t-neutral-700 pt-[5px] px-2'>
        <div className='flex justify-between drag'>
          {chatHistory.length
            ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Button
                    className='bg-transparent no-drag text-neutral-800 gap-1 dark:text-white text-sm font-normal shadow-none hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border-0 border-zinc-600 w-fit rounded-md py-1 px-3 flex items-center cursor-pointer'
                    onClick={handleClearHistory}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className='text-green-500' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear History</TooltipContent>
              </Tooltip>
            )
            : (
              <Button
                className='bg-transparent no-drag text-neutral-800 gap-1 dark:text-white text-sm font-normal shadow-none hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border-0 border-zinc-600 w-fit rounded-md py-1 px-3 flex items-center cursor-pointer'
                disabled={true}
              >
                <FontAwesomeIcon icon={faBan} className='text-red-400' />
              </Button>
            )}
          <SelectDirectory
            clearDirectory={clearDirectory}
            handleOpen={handleOpen}
            selectedDirectory={selectedDirectory}
          />
        </div>
      </div>
    </main>
  );
}
