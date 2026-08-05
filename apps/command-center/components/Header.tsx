'use client';

export default function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-100 tracking-tight">Project SparkHQ</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50 uppercase">
                AI C-Suite v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Founder Command Center • Dhruv Mishra</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Event Router: Active
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">BullMQ: Connected</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Prisma DB: Synced</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            DM
          </div>
        </div>
      </div>
    </header>
  );
}
