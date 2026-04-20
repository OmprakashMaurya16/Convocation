export default function ScannerFrame({ children }) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden pb-24 md:pb-32 lg:pb-40">
      {/* Live Camera Feed Simulation */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrCsRN8f62yer1hgrxYwT-N3FMDVE2IFEO-6oZBCa3JyEVEIzNMbcg7ZK5rcK1iDsOb18qOAXgiGmLaXo49RyGzffGGr2iN4uiQiuTkO00OZAIuzFVKUGU8twJfxtUkedSnOEgsgHshxXPIZFstwmoQmBqZbLX7P4dguNbxr-r8E79A_xxxaAnfLJB5IEGKK9Y84ELzNMHXE2j-PKb1I-LX05C0HJV-7edkV93jEN97qW2YD7Ldk9uIw6RRqSzDEh8OC5OwVlF8OI')",
          }}
        ></div>
        {/* Overlay to darken camera feed */}
        <div className="absolute inset-0 bg-on-surface/30"></div>
      </div>

      {/* Scanning Reticle */}
      <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 border-2 border-white/40 rounded-xl flex items-center justify-center" style={{ boxShadow: '0 0 0 4000px rgba(0, 31, 42, 0.6)' }}>
        {/* Animated corner accents */}
        <div className="absolute -top-1 -left-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
        <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>

        {/* Scanning Line */}
        <div className="w-full h-0.5 bg-white/50 shadow-[0_0_10px_white] animate-bounce opacity-30"></div>
      </div>

      {/* Result Card Slot */}
      {children}
    </div>
  );
}
