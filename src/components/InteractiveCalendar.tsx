'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, differenceInMinutes, setHours, setMinutes } from 'date-fns';

export type CalendarSlot = {
  id: string;
  start: Date;
  end: Date;
  title: string;
  color?: string;
};

interface InteractiveCalendarProps {
  slots: CalendarSlot[];
  onAddSlot: (start: Date, end: Date) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function InteractiveCalendar({
  slots,
  onAddSlot,
  onDeleteSlot,
  disabled = false
}: InteractiveCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selection, setSelection] = useState<{ day: Date; startMin: number; endMin: number } | null>(null);
  const isDragging = useRef(false);
  const dragStartMin = useRef<number | null>(null);
  const dragDay = useRef<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Handle Drag Selection
  const handleMouseDown = (day: Date, hour: number) => {
    if (disabled) return;
    isDragging.current = true;
    const startMin = hour * 60;
    dragStartMin.current = startMin;
    dragDay.current = day;
    setSelection({ day, startMin, endMin: startMin + 60 });
  };

  const handleMouseEnter = (hour: number) => {
    if (!isDragging.current || dragStartMin.current === null || !dragDay.current) return;
    const currentMin = hour * 60;
    const start = Math.min(dragStartMin.current, currentMin);
    const end = Math.max(dragStartMin.current, currentMin) + 60;
    setSelection({ day: dragDay.current, startMin: start, endMin: end });
  };

  const handleMouseUp = async () => {
    if (!isDragging.current || !selection || !dragDay.current) return;
    isDragging.current = false;

    const startDate = setMinutes(setHours(new Date(selection.day), Math.floor(selection.startMin / 60)), selection.startMin % 60);
    const endDate = setMinutes(setHours(new Date(selection.day), Math.floor(selection.endMin / 60)), selection.endMin % 60);

    setSelection(null);
    dragStartMin.current = null;
    dragDay.current = null;

    if (differenceInMinutes(endDate, startDate) >= 15) {
      await onAddSlot(startDate, endDate);
    }
  };

  useEffect(() => {
    const onGlobalMouseUp = () => {
      if (isDragging.current) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => window.removeEventListener('mouseup', onGlobalMouseUp);
  }, [selection]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden select-none">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-200 bg-slate-50 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-sm"
          >
            ← Prev Week
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-sm"
          >
            Next Week →
          </button>
        </div>
        <div className="font-extrabold text-slate-900 text-base">
          {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
        </div>
      </div>

      {/* Grid View */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-100/90">
            <div className="p-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-center border-r border-slate-200">Time</div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                <div className="text-xs font-bold text-slate-600 uppercase">{format(day, 'EEE')}</div>
                <div className={`text-base font-black mt-0.5 ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-slate-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-100 min-h-[56px]">
                <div className="p-2 text-xs font-bold text-slate-600 border-r border-slate-200 text-center bg-slate-50/60 flex items-center justify-center">
                  {format(setHours(new Date(), hour), 'h a')}
                </div>
                {weekDays.map(day => {
                  const daySlots = slots.filter(s => {
                    const slotStart = new Date(s.start);
                    return isSameDay(slotStart, day) && slotStart.getHours() === hour;
                  });
                  
                  const isSelected = selection && isSameDay(selection.day, day) && 
                    Math.floor(selection.startMin / 60) <= hour && Math.floor(selection.endMin / 60) > hour;

                  return (
                    <div
                      key={day.toISOString()}
                      onMouseDown={() => handleMouseDown(day, hour)}
                      onMouseEnter={() => handleMouseEnter(hour)}
                      className={`border-r border-slate-100 last:border-r-0 relative cursor-crosshair transition-colors p-1 flex flex-col gap-1 ${
                        isSelected ? 'bg-indigo-100/80 border-indigo-400' : 'hover:bg-indigo-50/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="text-[10px] font-bold text-indigo-900 bg-white/90 px-1 py-0.5 rounded shadow text-center">
                          Selected Slot
                        </div>
                      )}

                      {/* Render Existing Slots */}
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete timeslot "${slot.title}"?`)) {
                              onDeleteSlot(slot.id);
                            }
                          }}
                          style={{ backgroundColor: slot.color || '#4f46e5' }}
                          className="p-2 rounded-lg text-white shadow-sm text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between"
                        >
                          <div className="truncate">{slot.title}</div>
                          <div className="text-[10px] opacity-90">
                            {format(new Date(slot.start), 'h:mm a')} - {format(new Date(slot.end), 'h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
