import React from 'react';
import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-8 font-sans">
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="rounded-full border border-white/20 bg-white/[0.06] px-5 py-2 text-xs font-bold tracking-[0.2em] text-white hover:border-white/40 transition-colors"
        >
          MARIS
        </Link>
        <Link
          href="/"
          className="text-xs text-white/70 hover:text-white transition-colors"
        >
          ← Return to Home
        </Link>
      </header>

      <main className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/80">
          <span>MARIS v2.4.0 (Universal Release)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Download MARIS
        </h1>

        <p className="text-sm text-white/60 leading-relaxed">
          High-performance secure maritime networking & forensic telemetry client for Windows, macOS, Linux, iOS, and Android.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/console"
            className="w-full sm:w-auto rounded-full bg-white text-black px-8 py-3.5 text-sm font-bold shadow-lg hover:bg-white/90 transition-transform active:scale-95"
          >
            Launch Web Console
          </Link>
          <a
            href="#installer"
            className="w-full sm:w-auto rounded-full border border-white/20 bg-white/[0.06] px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Download for Windows (.exe)
          </a>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-white/40 border-t border-white/[0.08] pt-6">
        © {new Date().getFullYear()} MARIS Global Infrastructure. 30-days money back guarantee.
      </footer>
    </div>
  );
}
