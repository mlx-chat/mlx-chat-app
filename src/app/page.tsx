'use client';

import React, {
  useEffect,
  useState,
} from 'react';
import {
  Button,
} from '../components/ui/button';
import {
  Input,
} from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function Home() {
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleOpen() {
    if (typeof window !== 'undefined' && global?.window) {
      window.electronAPI.selectDirectory();
    }
  }

  useEffect(() => {
    window.electronAPI.onSelectDirectory(customData => {
      setSelectedDirectory(customData[0]);
    });
  }, []);

  return (
    <main className='flex flex-col min-h-[calc(100vh-40px)] pb-4 px-8 gap-4 mb-4'>
      <div className=''>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-slate-100 rounded-sm dark:bg-zinc-900 border px-8 py-4'>
            <h1 className='text-md font-bold'>AI Model</h1>
            <p className='text-sm text-opacity-50 pt-1'>
              Choose between a set of different models
            </p>
            <div className='pt-4'>
              <Select>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select a model' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>AI Model</SelectLabel>
                    <SelectItem value='llama'>LLama</SelectItem>
                    <SelectItem value='gemma'>Gemma</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='bg-slate-100 rounded-sm dark:bg-zinc-900 border px-8 py-4'>
            <h1 className='text-md font-bold'>Data Set</h1>
            <p className='text-sm text-opacity-50 pt-1'>
              This folder can contain .md, .pdf, and .doc files
            </p>
            <div className='flex gap-2 mt-4'>
              <Input onClick={handleOpen} value={selectedDirectory ?? ''} readOnly />
              <Button onClick={handleOpen}>Open</Button>
            </div>
          </div>
        </div>
      </div>
      <div className='flex-grow min-w-full bg-slate-100 rounded-sm dark:bg-zinc-900 border flex'>
        <div className='flex justify-center items-center min-h-full align-middle flex-grow'>
          <h1 className='text-md text-zinc-500 dark:text-zinc-500'>No messages yet</h1>
        </div>
      </div>
      <div className='flex justify-center'>
        <Input
          value={message ?? ''}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Enter prompt here'
        />
      </div>
    </main>
  );
}
