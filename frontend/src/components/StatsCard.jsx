export default function StatsCard({ label, value, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-primary',
    emerald: 'text-emerald-600',
    tertiary: 'text-tertiary',
  };

  return (
    <div className="bg-surface-container-lowest p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg md:rounded-xl border border-outline-variant/10">
      <p className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 xs:mb-1 line-clamp-1">{label}</p>
      <p className={`text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-headline font-bold ${colorClasses[color]} truncate`}>{value}</p>
    </div>
  );
}
