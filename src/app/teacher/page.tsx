export default function TeacherDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-6">Teacher Dashboard</h1>
      <p className="text-slate-600 text-lg">Manage your schedule and view dancer interest.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">My Slots This Week</h3>
          <p className="text-3xl font-black text-indigo-600 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">Total Interest Registered</h3>
          <p className="text-3xl font-black text-fuchsia-600 mt-2">--</p>
        </div>
      </div>
    </div>
  );
}
