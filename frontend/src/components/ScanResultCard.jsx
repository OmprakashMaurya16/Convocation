export default function ScanResultCard({ status, statusColor, time, student, idNumber, nextPhase, nextPhaseIcon, show }) {
  if (!show) return null;

  return (
    <div className="absolute z-20 bottom-24 md:bottom-32 lg:bottom-40 px-4 md:px-8 lg:px-12 w-full max-w-md md:max-w-2xl lg:max-w-3xl left-1/2 transform -translate-x-1/2">
      <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl lg:rounded-3xl p-1 md:p-2 shadow-2xl shadow-green-500/30">
        <div className={`${statusColor} rounded-lg md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4 lg:gap-6`}>
          {/* Header with Status and Time */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
              <div className="bg-white/20 p-2 md:p-3 lg:p-4 rounded-full">
                <span 
                  className="material-symbols-outlined text-white text-2xl md:text-3xl lg:text-4xl" 
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-white/80 font-label text-xs md:text-sm lg:text-base font-semibold uppercase tracking-widest">
                  Status
                </p>
                <h2 className="text-white font-headline text-lg md:text-2xl lg:text-4xl font-bold leading-tight">
                  {status}
                </h2>
              </div>
            </div>
            <span className="text-white/60 font-body text-xs md:text-sm lg:text-base font-bold">{time}</span>
          </div>

          {/* Student Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 space-y-2 md:space-y-3 lg:space-y-4">
            {student && (
              <div className="flex justify-between items-center border-b border-white/10 pb-2 md:pb-3 lg:pb-4">
                <span className="text-white/70 text-xs md:text-sm lg:text-base font-label">Student</span>
                <span className="text-white font-body font-bold text-sm md:text-lg lg:text-2xl">{student}</span>
              </div>
            )}
            {idNumber && (
              <div className="flex justify-between items-center border-b border-white/10 pb-2 md:pb-3 lg:pb-4">
                <span className="text-white/70 text-xs md:text-sm lg:text-base font-label">ID Number</span>
                <span className="text-white font-body font-semibold text-xs md:text-base lg:text-lg">{idNumber}</span>
              </div>
            )}
            {nextPhase && (
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs md:text-sm lg:text-base font-label">Next Phase</span>
                <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 bg-white/20 px-2 md:px-3 lg:px-4 py-1 md:py-2 lg:py-3 rounded-full">
                  <span className="material-symbols-outlined text-sm md:text-base lg:text-lg text-white">
                    {nextPhaseIcon || 'arrow_forward'}
                  </span>
                  <span className="text-white font-body font-bold text-xs md:text-sm lg:text-base">{nextPhase}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
