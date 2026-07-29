import { prisma } from "@/lib/prisma";
import { getEnrollmentStatus, approveUserAction } from "@/actions/admin";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalUsers, activeSlots, enrollment, pendingUsers] = await Promise.all([
    prisma.user.count(),
    prisma.timeSlot.count(),
    getEnrollmentStatus(),
    prisma.user.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const isOpen = enrollment?.isOpen ?? false;

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        Admin Dashboard
      </h1>
      <p className="text-zinc-400 text-lg mb-8 font-medium">
        Welcome to the 7DC dance studio administration portal.
      </p>

      {/* Pending Account Approvals Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-zinc-900 border border-amber-500/50 p-6 md:p-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl animate-pulse">
                ⏳
              </span>
              <div>
                <h2 className="text-xl font-black text-amber-400">Pending Parent Account Approvals</h2>
                <p className="text-xs text-zinc-400 font-medium">
                  {pendingUsers.length} new parent {pendingUsers.length === 1 ? 'account is' : 'accounts are'} awaiting approval.
                </p>
              </div>
            </div>
            <a 
              href="/admin/users" 
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Manage All Users →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-zinc-100 text-sm">{user.name}</div>
                  <div className="text-xs text-zinc-400">{user.email}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Registered {format(new Date(user.createdAt), 'MMM d, h:mm a')}</div>
                </div>

                <form action={approveUserAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button 
                    type="submit" 
                    className="text-xs px-3.5 py-2 rounded-xl font-extrabold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black shadow-md transition-all whitespace-nowrap"
                  >
                    ✅ Approve
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Total Users</h3>
          <p className="text-4xl font-black text-zinc-100 mt-2">{totalUsers}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Active Time Slots</h3>
          <p className="text-4xl font-black text-amber-400 mt-2">{activeSlots}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Enrollment Status</h3>
          <p className={`text-2xl font-black mt-2 ${isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </p>
        </div>
      </div>
    </div>
  );
}
