import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import Logo from '@/components/Logo';
import { ReactNode } from 'react';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar - Fixed to viewport height & sticky on desktop so Logout is pinned to bottom */}
      <aside className="w-full md:w-72 bg-zinc-900 border-r border-amber-500/20 text-white flex-shrink-0 shadow-2xl z-20 flex flex-col justify-between md:h-screen md:sticky md:top-0">
        <div className="overflow-y-auto">
          <div className="p-6 border-b border-zinc-800/80">
            <Logo size={44} textTitle="Teacher Portal" />
          </div>
          <nav className="flex flex-col gap-2 p-4 mt-2">
            <Link href="/teacher" className="p-3.5 hover:bg-zinc-800/80 hover:text-amber-400 rounded-xl transition-all font-bold text-sm text-zinc-300 flex items-center gap-3">
              <span>📊</span> Dashboard
            </Link>
            <Link href="/teacher/schedule" className="p-3.5 hover:bg-zinc-800/80 hover:text-amber-400 rounded-xl transition-all font-bold text-sm text-zinc-300 flex items-center gap-3">
              <span>🗓️</span> My Schedule
            </Link>
          </nav>
        </div>

        {/* Pinned Bottom Logout Container */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-auto bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
