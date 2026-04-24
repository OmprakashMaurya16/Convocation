const STAGE_STYLE = {
  REGISTERED: "bg-slate-100 text-slate-700 border-slate-200",
  CHECKED_IN: "bg-blue-50 text-blue-700 border-blue-100",
  SEAT_ALLOCATED: "bg-green-50 text-green-700 border-green-100",
  GOWN_ISSUED: "bg-amber-50 text-amber-700 border-amber-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANTEEN_TOKEN_ISSUED: "bg-slate-50 text-slate-700 border-slate-200",
};

const STAGE_LABEL = {
  REGISTERED: "REGISTERED",
  CHECKED_IN: "CHECKED-IN",
  SEAT_ALLOCATED: "SEAT ALLOCATED",
  GOWN_ISSUED: "ROBE ISSUED",
  COMPLETED: "ROBE RETURN",
  CANTEEN_TOKEN_ISSUED: "CANTEEN TOKEN",
};

export default function CandidateTable({
  candidates = [],
  page = 1,
  total = 0,
  totalPages = 1,
  onPageChange = () => {},
  isLoading = false,
}) {
  const from = total === 0 ? 0 : (page - 1) * 10 + 1;
  const to = Math.min(page * 10, total);

  return (
    <div className="bg-surface-container-lowest rounded-lg md:rounded-xl border border-outline-variant/10 shadow-[0_8px_48px_rgba(0,31,42,0.04)] overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10">
                Candidate ID
              </th>
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10">
                Full Name
              </th>
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10 hidden md:table-cell">
                Department
              </th>
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10">
                Stage
              </th>
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10 hidden sm:table-cell">
                Seat No.
              </th>
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10 hidden lg:table-cell">
                Last Updated
              </th>
              <th className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[11px] font-label font-extrabold text-slate-500 uppercase tracking-widest border-b border-outline-variant/10 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="hover:bg-surface-container-low/30 transition-colors group"
              >
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 font-label text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-bold text-primary truncate">
                  {candidate.id}
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4">
                  <div className="flex items-center gap-2 xs:gap-2.5 md:gap-3">
                    <div className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[7px] xs:text-[8px] md:text-[10px] font-bold flex-shrink-0 bg-blue-100 text-blue-700">
                      {candidate.initials}
                    </div>
                    <span className="font-body text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-medium text-on-surface truncate">
                      {candidate.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-[8px] xs:text-[9px] sm:text-xs md:text-sm text-slate-600 hidden md:table-cell truncate">
                  {candidate.department}
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4">
                  <span
                    className={`px-2 xs:px-2.5 md:px-3 py-0.5 xs:py-1 md:py-1.5 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold border uppercase tracking-tighter whitespace-nowrap text-center ${STAGE_STYLE[candidate.stage] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                  >
                    {STAGE_LABEL[candidate.stage] || candidate.stage}
                  </span>
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-label font-bold text-primary hidden sm:table-cell truncate">
                  {candidate.seat}
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-label text-slate-400 hidden lg:table-cell truncate">
                  {candidate.time}
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-right">
                  <button className="p-1 xs:p-1.5 text-slate-400 hover:text-primary transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto rounded-lg hover:bg-surface-container-high">
                    <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">
                      more_vert
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? (
          <div className="px-4 py-6 text-sm text-on-surface-variant">
            Loading candidates...
          </div>
        ) : null}

        {!isLoading && candidates.length === 0 ? (
          <div className="px-4 py-6 text-sm text-on-surface-variant">
            No candidates found.
          </div>
        ) : null}
      </div>

      {/* Pagination Footer */}
      <div className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 bg-surface-container-low/30 flex flex-col xs:flex-row items-center justify-between gap-2 xs:gap-3 md:gap-4 border-t border-outline-variant/10">
        <div className="text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-label font-semibold text-slate-500 uppercase tracking-wider order-2 xs:order-1 line-clamp-1">
          Showing{" "}
          <span className="text-primary">
            {from} - {to}
          </span>{" "}
          of {total.toLocaleString()} candidates
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5 order-1 xs:order-2 flex-shrink-0">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1.5 xs:p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-slate-400 hover:text-primary transition-all active:scale-95 touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">
              chevron_left
            </span>
          </button>
          <div className="flex items-center gap-0.5 xs:gap-1">
            <button className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg bg-primary text-white text-[7px] xs:text-[8px] md:text-xs font-bold shadow-sm flex items-center justify-center touch-none min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto">
              {page}
            </button>
            {totalPages > page ? (
              <button
                onClick={() => onPageChange(page + 1)}
                className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg text-[7px] xs:text-[8px] md:text-xs font-bold text-slate-500 hover:bg-surface-container-high transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto"
              >
                {page + 1}
              </button>
            ) : null}
            {totalPages > page + 1 ? (
              <span className="mx-0.5 xs:mx-1 text-slate-400 text-[7px] xs:text-[8px] md:text-xs">
                ...
              </span>
            ) : null}
            {totalPages > page + 1 ? (
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg text-[7px] xs:text-[8px] md:text-xs font-bold text-slate-500 hover:bg-surface-container-high transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto"
              >
                {totalPages}
              </button>
            ) : null}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1.5 xs:p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-slate-400 hover:text-primary transition-all active:scale-95 touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
