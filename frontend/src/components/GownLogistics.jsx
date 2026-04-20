export default function GownLogistics() {
  const stats = [
    { label: 'Issued', value: 1780, color: 'bg-tertiary-container' },
    { label: 'Returned', value: 42, color: 'bg-error' },
    { label: 'Awaiting Issue', value: 628, color: 'bg-surface-container-low' },
  ];

  return (
    <div className="lg:col-span-4 bg-surface-container-lowest p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg md:rounded-xl flex flex-col">
      <h4 className="font-headline font-bold text-xs xs:text-sm md:text-base text-on-surface mb-3 xs:mb-4 md:mb-6 lg:mb-8">
        Gown Logistics
      </h4>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px] xs:min-h-[240px] md:min-h-[280px]">
        <div className="size-32 xs:size-36 sm:size-40 md:size-44 lg:size-48 rounded-full border-[10px] xs:border-[12px] md:border-[14px] lg:border-[16px] border-surface-container-low relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[10px] xs:border-[12px] md:border-[14px] lg:border-[16px] border-tertiary-container border-b-transparent border-l-transparent rotate-45"></div>
          <div className="text-center">
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-on-surface">1,822</p>
            <p className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-widest font-label">Processed</p>
          </div>
        </div>
      </div>

      <div className="mt-3 xs:mt-4 md:mt-6 space-y-1.5 xs:space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center text-[8px] xs:text-[9px] sm:text-xs">
            <div className="flex items-center gap-1.5 xs:gap-2">
              <div className={`size-2 xs:size-2.5 md:size-3 rounded-full ${stat.color}`}></div>
              <span className="text-on-surface-variant text-[8px] xs:text-[9px] sm:text-xs">{stat.label}</span>
            </div>
            <span className="font-bold text-on-surface text-[8px] xs:text-[9px] sm:text-xs">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
