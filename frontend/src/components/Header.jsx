export default function Header({
  onMenuClick = () => {},
  onLogout = null,
  actions = null,
}) {
  return (
    <header className="sticky top-0 z-50 bg-surface px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 md:py-4 flex flex-col xs:flex-row items-start xs:items-center justify-between border-b border-outline-variant/10 gap-1.5 xs:gap-2 md:gap-4">
      <div className="flex items-center gap-1.5 xs:gap-2 md:gap-4 w-full xs:w-auto">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 md:hidden text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors active:bg-surface-container-high touch-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-lg xs:text-xl">
            menu
          </span>
        </button>

        <h2 className="font-headline text-sm xs:text-base sm:text-lg md:text-2xl font-bold text-on-background line-clamp-1">
          Event Overview
        </h2>
        <span className="flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 md:px-3 py-0.5 xs:py-1 bg-error-container text-on-error-container rounded-full text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-bold animate-pulse flex-shrink-0 whitespace-nowrap">
          <span className="material-symbols-outlined text-[10px] xs:text-xs">
            radio_button_checked
          </span>
          <span className="hidden xs:inline">LIVE</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 xs:gap-2 md:gap-4 w-full md:w-auto justify-end">
        {/* Action Buttons */}
        <div className="flex gap-1 md:gap-2 flex-shrink-0">
          {actions}
          {onLogout ? (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md border border-error/20 bg-error-container text-on-error-container hover:bg-error hover:text-white transition-colors sm:text-xs"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout
            </button>
          ) : null}
          <button className="p-2 md:p-2.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors active:bg-surface-container-high touch-none min-h-[44px] min-w-[44px] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg md:text-xl">
              notifications
            </span>
          </button>
          <button className="p-2 md:p-2.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors active:bg-surface-container-high touch-none min-h-[44px] min-w-[44px] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg md:text-xl">
              settings
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
