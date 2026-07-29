'use client';
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 py-12">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 mb-2">Reset Password</h1>
        
        {submitted ? (
          <div className="text-center">
            <p className="text-emerald-600 font-semibold mb-6">If an account with that email exists, we've sent you a reset link.</p>
            <Link href="/login" className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-center mb-8">Enter your email to receive a password reset link.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
                  required 
                />
              </div>
              
              <button type="submit" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                Send Reset Link
              </button>
            </form>
            <div className="mt-8 text-center text-sm text-slate-500">
              Remembered your password? <Link href="/login" className="text-fuchsia-600 font-semibold hover:text-fuchsia-700 transition-colors">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
