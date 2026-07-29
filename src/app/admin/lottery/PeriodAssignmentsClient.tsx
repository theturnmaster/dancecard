'use client';
import { useState } from 'react';
import { format } from 'date-fns';

interface PeriodAssignmentsClientProps {
  periods: any[];
  assignments: any[];
}

export default function PeriodAssignmentsClient({ periods, assignments }: PeriodAssignmentsClientProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(periods[0]?.id || '');

  const activePeriod = periods.find(p => p.id === selectedPeriodId) || periods[0];

  // Filter assignments matching activePeriod's lesson date window or fallback to all assignments if single period
  const periodAssignments = assignments.filter(a => {
    if (!activePeriod) return true;
    const slotStart = new Date(a.timeSlot.startTime).getTime();
    const lessonStart = new Date(activePeriod.lessonStart).getTime();
    const lessonEnd = new Date(activePeriod.lessonEnd).getTime();
    return (slotStart >= lessonStart && slotStart <= lessonEnd) || periods.length === 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-2xl font-black text-zinc-100">Lottery Assignments per Period</h3>
        
        {/* Period Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          {periods.map(period => (
            <button
              key={period.id}
              type="button"
              onClick={() => setSelectedPeriodId(period.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md ${
                (selectedPeriodId === period.id || (!selectedPeriodId && period.id === periods[0]?.id))
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20 scale-[1.02]'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              📅 {period.name}
            </button>
          ))}
        </div>
      </div>

      {activePeriod && (
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-wrap justify-between items-center text-xs text-zinc-300 gap-4">
          <div>
            <span className="font-bold text-amber-400">Viewing Assignments For:</span>{' '}
            <span className="font-black text-zinc-100">{activePeriod.name}</span>
          </div>
          <div>
            <span className="font-bold text-zinc-400">Lessons Date Range:</span>{' '}
            <span className="font-bold text-amber-300">
              {format(new Date(activePeriod.lessonStart), 'MMM d, yyyy')} - {format(new Date(activePeriod.lessonEnd), 'MMM d, yyyy')}
            </span>
          </div>
          <div>
            <span className="font-bold text-zinc-400">Total Assignments:</span>{' '}
            <span className="font-black text-emerald-400">{periodAssignments.length}</span>
          </div>
        </div>
      )}

      {/* Period Assignments Table */}
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
              No lottery assignments generated for {activePeriod?.name || 'this period'} yet. Close enrollment and click "🎰 Run Lottery" on the period row above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
