export default function AnalyticsCard({ title, value, percentage, borderColor, isNegative = false }) {
  const borderColorClass = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    'surface-tint': 'border-surface-tint',
    'tertiary-container': 'border-tertiary-container',
    error: 'border-error',
  }[borderColor] || 'border-primary';

  const textColorClass = {
    primary: 'text-primary',
    secondary: 'text-on-secondary-fixed-variant',
    'surface-tint': 'text-on-secondary-fixed-variant',
    'tertiary-container': 'text-on-tertiary-fixed-variant',
    error: 'text-error',
  }[borderColor] || 'text-primary';

  return (
    <div className={`bg-surface-container-lowest p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg md:rounded-xl border-l-4 ${borderColorClass}`}>
      <p className="text-on-surface-variant text-[8px] xs:text-[9px] sm:text-xs font-label uppercase tracking-wider mb-1.5 xs:mb-2 md:mb-3 line-clamp-2">{title}</p>
      <div className="flex items-end justify-between gap-1 xs:gap-2">
        <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-on-surface font-body truncate">{value}</h3>
        <span className={`${textColorClass} text-[7px] xs:text-[8px] sm:text-xs font-bold flex-shrink-0 text-right`}>
          {isNegative ? '' : '+'}{percentage}
        </span>
      </div>
    </div>
  );
}
