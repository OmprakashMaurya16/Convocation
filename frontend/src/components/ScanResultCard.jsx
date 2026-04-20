export default function ScanResultCard({
  status,
  statusColor,
  time,
  student,
  idNumber,
  nextPhase,
  nextPhaseIcon,
  show,
}) {
  if (!show) return null;

  return (
    <div className="w-full max-w-3xl pointer-events-auto">
      <div className="rounded-2xl bg-surface-container-lowest p-1 shadow-2xl">
        <div className={`${statusColor} rounded-xl p-4 sm:p-5 md:p-6`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5 sm:p-3">
                <span
                  className="material-symbols-outlined text-2xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div>
                <p className="font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-xs">
                  Status
                </p>
                <h2 className="font-headline text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                  {status}
                </h2>
              </div>
            </div>
            <span className="font-body text-xs font-semibold text-white/70 sm:text-sm">
              {time}
            </span>
          </div>

          <div className="rounded-xl bg-white/12 p-3.5 backdrop-blur-sm sm:p-4 md:p-5">
            {student && (
              <div className="grid grid-cols-1 gap-1 border-b border-white/15 pb-3 sm:grid-cols-[110px_1fr] sm:gap-3">
                <span className="font-label text-sm text-white/75">
                  Student
                </span>
                <span className="font-body text-base font-bold text-white sm:text-right md:text-lg">
                  {student}
                </span>
              </div>
            )}
            {idNumber && (
              <div className="grid grid-cols-1 gap-1 border-b border-white/15 py-3 sm:grid-cols-[110px_1fr] sm:gap-3">
                <span className="font-label text-sm text-white/75">
                  ID Number
                </span>
                <span className="font-body text-sm font-semibold text-white sm:text-right md:text-base">
                  {idNumber}
                </span>
              </div>
            )}
            {nextPhase && (
              <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-[110px_1fr] sm:items-center sm:gap-3">
                <span className="font-label text-sm text-white/75">
                  Next Phase
                </span>
                <div className="justify-self-start rounded-full bg-white/25 px-3 py-1.5 sm:justify-self-end">
                  <span className="flex items-center gap-1.5 font-body text-sm font-semibold text-white">
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
