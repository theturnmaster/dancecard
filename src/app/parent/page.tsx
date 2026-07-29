import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function ParentDashboard() {
  const session = await getServerSession(authOptions);
  const parentId = (session?.user as any)?.id;

  const [myDancersCount, assignedSlotsCount] = await Promise.all([
    parentId ? prisma.dancer.count({ where: { parentId } }) : 0,
    parentId ? prisma.assignment.count({ where: { dancer: { parentId } } }) : 0
  ]);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-fuchsia-900 mb-6">Parent Dashboard</h1>
      <p className="text-slate-600 text-lg">Manage your dancers and register for lessons.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">My Dancers</h3>
          <p className="text-4xl font-black text-rose-500 mt-2">{myDancersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Assigned Lessons</h3>
          <p className="text-4xl font-black text-purple-600 mt-2">{assignedSlotsCount}</p>
        </div>
      </div>
    </div>
  );
}
