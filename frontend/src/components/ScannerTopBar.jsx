export default function ScannerTopBar({
  title,
  counter,
  onSettings,
  onLogout = null,
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#002547] shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:py-5 md:px-6 md:py-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-lg">
              school
            </span>
          </div>
          <h1 className="truncate font-headline font-semibold text-lg tracking-wide text-white">
            {title}
          </h1>
        </div>

        {onLogout ? (
          <button
            onClick={onLogout}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs md:text-sm font-medium text-white hover:bg-white/20 transition-all"
            aria-label="Logout"
          >
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}
