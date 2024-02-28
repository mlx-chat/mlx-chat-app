import React, {
  useState,
} from 'react';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';

const Chat = ({
  selectedDirectory,
}: {
  selectedDirectory: string | null;
}) => {
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string | null; }[]>([]);
  const sendMessage = async (message: string) => {
    try {
      const newHistory = [
        ...chatHistory,
        { role: 'user', content: message },
      ];
      setChatHistory(newHistory);
      const response = await fetch('http://localhost:8080/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          temperature: 0.0,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          max_tokens: 100,
          ...(selectedDirectory !== null && { directory: selectedDirectory }),
        }),
      });

      const responseData = await response.json();
      const assistantResponse = responseData.choices[0].message.content;

      setChatHistory([
        ...newHistory,
        { role: 'assistant', content: assistantResponse },
      ]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending message: ', error);
    }
  };

  return (
    <>
      <div className='flex justify-center'>
        <ChatInput sendMessage={sendMessage} />
      </div>
      <div className='flex-grow min-w-full bg-slate-100 rounded-sm dark:bg-zinc-900 border flex h-[1px]'>
        <ChatMessages chatHistory={chatHistory} />
      </div>
    </>
  );
};

export default Chat;
