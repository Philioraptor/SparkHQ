import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Prompt & Workflow Pack — Fix n8n & Next.js in Minutes',
  description: '5 Master Prompts + production configs that fix the most common n8n and Next.js failures. Paste your error, get one actionable fix.',
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
