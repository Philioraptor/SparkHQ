'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#080B11]/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
                  SparkHQ
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase tracking-wider">
                  Open Source
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Autonomous AI C-Suite for Solopreneurs
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Navigation Links, GitHub Repo Link & Coffee Button */}
        <div className="flex items-center gap-3">
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Philioraptor/SparkHQ"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline font-mono">Philioraptor/SparkHQ</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
              ★ Star
            </span>
          </a>

          {/* Buy Me a Coffee Button */}
          <Link
            href="/billing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-950/40 active:scale-95"
          >
            <span>☕</span>
            <span className="hidden sm:inline">Buy Me a Coffee</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
