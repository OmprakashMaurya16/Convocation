export default function ScannerTopBar({
  title,
  counter,
  onSettings,
  onLogout = null,
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant/40 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-primary text-lg sm:text-xl">
            qr_code_scanner
          </span>
          <h1 className="truncate text-base font-headline font-bold tracking-tight text-on-background sm:text-lg md:text-xl">
            {title}
          </h1>
        </div>

        <div className="rounded-full bg-primary px-3 py-1.5 sm:px-4 sm:py-2">
          <span className="whitespace-nowrap text-[11px] font-headline font-semibold tracking-wide text-white sm:text-xs md:text-sm">
            {counter}
          </span>
        </div>

        <button
          onClick={onSettings}
          className="ml-1 rounded-full p-2 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label="Open scanner settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {onLogout ? (
          <button
            onClick={onLogout}
            className="rounded-lg bg-error px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            aria-label="Logout"
          >
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}
