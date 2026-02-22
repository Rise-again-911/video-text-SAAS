import './globals.css';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'VideoText SaaS',
  description: 'YouTube Transcript exporter'
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
