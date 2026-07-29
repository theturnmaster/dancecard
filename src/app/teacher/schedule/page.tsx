import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherSlots, createTeacherSlot, deleteTeacherSlot, updateTeacherSlot } from "@/actions/teacher";
import { getRooms, getEnrollmentPeriods } from "@/actions/admin";
import TeacherScheduleClient from './TeacherScheduleClient';

export const dynamic = 'force-dynamic';

export default async function TeacherSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== 'TEACHER' && (session.user as any).role !== 'ADMIN')) {
    return <div>Unauthorized</div>;
  }

  const teacherId = (session.user as any).id;

  const [slots, rooms, periods] = await Promise.all([
    getTeacherSlots(teacherId),
    getRooms(),
    getEnrollmentPeriods()
  ]);

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        My Schedule
      </h1>
      <p className="text-zinc-400 text-lg mb-8 font-medium">Select an enrollment period to view and manage your availability schedule.</p>
      
      <TeacherScheduleClient 
        periods={periods}
        rooms={rooms}
        slots={slots}
        onAddSlot={createTeacherSlot.bind(null, teacherId)}
        onUpdateSlot={updateTeacherSlot.bind(null, teacherId)}
        onDeleteSlot={deleteTeacherSlot.bind(null, teacherId)}
      />
    </div>
  );
}
