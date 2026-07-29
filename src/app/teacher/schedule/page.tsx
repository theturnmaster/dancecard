import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherSlots, createTeacherSlot, deleteTeacherSlot, updateTeacherSlot } from "@/actions/teacher";
import { getRooms } from "@/actions/admin";
import TeacherScheduleClient from './TeacherScheduleClient';

export default async function TeacherSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== 'TEACHER' && (session.user as any).role !== 'ADMIN')) {
    return <div>Unauthorized</div>;
  }

  const teacherId = (session.user as any).id;

  const [slots, rooms] = await Promise.all([
    getTeacherSlots(teacherId),
    getRooms()
  ]);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-6">My Schedule</h1>
      <p className="text-slate-600 text-lg mb-8">Manage your availability and drag to create timeslots interactively.</p>
      
      <TeacherScheduleClient 
        rooms={rooms}
        slots={slots}
        onAddSlot={createTeacherSlot.bind(null, teacherId)}
        onUpdateSlot={updateTeacherSlot.bind(null, teacherId)}
        onDeleteSlot={deleteTeacherSlot.bind(null, teacherId)}
      />
    </div>
  );
}
