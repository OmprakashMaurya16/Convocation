export default function ErrorStateCard({ 
  title, 
  message, 
  protocol, 
  icon = 'close',
  onBackToScan,
  countdown = 5
}) {
  return (
    <div className="absolute inset-0 z-20 bg-error/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-6 text-white text-center">
      {/* High Visibility Content Wrapper */}
      <div className="max-w-md w-full space-y-6 md:space-y-8 flex flex-col items-center">
        {/* Large Icon with Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-white opacity-20 blur-3xl rounded-full scale-150"></div>
          <div className="relative bg-white/20 p-6 md:p-8 rounded-full border border-white/30 backdrop-blur-xl">
            <span 
              className="material-symbols-outlined text-6xl md:text-[120px] leading-none" 
              style={{ fontVariationSettings: "'wght' 700" }}
            >
              {icon}
            </span>
          </div>
        </div>

        {/* Error Message Cluster */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tighter leading-none">
            {title}
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl font-body font-medium opacity-90 max-w-xs mx-auto leading-tight">
            {message}
          </p>
        </div>

        {/* Detail / Guidance Panel */}
        <div className="backdrop-blur-xl bg-white/10 p-4 md:p-6 rounded-xl border border-white/10 w-full">
          <div className="flex items-center gap-2 md:gap-3 mb-2 text-white/70">
            <span className="material-symbols-outlined text-xs md:text-sm">info</span>
            <span className="text-xs font-label font-bold uppercase tracking-widest">
              Protocol Instruction
            </span>
          </div>
          <p className="text-sm md:text-base font-body text-left leading-relaxed">
            {protocol}
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onBackToScan}
          className="w-full bg-white text-error font-headline font-bold py-4 md:py-5 px-4 rounded-lg md:rounded-xl shadow-2xl hover:shadow-xl active:scale-95 transition-all duration-150 text-base md:text-lg flex items-center justify-center gap-2 md:gap-3"
        >
          <span className="material-symbols-outlined font-bold">arrow_back</span>
          <span>Back to Scan</span>
        </button>

        {/* Auto-reset Timer */}
        <p className="text-xs font-label uppercase tracking-widest opacity-50">
          System auto-resets in {countdown} seconds
        </p>
      </div>
    </div>
  );
}
