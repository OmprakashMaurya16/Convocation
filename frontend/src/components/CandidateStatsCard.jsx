export default function CandidateStatsCard({ icon, iconBg, label, value, badge, badgeColor }) {
  return (
    <div className="bg-surface-container-lowest p-3 xs:p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,31,42,0.02)] hover:shadow-[0_8px_32px_rgba(0,31,42,0.06)] transition-shadow">
      <div className="flex items-center justify-between mb-2 xs:mb-3 md:mb-4">
        <div className={`p-1.5 xs:p-2 md:p-2.5 rounded-lg ${iconBg}`}>
          <span className="material-symbols-outlined text-xs xs:text-sm md:text-lg">{icon}</span>
        </div>
        {badge && (
          <span className={`text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-label font-bold ${badgeColor} px-1.5 xs:px-2 md:px-2.5 py-0.5 xs:py-1 rounded-full whitespace-nowrap`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-label font-semibold uppercase tracking-wider line-clamp-2 mb-1 xs:mb-1.5 md:mb-2">{label}</p>
      <h3 className="font-headline font-extrabold text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary truncate">{value}</h3>
    </div>
  );
}
