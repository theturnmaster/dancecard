import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMyDancers, createDancer, deleteDancer } from "@/actions/parent";
import { revalidatePath } from "next/cache";

export default async function ManageDancersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'PARENT') {
    return <div>Unauthorized</div>;
  }

  const dancers = await getMyDancers(session.user.id);

  // Server actions for form
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
      <h1 className="text-4xl font-extrabold text-fuchsia-900 mb-6">My Dancers</h1>
      <p className="text-slate-600 text-lg mb-8">Add your dancers and specify the maximum number of private lessons they would like to receive during this period.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {dancers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-slate-500">You haven't added any dancers yet.</p>
            </div>
          ) : (
            dancers.map(dancer => (
              <div key={dancer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{dancer.name}</h3>
                  <p className="text-slate-500">Age: {dancer.age} | Max requested slots: <span className="font-semibold text-fuchsia-600">{dancer.maxSlotsRequested}</span></p>
                </div>
                <form action={removeDancer}>
                  <input type="hidden" name="dancerId" value={dancer.id} />
                  <button type="submit" className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                    Remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-fuchsia-100 sticky top-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add a Dancer</h3>
            <form action={addDancer} className="flex flex-col gap-4">
              <input type="hidden" name="parentId" value={session.user.id} />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                <input type="text" name="name" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                <input type="number" name="age" min="1" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Max Lessons Desired</label>
                <input type="number" name="maxSlots" min="1" defaultValue="1" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                <p className="text-xs text-slate-500 mt-1">The maximum number of timeslots they should be assigned.</p>
              </div>
              <button type="submit" className="mt-2 w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                Add Dancer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
