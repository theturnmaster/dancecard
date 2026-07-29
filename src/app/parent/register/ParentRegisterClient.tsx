'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, setHours, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

interface ParentRegisterClientProps {
  periods: any[];
  slots: any[];
  dancers: any[];
  registerInterestAction: (dancerId: string, timeSlotId: string) => Promise<any>;
  removeInterestAction: (dancerId: string, timeSlotId: string) => Promise<any>;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function ParentRegisterClient({
  periods,
  slots,
  dancers,
  registerInterestAction,
  removeInterestAction
}: ParentRegisterClientProps) {
  // Teacher Filter State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Extract unique teachers from timeslots
  const teachersMap = new Map<string, string>();
  slots.forEach(s => {
    if (s.teacher?.id && s.teacher?.name) {
      teachersMap.set(s.teacher.id, s.teacher.name);
    }
  });
  const teachersList = Array.from(teachersMap.entries()).map(([id, name]) => ({ id, name }));

  // Collapsible state for each enrollment period (active open period expanded by default)
  const [collapsedPeriods, setCollapsedPeriods] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    periods.forEach(p => {
      initialState[p.id] = !p.isOpen; // collapsed if NOT open
    });
    return initialState;
  });

  const activePeriod = periods.find(p => p.isOpen) || periods[0];
  const isEnrollmentOpen = activePeriod?.isOpen ?? false;

  const minDate = activePeriod ? new Date(activePeriod.lessonStart) : undefined;
  const maxDate = activePeriod ? new Date(activePeriod.lessonEnd) : undefined;

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(minDate || new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    if (minDate) {
      setCurrentWeekStart(startOfWeek(minDate, { weekStartsOn: 1 }));
    }
  }, [activePeriod?.id]);

  const togglePeriodCollapse = (periodId: string) => {
    setCollapsedPeriods(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Determine if previous/next week navigation is allowed
  const canGoPrev = minDate ? !isBefore(currentWeekStart, startOfWeek(minDate, { weekStartsOn: 1 })) : true;
  const canGoNext = maxDate ? !isAfter(addDays(currentWeekStart, 7), startOfWeek(maxDate, { weekStartsOn: 1 })) : true;

  const isDayOutOfRange = (day: Date) => {
    const dayStart = startOfDay(day);
    if (minDate && isBefore(dayStart, startOfDay(minDate))) return true;
    if (maxDate && isAfter(dayStart, endOfDay(maxDate))) return true;
    return false;
  };

  const isInterested = (dancerId: string, timeSlotId: string) => {
    const dancer = dancers.find(d => d.id === dancerId);
    return dancer?.interestRegistrations?.some((ir: any) => ir.timeSlotId === timeSlotId) ?? false;
  };

  const handleToggleInterest = async (dancerId: string, timeSlotId: string) => {
    if (!isEnrollmentOpen) return;
    const currentlyInterested = isInterested(dancerId, timeSlotId);
    if (currentlyInterested) {
      await removeInterestAction(dancerId, timeSlotId);
    } else {
      await registerInterestAction(dancerId, timeSlotId);
    }
  };

  // Filter slots to current active period's date range
  const periodSlots = activePeriod ? slots.filter(s => {
    const slotStart = new Date(s.startTime).getTime();
    const lStart = new Date(activePeriod.lessonStart).getTime();
    const lEnd = new Date(activePeriod.lessonEnd).getTime();
    return (slotStart >= lStart && slotStart <= lEnd) || slots.length > 0;
  }) : slots;

  // Filter slots by selected teacher if filtered
  const filteredSlots = selectedTeacherId 
    ? periodSlots.filter(s => s.teacherId === selectedTeacherId)
    : periodSlots;

  return (
    <div className="space-y-8">
      {/* 1. All Enrollment Periods (Collapsible Cards) */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-zinc-100 mb-2">Enrollment Periods</h3>
        {periods.map(period => {
          const isCollapsed = collapsedPeriods[period.id] ?? !period.isOpen;
          return (
            <div 
              key={period.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                period.isOpen 
                  ? 'bg-zinc-900 border-amber-500/50 shadow-xl shadow-amber-500/5' 
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              {/* Header / Click to Collapse */}
              <button
                type="button"
                onClick={() => togglePeriodCollapse(period.id)}
                className="w-full p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-lg leading-none">
                    {isCollapsed ? '+' : '−'}
                  </span>
                  <div>
                    <h4 className="text-xl font-black text-zinc-100 flex items-center gap-3">
                      {period.name}
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                        period.isOpen 
                          ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-rose-950/90 text-rose-400 border border-rose-500/40'
                      }`}>
                        {period.isOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="text-zinc-400">
                    <strong className="text-zinc-200">Registration:</strong>{' '}
                    <span className="text-amber-300 font-bold">
                      {format(new Date(period.enrollmentStart), 'MMM d, yyyy')} - {format(new Date(period.enrollmentEnd), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="text-zinc-400 border-l border-zinc-800 pl-4 hidden sm:block">
                    <strong className="text-zinc-200">Lessons:</strong>{' '}
                    <span className="text-emerald-300 font-bold">
                      {format(new Date(period.lessonStart), 'MMM d, yyyy')} - {format(new Date(period.lessonEnd), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400/90 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                    {isCollapsed ? 'Expand Details' : 'Collapse'}
                  </span>
                </div>
              </button>

              {/* Detailed Breakdown when Expanded */}
              {!isCollapsed && (
                <div className="px-6 pb-6 pt-2 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                      Parent Registration Window
                    </span>
                    <p className="text-sm font-bold text-zinc-200">
                      {format(new Date(period.enrollmentStart), 'MMMM d, yyyy')} to {format(new Date(period.enrollmentEnd), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {period.isOpen 
                        ? 'Parents can register interest for timeslots during this window.' 
                        : 'Registration for this period is closed.'}
                    </p>
                  </div>

                  <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
                      Private Lessons Covered
                    </span>
                    <p className="text-sm font-bold text-zinc-200">
                      {format(new Date(period.lessonStart), 'MMMM d, yyyy')} to {format(new Date(period.lessonEnd), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Date range of private lessons included in this lottery distribution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {periods.length === 0 && (
          <div className="bg-amber-950/40 border border-amber-500/40 text-amber-300 p-4 rounded-xl text-sm font-medium">
            No enrollment periods have been configured yet.
          </div>
        )}
      </div>

      {/* 2. Interactive Weekly Calendar View for Registering Interest */}
      {dancers.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800 text-center">
          <p className="text-zinc-400 mb-4 font-medium">You need to add a dancer before you can register for timeslots.</p>
          <a href="/parent/dancers" className="text-amber-400 font-extrabold hover:underline">Go to My Dancers</a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-zinc-100">Weekly Schedule & Interest Selector</h3>
              <p className="text-zinc-400 text-sm font-medium">
                {isEnrollmentOpen 
                  ? 'Click a dancer button on any slot to register or unregister interest instantly.' 
                  : 'Enrollment is currently closed. View your registered interests below.'}
              </p>
            </div>

            {/* Controls: Teacher Filter + Week Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Teacher Filter Dropdown */}
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-xl shadow-sm">
                <label className="text-xs font-bold text-amber-400 whitespace-nowrap">Filter Teacher:</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">All Teachers ({teachersList.length})</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Week Navigation Controls */}
              <div className="flex items-center gap-2">
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
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => minDate && setCurrentWeekStart(startOfWeek(minDate, { weekStartsOn: 1 }))}
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
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Weekly Grid Component */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden select-none text-zinc-100">
            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
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
                        {outOfRange && <span className="text-[9px] font-extrabold text-rose-400 uppercase block">Out of Range</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Time Rows */}
                <div className="relative">
                  {HOURS.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b border-zinc-800/60 min-h-[96px]">
                      {/* Time Column */}
                      <div className="p-2 text-xs font-bold text-amber-400 border-r border-zinc-800 text-center bg-zinc-950/60 flex items-center justify-center">
                        {format(setHours(new Date(), hour), 'h a')}
                      </div>

                      {/* Day Columns */}
                      {weekDays.map(day => {
                        const outOfRange = isDayOutOfRange(day);
                        const daySlots = filteredSlots.filter(s => {
                          const slotStart = new Date(s.startTime);
                          return isSameDay(slotStart, day) && slotStart.getHours() === hour;
                        });

                        return (
                          <div 
                            key={day.toISOString()} 
                            className={`border-r border-zinc-800/60 last:border-r-0 relative p-1.5 flex flex-col gap-1.5 ${
                              outOfRange ? 'bg-zinc-950/80' : 'bg-zinc-900/40 hover:bg-zinc-800/20'
                            }`}
                          >
                            {daySlots.map(slot => (
                              <div
                                key={slot.id}
                                className="bg-zinc-950/90 border border-amber-500/40 p-2 rounded-xl shadow-lg flex flex-col justify-between h-full hover:border-amber-400 transition-colors"
                              >
                                <div>
                                  <div className="text-[11px] font-black text-amber-300 truncate">
                                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                                  </div>
                                  <div className="text-[10px] font-medium text-zinc-400 truncate">
                                    {slot.teacher?.name} • <span className="text-zinc-300">{slot.room?.name}</span>
                                  </div>
                                </div>

                                {/* Dancer Interest Toggle Pills */}
                                <div className="mt-2 pt-1.5 border-t border-zinc-800 flex flex-wrap gap-1">
                                  {dancers.map(dancer => {
                                    const interested = isInterested(dancer.id, slot.id);
                                    return (
                                      <button
                                        key={dancer.id}
                                        type="button"
                                        disabled={!isEnrollmentOpen}
                                        onClick={() => handleToggleInterest(dancer.id, slot.id)}
                                        title={isEnrollmentOpen ? `Click to ${interested ? 'remove' : 'add'} interest for ${dancer.name}` : 'Enrollment closed'}
                                        className={`text-[10px] px-2 py-1 rounded-lg font-black transition-all shadow-sm flex items-center gap-1 ${
                                          interested
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20 scale-[1.02]'
                                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-amber-300'
                                        } ${!isEnrollmentOpen ? 'cursor-not-allowed opacity-75' : ''}`}
                                      >
                                        <span>{interested ? '✓' : '+'}</span>
                                        <span>{dancer.name}</span>
                                      </button>
                                    );
                                  })}
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
        </div>
      )}
    </div>
  );
}
