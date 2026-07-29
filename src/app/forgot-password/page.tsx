'use client';
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden py-12 px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="bg-zinc-900/90 border border-amber-500/30 p-8 md:p-10 rounded-3xl shadow-2xl shadow-amber-500/5 max-w-md w-full backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size={64} textTitle="Dance Portal" />
        </div>

        <h1 className="text-2xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-1">
          Reset Password
        </h1>
        
        {submitted ? (
          <div className="text-center mt-6">
            <p className="text-emerald-400 font-bold text-sm mb-6 bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl">
              If an account with that email exists, we've sent you a reset link.
            </p>
            <Link 
              href="/login" 
              className="inline-block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 text-center text-sm font-medium mb-8">
              Enter your email to receive a password reset link.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-zinc-950 text-zinc-100 font-medium placeholder-zinc-500 shadow-inner"
                  placeholder="you@example.com"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </form>
            <div className="mt-8 text-center text-xs font-medium text-zinc-400">
              Remembered your password? <Link href="/login" className="text-amber-400 font-bold hover:text-amber-300 underline transition-colors">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
