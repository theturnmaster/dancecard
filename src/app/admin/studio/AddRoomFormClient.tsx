'use client';
import { useState } from 'react';

interface AddRoomFormClientProps {
  handleCreateRoom: (formData: FormData) => Promise<void>;
}

export default function AddRoomFormClient({ handleCreateRoom }: AddRoomFormClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-amber-500/30 mb-10 overflow-hidden transition-all">
      {/* Clickable Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl leading-none">
            {isOpen ? '−' : '+'}
          </span>
          <h3 className="text-xl font-black text-amber-400">Add Studio Room</h3>
        </div>
        <span className="text-xs font-extrabold text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
          {isOpen ? 'Collapse Form' : 'Expand Form'}
        </span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6 md:px-8 md:pb-8 pt-2 border-t border-zinc-800/80">
          <form action={handleCreateRoom} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1.5">
                Room Name
              </label>
              <input 
                type="text" 
                name="name" 
                placeholder="e.g. Studio A, Rehearsal Hall" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400" 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto self-end bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              Add Studio Room
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
