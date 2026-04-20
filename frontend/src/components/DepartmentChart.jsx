export default function DepartmentChart() {
  const departments = [
    { name: 'CS', present: 75, expected: 90 },
    { name: 'ENG', present: 60, expected: 85 },
    { name: 'MATH', present: 65, expected: 70 },
    { name: 'BIO', present: 88, expected: 95 },
    { name: 'LAW', present: 40, expected: 80 },
    { name: 'ART', present: 72, expected: 90 },
  ];

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg md:rounded-xl">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-3 xs:mb-4 md:mb-6 lg:mb-8 gap-2 xs:gap-3 md:gap-4">
        <h4 className="font-headline font-bold text-xs xs:text-sm md:text-base text-on-surface">Department-wise Attendance</h4>
        <div className="flex gap-2 xs:gap-3 md:gap-4 flex-wrap text-[8px] xs:text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-on-surface-variant uppercase font-bold">
            <div className="size-1.5 xs:size-2 bg-primary rounded-sm"></div> Present
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant uppercase font-bold">
            <div className="size-1.5 xs:size-2 bg-surface-variant rounded-sm"></div> Expected
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between h-40 xs:h-48 sm:h-56 lg:h-64 gap-1 xs:gap-1.5 md:gap-2 lg:gap-4 px-1 xs:px-2 overflow-x-auto pb-2">
        {departments.map((dept) => (
          <div key={dept.name} className="flex-1 min-w-[24px] xs:min-w-[32px] md:min-w-[40px] flex flex-col items-center gap-1 xs:gap-1.5 md:gap-2 group">
            <div className="relative w-full h-full flex flex-col justify-end gap-0.5 xs:gap-1">
              <div className="absolute inset-x-0 bottom-0 bg-surface-container-low rounded-t w-full h-[90%]"></div>
              <div
                className="relative bg-primary rounded-t w-full transition-all group-hover:brightness-110"
                style={{ height: `${dept.present}%` }}
              ></div>
            </div>
            <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold text-outline uppercase tracking-tighter whitespace-nowrap">{dept.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
