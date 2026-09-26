'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Map as MapIcon,
  FileUp,
  Layers,
  FileText,
  Search,
  RotateCcw,
  Bell,
  Clock,
  Radio,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  User,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { demoStore } from '@/lib/demo/store';
import { useDemoStore } from '@/lib/demo';
import CommandPalette from './CommandPalette';
import ToastNotifier from './ToastNotifier';
import DetailDrawer from './DetailDrawer';
import { Anomaly } from '@/lib/demo/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Operations Console', href: '/console', icon: Shield },
  { label: 'PostGIS Map', href: '/map', icon: MapIcon },
  { label: 'Sonar Ingestion', href: '/upload', icon: FileUp },
  { label: 'Target Inventory', href: '/anomalies', icon: Layers },
  { label: 'Survey Reports', href: '/reports', icon: FileText },
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

  // If on Landing Page or Login page, render clean full viewport without console chrome
  const isLandingOrAuth = pathname === '/' || pathname === '/login';

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
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

  // Read Operator Session Cookies on Client
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
    // Clear auth cookies
    document.cookie = 'maris_demo_user=; Max-Age=0; path=/;';
    document.cookie = 'maris_role=; Max-Age=0; path=/;';
    document.cookie = 'maris_operator_name=; Max-Age=0; path=/;';
    router.push('/login');
  };

  if (isLandingOrAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#060a12] text-slate-100 sonar-grid-bg">
      {/* ── Left Collapsible Navigation Sidebar ── */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--color-border)] bg-[#0a1120]/95 backdrop-blur-xl transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 font-mono text-sm font-black text-black shadow-lg shadow-cyan-500/30">
              M
            </span>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-mono text-base font-black tracking-wider text-white">MARIS</span>
                <span className="font-mono text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest">
                  SIH26057 · Edge AI
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg border border-[var(--color-border)] p-1 text-slate-400 hover:bg-[#121d33] hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-[#121d33] hover:text-slate-100 border border-transparent'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={clsx('h-4 w-4 shrink-0', isActive ? 'text-cyan-400' : 'text-slate-400')} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Active Processing Pulse */}
        {jobs.length > 0 && !sidebarCollapsed && (
          <div className="m-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 animate-pulse" /> ACTIVE PIPELINE
              </span>
              <span>{jobs.length} JOBS</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-slate-300 truncate">{jobs[0].surveyName}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#060a12]">
              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${jobs[0].progress}%` }} />
            </div>
          </div>
        )}

        {/* Footer info & Landing link */}
        <div className="border-t border-[var(--color-border)] p-3 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            {!sidebarCollapsed && <span>3D Landing · The Descent</span>}
          </Link>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {!sidebarCollapsed && <span>UNDROIP MOSAIC · ONLINE</span>}
          </div>
        </div>
      </aside>

      {/* ── Main Operations Viewport ── */}
      <div
        className={clsx(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        {/* Top Operations Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[#0a1120]/80 px-6 backdrop-blur-xl">
          {/* Left: Quick Search Bar trigger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[#060a12] px-3.5 py-1.5 text-xs text-slate-400 hover:border-cyan-400 hover:text-slate-200"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span>Search mission telemetry...</span>
              <kbd className="rounded border border-slate-700 bg-[#0a1120] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Telemetry Health, Clock, Alerts, Demo Badge, User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* UTC Master Clock */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[#060a12] px-3 py-1 font-mono text-xs text-slate-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
            </div>

            {/* System Health */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% OPERATIONAL</span>
            </div>

            {/* Tactical Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="relative rounded-lg border border-[var(--color-border)] p-2 text-slate-300 hover:bg-[#121d33] hover:text-white"
                title="Tactical Alerts"
              >
                <Bell className="h-4 w-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[10px] font-bold text-white">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown Panel */}
              {alertsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAlertsOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-[var(--color-border)] bg-[#0d1627] p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="font-mono text-xs font-bold text-white">Tactical Alerts</span>
                      <span className="font-mono text-[10px] text-cyan-400">{alerts.length} Total</span>
                    </div>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {alerts.map((alt) => (
                      <div
                        key={alt.id}
                        className={clsx(
                          'rounded-lg border p-2.5 text-xs',
                          alt.acknowledged
                            ? 'border-slate-800 bg-[#070b14] text-slate-400'
                            : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                        )}
                      >
                        <p className="font-bold text-white">{alt.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{alt.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-400">
                            {new Date(alt.timestamp).toLocaleTimeString()}
                          </span>
                          {!alt.acknowledged && (
                            <button
                              onClick={() => demoStore.acknowledgeAlert(alt.id)}
                              className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300 hover:bg-rose-500/30"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </>
              )}
            </div>

            {/* Demo Data Mode Badge with One-Click Reset */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 px-2.5 py-1 text-xs">
              <span className="font-mono font-bold text-amber-300 text-[11px]">DEMO</span>
              <button
                onClick={() => demoStore.resetToFactorySeed()}
                title="Reset to Factory Demo Seed (26057)"
                className="flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-200 hover:bg-amber-500/30"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            {/* User Session Profile & Signout */}
            <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-3">
              <div className="hidden sm:flex flex-col text-right font-mono">
                <span className="text-xs font-bold text-slate-200">{operatorName}</span>
                <span className="text-[9px] text-cyan-400 uppercase">ROLE: {operatorRole}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out / Change Session"
                className="rounded-lg border border-[var(--color-border)] p-1.5 text-slate-400 hover:border-rose-500/50 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <ToastNotifier onSelectAnomaly={(a) => setSelectedAnomaly(a)} />
      <DetailDrawer anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
    </div>
  );
}
