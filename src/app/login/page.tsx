'use client';
import "../globals.css";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const BACKGROUND_IMAGE_URL = "https://static.wixstatic.com/media/bfd7f8_fa8d4d08500140f7a5ae3067f8fb03c8~mv2.jpg/v1/crop/x_0,y_320,w_2729,h_1101/fill/w_2574,h_1038,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Greatest%20Show_edited.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden py-12 px-4">
      {/* 10% Opacity Full Viewport Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-10"
        style={{ backgroundImage: `url("${BACKGROUND_IMAGE_URL}")` }}
      />

      {/* Ambient Gold Glow Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/15 blur-[150px] rounded-full pointer-events-none" />

      {/* Login Form Card */}
      <div className="bg-zinc-900/90 border border-amber-500/40 p-8 md:p-10 rounded-3xl shadow-2xl shadow-amber-500/10 max-w-md w-full backdrop-blur-2xl relative z-10">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size={72} title="DanceCard" textTitle="7 Dance Centre" />
        </div>
        
        <h1 className="text-3xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-1">
          Welcome Back
        </h1>
        <p className="text-zinc-400 text-center text-sm font-medium mb-8">
          Sign in to access your DanceCard.
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/60 text-rose-200 rounded-xl text-xs text-center font-bold shadow-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all bg-zinc-950 text-zinc-100 font-bold placeholder-zinc-500 shadow-inner"
              placeholder="admin@test.com"
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-amber-400/80 hover:text-amber-300 font-bold transition-colors">
                Forgot?
              </Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all bg-zinc-950 text-zinc-100 font-bold shadow-inner"
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 px-4 rounded-xl shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] text-base"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Quick Fill Test Accounts */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-3 text-center">
            Quick Fill Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@test.com")}
              className="px-2 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-colors text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("teacher@test.com")}
              className="px-2 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-colors text-center"
            >
              💃 Teacher
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("parent@test.com")}
              className="px-2 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-colors text-center"
            >
              👨‍👩‍👧 Parent
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs font-medium text-zinc-400">
          Don't have an account? <Link href="/signup" className="text-amber-400 font-bold hover:text-amber-300 underline transition-colors">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
