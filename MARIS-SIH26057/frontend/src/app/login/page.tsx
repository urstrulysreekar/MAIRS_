'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Frame } from '@/components/ui/Frame';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import {
  Shield,
  Radio,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please provide a valid operator email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get('next') || '/console';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Looping Sonar-Ping Canvas Animation on Left Panel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const rings: { r: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(24, 40, 68, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Concentric Range Rings
      const maxR = Math.min(w, h) * 0.42;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      for (let r = 40; r <= maxR; r += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Sonar Beam Sweep
      angle += 0.025;
      const beamX = cx + Math.cos(angle) * maxR;
      const beamY = cy + Math.sin(angle) * maxR;

      const beamGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      beamGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.35, angle);
      ctx.closePath();
      ctx.fill();

      // Pulsing Sonar Ring Emits
      if (Math.random() < 0.035) {
        rings.push({ r: 5, opacity: 0.8 });
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += 1.6;
        ring.opacity -= 0.008;

        if (ring.opacity <= 0 || ring.r > maxR) {
          rings.splice(i, 1);
        } else {
          ctx.strokeStyle = `rgba(0, 240, 255, ${ring.opacity})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Central Transceiver Hub
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSignupSuccess(false);

    // Zod validation
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (field === 'email') fieldErrors.email = issue.message;
        if (field === 'password') fieldErrors.password = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(nextRoute);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'analyst', is_demo: false },
          },
        });
        if (error) throw error;
        setSignupSuccess(true);
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : 'Authentication request failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleKey: string, operatorName: string, roleTitle: string) => {
    document.cookie = `maris_demo_user=true; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `maris_role=${roleKey}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `maris_operator_name=${encodeURIComponent(operatorName)}; path=/; max-age=86400; SameSite=Lax`;
    router.push(nextRoute);
  };

  const handleGuestDemo = () => {
    handleRoleSelect('guest', 'Guest Evaluator', 'EVALUATION JURY');
  };

  const ROLES = [
    {
      id: 'commander',
      name: 'Capt. Vivek Sharma',
      role: 'TACTICAL COMMANDER',
      clearance: 'LEVEL 4 · FULL WRITE & DISPATCH',
      desc: 'Authorized to dispatch EOD divers, acknowledge priority alerts, and approve hazard triage.',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
    },
    {
      id: 'analyst',
      name: 'Dr. Ananya Nair',
      role: 'INTELLIGENCE ANALYST',
      clearance: 'LEVEL 3 · ML TRIAGE & GLCM',
      desc: 'Specialized in YOLOv8-DySample confidence validation and 5-channel GLCM texture reviews.',
      badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
    },
    {
      id: 'hydrographer',
      name: 'Lt. R. Menon',
      role: 'FIELD HYDROGRAPHER',
      clearance: 'LEVEL 3 · USV & SSS INGEST',
      desc: 'Manages raw XTF/JSF sonar streams, UNDROIP attitude compensation, and swath bathymetry.',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    },
    {
      id: 'jury',
      name: 'SIH Jury Evaluator',
      role: 'GUEST EVALUATOR',
      clearance: 'LEVEL 2 · READ-ONLY DEMO',
      desc: 'Zero-config evaluation mode pre-seeded with 350+ multi-spectral Indian Ocean detections.',
      badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#03030f] text-slate-100">
      {/* ── Left Brand Telemetry Panel ── */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between border-r border-[#182844] bg-[#070c1a] p-12 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00f0ff] font-mono text-sm font-black text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              M
            </span>
            <span className="font-syncopate text-xl font-black tracking-widest text-white">
              MARIS
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">
            SIH26057 · Edge Sonar Telemetry
          </p>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1022]/80 px-3 py-0.5 text-[10px] font-mono font-medium text-cyan-400 backdrop-blur-md">
            <Shield className="h-3.5 w-3.5" />
            <span>AIR-GAPPED DEFENSE CONSOLE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
            Autonomous Underwater Hazard Recognition &amp; PostGIS Geotagging
          </h2>
          <p className="text-xs leading-relaxed text-[#8496b0]">
            UNDROIP 3-axis IMU pitch/roll compensation, 2D-FFT de-striping, and YOLOv8-DySample 5-channel GLCM
            texture tensor inference for marine safety and ghost net remediation.
          </p>

          <div className="flex items-center gap-4 font-mono text-[10px] text-[#8496b0] pt-2">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-[#00f0ff] animate-pulse" /> SSS / ARIS Dual Sensor
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#0ac5b2]" /> PostGIS SRID: 4326
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-[#4d5e78]">
          <span>GULF OF MANNAR · SECTOR 4</span>
          <span>SUB-METER ACCURACY</span>
        </div>
      </div>

      {/* ── Right Auth Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[#00f0ff] font-mono text-xs font-black text-black">
                M
              </span>
              <span className="font-syncopate text-lg font-black text-white">MARIS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Operator Authorization
            </h1>
            <p className="mt-1.5 font-mono text-xs text-[#8496b0]">
              Select an operational role to enter the live demo console or provide credentials.
            </p>
          </div>

          {/* 1-Click Role Selection Cards */}
          <div className="space-y-2.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
              1-Click Evaluation Roles (Instant Zero-Config Access)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id, r.name, r.role)}
                  className="group relative flex flex-col items-start p-3.5 rounded-xl border border-white/10 bg-[#0a1122]/90 hover:bg-[#121c38] hover:border-cyan-400/50 transition-all text-left shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="font-space font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {r.name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border mb-1.5 ${r.badgeColor}`}>
                    {r.role}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {r.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#03030f] px-3 font-mono text-[10px] uppercase text-slate-500 shrink-0">
              or supabase cloud login
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Auth Form Frame */}
          <Frame variant="card" withTicks className="p-5 bg-[#080d1e]/80 border-white/10">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field
                label="Operator Email"
                type="email"
                placeholder="analyst@maris.navy.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <Field
                label="Security Key / Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              {authError && (
                <div className="flex items-center gap-2 rounded border border-[#ff3b5c]/40 bg-[#ff3b5c]/10 p-2.5 text-left font-mono text-xs text-[#ff3b5c]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="flex items-center gap-2 rounded border border-[#0ac5b2]/40 bg-[#0ac5b2]/10 p-2.5 text-left font-mono text-xs text-[#0ac5b2]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Account provisioned! Check email for verification link.</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full font-bold"
              >
                {loading
                  ? 'Verifying Credentials...'
                  : mode === 'signin'
                  ? 'Authenticate & Enter Console'
                  : 'Register Operator Profile'}
              </Button>
            </form>

            <div className="mt-3.5 border-t border-white/10 pt-2.5 flex items-center justify-between text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setAuthError(null);
                }}
                className="text-[#8496b0] hover:text-[#00f0ff] transition-colors"
              >
                {mode === 'signin'
                  ? "Don't have credentials? Sign up →"
                  : 'Already registered? Sign in here →'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('analyst@maris.navy.in');
                  setPassword('maris2026');
                }}
                className="text-cyan-400 hover:underline"
              >
                Auto-Fill Demo
              </button>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
