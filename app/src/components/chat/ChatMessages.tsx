import React, {
  useEffect,
} from 'react';
import type {
  ChatMessage,
} from '../../constants/chat';

const ChatMessages = ({
  chatHistory,
}: {
  chatHistory: ChatMessage[];
}) => {
  const messagesRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const scrollHeight = messagesRef.current?.scrollHeight;
    const height = messagesRef.current?.clientHeight ?? 0;
    const maxScrollTop = scrollHeight ? scrollHeight - height : 0;
    if (messagesRef.current) {
      messagesRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  useEffect(() => {
    // check if the user is not at the bottom of the chat
    const currentScroll = messagesRef.current?.scrollTop ?? 0;
    const scrollHeight = messagesRef.current?.scrollHeight;
    const height = messagesRef.current?.clientHeight ?? 0;
    const maxScrollTop = scrollHeight ? scrollHeight - height : 0;
    const scrollInHistory = (maxScrollTop - currentScroll) > 200;

    if (scrollInHistory && chatHistory[chatHistory.length - 1]?.role !== 'user') {
      return;
    }

    scrollToBottom();
  }, [chatHistory]);
  return chatHistory.length
    ? (
      <div ref={messagesRef} className='flex flex-col flex-grow gap-4 p-4 overflow-y-scroll'>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-4 rounded-sm ${
                chat.role === 'user'
                  ? 'bg-slate-200 dark:bg-zinc-800'
                  : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            >
              <p>{chat.content}</p>
            </div>
          </div>
        ))}
      </div>
    )
    : (
      <div className='flex justify-center items-center min-h-full align-middle flex-grow'>
        <h1 className='text-md text-zinc-500 dark:text-zinc-500'>No messages yet</h1>
      </div>
    );
};

export default ChatMessages;
