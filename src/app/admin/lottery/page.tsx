import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEnrollmentStatus, toggleEnrollment } from "@/actions/admin";
import { runLottery } from "@/actions/lottery";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

export default async function AdminLotteryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const enrollment = await getEnrollmentStatus();
  const isOpen = enrollment?.isOpen ?? false;

  // Stats for the lottery page
  const totalSlots = await prisma.timeSlot.count();
  const totalDancers = await prisma.dancer.count();
  const totalInterests = await prisma.interestRegistration.count();
  const totalAssigned = await prisma.assignment.count();

  const assignments = await prisma.assignment.findMany({
    include: {
      dancer: { include: { parent: true } },
      timeSlot: { include: { teacher: true, room: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  async function handleToggleEnrollment() {
    'use server';
    await toggleEnrollment(!isOpen);
  }

  async function handleRunLottery() {
    'use server';
    await runLottery();
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Lottery & Enrollment</h1>
      <p className="text-slate-600 text-lg mb-8">Manage the enrollment period and execute the algorithmic lottery.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-center items-center text-center h-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Enrollment Period</h2>
          <div className={`text-xl font-black mb-6 ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
            CURRENTLY {isOpen ? 'OPEN' : 'CLOSED'}
          </div>
          <p className="text-slate-600 text-sm font-medium mb-6 max-w-xs">
            {isOpen 
              ? 'Parents can register interest for timeslots. You cannot run the lottery while enrollment is open.'
              : 'Parents can no longer modify their registrations. You may run the lottery algorithm.'}
          </p>
          <form action={handleToggleEnrollment}>
            <button type="submit" className={`px-8 py-3 rounded-full font-bold shadow-md transition-all ${isOpen ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>
              {isOpen ? 'Close Enrollment' : 'Open Enrollment'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
             <div className="w-32 h-32 rounded-full border-[10px] border-white"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 z-10">Run Lottery Engine</h2>
          <p className="text-slate-300 text-sm font-medium mb-8 max-w-xs z-10">
            Executes the Peanut Butter Spread algorithm to fairly distribute lessons across all requested slots.
          </p>
          
          <form action={handleRunLottery}>
            <button 
              type="submit" 
              disabled={isOpen}
              className={`px-8 py-4 rounded-xl font-black shadow-lg transition-all z-10 relative ${
                isOpen 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white hover:scale-105 active:scale-95'
              }`}
            >
              EXECUTE LOTTERY
            </button>
          </form>
          {isOpen && <p className="text-xs font-bold text-rose-400 mt-4 z-10">You must close enrollment first.</p>}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-6">Current Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Available Slots</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalSlots}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Dancers</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalDancers}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Interests</div>
          <div className="text-3xl font-black text-fuchsia-700 mt-2">{totalInterests}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Slots Assigned</div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{totalAssigned}</div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-6">Lottery Assignments</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-900">Dancer</th>
                <th className="px-6 py-4 font-bold text-slate-900">Parent</th>
                <th className="px-6 py-4 font-bold text-slate-900">Date & Time</th>
                <th className="px-6 py-4 font-bold text-slate-900">Teacher</th>
                <th className="px-6 py-4 font-bold text-slate-900">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{a.dancer.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{a.dancer.parent.name} ({a.dancer.parent.email})</td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {format(new Date(a.timeSlot.startTime), 'MMM d, yyyy | h:mm a')} - {format(new Date(a.timeSlot.endTime), 'h:mm a')}
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-700">{a.timeSlot.teacher.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{a.timeSlot.room.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">No assignments have been generated yet. Close enrollment and execute the lottery above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
