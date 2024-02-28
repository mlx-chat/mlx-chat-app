import React, {
  useRef,
  useState,
} from 'react';
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
        placeholder='Enter prompt here'
        onKeyDown={handleSend}
        ref={inputRef}
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
