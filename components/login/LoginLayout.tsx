import { Wifi, Shield, Zap, Clock, Infinity, Users } from "lucide-react";

interface LoginLayoutProps {
  leftColor: string;
  leftTitle: string;
  leftDescription: string;
  leftFeatures: Array<{
    icon: "shield" | "zap" | "clock" | "infinity" | "users";
    bold: string;
    text: string;
  }>;
  badgeSSID: string;
  badgePrefix?: string;
  badgeTheme?: "green" | "slate";
  footerText?: string;
  children: React.ReactNode;
}

export function LoginLayout({
  leftColor,
  leftTitle,
  leftDescription,
  leftFeatures,
  badgeSSID,
  badgePrefix = "Red disponible",
  badgeTheme = "green",
  footerText = "© 2026 IEQ - Todos los derechos reservados",
  children,
}: LoginLayoutProps) {
  
  // Helper for rendering icons
  const renderIcon = (iconName: string) => {
    const props = { className: "h-4 w-4 text-sky-400" };
    switch (iconName) {
      case "shield": return <Shield {...props} />;
      case "zap": return <Zap {...props} />;
      case "clock": return <Clock {...props} />;
      case "infinity": return <Infinity {...props} />;
      case "users": return <Users {...props} />;
      default: return <Shield {...props} />;
    }
  };

  // Helper to format title (newlines and IEQ colored)
  const formatTitle = (title: string) => {
    // Split by \n if explicitly provided in string
    const lines = title.split("\\n");
    return lines.map((line, idx) => {
      const words = line.split(" ");
      return (
        <span key={idx}>
          {words.map((word, wIdx) => {
            const isIEQ = word.includes("IEQ");
            return (
              <span key={wIdx} className={isIEQ ? "text-sky-400" : ""}>
                {word}{wIdx < words.length - 1 ? " " : ""}
              </span>
            );
          })}
          {idx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const badgeWrapperClass = badgeTheme === "green" 
    ? "flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs"
    : "flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1.5 text-xs";
  
  const badgeDotClass = badgeTheme === "green"
    ? "h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"
    : "h-1.5 w-1.5 rounded-full bg-slate-400";

  const badgeTextClass = badgeTheme === "green" ? "text-green-400" : "text-slate-300";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans text-neutral-900">
      
      {/* Left Panel - Dynamic Branding */}
      <div 
        className="relative flex w-full flex-col justify-between overflow-hidden px-10 py-10 lg:w-1/2 lg:px-16 lg:py-16"
        style={{ backgroundColor: leftColor }}
      >
        {/* Background Decorative Circles */}
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full border border-white/10" />
        <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full border border-white/10" />
        <div className="absolute left-[10%] top-[20%] h-[800px] w-[800px] rounded-full border border-white/10" />

        {/* Content wrapper with z-index to stay above background */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Logo Header (Visible on both Mobile and Desktop) */}
          <div className="flex items-center justify-between lg:justify-start lg:mb-20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-sky-500/10 p-1.5 overflow-hidden">
                <img src="/logo-ieq.png" alt="IEQ Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-semibold leading-tight text-white">Portal IEQ</h1>
                <p className="text-[11px] lg:text-sm text-slate-400">Control de acceso WiFi</p>
              </div>
            </div>
            
            {/* Mobile Badge SSID (Hidden on desktop) */}
            <div className={`lg:hidden ${badgeWrapperClass}`}>
              <span className={badgeDotClass} />
              <span className={badgeTextClass}>
                {badgePrefix}{badgePrefix ? " \u00B7 " : ""}{badgeSSID}
              </span>
            </div>
          </div>

          {/* Main Content (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:flex-col lg:mt-auto">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              {formatTitle(leftTitle)}
            </h2>
            <p className="text-base text-slate-300 max-w-sm mb-8">
              {leftDescription}
            </p>

            {/* Feature List */}
            <div className="flex flex-col gap-4">
              {leftFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 p-2">
                    {renderIcon(feat.icon)}
                  </div>
                  <p className="text-sm">
                    <strong className="text-white font-medium">{feat.bold}</strong>
                    <span className="text-slate-300"> {feat.text}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer & Badge area (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-between mt-auto pt-12">
            <p className="text-sm text-slate-500">
              {footerText}
            </p>
            <div className={badgeWrapperClass}>
              <span className={badgeDotClass} />
              <span className={badgeTextClass}>
                {badgePrefix}{badgePrefix ? " \u00B7 " : ""}{badgeSSID}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form / Content */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-10 py-10 lg:w-1/2 lg:px-16 lg:py-16">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
      
    </div>
  );
}
