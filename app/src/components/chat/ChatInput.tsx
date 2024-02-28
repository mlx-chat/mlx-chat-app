import React, {
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

  const handleSend = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || message.length === 0) {
      return;
    }
    e.preventDefault();
    setMessage('');
    sendMessage(message);
  };

  return (
    <Input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder='Enter prompt here'
      onKeyDown={handleSend}
    />
  );
};

export default ChatInput;
