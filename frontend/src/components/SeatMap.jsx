import { useState } from "react";

export default function SeatMap({ className = "" }) {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [activeSection, setActiveSection] = useState("A");

  const seatRows = {
    A: [
      { id: "A1", status: "occupied" },
      { id: "A2", status: "occupied" },
      { id: "A3", status: "reserved" },
      { id: "A4", status: "occupied" },
      null,
      { id: "A5", status: "occupied" },
      { id: "A6", status: "occupied" },
      { id: "A7", status: "occupied" },
      { id: "A8", status: "occupied" },
      null,
      { id: "A9", status: "empty" },
      { id: "A10", status: "occupied" },
    ],
    B: [
      { id: "B1", status: "occupied" },
      { id: "B2", status: "occupied" },
      { id: "B3", status: "manual" },
      { id: "B4", status: "occupied" },
      null,
      { id: "B5", status: "occupied" },
      { id: "B6", status: "occupied" },
      { id: "B7", status: "empty" },
      { id: "B8", status: "occupied" },
      null,
      { id: "B9", status: "occupied" },
      { id: "B10", status: "occupied" },
    ],
    C: [
      { id: "C1", status: "occupied" },
      { id: "C2", status: "occupied" },
      { id: "C3", status: "occupied" },
      { id: "C4", status: "empty" },
      null,
      { id: "C5", status: "occupied" },
      { id: "C6", status: "occupied" },
      { id: "C7", status: "occupied" },
      { id: "C8", status: "occupied" },
      null,
      { id: "C9", status: "empty" },
      { id: "C10", status: "empty" },
    ],
  };

  const getSeatColor = (status) => {
    switch (status) {
      case "occupied":
        return "bg-emerald-500 text-white";
      case "reserved":
        return "bg-primary-container text-white";
      case "empty":
        return "bg-surface-container border border-outline-variant/30 text-slate-400";
      case "manual":
        return "bg-error text-white ring-4 ring-error/20";
      default:
        return "bg-surface-container text-slate-400";
    }
  };

  return (
    <div
      className={`bg-surface-container-lowest rounded-lg md:rounded-xl lg:rounded-2xl p-3 xs:p-4 md:p-6 lg:p-8 shadow-[0_8px_32px_rgba(0,31,42,0.02)] border border-outline-variant/10 ${className}`}
    >
      {/* Legend */}
      <div className="flex items-center gap-1.5 xs:gap-2 md:gap-4 lg:gap-6 mb-4 xs:mb-6 md:mb-8 flex-wrap">
        <div className="flex items-center gap-1 xs:gap-2">
          <span className="w-2 xs:w-2.5 h-2 xs:h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <span className="text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">
            Occupied
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-2">
          <span className="w-2 xs:w-2.5 h-2 xs:h-2.5 rounded-full bg-primary-container flex-shrink-0"></span>
          <span className="text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">
            Reserved
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-2">
          <span className="w-2 xs:w-2.5 h-2 xs:h-2.5 rounded-full bg-surface-container border border-outline-variant/30 flex-shrink-0"></span>
          <span className="text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">
            Empty
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-2">
          <span className="w-2 xs:w-2.5 h-2 xs:h-2.5 rounded-full bg-error flex-shrink-0"></span>
          <span className="text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap hidden xs:inline">
            Flag
          </span>
        </div>

        {/* Section Buttons */}
        <div className="ml-auto flex gap-1 xs:gap-1.5 md:gap-2 flex-shrink-0">
          {["A", "B", "C"].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-2 xs:px-2.5 md:px-3 py-1 xs:py-1.5 rounded-lg text-[7px] xs:text-[8px] sm:text-xs md:text-sm font-bold transition-all touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto ${
                activeSection === section
                  ? "bg-surface-container-low text-primary"
                  : "bg-white text-slate-400 border border-outline-variant/20 hover:bg-surface-container-low"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Seat Grid Container */}
      <div className="relative bg-surface rounded-lg md:rounded-xl p-3 xs:p-4 md:p-6 lg:p-10 min-h-[300px] xs:min-h-[350px] md:min-h-[450px] lg:min-h-[500px] h-full flex flex-col items-center overflow-x-auto">
        {/* Stage */}
        <div className="w-full md:w-3/4 h-8 xs:h-10 md:h-12 bg-primary-container rounded-b-2xl md:rounded-b-3xl mb-4 xs:mb-6 md:mb-8 lg:mb-16 flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-headline font-extrabold text-white tracking-[0.2em] md:tracking-[0.3em] uppercase line-clamp-1">
            Stage
          </span>
        </div>

        {/* Seat Rows */}
        <div className="flex flex-col gap-1 xs:gap-1.5 md:gap-3 lg:gap-4">
          {[activeSection].map((rowLabel) => (
            <div
              key={rowLabel}
              className="flex gap-1 xs:gap-1.5 md:gap-2 lg:gap-3 justify-center flex-wrap"
            >
              {seatRows[rowLabel].map((seat, idx) =>
                seat ? (
                  <button
                    key={seat.id}
                    onClick={() => setSelectedSeat(seat.id)}
                    className={`w-5 h-5 xs:w-6 xs:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-[6px] xs:text-[7px] md:text-[9px] lg:text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm touch-none min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-auto md:min-w-auto ${getSeatColor(seat.status)}`}
                  >
                    {seat.id}
                  </button>
                ) : (
                  <div
                    key={`aisle-${rowLabel}-${idx}`}
                    className="w-2 xs:w-3 md:w-6 lg:w-12"
                  ></div>
                ),
              )}
            </div>
          ))}
        </div>

        {/* Background Icon */}
        <div className="absolute bottom-4 xs:bottom-6 md:bottom-8 right-4 xs:right-6 md:right-8 text-on-surface opacity-5 select-none pointer-events-none hidden md:block">
          <span className="material-symbols-outlined text-6xl md:text-7xl lg:text-8xl">
            architecture
          </span>
        </div>
      </div>

      {/* Floating Interaction Menu */}
      {selectedSeat && (
        <div className="fixed bottom-20 xs:bottom-24 md:bottom-8 left-4 right-4 xs:left-auto xs:right-auto md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2 bg-primary-container text-white px-3 xs:px-4 md:px-6 py-3 xs:py-4 rounded-lg md:rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 xs:gap-3 md:gap-6 border border-white/10 backdrop-blur-xl z-10 touch-none">
          <div className="flex flex-col text-center md:text-left">
            <span className="text-[8px] xs:text-[9px] md:text-[10px] font-bold text-on-primary-container uppercase tracking-widest">
              Selected
            </span>
            <span className="text-xs xs:text-sm md:text-base font-bold">
              {selectedSeat}
            </span>
          </div>
          <div className="hidden md:block h-8 w-px bg-white/10"></div>
          <div className="flex gap-1 xs:gap-2 md:gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-initial flex items-center justify-center gap-1 xs:gap-2 text-[8px] xs:text-[9px] md:text-xs font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap touch-none min-h-[44px] md:min-h-auto">
              <span className="material-symbols-outlined text-xs md:text-sm">
                swap_horiz
              </span>
              <span className="hidden sm:inline">Reassign</span>
            </button>
            <button className="flex-1 md:flex-initial flex items-center justify-center gap-1 xs:gap-2 text-[8px] xs:text-[9px] md:text-xs font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 bg-error text-white hover:opacity-90 rounded-lg transition-colors whitespace-nowrap touch-none min-h-[44px] md:min-h-auto">
              <span className="material-symbols-outlined text-xs md:text-sm">
                warning
              </span>
              <span className="hidden sm:inline">Override</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
