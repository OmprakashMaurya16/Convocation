const STAGE_OPTIONS = [
  { label: "All Stages", value: "ALL" },
  { label: "Registered", value: "REGISTERED" },
  { label: "Checked-In", value: "CHECKED_IN" },
  { label: "Seated", value: "SEATED" },
  { label: "Gown Issued", value: "GOWN_ISSUED" },
  { label: "Completed", value: "COMPLETED" },
];

export default function FilterBar({
  departments = [],
  selectedDepartment = "ALL",
  onDepartmentChange = () => {},
  selectedStage = "ALL",
  onStageChange = () => {},
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 mb-5 xs:mb-6 md:mb-8">
      {/* Department Filter */}
      <div className="bg-surface-container-low px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 md:py-3 rounded-lg md:rounded-xl flex items-center gap-2 xs:gap-3 border border-outline-variant/20 touch-none min-h-[44px]">
        <span className="material-symbols-outlined text-slate-400 text-xs md:text-lg hidden xs:inline flex-shrink-0">
          filter_list
        </span>
        <select
          value={selectedDepartment}
          onChange={(event) => onDepartmentChange(event.target.value)}
          className="bg-transparent border-none text-[8px] xs:text-sm md:text-base font-label font-semibold text-primary focus:ring-0 p-0 cursor-pointer flex-grow appearance-none"
        >
          <option value="ALL">All Departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      {/* Registration Status Filter */}
      <div className="bg-surface-container-low px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 md:py-3 rounded-lg md:rounded-xl flex items-center gap-2 xs:gap-3 border border-outline-variant/20 touch-none min-h-[44px]">
        <select
          value={selectedStage}
          onChange={(event) => onStageChange(event.target.value)}
          className="bg-transparent border-none text-[8px] xs:text-sm md:text-base font-label font-semibold text-primary focus:ring-0 p-0 cursor-pointer flex-grow appearance-none"
        >
          {STAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gown Return Status Filter */}
      <div className="bg-surface-container-low px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 md:py-3 rounded-lg md:rounded-xl flex items-center gap-2 xs:gap-3 border border-outline-variant/20 touch-none min-h-[44px] hidden sm:flex">
        <span className="text-[8px] xs:text-sm md:text-base font-label font-semibold text-slate-500">
          Live data filters
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Live Stream Status */}
      <div className="flex items-center gap-1 xs:gap-1.5 text-[7px] xs:text-[8px] sm:text-xs font-label font-bold text-slate-400 flex-shrink-0 ml-auto sm:ml-0">
        <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
        <span className="hidden sm:inline whitespace-nowrap">
          REAL-TIME STREAM ACTIVE
        </span>
      </div>
    </div>
  );
}
