'use client';

import React, {
  useEffect,
  useState,
} from 'react';
import Chat from '../components/chat/Chat';
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
    <main className='flex flex-col min-h-[calc(100vh-40px)] pb-4 px-8 gap-4 mb-4'>
      <div className=''>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-slate-100 rounded-sm dark:bg-zinc-900 border px-8 py-4'>
            <h1 className='text-md font-bold'>AI Model</h1>
            <p className='text-sm text-opacity-50 pt-1'>
              Choose between a set of different models
            </p>
            <div className='pt-4'>
              <Select
                value={selectedModel ?? ''}
                onValueChange={(value) => handleModelChange(value)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select a model' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>AI Model</SelectLabel>
                    <SelectItem value='llama'>LLama</SelectItem>
                    <SelectItem value='mlx-community/quantized-gemma-7b-it'>Gemma</SelectItem>
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
      <Chat selectedDirectory={selectedDirectory} />
    </main>
  );
}
