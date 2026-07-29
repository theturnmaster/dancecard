import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUsers, handleRoleChangeAction, handleDeleteAction } from "@/actions/admin";

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
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-700">Name</th>
                <th className="px-6 py-4 font-bold text-slate-700">Email</th>
                <th className="px-6 py-4 font-bold text-slate-700">Role</th>
                <th className="px-6 py-4 font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <form action={handleRoleChangeAction} className="inline-flex">
                      <input type="hidden" name="userId" value={user.id} />
                      <select 
                        name="role" 
                        defaultValue={user.role} 
                        className={`text-xs font-bold px-3 py-1.5 rounded-l-full border-none focus:ring-2 focus:ring-blue-500 ${
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-fuchsia-100 text-fuchsia-700'
                        }`}
                      >
                        <option value="PARENT">PARENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button type="submit" className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-r-full transition-colors">
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
  );
}
