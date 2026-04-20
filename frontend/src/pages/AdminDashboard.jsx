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

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
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

    const socket = createSocketClient();

    socket.on("scan:created", (scan) => {
      setLiveScans((previous) => [scan, ...previous].slice(0, 20));
    });

    return () => {
      socket.disconnect();
    };
  }, [auth]);

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
      title: "Seated",
      value: (stats?.seated || 0).toLocaleString(),
      percentage: toPercent(stats?.seated || 0),
      color: "surface-tint",
    },
    {
      title: "Gowns Issued",
      value: (stats?.gownIssued || 0).toLocaleString(),
      percentage: toPercent(stats?.gownIssued || 0),
      color: "tertiary-container",
    },
    {
      title: "Completed / Returned",
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
        />

        {/* Page Content */}
        <div className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8 pb-6 sm:pb-8 md:pb-12">
          {statsError ? (
            <div className="rounded-lg border border-error/25 bg-error-container px-3 py-2 text-sm text-on-error-container">
              {statsError}
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
            <DepartmentChart />
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
