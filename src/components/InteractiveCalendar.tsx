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
const QUARTERS = [0, 15, 30, 45];

export default function InteractiveCalendar({
  slots,
  onAddSlot,
  onDeleteSlot,
  disabled = false
}: InteractiveCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selection, setSelection] = useState<{ day: Date; startMin: number; endMin: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slotId: string; slotTitle: string } | null>(null);

  const isDragging = useRef(false);
  const dragStartMin = useRef<number | null>(null);
  const dragDay = useRef<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Handle Drag Selection in 15-minute intervals
  const handleMouseDown = (day: Date, hour: number, quarterMin: number) => {
    if (disabled) return;
    setContextMenu(null);
    isDragging.current = true;
    const startMin = hour * 60 + quarterMin;
    dragStartMin.current = startMin;
    dragDay.current = day;
    setSelection({ day, startMin, endMin: startMin + 30 }); // Default 30 mins slot
  };

  const handleMouseEnter = (hour: number, quarterMin: number) => {
    if (!isDragging.current || dragStartMin.current === null || !dragDay.current) return;
    const currentMin = hour * 60 + quarterMin;
    const start = Math.min(dragStartMin.current, currentMin);
    const end = Math.max(dragStartMin.current, currentMin) + 15;
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

    if (differenceInMinutes(endDate, startDate) < 15) return;

    // Client-side overlap validation
    const hasOverlap = slots.some(slot => {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();
      return startDate.getTime() < slotEnd && endDate.getTime() > slotStart;
    });

    if (hasOverlap) {
      alert("Cannot create timeslot: This room already has a timeslot scheduled during that time block.");
      return;
    }

    try {
      await onAddSlot(startDate, endDate);
    } catch (err: any) {
      alert(err.message || "Failed to create timeslot.");
    }
  };

  const handleContextMenu = (e: React.MouseEvent, slot: CalendarSlot) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      slotId: slot.id,
      slotTitle: slot.title
    });
  };

  const handleConfirmDelete = async (slotId: string, slotTitle: string) => {
    if (disabled) return;
    setContextMenu(null);
    if (confirm(`Delete timeslot "${slotTitle}"?`)) {
      try {
        await onDeleteSlot(slotId);
      } catch (err: any) {
        alert("Failed to delete timeslot: " + (err.message || "Unknown error"));
      }
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden select-none relative">
      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div 
          className="fixed inset-0 z-50 bg-transparent"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
        >
          <div 
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-48 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 truncate">
              {contextMenu.slotTitle}
            </div>
            <button
              type="button"
              onClick={() => handleConfirmDelete(contextMenu.slotId, contextMenu.slotTitle)}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <span>🗑️ Delete Timeslot</span>
            </button>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-lg hidden sm:inline-block">
            Right-Click Slot to Delete
          </span>
          <div className="font-extrabold text-slate-900 text-base">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
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

          {/* Time Rows (Hourly containing 4 x 15min quarters) */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-200 min-h-[72px]">
                {/* Time Column */}
                <div className="p-2 text-xs font-bold text-slate-700 border-r border-slate-200 text-center bg-slate-50 flex items-center justify-center">
                  {format(setHours(new Date(), hour), 'h a')}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                  const daySlots = slots.filter(s => {
                    const slotStart = new Date(s.start);
                    return isSameDay(slotStart, day) && slotStart.getHours() === hour;
                  });

                  return (
                    <div key={day.toISOString()} className="border-r border-slate-200 last:border-r-0 relative flex flex-col h-full bg-white">
                      {/* 4 Quarter Cells (15 mins each) */}
                      {QUARTERS.map(qMin => {
                        const cellMin = hour * 60 + qMin;
                        const isSelected = selection && isSameDay(selection.day, day) && 
                          selection.startMin <= cellMin && selection.endMin > cellMin;

                        return (
                          <div
                            key={qMin}
                            onMouseDown={() => handleMouseDown(day, hour, qMin)}
                            onMouseEnter={() => handleMouseEnter(hour, qMin)}
                            className={`flex-1 border-b border-slate-100 last:border-b-0 cursor-crosshair transition-colors relative ${
                              isSelected ? 'bg-indigo-500/30 border-indigo-400' : 'hover:bg-indigo-50/50'
                            }`}
                          >
                            {isSelected && qMin === (selection.startMin % 60) && Math.floor(selection.startMin / 60) === hour && (
                              <div className="absolute inset-x-0 top-0 z-20 text-[9px] font-bold text-indigo-900 bg-white/95 border border-indigo-300 rounded px-1 text-center shadow-sm">
                                {differenceInMinutes(
                                  setMinutes(setHours(new Date(), Math.floor(selection.endMin / 60)), selection.endMin % 60),
                                  setMinutes(setHours(new Date(), Math.floor(selection.startMin / 60)), selection.startMin % 60)
                                )} mins
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Render Existing Slots */}
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          onContextMenu={(e) => handleContextMenu(e, slot)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmDelete(slot.id, slot.title);
                          }}
                          style={{
                            backgroundColor: slot.color || '#4f46e5',
                            top: `${(new Date(slot.start).getMinutes() / 60) * 100}%`,
                            height: `${Math.max(26, (differenceInMinutes(new Date(slot.end), new Date(slot.start)) / 60) * 72)}px`
                          }}
                          className="absolute inset-x-1 p-1.5 rounded-lg text-white shadow-md text-xs font-bold z-10 cursor-pointer hover:opacity-90 transition-all flex justify-between items-start overflow-hidden group"
                        >
                          <div className="truncate text-[11px] leading-tight pr-1">
                            <div>{slot.title}</div>
                            <div className="text-[9px] font-medium opacity-95">
                              {format(new Date(slot.start), 'h:mm a')} - {format(new Date(slot.end), 'h:mm a')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmDelete(slot.id, slot.title);
                            }}
                            className="opacity-60 group-hover:opacity-100 hover:bg-black/20 px-1 py-0.5 rounded text-[10px] leading-none transition-opacity font-bold"
                            title="Delete slot"
                          >
                            ✕
                          </button>
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
