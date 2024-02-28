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
              className={`p-2 rounded-sm ${
                chat.role === 'user'
                  ? 'bg-[#E9E9EB] dark:bg-zinc-500'
                  : 'bg-slate-300 dark:bg-zinc-600'
              }`}
            >
              <p>{chat.content}</p>
            </div>
          </div>
        ))}
      </div>
    )
    : null;
};

export default ChatMessages;
