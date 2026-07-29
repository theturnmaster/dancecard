import { PrismaClient } from "@prisma/client";
import { getEnrollmentStatus } from "@/actions/admin";

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const [totalUsers, activeSlots, enrollment] = await Promise.all([
    prisma.user.count(),
    prisma.timeSlot.count(),
    getEnrollmentStatus()
  ]);

  const isOpen = enrollment?.isOpen ?? false;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Admin Dashboard</h1>
      <p className="text-slate-600 text-lg">Welcome to the dance studio administration portal.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Total Users</h3>
          <p className="text-4xl font-black text-blue-600 mt-2">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Active Time Slots</h3>
          <p className="text-4xl font-black text-emerald-600 mt-2">{activeSlots}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Enrollment Status</h3>
          <p className={`text-2xl font-black mt-2 ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </p>
        </div>
      </div>
    </div>
  );
}
