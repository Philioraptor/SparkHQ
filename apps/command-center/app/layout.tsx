import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project SparkHQ - Founder Command Center',
  description: 'Autonomous AI C-Suite System for Single Founders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
