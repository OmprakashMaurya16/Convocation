export default function ScannerFrame({ children, centerContent = null }) {
  return (
    <main className="relative">
      <div className="relative z-10 flex items-center justify-center">
        <div className="relative h-[52vh] min-h-[320px] max-h-[560px] w-full rounded-2xl border-2 border-primary/30 bg-surface shadow-sm">
          {centerContent ? (
            <div className="absolute inset-2 z-10 overflow-hidden rounded-xl pointer-events-auto">
              {centerContent}
            </div>
          ) : null}
          <div className="absolute -left-0.5 -top-0.5 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-primary" />
          <div className="absolute -right-0.5 -top-0.5 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-primary" />
          <div className="absolute -bottom-0.5 -left-0.5 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-primary" />
          <div className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-primary" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </main>
  );
}
