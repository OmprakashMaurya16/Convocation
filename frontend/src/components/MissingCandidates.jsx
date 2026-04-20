export default function MissingCandidates() {
  const candidates = [
    {
      initials: 'MA',
      name: 'Marcus Aurelius',
      id: '#C2024-098',
      location: 'Gate 4',
      time: '12m ago',
      color: 'bg-primary-fixed-dim text-primary',
      type: 'normal',
    },
    {
      initials: 'ER',
      name: 'Elena Rodriguez',
      id: '#C2024-112',
      location: 'Main Hall',
      time: '5m ago',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdI9tHV-EC6wxDxk2SuoOSl7yHjhdOOvWDJWmiztTFizWGuW58bZlGbtqqdP1Iv0dpU20GPJwYdFU_w5o0S9AKbgqtJmoaeWdNT70BqhRMwnptahM7d-UFnpR7Pg9RJXFDIesl-ggbQbobBMgJFTccouR77WtFguYYMZEtowo_JCjww5YvwJ5t9iznqBNSusx2EIWUilE7xasZD2qRpwloht6DNgXsLnFQ68yFXKO0nB2eN60AFW6TzbPEwIVTSC8f19p4G9fQndQ',
      color: '',
      type: 'normal',
    },
    {
      initials: 'SK',
      name: 'Sarah Kinsley',
      id: '#C2024-441',
      location: '',
      time: '22m ago',
      color: 'bg-error text-white',
      type: 'critical',
    },
    {
      initials: 'JB',
      name: 'James Bennett',
      id: '#C2024-882',
      location: 'Gate 1',
      time: '2m ago',
      color: 'bg-slate-200 text-slate-500',
      type: 'normal',
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col shadow-sm border border-outline-variant/10 flex-grow max-h-[500px] xs:max-h-[550px] md:max-h-[600px]">
      {/* Header */}
      <div className="p-3 xs:p-4 md:p-5 lg:p-6 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
        <div className="flex-grow min-w-0">
          <h3 className="font-headline font-bold text-xs xs:text-sm md:text-base lg:text-lg text-primary flex items-center gap-1 xs:gap-2 line-clamp-1">
            <span className="material-symbols-outlined text-xs xs:text-sm md:text-base">person_search</span>
            <span className="line-clamp-1">Missing</span>
          </h3>
          <p className="text-[7px] xs:text-[8px] sm:text-xs text-slate-500 mt-0.5">48 candidates</p>
        </div>
        <button className="p-1.5 xs:p-2 text-primary-container bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors flex-shrink-0 touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto">
          <span className="material-symbols-outlined text-xs md:text-base">filter_list</span>
        </button>
      </div>

      {/* Candidates List */}
      <div className="overflow-y-auto p-2 xs:p-3 md:p-4 space-y-1.5 xs:space-y-2 md:space-y-3">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`p-2 xs:p-3 rounded-lg md:rounded-xl flex items-center gap-1.5 xs:gap-2 transition-colors ${
              candidate.type === 'critical'
                ? 'bg-error-container/30 border border-error/10'
                : 'bg-surface hover:bg-surface-container border border-transparent hover:border-outline-variant/20'
            }`}
          >
            {candidate.image ? (
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-8 xs:w-9 h-8 xs:h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className={`w-8 xs:w-9 h-8 xs:h-9 rounded-full flex items-center justify-center font-bold text-[7px] xs:text-xs flex-shrink-0 ${candidate.color}`}>
                {candidate.initials}
              </div>
            )}

            <div className="flex-grow min-w-0">
              <p className="text-[8px] xs:text-[9px] sm:text-xs font-bold text-primary line-clamp-1">{candidate.name}</p>
              <p className="text-[7px] xs:text-[8px] text-slate-500 line-clamp-1">{candidate.id}</p>
            </div>

            <div className="text-right flex-shrink-0">
              {candidate.type === 'critical' ? (
                <span className="px-1 xs:px-2 py-0.5 rounded-full bg-error text-white text-[7px] xs:text-[8px] font-bold uppercase block mb-0.5 whitespace-nowrap">
                  Critical
                </span>
              ) : (
                <p className="text-[7px] xs:text-[8px] font-bold text-tertiary line-clamp-1">{candidate.location}</p>
              )}
              <p className="text-[7px] text-slate-400 whitespace-nowrap">{candidate.time}</p>
            </div>

            <button className="p-1.5 xs:p-2 text-primary hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto">
              <span className="material-symbols-outlined text-sm xs:text-base md:text-lg">near_me</span>
            </button>
          </div>
        ))}
      </div>

      {/* View Full List Button */}
      <button className="m-2 xs:m-3 md:m-4 p-2 xs:p-3 rounded-lg md:rounded-xl bg-surface-container-low text-primary-container font-label text-[8px] xs:text-[9px] sm:text-xs font-bold hover:bg-primary-container hover:text-white transition-all active:bg-primary-container/90 touch-none min-h-[44px] flex items-center justify-center mt-auto flex-shrink-0">
        View Full List
      </button>
    </div>
  );
}
