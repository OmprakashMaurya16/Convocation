export default function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 mb-5 xs:mb-6 md:mb-8">
      {/* Department Filter */}
      <div className="bg-surface-container-low px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 md:py-3 rounded-lg md:rounded-xl flex items-center gap-2 xs:gap-3 border border-outline-variant/20 touch-none min-h-[44px]">
        <span className="material-symbols-outlined text-slate-400 text-xs md:text-lg hidden xs:inline flex-shrink-0">filter_list</span>
        <select className="bg-transparent border-none text-[8px] xs:text-sm md:text-base font-label font-semibold text-primary focus:ring-0 p-0 cursor-pointer flex-grow appearance-none">
          <option>All Departments</option>
          <option>Computer Science</option>
          <option>Architecture</option>
          <option>Medicine</option>
          <option>Engineering</option>
        </select>
      </div>

      {/* Registration Status Filter */}
      <div className="bg-surface-container-low px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 md:py-3 rounded-lg md:rounded-xl flex items-center gap-2 xs:gap-3 border border-outline-variant/20 touch-none min-h-[44px]">
        <select className="bg-transparent border-none text-[8px] xs:text-sm md:text-base font-label font-semibold text-primary focus:ring-0 p-0 cursor-pointer flex-grow appearance-none">
          <option>Registration Status</option>
          <option>Confirmed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Gown Return Status Filter */}
      <div className="bg-surface-container-low px-3 xs:px-4 md:px-5 py-2 xs:py-2.5 md:py-3 rounded-lg md:rounded-xl flex items-center gap-2 xs:gap-3 border border-outline-variant/20 touch-none min-h-[44px] hidden sm:flex">
        <select className="bg-transparent border-none text-[8px] xs:text-sm md:text-base font-label font-semibold text-primary focus:ring-0 p-0 cursor-pointer flex-grow appearance-none">
          <option>Gown Return Status</option>
          <option>In Use</option>
          <option>Returned</option>
        </select>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Live Stream Status */}
      <div className="flex items-center gap-1 xs:gap-1.5 text-[7px] xs:text-[8px] sm:text-xs font-label font-bold text-slate-400 flex-shrink-0 ml-auto sm:ml-0">
        <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
        <span className="hidden sm:inline whitespace-nowrap">REAL-TIME STREAM ACTIVE</span>
      </div>
    </div>
  );
}
