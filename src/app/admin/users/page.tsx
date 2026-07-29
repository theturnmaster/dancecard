import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUsers, handleRoleChangeAction, handleDeleteAction, createUserAction } from "@/actions/admin";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const users = await getUsers();

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Manage Users</h1>
      <p className="text-slate-600 text-lg mb-8">View and manage all accounts in the system.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 sticky top-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New User</h3>
            <form action={createUserAction} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Name</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
                <input type="password" name="password" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Role</label>
                <select name="role" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="PARENT">PARENT</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button type="submit" className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                Create User
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-900">Name</th>
                <th className="px-6 py-4 font-bold text-slate-900">Email</th>
                <th className="px-6 py-4 font-bold text-slate-900">Role</th>
                <th className="px-6 py-4 font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <form action={handleRoleChangeAction} className="inline-flex">
                      <input type="hidden" name="userId" value={user.id} />
                      <select 
                        name="role" 
                        defaultValue={user.role} 
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-l-full border-none focus:ring-2 focus:ring-blue-500 ${
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-900' :
                          user.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-900' :
                          'bg-fuchsia-100 text-fuchsia-900'
                        }`}
                      >
                        <option value="PARENT">PARENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button type="submit" className="bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-r-full transition-colors">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <form action={handleDeleteAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button 
                        type="submit" 
                        disabled={user.id === (session.user as any)?.id}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-slate-500">No users found.</div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
