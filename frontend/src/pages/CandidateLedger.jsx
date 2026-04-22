import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../components";
import CandidateStatsCard from "../components/CandidateStatsCard";
import CandidateTable from "../components/CandidateTable";
import FilterBar from "../components/FilterBar";
import { apiRequest, clearAuthSession, getAuthSession } from "../utils/api";
import { createSocketClient } from "../utils/socket";

export default function CandidateLedger({
  onMenuClick = () => {},
  onLogout = null,
}) {
  const auth = useMemo(() => getAuthSession(), []);
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [department, setDepartment] = useState("ALL");
  const [stage, setStage] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const reloadTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (reloadTimeoutRef.current) {
        window.clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!auth?.token) return;

    const socket = createSocketClient({ token: auth.token });

    socket.on("connect", () => {
      socket.emit("admin:subscribe");
    });

    socket.on("stats:updated", (nextStats) => {
      setStats(nextStats);
    });

    const scheduleReload = () => {
      if (reloadTimeoutRef.current) {
        window.clearTimeout(reloadTimeoutRef.current);
      }

      reloadTimeoutRef.current = window.setTimeout(() => {
        setReloadTick((value) => value + 1);
        reloadTimeoutRef.current = null;
      }, 250);
    };

    socket.on("scan:created", scheduleReload);
    socket.on("seating:refresh", scheduleReload);

    return () => {
      socket.disconnect();
    };
  }, [auth]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const loadStats = async () => {
      try {
        const response = await apiRequest("/api/admin/stats", {
          token: auth.token,
        });
        setStats(response);
      } catch (error) {
        const message = error.message || "Failed to load stats";
        if (
          message.toLowerCase().includes("invalid token") ||
          message.toLowerCase().includes("no token")
        ) {
          clearAuthSession();
          if (onLogout) onLogout();
        }
      }
    };

    loadStats();
  }, [auth, onLogout, reloadTick]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const loadCandidates = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "10",
          department,
          stage,
        });

        const response = await apiRequest(`/api/admin/candidates?${query}`, {
          token: auth.token,
        });

        setCandidates(response.items || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
        setDepartments(response.departments || []);
      } catch (error) {
        const message = error.message || "Failed to load candidates";
        if (
          message.toLowerCase().includes("invalid token") ||
          message.toLowerCase().includes("no token")
        ) {
          clearAuthSession();
          if (onLogout) onLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [auth, department, onLogout, page, stage, reloadTick]);

  const totalRegistered = stats?.total || 0;
  const checkedIn = stats?.checkedIn || 0;
  const gownsIssued = stats?.gownIssued || 0;
  const seated = stats?.seated || 0;
  const gownIssuedPercent = totalRegistered
    ? `${Math.round((gownsIssued / totalRegistered) * 100)}%`
    : "0%";

  const handleDepartmentChange = (value) => {
    setDepartment(value);
    setPage(1);
  };

  const handleStageChange = (value) => {
    setStage(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto md:ml-56 lg:ml-64">
      {/* Header with Hamburger Menu */}
      <Header onMenuClick={onMenuClick} onLogout={onLogout} />

      {/* Main Content */}
      <main className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 min-h-screen pb-6 sm:pb-8 md:pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 xs:gap-2 text-[7px] xs:text-[8px] sm:text-xs font-label text-slate-400 mb-2 xs:mb-3 md:mb-4 uppercase tracking-tighter">
          <span>Portal</span>
          <span className="material-symbols-outlined text-[8px] xs:text-[10px]">
            chevron_right
          </span>
          <span className="text-primary font-bold">Candidate Ledger</span>
        </nav>

        {/* Page Heading & Actions */}
        <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-1.5 xs:gap-2 md:gap-4 mb-6 xs:mb-8 md:mb-10">
          <div className="w-full">
            <h2 className="font-headline font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary tracking-tight line-clamp-2">
              Candidate Ledger & Management
            </h2>
            <p className="text-slate-500 font-body mt-0.5 xs:mt-1 md:mt-2 text-[8px] xs:text-[9px] sm:text-xs md:text-sm line-clamp-2">
              Manage {totalRegistered.toLocaleString()} candidates across{" "}
              {departments.length} academic departments.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 xs:gap-2 md:gap-3 flex-shrink-0 w-full xs:w-auto">
            <button className="flex items-center justify-center gap-1 xs:gap-1.5 flex-1 xs:flex-none px-2 xs:px-4 md:px-5 py-1.5 xs:py-2 md:py-2.5 bg-surface-container-low text-primary border border-outline-variant/20 rounded-lg md:rounded-xl font-label font-bold text-[8px] xs:text-[9px] sm:text-xs md:text-sm hover:bg-surface-container-high transition-all active:bg-surface-container-highest touch-none min-h-[44px]">
              <span className="material-symbols-outlined text-xs md:text-lg">
                upload_file
              </span>
              <span className="hidden xs:inline whitespace-nowrap">
                Export Ledger
              </span>
            </button>
            <button className="flex items-center justify-center gap-1 xs:gap-1.5 flex-1 xs:flex-none px-2 xs:px-4 md:px-5 py-1.5 xs:py-2 md:py-2.5 bg-surface-container-low text-primary border border-outline-variant/20 rounded-lg md:rounded-xl font-label font-bold text-[8px] xs:text-[9px] sm:text-xs md:text-sm hover:bg-surface-container-high transition-all active:bg-surface-container-highest touch-none min-h-[44px]">
              <span className="material-symbols-outlined text-xs md:text-lg">
                restart_alt
              </span>
              <span className="hidden xs:inline whitespace-nowrap">
                Reset State
              </span>
            </button>
            <button className="flex items-center justify-center gap-1 xs:gap-1.5 flex-1 xs:flex-none px-2 xs:px-4 md:px-6 py-1.5 xs:py-2 md:py-2.5 signature-gradient text-white rounded-lg md:rounded-xl font-label font-bold text-[8px] xs:text-[9px] sm:text-xs md:text-sm shadow-lg shadow-primary/10 hover:shadow-xl transition-all active:shadow-md touch-none min-h-[44px]">
              <span className="material-symbols-outlined text-xs md:text-lg">
                checkroom
              </span>
              <span className="hidden sm:inline whitespace-nowrap">
                Manual Issue Gown
              </span>
            </button>
          </div>
        </div>

        {/* Dashboard Bento Stats */}
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 xs:mb-5 md:mb-6 lg:mb-8">
          <CandidateStatsCard
            icon="group"
            iconBg="bg-blue-50 text-blue-600"
            label="Total Registered"
            value={totalRegistered.toLocaleString()}
            badge={isLoading ? "Loading" : "Live"}
            badgeColor="text-green-600 bg-green-50"
          />
          <CandidateStatsCard
            icon="how_to_reg"
            iconBg="bg-amber-50 text-amber-600"
            label="Checked-In"
            value={checkedIn.toLocaleString()}
          />
          <CandidateStatsCard
            icon="styler"
            iconBg="bg-purple-50 text-purple-600"
            label="Gowns Issued"
            value={gownsIssued.toLocaleString()}
            badge={gownIssuedPercent}
            badgeColor="text-purple-600"
          />
          <CandidateStatsCard
            icon="event_seat"
            iconBg="bg-emerald-50 text-emerald-600"
            label="Seated Assigned"
            value={seated.toLocaleString()}
          />
        </div>

        {/* Filters */}
        <FilterBar
          departments={departments}
          selectedDepartment={department}
          onDepartmentChange={handleDepartmentChange}
          selectedStage={stage}
          onStageChange={handleStageChange}
        />

        {/* Candidate Table */}
        <CandidateTable
          candidates={candidates}
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />

        {/* Footer Meta Info */}
        <div className="mt-6 xs:mt-7 md:mt-8 lg:mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 md:gap-6 lg:gap-8">
          <div className="bg-surface-container-lowest p-4 xs:p-5 md:p-6 lg:p-8 rounded-lg md:rounded-xl border border-dashed border-outline-variant/30 shadow-[0_4px_24px_rgba(0,31,42,0.02)]">
            <h4 className="font-headline font-bold text-[9px] xs:text-sm md:text-base text-primary mb-2 xs:mb-3 md:mb-4 flex items-center gap-1.5 xs:gap-2">
              <span className="material-symbols-outlined text-xs md:text-lg">
                info
              </span>
              <span className="line-clamp-1">Ledger Integrity Status</span>
            </h4>
            <p className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm text-slate-600 font-body leading-relaxed line-clamp-4">
              All student records are cryptographically hashed and synced with
              the university central registry. Manual overrides are logged with
              administrator timestamps. Last global sync was{" "}
              <span className="font-bold">12 minutes ago</span>.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-4 xs:p-5 md:p-6 lg:p-8 rounded-lg md:rounded-xl border border-dashed border-outline-variant/30 shadow-[0_4px_24px_rgba(0,31,42,0.02)]">
            <h4 className="font-headline font-bold text-[9px] xs:text-sm md:text-base text-primary mb-2 xs:mb-3 md:mb-4 flex items-center gap-1.5 xs:gap-2">
              <span className="material-symbols-outlined text-xs md:text-lg">
                stream
              </span>
              <span className="line-clamp-1">Live Stream Diagnostics</span>
            </h4>
            <div className="space-y-1.5 xs:space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] xs:text-[9px] md:text-xs font-label text-slate-500">
                  WebSocket Latency
                </span>
                <span className="text-[8px] xs:text-[9px] md:text-xs font-label font-bold text-green-600">
                  14ms
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1 md:h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[88%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] xs:text-[9px] md:text-xs font-label text-slate-500">
                  Update Frequency
                </span>
                <span className="text-[8px] xs:text-[9px] md:text-xs font-label font-bold text-primary">
                  2.4 updates/sec
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB Button */}
      <button className="fixed bottom-4 right-4 xs:bottom-6 md:bottom-8 md:right-8 w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 signature-gradient text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all z-40 group touch-none">
        <span className="material-symbols-outlined text-lg xs:text-xl md:text-3xl group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
      </button>
    </div>
  );
}
