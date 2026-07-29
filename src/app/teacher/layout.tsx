import Link from 'next/link';
import { ReactNode } from 'react';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex-shrink-0 shadow-xl z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">Teacher Portal</h2>
        </div>
        <nav className="flex flex-col gap-2 px-4 mt-4">
          <Link href="/teacher" className="p-3 hover:bg-indigo-800 rounded-lg transition-colors font-medium">Dashboard</Link>
          <Link href="/teacher/schedule" className="p-3 hover:bg-indigo-800 rounded-lg transition-colors font-medium">My Schedule</Link>
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
