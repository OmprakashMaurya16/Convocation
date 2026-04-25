export default function ScanResultCard({
  status,
  statusColor,
  time,
  student,
  idNumber,
  seat,
  nextPhase,
  nextPhaseIcon,
  message,
  show,
}) {
  if (!show) return null;

  const isRejected = status === "REJECTED";

  return (
    <div className="w-full max-w-lg mx-auto pointer-events-auto transition-all duration-500 scale-[0.95] sm:scale-100">
      <div className="rounded-2xl bg-white p-0.5 shadow-xl">
        <div className={`${statusColor} rounded-xl p-4 sm:p-5 md:p-6 shadow-inner`}>
          {/* ── Header: status + time ── */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2 ring-1 ring-white/30">
                <span
                  className="material-symbols-outlined text-2xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isRejected ? "cancel" : "check_circle"}
                </span>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-wider text-white/80">
                  Result
                </p>
                <h2 className="font-headline text-lg font-black leading-tight text-white sm:text-xl tracking-tight">
                  {status}
                </h2>
              </div>
            </div>
            <div className="bg-black/10 px-2 py-0.5 rounded-full backdrop-blur-md">
              <span className="font-body text-[10px] font-bold text-white">
                {time}
              </span>
            </div>
          </div>

          {/* ── Dynamic stage message ── */}
          {message && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-white/30 bg-white/20 px-4 py-3 backdrop-blur-md shadow-sm">
              <span
                className="material-symbols-outlined mt-0.5 shrink-0 text-lg text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isRejected ? "report" : "campaign"}
              </span>
              <p className="font-body text-sm font-bold leading-snug text-white">
                {message}
              </p>
            </div>
          )}

          {/* ── Detail rows ── */}
          <div className="rounded-xl bg-black/10 p-4 backdrop-blur-md border border-white/10">
            {student && (
              <div className="grid grid-cols-1 gap-0.5 border-b border-white/20 pb-2.5 sm:grid-cols-[90px_1fr] sm:gap-3">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Student
                </span>
                <span className="font-headline text-base font-black text-white sm:text-right">
                  {student}
                </span>
              </div>
            )}
            {idNumber && (
              <div className="grid grid-cols-1 gap-0.5 border-b border-white/20 py-2.5 sm:grid-cols-[90px_1fr] sm:gap-3">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-white/70">
                  ID Number
                </span>
                <span className="font-body text-xs font-black text-white sm:text-right">
                  {idNumber}
                </span>
              </div>
            )}
            {seat && (
              <div className="grid grid-cols-1 gap-0.5 border-b border-white/20 py-2.5 sm:grid-cols-[90px_1fr] sm:gap-3">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Seat
                </span>
                <span className="font-headline text-base font-black text-white sm:text-right">
                  {seat}
                </span>
              </div>
            )}
            {nextPhase && (
              <div className="grid grid-cols-1 gap-2 pt-2.5 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-3">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Current Stage
                </span>
                <div className="justify-self-start rounded-lg bg-white/20 border border-white/30 px-3 py-1 sm:justify-self-end shadow-sm">
                  <span className="flex items-center gap-1.5 font-body text-[11px] font-black text-white">
                    <span className="material-symbols-outlined text-base text-white">
                      {nextPhaseIcon || "arrow_forward"}
                    </span>
                    {nextPhase}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
