import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUsers, updateUserRole, deleteUser } from "@/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const users = await getUsers();

  async function handleRoleChange(formData: FormData) {
    'use server';
    const userId = formData.get('userId') as string;
    const role = formData.get('role') as any;
    await updateUserRole(userId, role);
    revalidatePath('/admin/users');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const userId = formData.get('userId') as string;
    await deleteUser(userId);
    revalidatePath('/admin/users');
  }

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
                    <form action={handleRoleChange} className="inline-flex">
                      <input type="hidden" name="userId" value={user.id} />
                      <select 
                        name="role" 
                        defaultValue={user.role} 
                        onChange={(e) => e.target.form?.requestSubmit()}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-none cursor-pointer focus:ring-2 focus:ring-blue-500 ${
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-fuchsia-100 text-fuchsia-700'
                        }`}
                      >
                        <option value="PARENT">PARENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <form action={handleDelete}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button 
                        type="submit" 
                        disabled={user.id === session.user.id}
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
