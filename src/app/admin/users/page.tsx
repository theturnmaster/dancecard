import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUsers, handleRoleChangeAction, handleDeleteAction, createUserAction, approveUserAction } from "@/actions/admin";
import AddUserFormClient from "./AddUserFormClient";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const users = await getUsers();

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        Manage Users
      </h1>
      <p className="text-zinc-400 text-lg mb-8 font-medium">View and manage all 7DC accounts in the system.</p>
      
      {/* Collapsible New User Form (Default Collapsed) */}
      <AddUserFormClient createUserAction={createUserAction} />

      {/* Users Table */}
      <h3 className="text-2xl font-black text-zinc-100 mb-4">User Index</h3>
      <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800">
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Approval Status</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-100">{user.name}</td>
                  <td className="px-6 py-4 font-medium text-zinc-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <form action={handleRoleChangeAction} className="inline-flex">
                      <input type="hidden" name="userId" value={user.id} />
                      <select 
                        name="role" 
                        defaultValue={user.role} 
                        className={`text-xs font-black px-3 py-1.5 rounded-l-full border-none focus:ring-2 focus:ring-amber-400 ${
                          user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          user.role === 'TEACHER' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                          'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <option value="PARENT">PARENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold px-3 py-1.5 rounded-r-full transition-colors">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                      user.isApproved !== false
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse'
                    }`}>
                      {user.isApproved !== false ? 'Approved' : 'Pending Approval'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.isApproved === false && (
                        <form action={approveUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button 
                            type="submit" 
                            className="text-xs px-3.5 py-1.5 rounded-lg font-extrabold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black shadow-md transition-all whitespace-nowrap"
                          >
                            ✅ Approve
                          </button>
                        </form>
                      )}

                      <form action={handleDeleteAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button 
                          type="submit" 
                          disabled={user.id === (session.user as any)?.id}
                          className="text-rose-400 hover:text-rose-300 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-950/60 px-2.5 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-zinc-500 font-medium">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
