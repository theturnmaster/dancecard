import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEnrollmentStatus, toggleEnrollment } from "@/actions/admin";
import { runLottery } from "@/actions/lottery";
import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminLotteryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const enrollment = await getEnrollmentStatus();
  const isOpen = enrollment?.isOpen ?? false;

  // Stats for the lottery page
  const totalSlots = await prisma.timeSlot.count();
  const totalDancers = await prisma.dancer.count();
  const totalInterests = await prisma.interestRegistration.count();
  const totalAssigned = await prisma.assignment.count();

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
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Enrollment Period</h2>
          <div className={`text-xl font-black mb-6 ${isOpen ? 'text-emerald-500' : 'text-rose-500'}`}>
            CURRENTLY {isOpen ? 'OPEN' : 'CLOSED'}
          </div>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {isOpen 
              ? 'Parents can register interest for timeslots. You cannot run the lottery while enrollment is open.'
              : 'Parents can no longer modify their registrations. You may run the lottery algorithm.'}
          </p>
          <form action={handleToggleEnrollment}>
            <button type="submit" className={`px-8 py-3 rounded-full font-bold shadow-md transition-all ${isOpen ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
              {isOpen ? 'Close Enrollment' : 'Open Enrollment'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
             <div className="w-32 h-32 rounded-full border-[10px] border-white"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 z-10">Run Lottery Engine</h2>
          <p className="text-blue-200 text-sm mb-8 max-w-xs z-10">
            Executes the Peanut Butter Spread algorithm to fairly distribute lessons across all requested slots.
          </p>
          
          <form action={handleRunLottery}>
            <button 
              type="submit" 
              disabled={isOpen}
              className={`px-8 py-4 rounded-xl font-black shadow-lg transition-all z-10 relative ${
                isOpen 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white hover:scale-105 active:scale-95'
              }`}
            >
              EXECUTE LOTTERY
            </button>
          </form>
          {isOpen && <p className="text-xs text-rose-400 mt-4 z-10">You must close enrollment first.</p>}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-6">Current Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
          <div className="text-sm font-bold text-slate-500 uppercase">Available Slots</div>
          <div className="text-3xl font-black text-slate-800 mt-2">{totalSlots}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
          <div className="text-sm font-bold text-slate-500 uppercase">Total Dancers</div>
          <div className="text-3xl font-black text-slate-800 mt-2">{totalDancers}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
          <div className="text-sm font-bold text-slate-500 uppercase">Total Interests</div>
          <div className="text-3xl font-black text-fuchsia-600 mt-2">{totalInterests}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
          <div className="text-sm font-bold text-slate-500 uppercase">Slots Assigned</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{totalAssigned}</div>
        </div>
      </div>
    </div>
  );
}
