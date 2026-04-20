export default function ScannerBottomNav({ activeMode, setActiveMode }) {
  const modes = [
    { id: 'entry', label: 'Entry', icon: 'login' },
    { id: 'seating', label: 'Seating', icon: 'chair' },
    { id: 'gown', label: 'Gown', icon: 'checkroom' },
    { id: 'return', label: 'Return', icon: 'assignment_return' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 md:h-24 lg:h-28 bg-surface/90 backdrop-blur-xl border-t border-blue-100/10 shadow-2xl flex justify-around items-center px-2 md:px-4 lg:px-8 z-50">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setActiveMode(mode.id)}
          className={`flex flex-col items-center justify-center py-3 md:py-4 lg:py-5 px-3 md:px-4 lg:px-6 rounded-lg md:rounded-xl lg:rounded-2xl transition-all active:scale-90 duration-75 flex-1 gap-1 md:gap-1.5 lg:gap-2 ${
            activeMode === mode.id
              ? 'bg-primary text-white scale-105 shadow-lg'
              : 'text-blue-400 hover:bg-blue-50'
          }`}
          style={activeMode === mode.id ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          <span className="material-symbols-outlined text-base md:text-lg lg:text-2xl">
            {mode.icon}
          </span>
          <span className="font-label font-semibold text-[10px] md:text-xs lg:text-sm uppercase tracking-wider">
            {mode.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
