import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'DriveFair - Consent-Based Behavioral Insurance',
  description: 'Fair insurance pricing based on your actual driving behavior',
};

// Next 14: themeColor must live in the viewport export, not metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0080ff',
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
