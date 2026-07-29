'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PARENT");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Call our signup API route (which we will build next)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 py-12">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-rose-600 mb-2">Create an Account</h1>
        <p className="text-slate-700 text-center font-medium mb-8">Join the studio to manage your dancers</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center font-bold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all bg-white text-slate-900 font-medium shadow-sm"
              placeholder="Jane Doe"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all bg-white text-slate-900 font-medium shadow-sm"
              placeholder="you@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all bg-white text-slate-900 font-medium shadow-sm"
              placeholder="••••••••"
              required 
              minLength={6}
            />
          </div>
          
          <button type="submit" className="mt-4 w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            Sign Up
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-slate-700">
          Already have an account? <Link href="/login" className="text-indigo-700 font-bold hover:text-indigo-900 underline transition-colors">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
