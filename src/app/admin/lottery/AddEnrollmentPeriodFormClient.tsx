'use client';
import { useState } from 'react';

interface AddEnrollmentPeriodFormClientProps {
  createEnrollmentPeriodAction: (formData: FormData) => Promise<void>;
}

export default function AddEnrollmentPeriodFormClient({ createEnrollmentPeriodAction }: AddEnrollmentPeriodFormClientProps) {
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
          <h3 className="text-xl font-black text-amber-400">Create Enrollment Period</h3>
        </div>
        <span className="text-xs font-extrabold text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
          {isOpen ? 'Collapse Form' : 'Expand Form'}
        </span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6 md:px-8 md:pb-8 pt-2 border-t border-zinc-800/80">
          <form action={createEnrollmentPeriodAction} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1.5">
                Period Name
              </label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="e.g. Fall 2026 Private Lessons"
                className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Registration Window */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Registration Window (Parent Sign-up)
                </h4>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Enrollment Start Date</label>
                  <input 
                    type="date" 
                    name="enrollmentStart" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Enrollment End Date</label>
                  <input 
                    type="date" 
                    name="enrollmentEnd" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" 
                  />
                </div>
              </div>

              {/* Column 2: Lesson Date Range Covered */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Lesson Dates Covered
                </h4>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Lesson Start Date</label>
                  <input 
                    type="date" 
                    name="lessonStart" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Lesson End Date</label>
                  <input 
                    type="date" 
                    name="lessonEnd" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select 
                name="isOpen" 
                defaultValue="false"
                className="w-full md:w-64 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="false">Closed (Default)</option>
                <option value="true">Open Immediately</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full sm:w-auto self-end bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              Create Enrollment Period
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
