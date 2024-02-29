import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  useAppSelector,
} from '../../lib/hooks';
import {
  Input,
} from '../ui/input';

const ChatInput = ({
  sendMessage,
}: {
  sendMessage: (text: string) => void;
}) => {
  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || message.length === 0) {
      return;
    }
    e.preventDefault();
    setMessage('');
    sendMessage(message);
  };

  // detect website focus and focus the input
  const handleFocus = () => {
    if (document.activeElement !== inputRef.current) {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const isDirectoryIndexing = useAppSelector((state) => state.isDirectoryIndexing);

  return (
    <div
      className='w-full py-2'
      onClick={() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }}
      style={{
        // @ts-expect-error -- WebkitAppRegion is a valid property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        WebkitAppRegion: 'drag',
      }}
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isDirectoryIndexing ? 'Indexing your files..' : 'Enter prompt here'}
        onKeyDown={handleSend}
        ref={inputRef}
        disabled={isDirectoryIndexing}
        className={'text-xl border-0 focus-visible:outline-transparent focus-visible:ring-0 focus-visible:shadow-0 w-full shadow-0'}
        style={{
          // @ts-expect-error -- WebkitAppRegion is a valid property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          WebkitAppRegion: 'no-drag',
        }}
      />
    </div>
  );
};

export default ChatInput;
