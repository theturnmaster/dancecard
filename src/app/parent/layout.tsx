import Link from 'next/link';
import { ReactNode } from 'react';

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-fuchsia-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-fuchsia-900 text-white flex-shrink-0 shadow-xl z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-rose-300">Parent Portal</h2>
        </div>
        <nav className="flex flex-col gap-2 px-4 mt-4">
          <Link href="/parent" className="p-3 hover:bg-fuchsia-800 rounded-lg transition-colors font-medium">Dashboard</Link>
          <Link href="/parent/dancers" className="p-3 hover:bg-fuchsia-800 rounded-lg transition-colors font-medium">My Dancers</Link>
          <Link href="/parent/register" className="p-3 hover:bg-fuchsia-800 rounded-lg transition-colors font-medium">Register Interest</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
