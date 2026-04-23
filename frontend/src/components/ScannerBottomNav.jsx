export default function ScannerBottomNav({
  activeMode,
  setActiveMode,
  enabledModes,
  hiddenModes = [],
}) {
  const modes = [
    { id: "entry", label: "Entry", icon: "login" },
    { id: "seating", label: "Seating", icon: "chair" },
    { id: "gown", label: "Robe", icon: "checkroom" },
    { id: "return", label: "Return", icon: "assignment_return" },
    { id: "canteen", label: "Canteen", icon: "restaurant" },
  ];

  const visibleModes = modes.filter((mode) => !hiddenModes.includes(mode.id));
  const gridColsClass =
    visibleModes.length === 5
      ? "grid-cols-5"
      : visibleModes.length >= 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/40 bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div
        className={`mx-auto grid w-full max-w-4xl ${gridColsClass} gap-1 px-2 py-2 sm:px-3 sm:py-2.5`}
      >
        {visibleModes.map((mode) => {
          const isEnabled = !enabledModes || enabledModes.includes(mode.id);

          return (
            <button
              key={mode.id}
              onClick={() => isEnabled && setActiveMode(mode.id)}
              disabled={!isEnabled}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 transition-colors ${
                activeMode === mode.id
                  ? "bg-primary text-white"
                  : isEnabled
                    ? "text-on-surface-variant hover:bg-surface-container"
                    : "cursor-not-allowed text-on-surface-variant/45"
              }`}
              style={
                activeMode === mode.id
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
              aria-label={`Switch to ${mode.label} mode`}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">
                {mode.icon}
              </span>
              <span className="mt-0.5 font-label text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
