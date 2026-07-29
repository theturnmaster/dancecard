import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const teacherId = (session?.user as any)?.id;

  const [mySlotsCount, totalInterestCount] = await Promise.all([
    teacherId ? prisma.timeSlot.count({ where: { teacherId } }) : 0,
    teacherId ? prisma.interestRegistration.count({ where: { timeSlot: { teacherId } } }) : 0
  ]);

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        Teacher Dashboard
      </h1>
      <p className="text-zinc-400 text-lg font-medium mb-8">Manage your schedule and view dancer interest.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">My Timeslots</h3>
          <p className="text-4xl font-black text-amber-400 mt-2">{mySlotsCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Total Interest Registered</h3>
          <p className="text-4xl font-black text-yellow-300 mt-2">{totalInterestCount}</p>
        </div>
      </div>
    </div>
  );
}
