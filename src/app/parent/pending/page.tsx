import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ParentPendingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden py-12 px-4">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-10"
        style={{ backgroundImage: `url("https://static.wixstatic.com/media/bfd7f8_fa8d4d08500140f7a5ae3067f8fb03c8~mv2.jpg/v1/crop/x_0,y_320,w_2729,h_1101/fill/w_2574,h_1038,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Greatest%20Show_edited.jpg")` }}
      />
      {/* Ambient Gold Glow Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/15 blur-[150px] rounded-full pointer-events-none" />

      <div className="bg-zinc-900/90 border border-amber-500/40 p-8 md:p-10 rounded-3xl shadow-2xl shadow-amber-500/10 max-w-lg w-full backdrop-blur-2xl relative z-10 text-center">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size={72} title="DanceCard" textTitle="7 Dance Centre" />
        </div>

        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
          ⏳
        </div>

        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
          Account Pending Approval
        </h1>
        
        <p className="text-zinc-300 text-sm font-medium mb-6 leading-relaxed">
          Welcome to 7 Dance Centre, <strong className="text-amber-400">{session?.user?.name || 'Parent'}</strong>! Your registration has been received and placed in probationary status awaiting administrator review.
        </p>

        <div className="bg-zinc-950/80 border border-amber-500/30 p-4 rounded-xl mb-8 text-xs text-zinc-400 text-left space-y-2">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">What happens next?</div>
          <p>• Studio administrators review new parent accounts regularly.</p>
          <p>• Once approved, your account will be activated automatically.</p>
          <p>• You can log back in anytime to check your approval status.</p>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
