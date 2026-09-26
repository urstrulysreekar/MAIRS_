import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/ui/AppShell';

export const metadata: Metadata = {
  title: 'MARIS | Marine Acoustic Recognition & Geodetic Intelligence System',
  description:
    'Edge acoustic anomaly recognition and sub-meter PostGIS spatial geotagging for underwater hazard detection and marine survey missions.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MARIS',
  },
};

export const viewport: Viewport = {
  themeColor: '#070a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen antialiased bg-[#070a0f] text-[#e2e8e4] selection:bg-[#3b7b99] selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
