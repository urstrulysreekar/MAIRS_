import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/ui/AppShell';

export const metadata: Metadata = {
  title: 'MARIS – Marine Anomaly Recognition & Intelligence System (SIH26057)',
  description:
    'Edge AI side-scan sonar telemetry for detecting ghost nets and underwater hazards.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MARIS',
  },
};

export const viewport: Viewport = {
  themeColor: '#00f0ff',
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
      <body className="min-h-screen antialiased bg-[#060a12] text-slate-100 selection:bg-cyan-400 selection:text-black">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
