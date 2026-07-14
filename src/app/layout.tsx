import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from '@/components/providers';
import { DotPattern } from '@/components/ui/dot-pattern';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ScholarTrack - Scholarship Tracking System',
  description: 'Manage, monitor, and streamline all scholarship-related activities for students',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen">
          <DotPattern
            className="text-muted-foreground/8"
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={0.8}
          />
          <div className="relative z-10">
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
