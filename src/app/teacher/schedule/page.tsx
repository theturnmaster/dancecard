import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherSlots, createTeacherSlot, deleteTeacherSlot } from "@/actions/teacher";
import { getRooms } from "@/actions/admin";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function TeacherSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return <div>Unauthorized</div>;
  }

  const [slots, rooms] = await Promise.all([
    getTeacherSlots(session.user.id),
    getRooms()
  ]);

  async function addSlot(formData: FormData) {
    'use server';
    const roomId = formData.get('roomId') as string;
    const dateStr = formData.get('date') as string;
    const startTimeStr = formData.get('startTime') as string;
    const endTimeStr = formData.get('endTime') as string;
    
    // Construct Date objects
    const start = new Date(`${dateStr}T${startTimeStr}`);
    const end = new Date(`${dateStr}T${endTimeStr}`);
    
    if (start < end) {
      await createTeacherSlot(session!.user.id, roomId, start, end);
      revalidatePath('/teacher/schedule');
    }
  }

  async function removeSlot(formData: FormData) {
    'use server';
    const slotId = formData.get('slotId') as string;
    await deleteTeacherSlot(slotId, session!.user.id);
    revalidatePath('/teacher/schedule');
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-6">My Schedule</h1>
      <p className="text-slate-600 text-lg mb-8">Manage your availability and view dancer interests.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {slots.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
              You haven't added any timeslots yet.
            </div>
          ) : (
            slots.map(slot => (
              <div key={slot.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500 flex flex-col md:flex-row justify-between">
                <div>
                  <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    {format(new Date(slot.startTime), 'MMM d, yyyy')}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Room: {slot.room.name}</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {slot.assignment ? (
                      <p className="text-sm font-bold text-emerald-600">Assigned: {slot.assignment.dancer.name}</p>
                    ) : (
                      <p className="text-sm font-semibold text-slate-600">
                        {slot.interestRegistrations.length} dancer(s) interested
                      </p>
                    )}
                    
                    {!slot.assignment && slot.interestRegistrations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {slot.interestRegistrations.map(ir => (
                          <span key={ir.id} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {ir.dancer.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-start">
                  <form action={removeSlot}>
                    <input type="hidden" name="slotId" value={slot.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                      Delete Slot
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 sticky top-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Timeslot</h3>
            {rooms.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">No rooms available. Ask an Admin to create a room first.</p>
            ) : (
              <form action={addSlot} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Room</label>
                  <select name="roomId" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input type="date" name="date" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                    <input type="time" name="startTime" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" step="900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                    <input type="time" name="endTime" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" step="900" />
                  </div>
                </div>
                <button type="submit" className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                  Create Slot
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
