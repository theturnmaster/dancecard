import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
  getEnrollmentPeriods, 
  createEnrollmentPeriodAction, 
  toggleEnrollmentPeriodAction, 
  deleteEnrollmentPeriodAction,
  updateEnrollmentPeriodAction
} from "@/actions/admin";
import { runLottery } from "@/actions/lottery";
import { format } from "date-fns";
import Link from "next/link";
import AddEnrollmentPeriodFormClient from "./AddEnrollmentPeriodFormClient";
import EditEnrollmentPeriodModal from "./EditEnrollmentPeriodModal";

export const dynamic = 'force-dynamic';

export default async function AdminLotteryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const periods = await getEnrollmentPeriods();

  async function handleRunLottery(formData: FormData) {
    'use server';
    const periodId = formData.get('periodId') as string;
    if (periodId) {
      await runLottery(periodId);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        Lottery & Enrollment
      </h1>
      <p className="text-zinc-400 text-lg mb-8 font-medium">
        Manage enrollment periods, configure period schedules, and execute the lottery engine.
      </p>

      {/* Collapsible Form for Creating Enrollment Periods */}
      <AddEnrollmentPeriodFormClient createEnrollmentPeriodAction={createEnrollmentPeriodAction} />

      {/* Enrollment Periods Index Table */}
      <div className="mb-12">
        <h3 className="text-2xl font-black text-zinc-100 mb-4">Configured Enrollment Periods</h3>
        <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Period Name</th>
                  <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Registration Window</th>
                  <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Lessons Covered</th>
                  <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {periods.map(period => (
                  <tr key={period.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-100">{period.name}</td>
                    <td className="px-6 py-4 font-medium text-zinc-300 text-xs">
                      {format(new Date(period.enrollmentStart), 'MMM d, yyyy')} - {format(new Date(period.enrollmentEnd), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-300 text-xs">
                      {format(new Date(period.lessonStart), 'MMM d, yyyy')} - {format(new Date(period.lessonEnd), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                        period.isOpen 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        {period.isOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Manage Period Schedule */}
                        <Link
                          href={`/admin/schedule?periodId=${period.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 transition-all flex items-center gap-1.5"
                        >
                          🗓️ Schedule
                        </Link>

                        {/* View Period Assignments */}
                        <Link
                          href={`/admin/lottery/${period.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-all flex items-center gap-1.5"
                        >
                          📋 Assignments
                        </Link>

                        {/* Edit Enrollment Period Modal */}
                        <EditEnrollmentPeriodModal 
                          period={period} 
                          updateEnrollmentPeriodAction={updateEnrollmentPeriodAction} 
                        />

                        {/* Toggle Open/Close */}
                        <form action={toggleEnrollmentPeriodAction}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <input type="hidden" name="currentIsOpen" value={String(period.isOpen)} />
                          <button 
                            type="submit" 
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                              period.isOpen 
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-rose-300' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black'
                            }`}
                          >
                            {period.isOpen ? 'Close' : 'Open'}
                          </button>
                        </form>

                        {/* Scoped Run Lottery Action */}
                        <form action={handleRunLottery}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <button 
                            type="submit" 
                            disabled={period.isOpen}
                            title={period.isOpen ? "Close enrollment before running lottery" : "Run lottery for this period"}
                            className={`text-xs px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                              period.isOpen
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md'
                            }`}
                          >
                            🎰 Run Lottery
                          </button>
                        </form>

                        {/* Delete Action */}
                        <form action={deleteEnrollmentPeriodAction}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <button 
                            type="submit" 
                            className="text-rose-400 hover:text-rose-300 font-bold text-xs px-2 py-1 rounded hover:bg-rose-950/60 transition-colors"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {periods.length === 0 && (
              <div className="p-8 text-center text-zinc-500 font-medium">No enrollment periods configured yet. Expand the form above to create one.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
