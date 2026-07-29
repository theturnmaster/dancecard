import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAvailableSlots, getMyDancers, registerInterest, removeInterest } from "@/actions/parent";
import { getEnrollmentStatus } from "@/actions/admin";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function RegisterInterestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'PARENT') {
    return <div>Unauthorized</div>;
  }

  const [slots, dancers, enrollment] = await Promise.all([
    getAvailableSlots(),
    getMyDancers(session.user.id),
    getEnrollmentStatus()
  ]);

  const isEnrollmentOpen = enrollment?.isOpen ?? false;

  async function handleRegister(formData: FormData) {
    'use server';
    const dancerId = formData.get('dancerId') as string;
    const timeSlotId = formData.get('timeSlotId') as string;
    await registerInterest(dancerId, timeSlotId);
    revalidatePath('/parent/register');
  }

  async function handleRemoveInterest(formData: FormData) {
    'use server';
    const dancerId = formData.get('dancerId') as string;
    const timeSlotId = formData.get('timeSlotId') as string;
    await removeInterest(dancerId, timeSlotId);
    revalidatePath('/parent/register');
  }

  // Check if a dancer is interested in a slot
  const isInterested = (dancerId: string, timeSlotId: string) => {
    const dancer = dancers.find(d => d.id === dancerId);
    return dancer?.interestRegistrations.some(ir => ir.timeSlotId === timeSlotId) ?? false;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-fuchsia-900 mb-2">Register Interest</h1>
          <p className="text-slate-600 text-lg">Select the times you are available for private lessons.</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm ${isEnrollmentOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          Enrollment is {isEnrollmentOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>

      {!isEnrollmentOpen && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8">
          The enrollment period is currently closed. You cannot modify your registrations at this time.
        </div>
      )}
      
      {dancers.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500 mb-4">You need to add a dancer before you can register for timeslots.</p>
          <a href="/parent/dancers" className="text-fuchsia-600 font-bold hover:underline">Go to My Dancers</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map(slot => (
            <div key={slot.id} className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-fuchsia-500 flex flex-col h-full">
              <div className="flex-grow">
                <div className="text-sm font-bold text-fuchsia-600 uppercase tracking-wider mb-1">
                  {format(new Date(slot.startTime), 'MMM d, yyyy')}
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                </h3>
                <div className="mt-4 text-sm text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  <p><span className="font-semibold text-slate-800">Teacher:</span> {slot.teacher.name}</p>
                  <p><span className="font-semibold text-slate-800">Room:</span> {slot.room.name}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-700 mb-3">Register for:</p>
                <div className="space-y-2">
                  {dancers.map(dancer => {
                    const interested = isInterested(dancer.id, slot.id);
                    return (
                      <div key={dancer.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dancer.name}</span>
                        {isEnrollmentOpen ? (
                          <form action={interested ? handleRemoveInterest : handleRegister}>
                            <input type="hidden" name="dancerId" value={dancer.id} />
                            <input type="hidden" name="timeSlotId" value={slot.id} />
                            <button 
                              type="submit" 
                              className={`text-xs px-3 py-1.5 rounded-md font-bold transition-colors ${
                                interested 
                                  ? 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {interested ? 'Interested' : 'Select'}
                            </button>
                          </form>
                        ) : (
                          <span className={`text-xs px-3 py-1 rounded-md font-bold ${
                            interested ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {interested ? 'Registered' : 'Not Selected'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {slots.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
              No timeslots are currently available. Check back later!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
