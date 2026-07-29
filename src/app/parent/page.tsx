import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ParentDashboard() {
  const session = await getServerSession(authOptions);
  const parentId = (session?.user as any)?.id;

  const [myDancersCount, assignedSlotsCount] = await Promise.all([
    parentId ? prisma.dancer.count({ where: { parentId } }) : 0,
    parentId ? prisma.assignment.count({ where: { dancer: { parentId } } }) : 0
  ]);

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        Parent Dashboard
      </h1>
      <p className="text-zinc-400 text-lg font-medium mb-8">Manage your dancers and register for private dance lessons.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">My Dancers</h3>
          <p className="text-4xl font-black text-amber-400 mt-2">{myDancersCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 hover:border-amber-500/40 transition-colors">
          <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Assigned Lessons</h3>
          <p className="text-4xl font-black text-yellow-300 mt-2">{assignedSlotsCount}</p>
        </div>
      </div>
    </div>
  );
}
