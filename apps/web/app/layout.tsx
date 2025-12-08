import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Re Generative UI – C1 Replica',
  description: 'Prototype of a Generative UI middleware stack using Gemini 2.5 Flash and Vercel AI SDK.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
