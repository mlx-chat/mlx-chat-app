import React from 'react';
import type {
  ChatMessage,
} from '../../constants/chat';

const Message = ({
  message,
}: {
  message: ChatMessage;
}) => (
  <div
    className={'flex w-full'}
  >
    <div
      className={'rounded-sm w-full relative flex items-center'}
    >
      <div className='w-full h-[1px] bg-red-500 rounded-md' />
      <div className='text-[12px] font-semibold select-text px-2 text-red-500 bg-transparent flex-grow rounded-md text-center py-1 whitespace-nowrap'>
        {message.content}
      </div>
      <div className='w-full h-[1px] bg-red-500 rounded-md' />
      <div className='arrow-tag text-[10px] p-0 absolute right-0 font-bold select-text uppercase pr-1 pl-1 text-white bg-red-500 flex-grow rounded-sm text-center whitespace-nowrap'>
        <svg
          className='absolute -left-[5px] top-[1px] z-[-1]'
          aria-hidden='true'
          role='img'
          width='8'
          height='13'
          viewBox='0 0 8 13'
        >
          <path
            className='fill-red-500 text-red-500'
            stroke='currentColor'
            fill='transparent'
            d='M8.16639 0.5H9C10.933 0.5 12.5 2.067 12.5 4V9C12.5 10.933 10.933 12.5 9 12.5H8.16639C7.23921 12.5 6.34992 12.1321 5.69373 11.4771L0.707739 6.5L5.69373 1.52292C6.34992 0.86789 7.23921 0.5 8.16639 0.5Z'
          >
          </path>
        </svg>
        Mode
      </div>
    </div>
  </div>
);

export default Message;
