import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRooms, createRoom, createTimeSlot } from "@/actions/admin";
import { getAvailableSlots } from "@/actions/parent"; // Reusing to get all slots
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export default async function AdminSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
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

  async function handleCreateSlot(formData: FormData) {
    'use server';
    const teacherId = formData.get('teacherId') as string;
    const roomId = formData.get('roomId') as string;
    const dateStr = formData.get('date') as string;
    const startTimeStr = formData.get('startTime') as string;
    const endTimeStr = formData.get('endTime') as string;
    
    const start = new Date(`${dateStr}T${startTimeStr}`);
    const end = new Date(`${dateStr}T${endTimeStr}`);
    
    if (start < end) {
      await createTimeSlot(roomId, teacherId, start, end);
      revalidatePath('/admin/schedule');
    }
  }

  async function handleDeleteSlot(formData: FormData) {
    'use server';
    const slotId = formData.get('slotId') as string;
    await prisma.timeSlot.delete({ where: { id: slotId }});
    revalidatePath('/admin/schedule');
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Manage Schedule</h1>
      <p className="text-slate-600 text-lg mb-8">Manage studio rooms and time blocks for all teachers.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">All Active Timeslots</h3>
            <div className="space-y-4">
              {allSlots.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
                  No timeslots have been created yet.
                </div>
              ) : (
                allSlots.map(slot => (
                  <div key={slot.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">
                        {format(new Date(slot.startTime), 'MMM d, yyyy')} | {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        Teacher: <span className="font-semibold text-slate-700">{slot.teacher.name}</span> | 
                        Room: <span className="font-semibold text-slate-700">{slot.room.name}</span>
                      </div>
                    </div>
                    <form action={handleDeleteSlot}>
                      <input type="hidden" name="slotId" value={slot.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-semibold p-2">Delete</button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
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

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Timeslot (Admin Override)</h3>
            <form action={handleCreateSlot} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher</label>
                <select name="teacherId" required className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white">
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room</label>
                <select name="roomId" required className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white">
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                <input type="date" name="date" required className="w-full px-4 py-2 rounded-xl border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                  <input type="time" name="startTime" step="900" required className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                  <input type="time" name="endTime" step="900" required className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
              </div>
              <button type="submit" disabled={rooms.length === 0 || teachers.length === 0} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                Create Slot
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
