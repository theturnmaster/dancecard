'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface EditEnrollmentPeriodModalProps {
  period: {
    id: string;
    name: string;
    enrollmentStart: Date | string;
    enrollmentEnd: Date | string;
    lessonStart: Date | string;
    lessonEnd: Date | string;
  };
  updateEnrollmentPeriodAction: (formData: FormData) => Promise<void>;
}

export default function EditEnrollmentPeriodModal({ period, updateEnrollmentPeriodAction }: EditEnrollmentPeriodModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Format dates for <input type="date" value="YYYY-MM-DD" />
  const formatDateInput = (d: Date | string) => {
    try {
      return format(new Date(d), 'yyyy-MM-dd');
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-all flex items-center gap-1"
      >
        ✏️ Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              disabled={saving}
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 font-extrabold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-amber-400 mb-2">Edit Enrollment Period</h3>
            <p className="text-xs text-zinc-400 font-medium mb-6">Tweak the registration window and lesson coverage dates for "{period.name}".</p>

            <form action={async (formData) => {
              setSaving(true);
              try {
                await updateEnrollmentPeriodAction(formData);
                router.refresh();
                setIsOpen(false);
              } catch (e) {
                alert("Failed to update enrollment period.");
              } finally {
                setSaving(false);
              }
            }} className="space-y-6">
              <input type="hidden" name="periodId" value={period.id} />

              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1.5">
                  Period Name
                </label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  defaultValue={period.name}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Registration Window */}
                <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Registration Window
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Enrollment Start Date</label>
                    <input 
                      type="date" 
                      name="enrollmentStart" 
                      required 
                      defaultValue={formatDateInput(period.enrollmentStart)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Enrollment End Date</label>
                    <input 
                      type="date" 
                      name="enrollmentEnd" 
                      required 
                      defaultValue={formatDateInput(period.enrollmentEnd)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    />
                  </div>
                </div>

                {/* Column 2: Lesson Date Range Covered */}
                <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Lesson Dates Covered
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Lesson Start Date</label>
                    <input 
                      type="date" 
                      name="lessonStart" 
                      required 
                      defaultValue={formatDateInput(period.lessonStart)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Lesson End Date</label>
                    <input 
                      type="date" 
                      name="lessonEnd" 
                      required 
                      defaultValue={formatDateInput(period.lessonEnd)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 font-medium text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
