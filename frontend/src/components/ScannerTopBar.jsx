export default function ScannerTopBar({ title, counter, onSettings }) {
  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-blue-200/20 shadow-sm sticky top-0 z-40 flex justify-between items-center px-4 sm:px-8 lg:px-12 py-4 md:py-6 w-full">
      {/* Left: Scanner Icon + Title */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1">
        <span className="material-symbols-outlined text-blue-900 text-lg sm:text-xl lg:text-2xl">
          qr_code_scanner
        </span>
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-headline font-black tracking-tight text-blue-900">
          Scanner Ledger
        </h1>
      </div>

      {/* Center: Counter Badge */}
      <div className="bg-primary-container px-3 sm:px-4 md:px-6 py-1.5 md:py-2 rounded-full mx-2 md:mx-4">
        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-headline font-bold text-white tracking-wide whitespace-nowrap">
          {counter}
        </span>
      </div>

      {/* Right: Settings */}
      <button
        onClick={onSettings}
        className="text-blue-400 hover:opacity-80 transition-opacity active:scale-90 ml-2"
      >
        <span className="material-symbols-outlined text-lg md:text-xl lg:text-2xl">settings</span>
      </button>
    </header>
  );
}
