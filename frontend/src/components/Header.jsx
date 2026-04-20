export default function Header({ onMenuClick = () => {} }) {
  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 md:py-4 flex flex-col xs:flex-row items-start xs:items-center justify-between border-b border-outline-variant/10 gap-1.5 xs:gap-2 md:gap-4">
      <div className="flex items-center gap-1.5 xs:gap-2 md:gap-4 w-full xs:w-auto">
        {/* Mobile Menu Button */}
        <button onClick={onMenuClick} className="p-2 md:hidden text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors active:bg-surface-container-high touch-none min-h-[44px] min-w-[44px] flex items-center justify-center">
          <span className="material-symbols-outlined text-lg xs:text-xl">menu</span>
        </button>
        
        <h2 className="font-headline text-sm xs:text-base sm:text-lg md:text-2xl font-bold text-on-background line-clamp-1">Event Overview</h2>
        <span className="flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 md:px-3 py-0.5 xs:py-1 bg-error-container text-on-error-container rounded-full text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-bold animate-pulse flex-shrink-0 whitespace-nowrap">
          <span className="material-symbols-outlined text-[10px] xs:text-xs">radio_button_checked</span>
          <span className="hidden xs:inline">LIVE</span>
        </span>
      </div>

      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1.5 xs:gap-2 md:gap-4 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 md:flex-none w-full xs:w-auto">
          <span className="material-symbols-outlined absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 text-outline text-xs md:text-sm">
            search
          </span>
          <input
            className="bg-surface-container-low border-none rounded-lg pl-8 xs:pl-9 md:pl-10 pr-3 xs:pr-4 py-1.5 xs:py-2 text-xs md:text-sm focus:ring-2 focus:ring-primary w-full md:w-64 transition-all"
            placeholder="Search..."
            type="text"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 md:gap-2 flex-shrink-0">
          <button className="p-2 md:p-2.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors active:bg-surface-container-high touch-none min-h-[44px] min-w-[44px] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg md:text-xl">notifications</span>
          </button>
          <button className="p-2 md:p-2.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors active:bg-surface-container-high touch-none min-h-[44px] min-w-[44px] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg md:text-xl">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
