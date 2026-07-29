'use client';
import { useState } from 'react';
import InteractiveCalendar from '@/components/InteractiveCalendar';

export default function TeacherScheduleClient({ 
  rooms, 
  slots, 
  onAddSlot, 
  onDeleteSlot 
}: any) {
  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id || '');

  const filteredSlots = slots.filter((s: any) => s.roomId === activeRoomId);

  return (
    <div className="space-y-6">
      {/* Room Tabs */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Studio Room Tab</label>
        <div className="flex flex-wrap gap-2">
          {rooms.map((r: any) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRoomId(r.id)}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
                activeRoomId === r.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-md scale-[1.02]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📍 {r.name}
            </button>
          ))}
          {rooms.length === 0 && <span className="text-sm font-semibold text-amber-600">No rooms available. Contact Admin to add studio rooms first.</span>}
        </div>
      </div>

      {/* Calendar for Active Room */}
      <InteractiveCalendar 
        disabled={!activeRoomId}
        slots={filteredSlots.map((s: any) => ({
          id: s.id,
          start: new Date(s.startTime),
          end: new Date(s.endTime),
          title: s.room?.name || 'Room',
          color: '#4f46e5'
        }))}
        onAddSlot={async (start, end) => {
          if (activeRoomId) await onAddSlot(activeRoomId, start, end);
        }}
        onDeleteSlot={onDeleteSlot}
      />
    </div>
  );
}
