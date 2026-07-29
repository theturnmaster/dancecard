'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClearAssignmentsButtonClientProps {
  periodId: string;
  periodName: string;
  assignmentCount: number;
  clearPeriodAssignmentsAction: (formData: FormData) => Promise<void>;
}

export default function ClearAssignmentsButtonClient({
  periodId,
  periodName,
  assignmentCount,
  clearPeriodAssignmentsAction
}: ClearAssignmentsButtonClientProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  const handleConfirmClear = async () => {
    setClearing(true);
    try {
      const formData = new FormData();
      formData.append('periodId', periodId);
      await clearPeriodAssignmentsAction(formData);
      router.refresh();
      setShowConfirmModal(false);
    } catch (err) {
      alert("Failed to clear assignments.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={assignmentCount === 0}
        onClick={() => setShowConfirmModal(true)}
        className="text-xs px-4 py-2 rounded-xl font-extrabold transition-all border shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/50"
      >
        <span>🗑️ Clear All Assignments</span>
      </button>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-rose-500/50 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in-95 duration-150 relative text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>

            <h3 className="text-2xl font-black text-rose-400 mb-2">Clear All Assignments?</h3>
            
            <p className="text-zinc-300 text-sm font-medium mb-6 leading-relaxed">
              Are you sure you want to clear all <strong className="text-amber-400">{assignmentCount}</strong> lottery assignments for <strong className="text-zinc-100">"{periodName}"</strong>?
              <br />
              <span className="text-rose-400 text-xs font-bold block mt-2">This action cannot be undone.</span>
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={clearing}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 border border-zinc-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={clearing}
                onClick={handleConfirmClear}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-950 transition-all disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
