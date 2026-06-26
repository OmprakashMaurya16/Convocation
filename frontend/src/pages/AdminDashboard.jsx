import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  Header,
  AnalyticsCard,
  DepartmentChart,
  GownLogistics,
  LiveScanTable,
  Footer,
} from "../components";
import SeatingArchitecture from "./SeatingArchitecture";
import CandidateLedger from "./CandidateLedger";
import StudentManager from "./StudentManager";
import { apiRequest, clearAuthSession, getAuthSession } from "../utils/api";
import { createSocketClient } from "../utils/socket";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const auth = useMemo(() => getAuthSession(), []);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [liveScans, setLiveScans] = useState([]);
  const [statsError, setStatsError] = useState("");
  const [adminActionMessage, setAdminActionMessage] = useState("");
  const [adminActionError, setAdminActionError] = useState("");
  const [isResettingEvent, setIsResettingEvent] = useState(false);
  const [departmentRefreshKey, setDepartmentRefreshKey] = useState(0);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  const handleResetEvent = async () => {
    if (!auth?.token) return;

    setIsResettingEvent(true);
    setAdminActionMessage("");
    setAdminActionError("");

    try {
      await apiRequest("/api/admin/reset-event", {
        method: "POST",
        token: auth.token,
      });

      setAdminActionMessage(
        "Event reset: a new session window started. Only registrations after this reset will be counted (no data deleted).",
      );
    } catch (error) {
      setAdminActionError(error.message || "Failed to reset event");
    } finally {
      setIsResettingEvent(false);
    }
  };

  useEffect(() => {
    if (!auth?.token || auth?.role !== "ADMIN") {
      navigate("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const [statsResponse, liveScanResponse] = await Promise.all([
          apiRequest("/api/admin/stats", {
            token: auth.token,
          }),
          apiRequest("/api/admin/live-scans", {
            token: auth.token,
          }),
        ]);

        setStats(statsResponse);
        setLiveScans(liveScanResponse?.scans || []);
      } catch (error) {
        const message = error.message || "Failed to load dashboard stats";
        setStatsError(message);

        if (
          message.toLowerCase().includes("invalid token") ||
          message.toLowerCase().includes("no token")
        ) {
          clearAuthSession();
          navigate("/");
        }
      }
    };

    fetchStats();
  }, [auth, navigate]);

  useEffect(() => {
    if (!auth?.token || auth?.role !== "ADMIN") {
      return;
    }

    const socket = createSocketClient({ token: auth.token });

    const fetchStatsForRefresh = async () => {
      try {
        const [statsResponse, liveScanResponse] = await Promise.all([
          apiRequest("/api/admin/stats", {
            token: auth.token,
          }),
          apiRequest("/api/admin/live-scans", {
            token: auth.token,
          }),
        ]);

        setStats(statsResponse);
        setLiveScans(liveScanResponse?.scans || []);
      } catch (error) {
        const message = error.message || "Failed to load dashboard stats";
        setStatsError(message);
        if (
          message.toLowerCase().includes("invalid token") ||
          message.toLowerCase().includes("no token")
        ) {
          clearAuthSession();
          navigate("/");
        }
      }
    };

    socket.on("connect", () => {
      socket.emit("admin:subscribe");
    });

    socket.on("admin:subscribed", (data) => {});

    socket.on("scan:created", (scan) => {
      setLiveScans((previous) => [scan, ...previous].slice(0, 20));
    });

    socket.on("stats:updated", (nextStats) => {
      setStats(nextStats);
    });

    socket.on("department-stats:refresh", () => {
      setDepartmentRefreshKey((value) => value + 1);
    });

    socket.on("seating:refresh", () => {
      // On reset event or major seating change, reload all data
      setLiveScans([]);
      fetchStatsForRefresh();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {});

    return () => {
      socket.disconnect();
    };
  }, [auth, navigate]);

  const total = stats?.total || 0;

  const toPercent = (value) => {
    if (!total) return "0.0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const analyticsData = [
    {
      title: "Total Registered",
      value: total.toLocaleString(),
      percentage: "100%",
      color: "primary",
    },
    {
      title: "Checked-in",
      value: (stats?.checkedIn || 0).toLocaleString(),
      percentage: toPercent(stats?.checkedIn || 0),
      color: "secondary",
    },
    {
      title: "Seat Allocated",
      value: (stats?.seatAllocated || 0).toLocaleString(),
      percentage: toPercent(stats?.seatAllocated || 0),
      color: "surface-tint",
    },
    {
      title: "Robes Issued",
      value: (stats?.gownIssued || 0).toLocaleString(),
      percentage: toPercent(stats?.gownIssued || 0),
      color: "tertiary-container",
    },
    {
      title: "Robe Return",
      value: (stats?.completed || 0).toLocaleString(),
      percentage: toPercent(stats?.completed || 0),
      color: "error",
    },
  ];

  // Render different pages based on activePage
  if (activePage === "seating") {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
        <Sidebar
          activeItem={activePage}
          setActiveItem={setActivePage}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <SeatingArchitecture
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  if (activePage === "candidate") {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
        <Sidebar
          activeItem={activePage}
          setActiveItem={setActivePage}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <CandidateLedger
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  if (activePage === "students") {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
        <Sidebar
          activeItem={activePage}
          setActiveItem={setActivePage}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <StudentManager
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // Default: Dashboard
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        activeItem={activePage}
        setActiveItem={setActivePage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col w-full h-screen overflow-y-auto md:ml-56 lg:ml-64"
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      >
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          actions={
            <button
              type="button"
              onClick={handleResetEvent}
              disabled={isResettingEvent}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md border border-outline-variant/30 bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
            >
              <span className="material-symbols-outlined text-sm">
                restart_alt
              </span>
              {isResettingEvent ? "Resetting..." : "Reset Event"}
            </button>
          }
        />

        {/* Page Content */}
        <div className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8 pb-6 sm:pb-8 md:pb-12">
          {statsError ? (
            <div className="rounded-lg border border-error/25 bg-error-container px-3 py-2 text-sm text-on-error-container">
              {statsError}
            </div>
          ) : null}

          {adminActionError ? (
            <div className="rounded-lg border border-error/25 bg-error-container px-3 py-2 text-sm text-on-error-container">
              {adminActionError}
            </div>
          ) : null}

          {adminActionMessage ? (
            <div className="rounded-lg border border-emerald-600/25 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {adminActionMessage}
            </div>
          ) : null}

          {/* 1. Top Analytics Cards */}
          <section className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
            {analyticsData.map((card) => (
              <AnalyticsCard
                key={card.title}
                title={card.title}
                value={card.value}
                percentage={card.percentage}
                borderColor={card.color}
                isNegative={card.isNegative}
              />
            ))}
          </section>

          {/* 2. Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
            <DepartmentChart
              token={auth?.token}
              refreshKey={departmentRefreshKey}
            />
            <GownLogistics stats={stats} />
          </section>

          {/* 3. Live Scan Table */}
          <section className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6">
            <LiveScanTable scanData={liveScans} />
          </section>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
