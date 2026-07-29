import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRooms, createTimeSlot, updateTimeSlot, deleteTimeSlot, getTeachers, getEnrollmentPeriods } from "@/actions/admin";
import { getAvailableSlots } from "@/actions/parent"; 
import AdminScheduleClient from './AdminScheduleClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminSchedulePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ periodId?: string }> 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const { periodId } = await searchParams;

  const [rooms, allSlots, teachers, periods] = await Promise.all([
    getRooms(),
    getAvailableSlots(),
    getTeachers(),
    getEnrollmentPeriods()
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link 
            href="/admin/lottery" 
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 mb-2"
          >
            ← Back to Enrollment Periods
          </Link>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500">
            Manage Enrollment Schedule
          </h1>
        </div>
      </div>
      
      <AdminScheduleClient 
        periods={periods}
        initialPeriodId={periodId || ''}
        rooms={rooms}
        teachers={teachers}
        slots={allSlots}
        onAddSlot={createTimeSlot}
        onUpdateSlot={updateTimeSlot}
        onDeleteSlot={deleteTimeSlot}
      />
    </div>
  );
}
