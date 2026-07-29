import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const teacherId = (session?.user as any)?.id;

  const [mySlotsCount, totalInterestCount] = await Promise.all([
    teacherId ? prisma.timeSlot.count({ where: { teacherId } }) : 0,
    teacherId ? prisma.interestRegistration.count({ where: { timeSlot: { teacherId } } }) : 0
  ]);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-6">Teacher Dashboard</h1>
      <p className="text-slate-600 text-lg">Manage your schedule and view dancer interest.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">My Timeslots</h3>
          <p className="text-4xl font-black text-indigo-600 mt-2">{mySlotsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Total Interest Registered</h3>
          <p className="text-4xl font-black text-fuchsia-600 mt-2">{totalInterestCount}</p>
        </div>
      </div>
    </div>
  );
}
