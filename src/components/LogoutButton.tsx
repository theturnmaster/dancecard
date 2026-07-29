'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut({ redirect: false, callbackUrl: '/login' });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <button 
      type="button"
      disabled={loggingOut}
      onClick={handleLogout}
      className="flex items-center justify-center gap-2 p-3.5 w-full bg-zinc-900/90 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 text-amber-400 hover:text-black border border-amber-500/30 hover:border-amber-400 rounded-xl transition-all font-black text-sm shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <span>{loggingOut ? "Logging Out..." : "Log Out"}</span>
    </button>
  );
}
