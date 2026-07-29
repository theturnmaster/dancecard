import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clearPeriodAssignmentsAction } from "@/actions/lottery";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClearAssignmentsButtonClient from "./ClearAssignmentsButtonClient";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrollmentPeriodAssignmentsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const { id } = await params;

  const period = await prisma.enrollmentPeriod.findUnique({
    where: { id }
  });

  if (!period) {
    notFound();
  }

  // Fetch all assignments that fall within this period's lesson date window
  const allAssignments = await prisma.assignment.findMany({
    include: {
      dancer: { include: { parent: true } },
      timeSlot: { include: { teacher: true, room: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const periodAssignments = allAssignments.filter(a => {
    const slotStart = new Date(a.timeSlot.startTime).getTime();
    const lessonStart = new Date(period.lessonStart).getTime();
    const lessonEnd = new Date(period.lessonEnd).getTime();
    return slotStart >= lessonStart && slotStart <= lessonEnd;
  });

  return (
    <div>
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link 
          href="/admin/lottery" 
          className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-400 hover:text-amber-300 bg-zinc-900 border border-amber-500/30 hover:border-amber-400 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          ← Back to Enrollment & Lottery
        </Link>

        {/* Clear Assignments Action with Confirmation Modal */}
        <ClearAssignmentsButtonClient 
          periodId={period.id}
          periodName={period.name}
          assignmentCount={periodAssignments.length}
          clearPeriodAssignmentsAction={clearPeriodAssignmentsAction}
        />
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
            {period.name}
          </h1>
          <p className="text-zinc-400 text-lg font-medium">
            Generated lottery lesson assignments for this enrollment period.
          </p>
        </div>

        <span className={`text-xs px-4 py-2 rounded-full font-black uppercase tracking-wider border shadow-md ${
          period.isOpen 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
            : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
        }`}>
          {period.isOpen ? 'ENROLLMENT OPEN' : 'ENROLLMENT CLOSED'}
        </span>
      </div>

      {/* Period Metadata Card */}
      <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl mb-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider block mb-1">Registration Window</span>
          <span className="text-base font-black text-zinc-100">
            {format(new Date(period.enrollmentStart), 'MMM d, yyyy')} - {format(new Date(period.enrollmentEnd), 'MMM d, yyyy')}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider block mb-1">Lessons Date Range</span>
          <span className="text-base font-black text-amber-300">
            {format(new Date(period.lessonStart), 'MMM d, yyyy')} - {format(new Date(period.lessonEnd), 'MMM d, yyyy')}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider block mb-1">Total Assignments Generated</span>
          <span className="text-2xl font-black text-emerald-400">
            {periodAssignments.length}
          </span>
        </div>
      </div>

      {/* Assignments Table */}
      <h3 className="text-2xl font-black text-zinc-100 mb-4">Lesson Assignments</h3>
      <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800">
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Dancer</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Parent</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-4 font-extrabold text-amber-400 text-xs uppercase tracking-wider">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {periodAssignments.map(a => (
                <tr key={a.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-100">{a.dancer.name}</td>
                  <td className="px-6 py-4 font-medium text-zinc-400">{a.dancer.parent.name} ({a.dancer.parent.email})</td>
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    {format(new Date(a.timeSlot.startTime), 'MMM d, yyyy | h:mm a')} - {format(new Date(a.timeSlot.endTime), 'h:mm a')}
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-400">{a.timeSlot.teacher.name}</td>
                  <td className="px-6 py-4 font-bold text-zinc-300">{a.timeSlot.room.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {periodAssignments.length === 0 && (
            <div className="p-8 text-center text-zinc-500 font-medium">
              No lottery assignments generated for "{period.name}" yet. Close enrollment and click "🎰 Run Lottery" on the lottery management page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
