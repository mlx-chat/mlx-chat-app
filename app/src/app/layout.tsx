'use client';

import StoreProvider from '../AppProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        className={'min-h-screen overflow-y-hidden'}
        style={{
          userSelect: 'none',
        }}
      >
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
