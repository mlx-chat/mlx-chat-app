import Markdown from 'markdown-to-jsx';
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
    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`p-2 rounded-sm ${
        message.role === 'user'
          ? 'bg-blue-500 text-white'
          : 'bg-[#E9E9EB] dark:bg-zinc-500'
      }`}
    >
      <div className='text-md select-text'>
        <Markdown
          children={message.content ?? ''}
        />
      </div>
    </div>
  </div>
);

export default Message;
