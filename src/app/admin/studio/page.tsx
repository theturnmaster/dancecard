import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRooms, createRoom, deleteRoom } from "@/actions/admin";
import { revalidatePath } from "next/cache";
import AddRoomFormClient from "./AddRoomFormClient";

export const dynamic = 'force-dynamic';

export default async function AdminStudioPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  const rooms = await getRooms();

  async function handleCreateRoom(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    if (name) {
      await createRoom(name);
      revalidatePath('/admin/studio');
    }
  }

  async function handleDeleteRoom(formData: FormData) {
    'use server';
    const roomId = formData.get('roomId') as string;
    if (roomId) {
      await deleteRoom(roomId);
      revalidatePath('/admin/studio');
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
        Manage Studio
      </h1>
      <p className="text-zinc-400 text-lg mb-8 font-medium">
        Manage studio rooms and studio configurations.
      </p>
      
      {/* Collapsible Add Room Form */}
      <AddRoomFormClient handleCreateRoom={handleCreateRoom} />

      {/* Existing Rooms List */}
      <h3 className="text-2xl font-black text-zinc-100 mb-4">Existing Studio Rooms</h3>
      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800 text-center text-zinc-400 font-medium">
            No studio rooms configured yet. Expand the form above to add your first studio room.
          </div>
        ) : (
          rooms.map(room => (
            <div 
              key={room.id} 
              className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 flex justify-between items-center hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
                  📍
                </span>
                <div>
                  <h4 className="text-xl font-bold text-zinc-100">{room.name}</h4>
                </div>
              </div>

              <form action={handleDeleteRoom}>
                <input type="hidden" name="roomId" value={room.id} />
                <button 
                  type="submit" 
                  className="text-rose-400 hover:text-rose-300 font-bold text-sm px-4 py-2 rounded-xl hover:bg-rose-950/60 transition-colors"
                >
                  Delete Room
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
