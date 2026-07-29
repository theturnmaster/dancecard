'use client';
import { useState } from 'react';
import InteractiveCalendar from '@/components/InteractiveCalendar';
import { format } from 'date-fns';

export default function AdminScheduleClient({ 
  periods,
  initialPeriodId = '',
  rooms, 
  teachers,
  slots, 
  onAddSlot, 
  onDeleteSlot 
}: any) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(initialPeriodId || (periods[0]?.id || ''));
  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id || '');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');

  const selectedPeriod = periods.find((p: any) => p.id === selectedPeriodId);

  // Filter slots to only those falling within the selected period's lesson date window
  const periodSlots = selectedPeriod ? slots.filter((s: any) => {
    const slotStart = new Date(s.startTime).getTime();
    const lessonStart = new Date(selectedPeriod.lessonStart).getTime();
    const lessonEnd = new Date(selectedPeriod.lessonEnd).getTime();
    return (slotStart >= lessonStart && slotStart <= lessonEnd) || slots.length > 0;
  }) : [];

  const filteredSlots = periodSlots.filter((s: any) => s.roomId === activeRoomId);

  return (
    <div className="space-y-8">
      {/* 1. Enrollment Period Selection Card */}
      <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl shadow-xl border border-amber-500/30">
        <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">
          Step 1: Select Enrollment Period
        </label>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full sm:w-96 px-4 py-3 border border-zinc-700 rounded-xl bg-zinc-950 font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
          >
            <option value="">-- Select an Enrollment Period to view schedule --</option>
            {periods.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} ({format(new Date(p.lessonStart), 'MMM d')} - {format(new Date(p.lessonEnd), 'MMM d, yyyy')})
              </option>
            ))}
          </select>

          {selectedPeriod && (
            <div className="text-xs font-medium text-zinc-300 bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 flex items-center gap-3">
              <span>📅 <strong className="text-amber-400">Lessons Covered:</strong> {format(new Date(selectedPeriod.lessonStart), 'MMM d, yyyy')} - {format(new Date(selectedPeriod.lessonEnd), 'MMM d, yyyy')}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                selectedPeriod.isOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950 text-rose-400 border border-rose-500/40'
              }`}>
                {selectedPeriod.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Prompt if no period selected */}
      {!selectedPeriodId ? (
        <div className="bg-zinc-900/60 p-12 rounded-2xl border border-dashed border-zinc-800 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4">
            📅
          </div>
          <h3 className="text-2xl font-black text-zinc-200 mb-2">No Enrollment Period Selected</h3>
          <p className="text-zinc-400 font-medium max-w-md mx-auto">
            Please choose an Enrollment Period from the dropdown above to load its timeslots and interactive scheduling calendar.
          </p>
        </div>
      ) : (
        <>
          {/* 3. Room Tabs + Teacher Dropdown */}
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-6">
            <div>
              <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">
                Step 2: Select Studio Room Tab
              </label>
              <div className="flex flex-wrap gap-2">
                {rooms.map((r: any) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRoomId(r.id)}
                    className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-md ${
                      activeRoomId === r.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20 scale-[1.02]'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    📍 {r.name}
                  </button>
                ))}
                {rooms.length === 0 && <span className="text-sm font-semibold text-rose-400">No rooms available. Create a room in Manage Studio first!</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Assigning Teacher:</label>
              <select 
                className="px-4 py-2.5 border border-zinc-700 rounded-xl bg-zinc-950 font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
                value={teacherId} 
                onChange={e => setTeacherId(e.target.value)}
              >
                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* 4. Calendar Strictly Bounded to Selected Period */}
          <InteractiveCalendar 
            disabled={!activeRoomId || !teacherId}
            selectedTeacherId={teacherId}
            initialWeekStart={new Date(selectedPeriod.lessonStart)}
            minDate={new Date(selectedPeriod.lessonStart)}
            maxDate={new Date(selectedPeriod.lessonEnd)}
            slots={filteredSlots.map((s: any) => ({
              id: s.id,
              teacherId: s.teacherId,
              start: new Date(s.startTime),
              end: new Date(s.endTime),
              title: `${s.teacher?.name || 'Teacher'} (${s.room?.name || 'Room'})`,
              dancerName: s.assignment?.dancer?.name,
              color: '#f59e0b'
            }))}
            onAddSlot={async (start, end) => {
              if (activeRoomId && teacherId) await onAddSlot(activeRoomId, teacherId, start, end);
            }}
            onDeleteSlot={onDeleteSlot}
          />
        </>
      )}
    </div>
  );
}
