import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl z-10 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Admin Portal</h2>
        </div>
        <nav className="flex flex-col gap-2 px-4 mt-4 flex-grow">
          <Link href="/admin" className="p-3 hover:bg-slate-800 rounded-lg transition-colors font-medium">Dashboard</Link>
          <Link href="/admin/users" className="p-3 hover:bg-slate-800 rounded-lg transition-colors font-medium">Manage Users</Link>
          <Link href="/admin/schedule" className="p-3 hover:bg-slate-800 rounded-lg transition-colors font-medium">Manage Schedule</Link>
          <Link href="/admin/lottery" className="p-3 hover:bg-slate-800 rounded-lg transition-colors font-medium">Lottery & Enrollment</Link>
          
          <div className="mt-auto pb-6">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
