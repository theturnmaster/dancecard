'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, differenceInMinutes, setHours, setMinutes, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

export type CalendarSlot = {
  id: string;
  teacherId?: string;
  start: Date;
  end: Date;
  title: string;
  dancerName?: string;
  color?: string;
};

interface InteractiveCalendarProps {
  slots: CalendarSlot[];
  onAddSlot: (start: Date, end: Date) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  disabled?: boolean;
  selectedTeacherId?: string;
  initialWeekStart?: Date;
  minDate?: Date;
  maxDate?: Date;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM
const QUARTERS = [0, 15, 30, 45];

export default function InteractiveCalendar({
  slots,
  onAddSlot,
  onDeleteSlot,
  disabled = false,
  selectedTeacherId,
  initialWeekStart,
  minDate,
  maxDate
}: InteractiveCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(initialWeekStart || minDate || new Date(), { weekStartsOn: 1 })
  );
  const [selection, setSelection] = useState<{ day: Date; startMin: number; endMin: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slotId: string; slotTitle: string } | null>(null);

  useEffect(() => {
    if (initialWeekStart || minDate) {
      setCurrentWeekStart(startOfWeek(initialWeekStart || minDate || new Date(), { weekStartsOn: 1 }));
    }
  }, [initialWeekStart, minDate]);

  const isDragging = useRef(false);
  const dragStartMin = useRef<number | null>(null);
  const dragDay = useRef<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Determine if previous/next week navigation is allowed
  const canGoPrev = minDate ? !isBefore(currentWeekStart, startOfWeek(minDate, { weekStartsOn: 1 })) : true;
  const canGoNext = maxDate ? !isAfter(addDays(currentWeekStart, 7), startOfWeek(maxDate, { weekStartsOn: 1 })) : true;

  // Helper to check if a specific day is within [minDate, maxDate]
  const isDayOutOfRange = (day: Date) => {
    const dayStart = startOfDay(day);
    if (minDate && isBefore(dayStart, startOfDay(minDate))) return true;
    if (maxDate && isAfter(dayStart, endOfDay(maxDate))) return true;
    return false;
  };

  // Handle Drag Selection in 15-minute intervals
  const handleMouseDown = (day: Date, hour: number, quarterMin: number) => {
    if (disabled || isDayOutOfRange(day)) return;
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
    <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden select-none relative text-zinc-100">
      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div 
          className="fixed inset-0 z-50 bg-transparent"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
        >
          <div 
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed bg-zinc-900 border border-amber-500/40 rounded-xl shadow-2xl py-1.5 w-48 text-zinc-100 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider border-b border-zinc-800 truncate">
              {contextMenu.slotTitle}
            </div>
            <button
              type="button"
              onClick={() => handleConfirmDelete(contextMenu.slotId, contextMenu.slotTitle)}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/60 flex items-center gap-2 transition-colors"
            >
              <span>🗑️ Delete Timeslot</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/90 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => canGoPrev && setCurrentWeekStart(prev => addDays(prev, -7))}
            className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-colors shadow-sm ${
              canGoPrev
                ? 'bg-zinc-900 border-zinc-700 text-amber-400 hover:bg-zinc-800'
                : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            ← Prev Week
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekStart(startOfWeek(initialWeekStart || minDate || new Date(), { weekStartsOn: 1 }))}
            className="px-3.5 py-2 bg-amber-500 text-black border border-amber-400 rounded-xl text-xs font-extrabold hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10"
          >
            Period Start
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => canGoNext && setCurrentWeekStart(prev => addDays(prev, 7))}
            className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-colors shadow-sm ${
              canGoNext
                ? 'bg-zinc-900 border-zinc-700 text-amber-400 hover:bg-zinc-800'
                : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Next Week →
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-extrabold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-300 inline-block shadow-sm"></span>
              Selected Teacher
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 border border-slate-200 inline-block shadow-sm"></span>
              Other Teachers
            </span>
          </div>
          <div className="font-black text-amber-400 text-base border-l border-zinc-800 pl-4">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-zinc-800 bg-zinc-950">
            <div className="p-3 text-xs font-extrabold text-amber-400 uppercase tracking-wider text-center border-r border-zinc-800">Time</div>
            {weekDays.map(day => {
              const outOfRange = isDayOutOfRange(day);
              return (
                <div 
                  key={day.toISOString()} 
                  className={`p-3 text-center border-r border-zinc-800 last:border-r-0 ${
                    outOfRange ? 'bg-zinc-950/90 opacity-40' : ''
                  }`}
                >
                  <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">{format(day, 'MMM')}</div>
                  <div className="text-xs font-bold text-zinc-400 uppercase">{format(day, 'EEE')}</div>
                  <div className={`text-base font-black mt-0.5 ${isSameDay(day, new Date()) ? 'text-amber-400' : 'text-zinc-100'}`}>
                    {format(day, 'd')}
                  </div>
                  {outOfRange && <span className="text-[9px] font-extrabold text-rose-400 uppercase block">Out of Bounds</span>}
                </div>
              );
            })}
          </div>

          {/* Time Rows */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-zinc-800/60 min-h-[72px]">
                {/* Time Column */}
                <div className="p-2 text-xs font-bold text-amber-400 border-r border-zinc-800 text-center bg-zinc-950/60 flex items-center justify-center">
                  {format(setHours(new Date(), hour), 'h a')}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                  const outOfRange = isDayOutOfRange(day);
                  const daySlots = slots.filter(s => {
                    const slotStart = new Date(s.start);
                    return isSameDay(slotStart, day) && slotStart.getHours() === hour;
                  });

                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`border-r border-zinc-800/60 last:border-r-0 relative flex flex-col h-full ${
                        outOfRange ? 'bg-zinc-950/80 cursor-not-allowed' : 'bg-zinc-900/50'
                      }`}
                    >
                      {/* 4 Quarter Cells */}
                      {QUARTERS.map(qMin => {
                        const cellMin = hour * 60 + qMin;
                        const isSelected = selection && isSameDay(selection.day, day) && 
                          selection.startMin <= cellMin && selection.endMin > cellMin;

                        return (
                          <div
                            key={qMin}
                            onMouseDown={() => !outOfRange && handleMouseDown(day, hour, qMin)}
                            onMouseEnter={() => !outOfRange && handleMouseEnter(hour, qMin)}
                            className={`flex-1 border-b border-zinc-800/30 last:border-b-0 transition-colors relative ${
                              outOfRange 
                                ? 'cursor-not-allowed' 
                                : isSelected 
                                  ? 'bg-amber-500/30 border-amber-400 cursor-crosshair' 
                                  : 'hover:bg-zinc-800/50 cursor-crosshair'
                            }`}
                          >
                            {isSelected && qMin === (selection.startMin % 60) && Math.floor(selection.startMin / 60) === hour && (
                              <div className="absolute inset-x-0 top-0 z-20 text-[9px] font-extrabold text-black bg-amber-400 border border-amber-300 rounded px-1 text-center shadow-md">
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
                      {daySlots.map(slot => {
                        const isSelectedTeacher = selectedTeacherId ? slot.teacherId === selectedTeacherId : true;

                        return (
                          <div
                            key={slot.id}
                            onContextMenu={(e) => handleContextMenu(e, slot)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmDelete(slot.id, slot.title);
                            }}
                            style={{
                              top: `${(new Date(slot.start).getMinutes() / 60) * 100}%`,
                              height: `${Math.max(28, (differenceInMinutes(new Date(slot.end), new Date(slot.start)) / 60) * 72)}px`
                            }}
                            className={`absolute inset-x-1 p-1.5 rounded-lg text-xs font-black z-10 cursor-pointer hover:brightness-110 transition-all flex justify-between items-start overflow-hidden group border ${
                              isSelectedTeacher
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-300/60 shadow-lg shadow-amber-500/20'
                                : 'bg-gradient-to-r from-slate-300 via-zinc-300 to-slate-400 text-zinc-950 border-slate-200/60 shadow-md opacity-90'
                            }`}
                          >
                            <div className="truncate text-[11px] leading-tight pr-1">
                              <div>{slot.title}</div>
                              {slot.dancerName && (
                                <div className="text-[10px] font-black text-emerald-950 bg-emerald-400/90 rounded px-1 py-0.5 my-0.5 truncate border border-emerald-300/50 shadow-sm">
                                  💃 {slot.dancerName}
                                </div>
                              )}
                              <div className="text-[9px] font-bold opacity-90">
                                {format(new Date(slot.start), 'h:mm a')} - {format(new Date(slot.end), 'h:mm a')}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmDelete(slot.id, slot.title);
                              }}
                              className="opacity-70 group-hover:opacity-100 hover:bg-black/20 px-1 py-0.5 rounded text-[10px] leading-none transition-opacity font-extrabold"
                              title="Delete slot"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
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
