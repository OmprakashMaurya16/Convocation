import { useMemo, useState } from "react";

export default function SeatMap({
  className = "",
  seatStatusById = null,
  seatInfoById = null,
  onSeatStatusChange = null,
}) {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const FRONT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  const SIDE_ROWS = ["J", "K", "L", "M", "N", "O"];
  const BACK_ROWS = ["P", "Q", "R"];

  const normalizedSeatStatusById = useMemo(() => {
    if (!seatStatusById || typeof seatStatusById !== "object") return null;
    return seatStatusById;
  }, [seatStatusById]);

  const normalizedSeatInfoById = useMemo(() => {
    if (!seatInfoById || typeof seatInfoById !== "object") return null;
    return seatInfoById;
  }, [seatInfoById]);

  const hashSeatId = (seatId) => {
    let hash = 0;
    for (let index = 0; index < seatId.length; index += 1) {
      hash = (hash * 31 + seatId.charCodeAt(index)) % 100000;
    }
    return hash;
  };

  // NOTE: Status is currently a deterministic placeholder so the map is usable
  // before real seat-occupancy data is wired in.
  const getSeatStatus = (seatId) => {
    if (normalizedSeatStatusById) {
      return normalizedSeatStatusById[seatId] || "empty";
    }

    const hash = hashSeatId(seatId);
    if (hash % 23 === 0) return "manual";
    if (hash % 7 === 0) return "reserved";
    if (hash % 3 === 0) return "occupied";
    return "empty";
  };

  const buildSeat = (row, number) => {
    const id = `${row}${number}`;
    return { id, status: getSeatStatus(id) };
  };

  const formatSeatLabel = (seatId) =>
    String(seatId || "").replace(/^([A-Z]+)(\d+)$/, "$1-$2");

  const getSeatTooltip = (seatId, status) => {
    const label = formatSeatLabel(seatId);

    if (status === "occupied" && normalizedSeatInfoById?.[seatId]) {
      const info = normalizedSeatInfoById[seatId];
      const lines = [
        `Seat: ${label}`,
        `Status: Occupied`,
        info.name ? `Name: ${info.name}` : null,
        info.studentId ? `ID: ${info.studentId}` : null,
        info.department ? `Department: ${info.department}` : null,
        info.phone ? `Phone: ${info.phone}` : null,
        info.email ? `Email: ${info.email}` : null,
        info.state ? `State: ${info.state}` : null,
      ].filter(Boolean);
      return lines.join("\n");
    }

    if (status === "reserved") {
      return `Seat: ${label}\nStatus: Reserved`;
    }

    if (status === "manual") {
      return `Seat: ${label}\nStatus: Flagged`;
    }

    return `Seat: ${label}\nStatus: Empty`;
  };

  const buildRow = (row, count, startNumber = 1) =>
    Array.from({ length: count }, (_, idx) =>
      buildSeat(row, startNumber + idx),
    );

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
      </div>

      {/* Seat Grid Container */}
      <div className="relative bg-surface rounded-lg md:rounded-xl p-3 xs:p-4 md:p-6 lg:p-10 min-h-[300px] xs:min-h-[350px] md:min-h-[450px] lg:min-h-[500px] h-full flex flex-col items-center overflow-x-auto">
        {/* Stage */}
        <div className="w-full md:w-3/4 h-8 xs:h-10 md:h-12 bg-primary-container rounded-b-2xl md:rounded-b-3xl mb-4 xs:mb-6 md:mb-8 lg:mb-16 flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-headline font-extrabold text-white tracking-[0.2em] md:tracking-[0.3em] uppercase line-clamp-1">
            Stage
          </span>
        </div>

        <div className="flex flex-col items-center w-full [--seat-size:20px] xs:[--seat-size:24px] md:[--seat-size:28px] lg:[--seat-size:32px]">
          {/* Front Block (A–I, 1–17) */}
          <div className="flex flex-col gap-1.5 xs:gap-2 md:gap-2.5 lg:gap-3">
            {FRONT_ROWS.map((row) => (
              <div
                key={row}
                className="grid gap-1 xs:gap-1.5 md:gap-2 place-items-center"
                style={{
                  gridTemplateColumns: "repeat(17, var(--seat-size))",
                }}
              >
                {buildRow(row, 17).map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => setSelectedSeat(seat.id)}
                    title={getSeatTooltip(seat.id, seat.status)}
                    className={`w-[var(--seat-size)] h-[var(--seat-size)] rounded-lg flex items-center justify-center text-[6px] xs:text-[7px] md:text-[9px] lg:text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm touch-none ${getSeatColor(seat.status)}`}
                  >
                    {seat.id}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Spacing between blocks */}
          <div className="h-6 xs:h-8 md:h-12 lg:h-16" />

          {/* Back Blocks (J–O sides + EXIT + P–R rear rows) */}
          <div className="flex flex-col items-center gap-4 xs:gap-6 md:gap-8 lg:gap-10">
            <div
              className="grid gap-4 xs:gap-6 md:gap-10 items-start"
              style={{ gridTemplateColumns: "auto auto auto" }}
            >
              {/* Left Side (J–O, 1–5) */}
              <div className="flex flex-col gap-1.5 xs:gap-2 md:gap-2.5">
                {SIDE_ROWS.map((row) => (
                  <div
                    key={`left-${row}`}
                    className="grid gap-1 xs:gap-1.5 md:gap-2 place-items-center"
                    style={{
                      gridTemplateColumns: "repeat(5, var(--seat-size))",
                    }}
                  >
                    {buildRow(row, 5, 1).map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => setSelectedSeat(seat.id)}
                        title={getSeatTooltip(seat.id, seat.status)}
                        className={`w-[var(--seat-size)] h-[var(--seat-size)] rounded-lg flex items-center justify-center text-[6px] xs:text-[7px] md:text-[9px] lg:text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm touch-none ${getSeatColor(seat.status)}`}
                      >
                        {seat.id}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Exit Block */}
              <div className="flex items-center justify-center">
                <div className="bg-primary-container text-white flex items-center justify-center rounded-xl shadow-lg w-[calc(var(--seat-size)*6)] h-[calc(var(--seat-size)*6)]">
                  <span className="text-[10px] xs:text-xs md:text-sm font-headline font-extrabold tracking-widest">
                    EXIT
                  </span>
                </div>
              </div>

              {/* Right Side (J–O, 13–17) */}
              <div className="flex flex-col gap-1.5 xs:gap-2 md:gap-2.5">
                {SIDE_ROWS.map((row) => (
                  <div
                    key={`right-${row}`}
                    className="grid gap-1 xs:gap-1.5 md:gap-2 place-items-center"
                    style={{
                      gridTemplateColumns: "repeat(5, var(--seat-size))",
                    }}
                  >
                    {buildRow(row, 5, 13).map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => setSelectedSeat(seat.id)}
                        title={getSeatTooltip(seat.id, seat.status)}
                        className={`w-[var(--seat-size)] h-[var(--seat-size)] rounded-lg flex items-center justify-center text-[6px] xs:text-[7px] md:text-[9px] lg:text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm touch-none ${getSeatColor(seat.status)}`}
                      >
                        {seat.id}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Rear Rows (P–R, 1–17 no gap) */}
            <div className="flex flex-col gap-1.5 xs:gap-2 md:gap-2.5">
              {BACK_ROWS.map((row) => (
                <div
                  key={`rear-${row}`}
                  className="grid gap-1 xs:gap-1.5 md:gap-2 place-items-center"
                  style={{
                    gridTemplateColumns: "repeat(17, var(--seat-size))",
                  }}
                >
                  {buildRow(row, 17, 1).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => setSelectedSeat(seat.id)}
                      title={getSeatTooltip(seat.id, seat.status)}
                      className={`w-[var(--seat-size)] h-[var(--seat-size)] rounded-lg flex items-center justify-center text-[6px] xs:text-[7px] md:text-[9px] lg:text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm touch-none ${getSeatColor(seat.status)}`}
                    >
                      {seat.id}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
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
            <button
              type="button"
              onClick={() => {
                onSeatStatusChange?.(selectedSeat, "reserved");
                setSelectedSeat(null);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1 xs:gap-2 text-[8px] xs:text-[9px] md:text-xs font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap touch-none min-h-[44px] md:min-h-auto"
            >
              <span className="material-symbols-outlined text-xs md:text-sm">
                event_seat
              </span>
              <span className="hidden sm:inline">Reserve</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSeatStatusChange?.(selectedSeat, "manual");
                setSelectedSeat(null);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1 xs:gap-2 text-[8px] xs:text-[9px] md:text-xs font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 bg-error text-white hover:opacity-90 rounded-lg transition-colors whitespace-nowrap touch-none min-h-[44px] md:min-h-auto"
            >
              <span className="material-symbols-outlined text-xs md:text-sm">
                warning
              </span>
              <span className="hidden sm:inline">Flag</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSeatStatusChange?.(selectedSeat, "empty");
                setSelectedSeat(null);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1 xs:gap-2 text-[8px] xs:text-[9px] md:text-xs font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap touch-none min-h-[44px] md:min-h-auto"
            >
              <span className="material-symbols-outlined text-xs md:text-sm">
                close
              </span>
              <span className="hidden sm:inline">Empty</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
