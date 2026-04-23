import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header, StatsCard } from "../components";
import SeatMap from "../components/SeatMap";
import { apiRequest, clearAuthSession, getAuthSession } from "../utils/api";
import { createSocketClient } from "../utils/socket";

export default function SeatingArchitecture({
  onMenuClick = () => {},
  onLogout = null,
}) {
  // Derived from the rendered seat map layout:
  // Front A–I: 9 rows * 17 = 153
  // Sides J–O: 6 rows * (5 left + 5 right) = 60
  // Rear P–R: 3 rows * 17 = 51
  // Total = 264
  const HALL_CAPACITY = 264;

  const auth = useMemo(() => getAuthSession(), []);
  const [isResetting, setIsResetting] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [resetNote, setResetNote] = useState("");
  const resetArmTimeoutRef = useRef(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const [stats, setStats] = useState(null);
  const [seatStatusById, setSeatStatusById] = useState(null);
  const [seatInfoById, setSeatInfoById] = useState(null);

  useEffect(() => {
    return () => {
      if (resetArmTimeoutRef.current) {
        window.clearTimeout(resetArmTimeoutRef.current);
        resetArmTimeoutRef.current = null;
      }
    };
  }, []);

  const loadSeatingData = useCallback(async () => {
    if (!auth?.token) return;

    try {
      const [statsResponse, occupancyResponse] = await Promise.all([
        apiRequest("/api/admin/stats", { token: auth.token }),
        apiRequest("/api/admin/seat-occupancy", { token: auth.token }),
      ]);

      setStats(statsResponse);

      if (
        occupancyResponse?.seatStudentById &&
        typeof occupancyResponse.seatStudentById === "object"
      ) {
        setSeatInfoById(occupancyResponse.seatStudentById);
      } else {
        setSeatInfoById(null);
      }

      if (
        occupancyResponse?.seatStatusById &&
        typeof occupancyResponse.seatStatusById === "object"
      ) {
        setSeatStatusById(occupancyResponse.seatStatusById);
      } else {
        const occupied = Array.isArray(occupancyResponse?.occupied)
          ? occupancyResponse.occupied
          : [];

        const nextSeatStatus = {};
        for (const seatId of occupied) {
          if (seatId) nextSeatStatus[String(seatId)] = "occupied";
        }
        setSeatStatusById(nextSeatStatus);
      }
    } catch (error) {
      const message = error.message || "Failed to load seating data";
      setResetNote(message);

      if (
        message.toLowerCase().includes("invalid token") ||
        message.toLowerCase().includes("no token")
      ) {
        clearAuthSession();
        if (onLogout) onLogout();
      }
    }
  }, [auth, onLogout]);

  useEffect(() => {
    if (!auth?.token) return;

    const timeoutId = window.setTimeout(() => {
      loadSeatingData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [auth, loadSeatingData]);

  useEffect(() => {
    if (!auth?.token) return;

    const socket = createSocketClient({ token: auth.token });

    socket.on("connect", () => {
      socket.emit("admin:subscribe");
    });

    socket.on("seating:seatAssigned", (payload) => {
      const seatId = payload?.seatId;
      if (!seatId) return;

      setSeatStatusById((previous) => ({
        ...(previous || {}),
        [String(seatId)]: payload?.seatStatus || "reserved",
      }));

      if (payload?.student && typeof payload.student === "object") {
        setSeatInfoById((previous) => ({
          ...(previous || {}),
          [String(seatId)]: payload.student,
        }));
      }
    });

    socket.on("seating:seatConfirmed", (payload) => {
      const seatId = payload?.seatId;
      if (!seatId) return;

      setSeatStatusById((previous) => ({
        ...(previous || {}),
        [String(seatId)]: payload?.seatStatus || "occupied",
      }));

      if (payload?.student && typeof payload.student === "object") {
        setSeatInfoById((previous) => ({
          ...(previous || {}),
          [String(seatId)]: payload.student,
        }));
      }
    });

    socket.on("seating:refresh", () => {
      loadSeatingData();
    });

    socket.on("stats:updated", (nextStats) => {
      setStats(nextStats);
    });

    return () => {
      socket.disconnect();
    };
  }, [auth, loadSeatingData]);

  const handleSeatOverride = useCallback(
    async (seatId, status) => {
      if (!auth?.token) return;

      try {
        await apiRequest("/api/admin/seat-overrides", {
          method: "POST",
          token: auth.token,
          body: {
            seatId,
            status,
          },
        });

        await loadSeatingData();
      } catch (error) {
        const message = error.message || "Failed to update seat";
        setResetNote(message);

        if (
          message.toLowerCase().includes("invalid token") ||
          message.toLowerCase().includes("no token")
        ) {
          clearAuthSession();
          if (onLogout) onLogout();
        }
      }
    },
    [auth, loadSeatingData, onLogout],
  );

  const handleResetSeats = async () => {
    if (isResetting) return;

    if (!resetArmed) {
      setResetNote("Click again to confirm reset.");
      setResetArmed(true);

      if (resetArmTimeoutRef.current) {
        window.clearTimeout(resetArmTimeoutRef.current);
      }

      resetArmTimeoutRef.current = window.setTimeout(() => {
        setResetArmed(false);
        setResetNote("");
        resetArmTimeoutRef.current = null;
      }, 4000);

      return;
    }

    setResetNote("");
    setResetArmed(false);

    if (!auth?.token) {
      setResetNote("Session expired. Please login again.");
      clearAuthSession();
      if (onLogout) onLogout();
      return;
    }

    try {
      setIsResetting(true);
      const response = await apiRequest("/api/admin/reset-seats", {
        method: "POST",
        token: auth.token,
      });

      const cleared = response?.clearedSeats ?? 0;
      const clearedOverrides = response?.clearedOverrides ?? 0;
      setResetNote(
        `Reset complete. Cleared seats: ${cleared}. Overrides cleared: ${clearedOverrides}.`,
      );

      await loadSeatingData();
    } catch (error) {
      const message = error.message || "Failed to reset seats";
      setResetNote(message);

      if (
        message.toLowerCase().includes("invalid token") ||
        message.toLowerCase().includes("no token")
      ) {
        clearAuthSession();
        if (onLogout) onLogout();
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) return;

    if (!auth?.token) {
      setResetNote("Session expired. Please login again.");
      clearAuthSession();
      if (onLogout) onLogout();
      return;
    }

    try {
      setIsDownloading(true);
      setResetNote("Preparing report…");

      const report = await apiRequest("/api/admin/seating-report", {
        token: auth.token,
      });

      const rows = Array.isArray(report?.items) ? report.items : [];

      const escapeHtml = (value) =>
        String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");

      const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Seating Report</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
      h1 { margin: 0 0 6px; font-size: 18px; }
      .meta { margin: 0 0 14px; font-size: 12px; color: #6B7280; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #E5E7EB; padding: 8px 10px; font-size: 12px; text-align: left; }
      th { background: #F9FAFB; }
      @media print { body { padding: 0; } .meta { margin-bottom: 10px; } }
    </style>
  </head>
  <body>
    <h1>Seating Allocation Report</h1>
    <p class="meta">Generated: ${escapeHtml(report?.generatedAt || new Date().toISOString())} • Total: ${escapeHtml(report?.count ?? rows.length)}</p>
    <table>
      <thead>
        <tr>
          <th style="width: 38px;">#</th>
          <th>Name</th>
          <th style="width: 120px;">Roll No</th>
          <th style="width: 90px;">Seat</th>
          <th style="width: 110px;">Department</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.rollno)}</td>
            <td>${escapeHtml(row.seat)}</td>
            <td>${escapeHtml(row.department)}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <script>
      window.onload = () => {
        window.focus();
        window.print();
      };
    </script>
  </body>
</html>`;

      const popup = window.open("", "_blank");
      if (!popup) {
        setResetNote(
          "Popup blocked. Allow popups to download the PDF (print-to-PDF).",
        );
        return;
      }

      popup.document.open();
      popup.document.write(html);
      popup.document.close();

      setResetNote("");
    } catch (error) {
      const message = error.message || "Failed to prepare report";
      setResetNote(message);

      if (
        message.toLowerCase().includes("invalid token") ||
        message.toLowerCase().includes("no token")
      ) {
        clearAuthSession();
        if (onLogout) onLogout();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col h-screen overflow-y-auto md:ml-56 lg:ml-64">
      {/* Header with Hamburger Menu */}
      <Header onMenuClick={onMenuClick} onLogout={onLogout} />

      {/* Page Title & Stats */}
      <div className="px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 md:py-5 border-b border-outline-variant/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline font-extrabold text-sm xs:text-base sm:text-lg md:text-2xl lg:text-3xl text-primary tracking-tight line-clamp-1">
              Seating Architecture
            </h2>
            <p className="text-on-surface-variant mt-0.5 xs:mt-1 text-[9px] xs:text-[10px] sm:text-xs md:text-sm line-clamp-1">
              Real-time occupancy for Grand Hall A & B.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className={`flex items-center justify-center gap-1 xs:gap-1.5 px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 rounded-lg md:rounded-xl font-label font-bold text-[8px] xs:text-[9px] sm:text-xs md:text-sm shadow-sm border transition-all touch-none min-h-[44px] bg-white text-slate-600 border-outline-variant/20 hover:bg-surface-container-low ${
                  isDownloading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <span className="material-symbols-outlined text-xs md:text-base">
                  download
                </span>
                <span className="whitespace-nowrap">
                  {isDownloading ? "Preparing…" : "Download PDF"}
                </span>
              </button>

              <button
                onClick={handleResetSeats}
                disabled={isResetting}
                className={`flex items-center justify-center gap-1 xs:gap-1.5 px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 rounded-lg md:rounded-xl font-label font-bold text-[8px] xs:text-[9px] sm:text-xs md:text-sm shadow-sm border transition-all touch-none min-h-[44px] ${
                  resetArmed
                    ? "bg-error text-white border-error/30"
                    : "bg-white text-slate-600 border-outline-variant/20 hover:bg-surface-container-low"
                } ${isResetting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span className="material-symbols-outlined text-xs md:text-base">
                  restart_alt
                </span>
                <span className="whitespace-nowrap">
                  {isResetting
                    ? "Resetting…"
                    : resetArmed
                      ? "Confirm Reset"
                      : "Reset Seats"}
                </span>
              </button>
            </div>
            {resetNote ? (
              <span className="text-[8px] xs:text-[9px] sm:text-xs text-on-surface-variant text-right max-w-[240px]">
                {resetNote}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 xs:gap-2 md:gap-3 w-full mt-2 xs:mt-3 md:mt-4">
          <StatsCard
            label="Capacity"
            value={HALL_CAPACITY.toLocaleString()}
            color="primary"
          />
          <StatsCard
            label="Seated"
            value={stats?.seated ? stats.seated.toLocaleString() : "—"}
            color="emerald"
          />
          <StatsCard
            label="Pending"
            value={stats?.checkedIn ? stats.checkedIn.toLocaleString() : "—"}
            color="tertiary"
          />
          <StatsCard
            label="Occupancy"
            value={`${(((stats?.seated || 0) / HALL_CAPACITY) * 100 || 0).toFixed(1)}%`}
            color="primary"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 min-h-0 pb-6 sm:pb-8 md:pb-12">
        <div className="h-full min-h-[520px]">
          <SeatMap
            className="h-full"
            seatStatusById={seatStatusById}
            seatInfoById={seatInfoById}
            onSeatStatusChange={handleSeatOverride}
          />
        </div>
      </main>

      {/* FAB Button */}
      <button className="fixed bottom-4 right-4 xs:bottom-6 md:bottom-8 md:right-8 w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-[0_12px_48px_rgba(0,31,42,0.3)] hover:scale-105 transition-transform group z-40 touch-none">
        <span className="material-symbols-outlined text-sm xs:text-base md:text-xl lg:text-2xl transition-transform group-hover:rotate-12">
          qr_code_scanner
        </span>
        <span className="absolute right-14 xs:right-16 md:right-20 bg-primary text-white text-[8px] xs:text-xs md:text-sm font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl hidden sm:block">
          Scan
        </span>
      </button>
    </div>
  );
}
