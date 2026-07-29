const LOGO_URL = "https://static.wixstatic.com/media/bfd7f8_ea3641358b4d442188c8fbdf5a6be03b~mv2.png/v1/fill/w_110,h_110,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/7DC%20only%20logo%20black_edited_edited_edited.png";

interface LogoProps {
  size?: number;
  showText?: boolean;
  title?: string;
  textTitle?: string;
  className?: string;
}

export default function Logo({ 
  size = 48, 
  showText = true, 
  title = "DanceCard", 
  textTitle = "7 Dance Centre", 
  className = "" 
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center rounded-full p-1 bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-amber-600/30 border border-amber-400/40 shadow-lg shadow-amber-500/10">
        <img
          src={LOGO_URL}
          alt="7DC Logo"
          width={size}
          height={size}
          className="rounded-full object-contain filter drop-shadow-md brightness-110"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 drop-shadow-sm">
            {title}
          </span>
          <span className="text-xs font-bold text-amber-400/80 uppercase tracking-widest -mt-1">
            {textTitle}
          </span>
        </div>
      )}
    </div>
  );
}
