'use client';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
  onUpdateSlot?: (id: string, start: Date, end: Date) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  disabled?: boolean;
}

export default function InteractiveCalendar({
  slots,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  disabled = false
}: InteractiveCalendarProps) {
  const handleSelect = async (selectInfo: any) => {
    if (disabled) {
      selectInfo.view.calendar.unselect();
      return;
    }
    await onAddSlot(selectInfo.start, selectInfo.end);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = async (clickInfo: any) => {
    if (disabled) return;
    if (confirm(`Are you sure you want to delete the slot "${clickInfo.event.title}"?`)) {
      await onDeleteSlot(clickInfo.event.id);
    }
  };

  const handleEventChange = async (changeInfo: any) => {
    if (disabled || !onUpdateSlot) {
      changeInfo.revert();
      return;
    }
    try {
      await onUpdateSlot(changeInfo.event.id, changeInfo.event.start, changeInfo.event.end);
    } catch (e) {
      changeInfo.revert();
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin] as any}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        events={slots}
        selectable={!disabled}
        selectMirror={true}
        editable={!disabled && !!onUpdateSlot}
        dayMaxEvents={true}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:15:00"
        height="800px"
        allDaySlot={false}
      />
    </div>
  );
}
