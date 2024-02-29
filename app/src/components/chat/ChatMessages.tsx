import {
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import React, {
  useEffect,
} from 'react';
import type {
  ChatMessage,
} from '../../constants/chat';
import {
  useAppSelector,
} from '../../lib/hooks';
import Message from './ChatMessage';

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

  const isWaitingForResponse = useAppSelector((state) => state.isWaitingForResponse);

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
        {chatHistory.map((message, index) => (
          <Message
            key={index}
            message={message}
          />
        ))}
        {isWaitingForResponse
          ? (
            <div
              className={'flex justify-start'}
            >
              <div
                className={'p-2 rounded-sm'}
              >
                <div className='text-md select-text'>
                  <FontAwesomeIcon className='animate-spin' icon={faCircleNotch} />
                </div>
              </div>
            </div>
          )
          : null}
      </div>
    )
    : null;
};

export default ChatMessages;
