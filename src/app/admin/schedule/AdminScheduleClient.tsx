'use client';
import { useState } from 'react';
import InteractiveCalendar from '@/components/InteractiveCalendar';

export default function AdminScheduleClient({ 
  rooms, 
  teachers,
  slots, 
  onAddSlot, 
  onUpdateSlot, 
  onDeleteSlot 
}: any) {
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <label className="font-bold text-slate-700">Scheduling Room:</label>
          <select 
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
          >
            {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="font-bold text-slate-700">For Teacher:</label>
          <select 
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
            value={teacherId} 
            onChange={e => setTeacherId(e.target.value)}
          >
            {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <InteractiveCalendar 
        disabled={!roomId || !teacherId}
        slots={slots.map((s: any) => ({
          id: s.id,
          start: new Date(s.startTime),
          end: new Date(s.endTime),
          title: `${s.teacher?.name || 'Teacher'} (${s.room?.name || 'Room'})`,
          color: s.teacherId === teacherId ? '#2563eb' : '#94a3b8'
        }))}
        onAddSlot={async (start, end) => {
          if (roomId && teacherId) await onAddSlot(roomId, teacherId, start, end);
        }}
        onDeleteSlot={onDeleteSlot}
      />
    </div>
  );
}
