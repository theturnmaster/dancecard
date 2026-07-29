import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMyDancers, createDancer, deleteDancer } from "@/actions/parent";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ManageDancersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'PARENT') {
    return <div>Unauthorized</div>;
  }

  const dancers = await getMyDancers(session.user.id);

  async function addDancer(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const age = parseInt(formData.get('age') as string);
    const maxSlots = parseInt(formData.get('maxSlots') as string);
    const parentId = formData.get('parentId') as string;
    
    await createDancer(parentId, name, age, maxSlots);
    revalidatePath('/parent/dancers');
  }

  async function removeDancer(formData: FormData) {
    'use server';
    const dancerId = formData.get('dancerId') as string;
    await deleteDancer(dancerId);
    revalidatePath('/parent/dancers');
  }

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        My Dancers
      </h1>
      <p className="text-zinc-400 text-lg mb-8 font-medium">
        Manage your dancers, track their assigned private lessons, and set lesson limits.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {dancers.length === 0 ? (
            <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800 text-center">
              <p className="text-zinc-400 font-medium">You haven't added any dancers yet. Fill out the form to get started!</p>
            </div>
          ) : (
            dancers.map(dancer => (
              <div key={dancer.id} className="bg-zinc-900 p-6 md:p-7 rounded-2xl shadow-xl border border-zinc-800 flex flex-col gap-6 hover:border-amber-500/40 transition-colors">
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-100">{dancer.name}</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      Age: <span className="font-bold text-zinc-200">{dancer.age}</span> | Max desired lessons: <span className="font-extrabold text-amber-400">{dancer.maxSlotsRequested}</span>
                    </p>
                  </div>
                  <form action={removeDancer}>
                    <input type="hidden" name="dancerId" value={dancer.id} />
                    <button type="submit" className="text-rose-400 hover:text-rose-300 font-bold text-xs px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/80 transition-colors">
                      Remove Dancer
                    </button>
                  </form>
                </div>

                {/* Assigned Upcoming Registrations / Lessons */}
                <div>
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>✨ Assigned Lesson Registrations</span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full">
                      {dancer.assignments.length} Confirmed
                    </span>
                  </h4>

                  {dancer.assignments.length === 0 ? (
                    <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-medium">
                      No upcoming assigned lessons yet. Select preferred timeslots under <a href="/parent/register" className="text-amber-400 font-bold hover:underline">Register Interest</a>!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dancer.assignments.map(a => (
                        <div key={a.id} className="bg-zinc-950/80 border border-emerald-500/40 p-4 rounded-xl shadow-md space-y-1">
                          <div className="text-xs font-black text-emerald-400 flex items-center justify-between">
                            <span>📅 {format(new Date(a.timeSlot.startTime), 'MMM d, yyyy')}</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">Confirmed</span>
                          </div>
                          <div className="text-sm font-black text-zinc-100">
                            {format(new Date(a.timeSlot.startTime), 'h:mm a')} - {format(new Date(a.timeSlot.endTime), 'h:mm a')}
                          </div>
                          <div className="text-xs text-zinc-400 pt-1 border-t border-zinc-800/80 flex flex-wrap justify-between gap-1">
                            <span><strong className="text-amber-400">Teacher:</strong> {a.timeSlot.teacher.name}</span>
                            <span><strong className="text-zinc-300">Room:</strong> {a.timeSlot.room.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div>
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-amber-500/30 sticky top-6">
            <h3 className="text-lg font-black text-amber-400 mb-4">Add a Dancer</h3>
            <form action={addDancer} className="flex flex-col gap-4">
              <input type="hidden" name="parentId" value={session.user.id} />
              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">Name</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">Age</label>
                <input type="number" name="age" min="1" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">Max Lessons Desired</label>
                <input type="number" name="maxSlots" min="1" defaultValue="1" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">The maximum number of timeslots they should be assigned by the lottery.</p>
              </div>
              <button type="submit" className="mt-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all">
                Add Dancer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
