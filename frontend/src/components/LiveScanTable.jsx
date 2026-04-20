export default function LiveScanTable() {
  const scanData = [
    { time: '14:22:15', id: 'SC-2024-8812', name: 'Amara Okafor', stage: 'Gown Issued', location: 'Counter A-2' },
    { time: '14:22:02', id: 'SC-2024-4109', name: 'Daniel Schmidt', stage: 'Checked-In', location: 'Gate 4' },
    { time: '14:21:48', id: 'SC-2024-2234', name: 'Hiroki Sato', stage: 'Seated', location: 'Hall South' },
    { time: '14:21:10', id: 'SC-2024-9003', name: 'Elena Rodriguez', stage: 'Gown Issued', location: 'Counter B-1' },
    { time: '14:20:55', id: 'SC-2024-1120', name: 'Julian Thorne', stage: 'Checked-In', location: 'Gate 1' },
  ];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Gown Issued':
        return 'bg-secondary-container text-on-secondary-container';
      case 'Checked-In':
        return 'bg-surface-container-highest text-on-surface-variant';
      case 'Seated':
        return 'bg-surface-tint/20 text-on-primary-fixed-variant';
      default:
        return 'bg-surface-container-lowest';
    }
  };

  return (
    <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-lg md:rounded-xl overflow-hidden">
      <div className="p-2 xs:p-3 sm:p-4 md:p-6 border-b border-outline-variant/10 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-3 md:gap-4">
        <h4 className="font-headline font-bold text-xs xs:text-sm md:text-base text-on-surface">Live Scan Stream</h4>
        <button className="text-primary text-[8px] xs:text-[9px] sm:text-xs font-bold font-label flex items-center gap-1 hover:opacity-80 transition active:opacity-70 touch-none min-h-[44px] min-w-[44px] px-2 py-1.5">
          <span className="material-symbols-outlined text-base xs:text-lg">filter_list</span>
          <span className="hidden xs:inline">Filter</span>
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-1.5 xs:space-y-2 p-2 xs:p-3">
        {scanData.map((row, idx) => (
          <div key={idx} className="bg-surface-container-low p-2 xs:p-3 rounded-lg border border-outline-variant/20 touch-target active:bg-surface-container-highest transition">
            <div className="flex justify-between items-start gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] xs:text-[10px] text-on-surface-variant font-label mb-0.5 xs:mb-1">{row.time}</p>
                <p className="font-bold text-primary text-xs xs:text-sm truncate">{row.id}</p>
                <p className="text-xs xs:text-sm text-on-surface font-medium truncate mt-0.5 xs:mt-1">{row.name}</p>
              </div>
              <span className={`px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] font-bold uppercase whitespace-nowrap flex-shrink-0 ${getStageColor(row.stage)}`}>
                {row.stage.split(' ')[0]}
              </span>
            </div>
            <p className="text-[8px] xs:text-[9px] text-on-surface-variant truncate">{row.location}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-[9px] xs:text-[10px] uppercase tracking-widest text-on-surface-variant font-label">
              <th className="px-2 xs:px-3 md:px-6 py-2 xs:py-3">Timestamp</th>
              <th className="px-2 xs:px-3 md:px-6 py-2 xs:py-3">Student ID</th>
              <th className="px-2 xs:px-3 md:px-6 py-2 xs:py-3 hidden sm:table-cell">Name</th>
              <th className="px-2 xs:px-3 md:px-6 py-2 xs:py-3">Stage</th>
              <th className="px-2 xs:px-3 md:px-6 py-2 xs:py-3 text-right hidden lg:table-cell">Location</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm font-body">
            {scanData.map((row, idx) => (
              <tr key={idx} className="border-b border-outline-variant/5 hover:bg-surface-container-low/30 transition-colors active:bg-surface-container-low">
                <td className="px-2 xs:px-3 md:px-6 py-2 xs:py-3 text-on-surface-variant font-label text-[8px] xs:text-xs">{row.time}</td>
                <td className="px-2 xs:px-3 md:px-6 py-2 xs:py-3 font-bold text-primary text-xs sm:text-sm">{row.id}</td>
                <td className="px-2 xs:px-3 md:px-6 py-2 xs:py-3 font-medium text-on-surface hidden sm:table-cell text-xs sm:text-sm">{row.name}</td>
                <td className="px-2 xs:px-3 md:px-6 py-2 xs:py-3">
                  <span className={`px-1.5 xs:px-2 py-0.5 rounded-full text-[8px] xs:text-[9px] font-bold uppercase whitespace-nowrap ${getStageColor(row.stage)}`}>
                    {row.stage}
                  </span>
                </td>
                <td className="px-2 xs:px-3 md:px-6 py-2 xs:py-3 text-right text-on-surface-variant hidden lg:table-cell text-xs sm:text-sm">{row.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
