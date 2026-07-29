import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRooms, createRoom, createTimeSlot, updateTimeSlot } from "@/actions/admin";
import { getAvailableSlots } from "@/actions/parent"; 
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import AdminScheduleClient from './AdminScheduleClient';

const prisma = new PrismaClient();

export default async function AdminSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const [rooms, allSlots, teachers] = await Promise.all([
    getRooms(),
    getAvailableSlots(),
    prisma.user.findMany({ where: { role: 'TEACHER' } })
  ]);

  async function handleCreateRoom(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    if (name) {
      await createRoom(name);
      revalidatePath('/admin/schedule');
    }
  }

  async function handleAddSlot(roomId: string, teacherId: string, start: Date, end: Date) {
    'use server';
    await createTimeSlot(roomId, teacherId, start, end);
  }

  async function handleUpdateSlot(slotId: string, start: Date, end: Date) {
    'use server';
    await updateTimeSlot(slotId, start, end);
  }

  async function handleDeleteSlot(slotId: string) {
    'use server';
    await prisma.timeSlot.delete({ where: { id: slotId }});
    revalidatePath('/admin/schedule');
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Manage Schedule</h1>
      <p className="text-slate-600 text-lg mb-8">Manage studio rooms and time blocks for all teachers interactively.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <AdminScheduleClient 
            rooms={rooms}
            teachers={teachers}
            slots={allSlots}
            onAddSlot={handleAddSlot}
            onUpdateSlot={handleUpdateSlot}
            onDeleteSlot={handleDeleteSlot}
          />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add a Room</h3>
            <form action={handleCreateRoom} className="flex flex-col gap-4">
              <div>
                <input type="text" name="name" placeholder="Room Name (e.g., Studio A)" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl shadow transition-all">
                Add Room
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Existing Rooms:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {rooms.map(r => <li key={r.id}>- {r.name}</li>)}
                {rooms.length === 0 && <li>None</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
