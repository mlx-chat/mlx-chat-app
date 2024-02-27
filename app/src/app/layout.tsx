'use client';

import './globals.css';
import {
  Inter,
} from 'next/font/google';

// eslint-disable-next-line new-cap
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} bg-background min-h-screen overflow-y-hidden`}>
        <div
          className='h-10 w-full'
          style={{
            // @ts-expect-error -- WebkitAppRegion is a valid property
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitAppRegion: 'drag',
          }}
        />
        {children}
      </body>
    </html>
  );
}
