'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { demoStore } from '@/lib/demo/store';
import { useDemoStore } from '@/lib/demo';
import CommandPalette from './CommandPalette';
import ToastNotifier from './ToastNotifier';
import DetailDrawer from './DetailDrawer';
import { Anomaly } from '@/lib/demo/types';

// Bespoke Precision Architectural SVG Icons (Replaces generic Lucide icons)
const Icons = {
  Console: () => (
    <svg className="h-4 w-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" />
      <path d="M7 8l4 4-4 4M13 16h4" />
    </svg>
  ),
  Map: () => (
    <svg className="h-4 w-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  Upload: () => (
    <svg className="h-4 w-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Layers: () => (
    <svg className="h-4 w-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Reports: () => (
    <svg className="h-4 w-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Search: () => (
    <svg className="h-3.5 w-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Collapse: () => (
    <svg className="h-3.5 w-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Expand: () => (
    <svg className="h-3.5 w-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Operations Console', href: '/console', icon: Icons.Console },
  { label: 'PostGIS Swath Map', href: '/map', icon: Icons.Map },
  { label: 'Sonar Ingestion', href: '/upload', icon: Icons.Upload },
  { label: 'Target Inventory', href: '/anomalies', icon: Icons.Layers },
  { label: 'Survey Dossiers', href: '/reports', icon: Icons.Reports },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [utcTime, setUtcTime] = useState<string>('');
  const [alertsOpen, setAlertsOpen] = useState(false);

  const { alerts, jobs } = useDemoStore();
  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  const isLandingOrAuth = pathname === '/' || pathname === '/login';

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Keyboard Listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [operatorName, setOperatorName] = useState('Capt. Vivek Sharma');
  const [operatorRole, setOperatorRole] = useState('COMMANDER');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const matchName = document.cookie.match(/maris_operator_name=([^;]+)/);
      const matchRole = document.cookie.match(/maris_role=([^;]+)/);
      if (matchName && matchName[1]) {
        try {
          setOperatorName(decodeURIComponent(matchName[1]));
        } catch {
          // ignore
        }
      }
      if (matchRole && matchRole[1]) {
        setOperatorRole(matchRole[1].toUpperCase());
      }
    }
  }, []);

  const handleSignOut = () => {
    document.cookie = 'maris_demo_user=; Max-Age=0; path=/;';
    document.cookie = 'maris_role=; Max-Age=0; path=/;';
    document.cookie = 'maris_operator_name=; Max-Age=0; path=/;';
    router.push('/login');
  };

  if (isLandingOrAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#070a0f] text-[#e2e8e4] font-mono-inst selection:bg-[#3b7b99] selection:text-white">
      {/* ── Left Collapsible Navigation Sidebar ── */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.08] bg-[#0b1018] transition-all duration-200',
          sidebarCollapsed ? 'w-14' : 'w-60'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-3.5">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#8c978f] bg-[#101622] text-xs font-bold text-[#e2e8e4]">
              M
            </span>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-[0.2em] text-[#e2e8e4]">MARIS</span>
                <span className="text-[9px] text-[#8c978f] uppercase tracking-wider">
                  SIH26057 C2
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="border border-white/10 p-1 text-[#8c978f] hover:bg-white/[0.04] hover:text-[#e2e8e4]"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <Icons.Expand /> : <Icons.Collapse />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 text-xs transition-colors',
                  isActive
                    ? 'border border-white/30 bg-[#161e2e] text-[#e2e8e4]'
                    : 'border border-transparent text-[#8c978f] hover:bg-white/[0.03] hover:text-[#e2e8e4]'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={clsx('shrink-0', isActive ? 'text-[#e2e8e4]' : 'text-[#8c978f]')}>
                  <Icon />
                </span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Active Ingestion Pipeline Monitor */}
        {jobs.length > 0 && !sidebarCollapsed && (
          <div className="m-2 border border-white/[0.08] bg-[#101622] p-2.5 text-[10px]">
            <div className="flex items-center justify-between text-[#8c978f]">
              <span className="flex items-center gap-1.5 text-[#5b937c]">
                <span className="h-1.5 w-1.5 bg-[#5b937c]" /> PIPELINE ACTIVE
              </span>
              <span>{jobs.length} JOBS</span>
            </div>
            <p className="mt-1 text-[#e2e8e4] truncate">{jobs[0].surveyName}</p>
            <div className="mt-2 h-1 w-full bg-[#070a0f]">
              <div className="h-full bg-[#5b937c]" style={{ width: `${jobs[0].progress}%` }} />
            </div>
          </div>
        )}

        {/* Footer & Status */}
        <div className="border-t border-white/[0.08] p-3 space-y-1 text-[10px] text-[#8c978f]">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-[#e2e8e4] transition-colors"
          >
            <span>[PUBLIC ARCHIVE]</span>
          </Link>
          <div className="flex items-center gap-2 text-[#5b937c]">
            <span className="h-1.5 w-1.5 bg-[#5b937c]"></span>
            {!sidebarCollapsed && <span>LINK NOMINAL</span>}
          </div>
        </div>
      </aside>

      {/* ── Main Operations Viewport ── */}
      <div
        className={clsx(
          'flex flex-1 flex-col transition-all duration-200',
          sidebarCollapsed ? 'pl-14' : 'pl-60'
        )}
      >
        {/* Top Operations Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0b1018]/95 px-4 sm:px-6">
          {/* Quick Search */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 border border-white/10 bg-[#070a0f] px-3 py-1 text-xs text-[#8c978f] hover:border-white/30 hover:text-[#e2e8e4]"
            >
              <Icons.Search />
              <span>Filter telemetry...</span>
              <kbd className="border border-white/15 bg-[#101622] px-1 py-0.2 text-[9px] text-[#8c978f]">
                CMD+K
              </kbd>
            </button>
          </div>

          {/* Right Status Group */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* UTC Master Clock */}
            <div className="hidden lg:flex items-center gap-2 border border-white/10 bg-[#070a0f] px-2.5 py-1 text-[#8c978f]">
              <span>UTC:</span>
              <span className="tabular-nums text-[#e2e8e4]">{utcTime || 'SYNCHRONIZING...'}</span>
            </div>

            {/* Security Protocol */}
            <div className="hidden sm:flex items-center gap-1.5 border border-[#5b937c]/30 bg-[#5b937c]/10 px-2.5 py-1 text-[11px] text-[#5b937c]">
              <span className="h-1.5 w-1.5 bg-[#5b937c]"></span>
              <span>OPERATIONAL</span>
            </div>

            {/* Operator Lockup */}
            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
              <div className="text-right text-[10px]">
                <div className="text-[#e2e8e4] font-semibold">{operatorName}</div>
                <div className="text-[#8c978f] text-[9px]">{operatorRole}</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="border border-white/10 px-2 py-1 text-[10px] text-[#8c978f] hover:border-white/40 hover:text-[#e2e8e4]"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectAnomaly={(a) => setSelectedAnomaly(a)}
      />

      <ToastNotifier />

      <DetailDrawer
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
      />
    </div>
  );
}
