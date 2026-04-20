export default function SectionDistribution() {
  const sections = [
    { name: 'Section A (VIP)', percentage: 94 },
    { name: 'Section B (Honors)', percentage: 82 },
    { name: 'Section C (General)', percentage: 65 },
  ];

  const getBarColor = (index) => {
    switch (index) {
      case 0:
        return 'bg-primary-container';
      case 1:
        return 'bg-primary';
      case 2:
        return 'bg-emerald-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg md:rounded-xl lg:rounded-2xl p-3 xs:p-4 md:p-5 lg:p-6 shadow-sm border border-outline-variant/10">
      <h3 className="font-headline font-bold text-sm xs:text-base md:text-lg text-primary mb-2 xs:mb-3 md:mb-4 flex items-center gap-1 xs:gap-2 line-clamp-1">
        <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">donut_small</span>
        <span className="line-clamp-1">Distribution</span>
      </h3>
      <div className="space-y-2.5 xs:space-y-3 md:space-y-4">
        {sections.map((section, idx) => (
          <div key={section.name}>
            <div className="flex justify-between text-[7px] xs:text-[8px] sm:text-xs font-bold mb-1 xs:mb-1.5 md:mb-2">
              <span className="text-slate-600 line-clamp-1">{section.name}</span>
              <span className="text-primary flex-shrink-0 ml-1">{section.percentage}%</span>
            </div>
            <div className="w-full h-1 xs:h-1.5 md:h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(idx)}`}
                style={{ width: `${section.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
