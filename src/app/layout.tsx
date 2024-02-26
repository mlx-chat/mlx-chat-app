'use client';

import './globals.css';
import {
  Inter,
} from 'next/font/google';
import Link from 'next/link';

import {
  useSelectedLayoutSegment,
} from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  return (
    <html lang='en'>
      <body className={`${inter.className} bg-background min-h-screen overflow-y-hidden`}>
        <div
          className='h-10 w-full'
          style={{
            // @ts-expect-error -- WebkitAppRegion is a valid property
            WebkitAppRegion: 'drag',
          }}
        />
        {children}
      </body>
    </html>
  );
}
