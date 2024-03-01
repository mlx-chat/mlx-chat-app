'use client';

import type {
  IconProp,
} from '@fortawesome/fontawesome-svg-core';
import {
  faCog,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import React, {
  useEffect,
} from 'react';
import {
  convertToNiceShortcut,
  useKeyboardShortcut,
} from '../../lib/hooks';
import {
  cn,
} from '../../lib/utils';

enum SETTINGS {
  GENERAL,
  PROMPTS,
}

function SettingsOption({
  title,
  icon,
  onClick,
  selected,
}: {
  title: string;
  icon: IconProp;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center h-[44px] gap-[2px] no-drag w-fit p-1 px-2 justify-center hover:bg-[#E2E3E2] dark:hover:bg-[#454544] active:bg-[#D5D6D5] dark:active:bg-[#525251] cursor-default rounded-md text-[#6C6C6C] dark:text-[#9C9C9B] active:text-[#202020] dark:active:text-[#EEEEEE]',
        {
          'bg-[#E2E3E2] dark:bg-[#454544]': selected,
        },
      )}
    >
      <FontAwesomeIcon
        className={cn('text-[20px] pt-1', {
          'dark:text-[#0D87FF] text-[#0066EB]': selected,
        })}
        icon={icon}
      />
      <h1
        className={cn('text-[11px]', {
          'dark:text-[#0D87FF] text-[#0066EB]': selected,
        })}
      >
        {title}
      </h1>
    </div>
  );
}

function GeneralSettings() {
  const {
    startListening,
    stopListening,
    shortcut,
  } = useKeyboardShortcut();

  const [keybind, setKeybind] = React.useState<string>(
    window.electronAPI.fetchSetting('keybind'),
  );

  useEffect(() => {
    if (!shortcut) {
      return;
    }
    setKeybind(shortcut);
  }, [shortcut]);

  return (
    <div className='flex flex-col justify-center w-full items-center'>
      <div className='flex items-center mt-2'>
        <p className='text-sm'>Launch keybind:</p>
        <input
          className='rounded-sm text-[12px] text-center drop-shadow-sm bg-[#fffff] dark:bg-[#343432] border-0 h-[18px] w-28 ml-3 active:border-0 focus:border-0 outline-offset-2 focus:outline-blue-400'
          type='text'
          readOnly
          value={convertToNiceShortcut(keybind)}
          onFocus={startListening}
          onBlur={() => {
            stopListening();
            window.electronAPI.updateSetting('keybind', shortcut);
          }}
        />
      </div>
    </div>
  );
}

function PromptSettings() {
  return (
    <div>
      <h1>Prompt Settings</h1>
    </div>
  );
}

export default function Settings() {
  const [selectedSetting, setSelectedSetting] = React.useState<SETTINGS>(SETTINGS.GENERAL);

  return (
    <main className='flex flex-col dark:bg-[#383736] h-screen'>
      <div className='h-[81px] border-0 border-b border-b-neutral-300 dark:border-b-zinc-950 drag flex flex-col'>
        <h1 className='text-[12px] font-bold text-[#6C6C6C] dark:text-[#9C9C9B] text-center pt-1'>
          {selectedSetting === SETTINGS.GENERAL
            ? 'General'
            : 'Prompt'}
        </h1>
        <div className='flex justify-center items-center gap-[1px] mt-1'>
          <SettingsOption
            title='General'
            icon={faCog}
            onClick={() => setSelectedSetting(SETTINGS.GENERAL)}
            selected={selectedSetting === SETTINGS.GENERAL}
          />
          <SettingsOption
            title='Prompts'
            icon={faMessage}
            onClick={() => setSelectedSetting(SETTINGS.PROMPTS)}
            selected={selectedSetting === SETTINGS.PROMPTS}
          />
        </div>
      </div>
      <div className='flex-grow dark:bg-[#292929] bg-[#EEEDEC]'>
        {selectedSetting === SETTINGS.GENERAL
          ? <GeneralSettings />
          : <PromptSettings />}
      </div>
    </main>
  );
}
