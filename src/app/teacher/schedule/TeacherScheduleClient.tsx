'use client';
import { useState } from 'react';
import InteractiveCalendar from '@/components/InteractiveCalendar';

export default function TeacherScheduleClient({ 
  rooms, 
  slots, 
  onAddSlot, 
  onUpdateSlot, 
  onDeleteSlot 
}: any) {
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="font-bold text-slate-700">Select Room to Schedule in:</label>
        <select 
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
          value={roomId} 
          onChange={e => setRoomId(e.target.value)}
        >
          {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {!roomId && <span className="text-red-500 text-sm">No rooms available. Contact Admin.</span>}
      </div>

      <InteractiveCalendar 
        disabled={!roomId}
        slots={slots.map((s: any) => ({
          id: s.id,
          start: new Date(s.startTime),
          end: new Date(s.endTime),
          title: s.room.name,
          color: s.roomId === roomId ? '#4f46e5' : '#94a3b8' // Highlight slots for selected room
        }))}
        onAddSlot={async (start, end) => {
          if (roomId) await onAddSlot(roomId, start, end);
        }}
        onUpdateSlot={async (id, start, end) => {
          await onUpdateSlot(id, start, end);
        }}
        onDeleteSlot={onDeleteSlot}
      />
    </div>
  );
}
