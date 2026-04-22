import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiRequest,
  clearStudentSession,
  getStudentSession,
} from "../utils/api";
import { createSocketClient } from "../utils/socket";

const STAGE_ORDER = [
  "REGISTERED",
  "CHECKED_IN",
  "SEATED",
  "GOWN_ISSUED",
  "COMPLETED",
];

const STAGE_METADATA = {
  REGISTERED: { label: "Registered", icon: "check" },
  CHECKED_IN: { label: "Checked-in", icon: "login" },
  SEATED: { label: "Seated", icon: "chair" },
  GOWN_ISSUED: { label: "Gown Issued", icon: "checkroom" },
  COMPLETED: { label: "Completed", icon: "school" },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const studentSession = useMemo(() => getStudentSession(), []);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearStudentSession();
    navigate("/");
  };

  useEffect(() => {
    const qrToken = studentSession?.qrToken || studentSession?.studentId;

    if (!qrToken) {
      navigate("/");
      return;
    }

    const fetchStudent = async () => {
      try {
        const studentData = await apiRequest(
          `/api/student/${encodeURIComponent(qrToken)}`,
        );
        setStudent({ ...studentData, qrToken });
      } catch (fetchError) {
        setError(fetchError.message || "Could not load your dashboard data");
        clearStudentSession();
        navigate("/");
      }
    };

    fetchStudent();

    // Real-time updates via Socket.io
    const socket = createSocketClient();

    socket.on("connect", () => {
      console.log("Connected to real-time updates");
      socket.emit("student:subscribe", { studentId: qrToken });
    });

    // Listen for state updates
    socket.on("student:updated", (updatedData) => {
      if (
        updatedData.studentId === qrToken ||
        updatedData.qrToken === qrToken
      ) {
        setStudent((prev) => ({ ...prev, ...updatedData }));
      }
    });

    // Listen for scan events (server emits student-targeted refresh events)
    socket.on("scan:created", () => {
      fetchStudent();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from real-time updates");
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, studentSession]);

  const currentState = student?.state || "REGISTERED";
  const currentStateIndex = STAGE_ORDER.indexOf(currentState);

  const stages = STAGE_ORDER.map((stage) => {
    const stageIndex = STAGE_ORDER.indexOf(stage);

    return {
      label: STAGE_METADATA[stage].label,
      icon: STAGE_METADATA[stage].icon,
      completed: stageIndex < currentStateIndex,
      active: stageIndex === currentStateIndex,
    };
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", fill: true },
    { id: "schedule", label: "Schedule", icon: "event_upcoming", fill: false },
    { id: "seat", label: "Seat", icon: "event_seat", fill: false },
    { id: "docs", label: "Docs", icon: "description", fill: false },
  ];

  const seatSection = student?.seat?.section || "-";
  const seatNumber = student?.seat?.number || "-";
  const studentName = student?.name || studentSession?.name || "Student";
  const studentId = student?.qrToken || studentSession?.studentId || "-";
  const department = student?.department || "Department not available";
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(studentId)}`;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-40 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="material-symbols-outlined text-blue-900 dark:text-blue-200 text-base md:text-lg">
              menu
            </span>
            <h1 className="font-headline font-bold text-base md:text-lg tracking-tight text-blue-900 dark:text-blue-200">
              Convocation 2024
            </h1>
          </div>
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary/10 flex-shrink-0">
            <img
              alt="Student Avatar"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
            />
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-error px-3 py-1.5 text-xs md:text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-28 md:pb-8 space-y-6 md:space-y-8">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-2 md:space-y-3">
          <h2 className="font-headline font-extrabold text-2xl md:text-4xl lg:text-5xl tracking-tight text-primary">
            {studentName}
          </h2>
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <span className="font-label text-xs md:text-sm uppercase tracking-widest text-secondary font-semibold">
              Student ID: {studentId}
            </span>
            <span className="px-3 md:px-4 py-1 md:py-2 rounded-full bg-surface-container text-primary font-body font-medium text-xs md:text-sm">
              {department}
            </span>
          </div>
        </section>

        {error ? (
          <section className="rounded-lg border border-error/25 bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </section>
        ) : null}

        {/* QR Code Section */}
        <section className="bg-surface-container-lowest rounded-lg md:rounded-xl p-6 md:p-8 flex flex-col items-center shadow-sm relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-1 h-full"
            style={{
              background: "linear-gradient(135deg, #002547 0%, #1b3b5f 100%)",
            }}
          ></div>

          <div className="p-3 md:p-4 bg-white rounded-lg border-2 border-primary/10">
            <img
              alt="Check-in QR Code"
              className="w-40 md:w-56 lg:w-64 h-40 md:h-56 lg:h-64"
              src={qrImage}
            />
          </div>

          <p className="mt-4 md:mt-6 font-label text-xs md:text-xs uppercase tracking-tighter text-outline font-bold">
            Fast Check-in Identification
          </p>
        </section>

        {/* Status Tracker Section */}
        <section className="bg-surface-container-low rounded-lg md:rounded-xl p-4 md:p-6">
          <h3 className="font-headline font-bold text-sm md:text-base text-primary mb-4 md:mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm md:text-base">
              task_alt
            </span>
            Registration Status
          </h3>

          <div className="relative px-1 md:px-2">
            {/* Progress Line Background */}
            <div className="absolute top-3 left-0 w-full h-1 bg-outline-variant/30 rounded-full"></div>

            {/* Progress Line Active (Up to Stage 4) */}
            <div
              className="absolute top-3 left-0 h-1 rounded-full"
              style={{
                width: `${Math.max(0, ((currentStateIndex + 1) / STAGE_ORDER.length) * 100)}%`,
                background: "linear-gradient(135deg, #002547 0%, #1b3b5f 100%)",
              }}
            ></div>

            {/* Stages */}
            <div className="relative flex justify-between">
              {stages.map((stage, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1 md:space-y-2"
                >
                  <div
                    className={`w-5 md:w-6 h-5 md:h-6 rounded-full flex items-center justify-center z-10 transition-all ${
                      stage.active ? "ring-2 md:ring-4 ring-primary-fixed" : ""
                    }`}
                    style={{
                      background:
                        stage.completed || stage.active
                          ? "linear-gradient(135deg, #002547 0%, #1b3b5f 100%)"
                          : "#c0dfee",
                    }}
                  >
                    <span
                      className={`material-symbols-outlined text-xs md:text-sm ${
                        stage.completed || stage.active
                          ? "text-white"
                          : "text-on-surface"
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {stage.icon}
                    </span>
                  </div>
                  <span className="font-label text-[9px] md:text-xs font-bold text-primary text-center leading-tight">
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seat Details Card */}
        <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <div className="bg-surface-container-highest rounded-lg md:rounded-xl p-4 md:p-5 flex flex-col justify-center items-center lg:col-span-2">
            <span className="font-label text-xs md:text-sm uppercase tracking-widest text-on-secondary-container font-bold mb-1 md:mb-2">
              Section
            </span>
            <span className="font-headline font-extrabold text-3xl md:text-5xl text-primary">
              {seatSection}
            </span>
          </div>
          <div className="bg-surface-container-highest rounded-lg md:rounded-xl p-4 md:p-5 flex flex-col justify-center items-center lg:col-span-2">
            <span className="font-label text-xs md:text-sm uppercase tracking-widest text-on-secondary-container font-bold mb-1 md:mb-2">
              Seat Number
            </span>
            <span className="font-headline font-extrabold text-3xl md:text-5xl text-primary">
              {seatNumber}
            </span>
          </div>
        </section>

        {/* Instructions Panel */}
        <section className="bg-primary p-5 md:p-6 rounded-lg md:rounded-xl relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -right-8 md:-right-10 -bottom-8 md:-bottom-10 w-24 md:w-32 h-24 md:h-32 bg-primary-container rounded-full opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span
                className="material-symbols-outlined text-primary-fixed text-lg md:text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                campaign
              </span>
              <h4 className="font-headline font-bold text-sm md:text-base text-primary-fixed">
                Current Action
              </h4>
            </div>
            <p className="font-body text-white text-base md:text-lg leading-relaxed font-medium">
              Proceed to Seating Hall. Please have your seat{" "}
              <span className="text-primary-fixed font-bold underline decoration-primary-fixed/40 decoration-2 underline-offset-4">
                {seatNumber}
              </span>{" "}
              ready for inspection.
            </p>
          </div>
        </section>

        {/* Additional Info / Help - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex pt-2 md:pt-4 justify-between items-center px-2">
          <button className="flex items-center gap-2 text-primary font-label text-sm font-semibold hover:opacity-80 transition">
            <span className="material-symbols-outlined text-base">
              support_agent
            </span>
            Need Help?
          </button>
          <button className="flex items-center gap-2 text-outline font-label text-sm font-semibold hover:opacity-80 transition">
            <span className="material-symbols-outlined text-base">map</span>
            Hall Map
          </button>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:static md:border-t md:border-slate-200/20 md:dark:border-slate-800/20 w-full h-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none border-t border-slate-200/20 dark:border-slate-800/20">
        <div className="flex justify-around items-center w-full px-2 md:px-4 h-full max-w-6xl mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center px-3 md:px-4 py-2 rounded-lg md:rounded-xl transition-all duration-150 active:scale-90 ${
                activeNav === item.id
                  ? "text-blue-900 dark:text-white bg-blue-50 dark:bg-blue-900/40"
                  : "text-slate-400 dark:text-slate-500 hover:text-blue-800 dark:hover:text-blue-200"
              }`}
            >
              <span
                className="material-symbols-outlined text-lg md:text-xl"
                style={
                  activeNav === item.id
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {item.icon}
              </span>
              <span className="font-label font-semibold text-xs md:text-xs uppercase tracking-wider mt-1 leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
