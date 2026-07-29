'use client';
import { useState } from 'react';
import InteractiveCalendar from '@/components/InteractiveCalendar';

export default function AdminScheduleClient({ 
  rooms, 
  teachers,
  slots, 
  onAddSlot, 
  onDeleteSlot 
}: any) {
  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id || '');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');

  const filteredSlots = slots.filter((s: any) => s.roomId === activeRoomId);

  return (
    <div className="space-y-6">
      {/* Top Controls: Room Tabs + Teacher Dropdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Studio Room Tab</label>
          <div className="flex flex-wrap gap-2">
            {rooms.map((r: any) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRoomId(r.id)}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
                  activeRoomId === r.id
                    ? 'bg-blue-600 text-white shadow-blue-200 shadow-md scale-[1.02]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📍 {r.name}
              </button>
            ))}
            {rooms.length === 0 && <span className="text-sm font-semibold text-rose-600">No rooms available. Create a room on the right first!</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="font-bold text-slate-800 text-sm">Assigning Teacher:</label>
          <select 
            className="px-4 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={teacherId} 
            onChange={e => setTeacherId(e.target.value)}
          >
            {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Calendar for Active Room */}
      <InteractiveCalendar 
        disabled={!activeRoomId || !teacherId}
        slots={filteredSlots.map((s: any) => ({
          id: s.id,
          start: new Date(s.startTime),
          end: new Date(s.endTime),
          title: `${s.teacher?.name || 'Teacher'} (${s.room?.name || 'Room'})`,
          color: s.teacherId === teacherId ? '#2563eb' : '#64748b'
        }))}
        onAddSlot={async (start, end) => {
          if (activeRoomId && teacherId) await onAddSlot(activeRoomId, teacherId, start, end);
        }}
        onDeleteSlot={onDeleteSlot}
      />
    </div>
  );
}
