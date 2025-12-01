import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Membrane - AI for Product Integrations',
  description: 'Describe what you need. Watch integrations build, test and maintain themselves.',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
