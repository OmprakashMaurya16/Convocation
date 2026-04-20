import { useState } from 'react';

export default function CandidateTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const candidates = [
    {
      id: 'SCMS-2024-001',
      initials: 'AH',
      name: 'Adrian Holovaty',
      department: 'Computer Science',
      stage: 'Seated',
      stageColor: 'bg-green-50 text-green-700 border-green-100',
      seat: 'A-112',
      time: '2 mins ago',
      initialBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'SCMS-2024-042',
      initials: 'ES',
      name: 'Elena Sorokina',
      department: 'Architecture',
      stage: 'Gown Issued',
      stageColor: 'bg-amber-50 text-amber-700 border-amber-100',
      seat: 'C-084',
      time: 'Just now',
      initialBg: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'SCMS-2024-118',
      initials: 'MB',
      name: 'Marcus Bennett',
      department: 'Medicine',
      stage: 'Checked-In',
      stageColor: 'bg-blue-50 text-blue-700 border-blue-100',
      seat: '—',
      time: '14 mins ago',
      initialBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'SCMS-2024-089',
      initials: 'LT',
      name: 'Lana Thompson',
      department: 'Economics',
      stage: 'Seated',
      stageColor: 'bg-green-50 text-green-700 border-green-100',
      seat: 'B-012',
      time: '5 mins ago',
      initialBg: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'SCMS-2024-201',
      initials: 'JR',
      name: 'Julian Rossi',
      department: 'Engineering',
      stage: 'Gown Issued',
      stageColor: 'bg-amber-50 text-amber-700 border-amber-100',
      seat: 'D-144',
      time: '8 mins ago',
      initialBg: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'SCMS-2024-156',
      initials: 'SY',
      name: 'Sarah Young',
      department: 'Law',
      stage: 'Checked-In',
      stageColor: 'bg-blue-50 text-blue-700 border-blue-100',
      seat: '—',
      time: '1 hour ago',
      initialBg: 'bg-emerald-100 text-emerald-600',
    },
  ];

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
              <tr key={candidate.id} className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 font-label text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-bold text-primary truncate">{candidate.id}</td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4">
                  <div className="flex items-center gap-2 xs:gap-2.5 md:gap-3">
                    <div className={`w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[7px] xs:text-[8px] md:text-[10px] font-bold flex-shrink-0 ${candidate.initialBg}`}>
                      {candidate.initials}
                    </div>
                    <span className="font-body text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-medium text-on-surface truncate">{candidate.name}</span>
                  </div>
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-[8px] xs:text-[9px] sm:text-xs md:text-sm text-slate-600 hidden md:table-cell truncate">{candidate.department}</td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4">
                  <span className={`px-2 xs:px-2.5 md:px-3 py-0.5 xs:py-1 md:py-1.5 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold border uppercase tracking-tighter whitespace-nowrap text-center ${candidate.stageColor}`}>
                    {candidate.stage}
                  </span>
                </td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-label font-bold text-primary hidden sm:table-cell truncate">{candidate.seat}</td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-label text-slate-400 hidden lg:table-cell truncate">{candidate.time}</td>
                <td className="px-3 xs:px-4 md:px-6 py-2 xs:py-3 md:py-4 text-right">
                  <button className="p-1 xs:p-1.5 text-slate-400 hover:text-primary transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto rounded-lg hover:bg-surface-container-high">
                    <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3 xs:px-4 md:px-6 py-3 xs:py-4 bg-surface-container-low/30 flex flex-col xs:flex-row items-center justify-between gap-2 xs:gap-3 md:gap-4 border-t border-outline-variant/10">
        <div className="text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-label font-semibold text-slate-500 uppercase tracking-wider order-2 xs:order-1 line-clamp-1">
          Showing <span className="text-primary">1 - 6</span> of 2,482 candidates
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5 order-1 xs:order-2 flex-shrink-0">
          <button className="p-1.5 xs:p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-slate-400 hover:text-primary transition-all active:scale-95 touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto disabled:opacity-50">
            <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">chevron_left</span>
          </button>
          <div className="flex items-center gap-0.5 xs:gap-1">
            <button className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg bg-primary text-white text-[7px] xs:text-[8px] md:text-xs font-bold shadow-sm flex items-center justify-center touch-none min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto">1</button>
            <button className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg text-[7px] xs:text-[8px] md:text-xs font-bold text-slate-500 hover:bg-surface-container-high transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto">2</button>
            <button className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg text-[7px] xs:text-[8px] md:text-xs font-bold text-slate-500 hover:bg-surface-container-high transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto">3</button>
            <span className="mx-0.5 xs:mx-1 text-slate-400 text-[7px] xs:text-[8px] md:text-xs">...</span>
            <button className="w-6 xs:w-7 h-6 xs:h-7 md:w-8 md:h-8 rounded-lg text-[7px] xs:text-[8px] md:text-xs font-bold text-slate-500 hover:bg-surface-container-high transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto">414</button>
          </div>
          <button className="p-1.5 xs:p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-slate-400 hover:text-primary transition-all active:scale-95 touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto">
            <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
