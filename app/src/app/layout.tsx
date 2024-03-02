'use client';

import StoreProvider from '../AppProvider';
import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import {
  config,
} from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;

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
