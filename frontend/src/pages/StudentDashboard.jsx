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
  "SEAT_ALLOCATED",
  "GOWN_ISSUED",
  "COMPLETED",
  "CANTEEN_TOKEN_ISSUED",
];

const STAGE_METADATA = {
  REGISTERED: { label: "Registered", icon: "check" },
  CHECKED_IN: { label: "Checked-in", icon: "login" },
  SEAT_ALLOCATED: { label: "Seat Allocated", icon: "event_seat" },
  GOWN_ISSUED: { label: "Robe Issued", icon: "checkroom" },
  COMPLETED: { label: "Robe Return", icon: "assignment_return" },
  CANTEEN_TOKEN_ISSUED: { label: "Canteen Token", icon: "restaurant" },
};

/**
 * Returns the "Current Action" instruction shown on the student dashboard.
 * @param {string} state - student's current state
 * @param {string} seatSection - seat row letter, e.g. "A"
 * @param {string} seatNumber  - seat number, e.g. "12"
 */
const getCurrentAction = (state, seatSection, seatNumber) => {
  const hasSeat =
    seatSection && seatSection !== "-" && seatNumber && seatNumber !== "-";
  const seatLabel = hasSeat ? `${seatSection}-${seatNumber}` : null;

  switch (state) {
    case "REGISTERED":
      return "Please proceed to the Entry Gate and present your QR code to the staff for check-in.";
    case "CHECKED_IN":
      return "You are being checked in. Your seat is being allocated.";
    case "SEAT_ALLOCATED":
      return seatLabel
        ? `Your seat has been allocated: ${seatLabel}. Please proceed to the Robe Counter for gown issuance.`
        : "Your seat has been allocated. Please proceed to the Robe Counter for gown issuance.";
    case "GOWN_ISSUED":
      return "Your gown has been issued successfully. Please proceed to the Return Counter to return it.";
    case "COMPLETED":
      return "Your gown has been successfully returned. You may now proceed to the food counter.";
    case "CANTEEN_TOKEN_ISSUED":
      return "🎉 Congratulations, Graduate! Enjoy your meal and have a wonderful celebration!";
    default:
      return "Please follow instructions from the event staff.";
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const studentSession = useMemo(() => getStudentSession(), []);
  // Removed bottom nav state
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearStudentSession();
    navigate("/", { replace: true });
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
  const safeCurrentStateIndex = currentStateIndex >= 0 ? currentStateIndex : 0;

  const stages = STAGE_ORDER.map((stage) => {
    const stageIndex = STAGE_ORDER.indexOf(stage);
    return {
      label: STAGE_METADATA[stage].label,
      icon: STAGE_METADATA[stage].icon,
      completed: stageIndex < safeCurrentStateIndex,
      active: stageIndex === safeCurrentStateIndex,
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
      {/* Responsive Title Bar - Always Row */}
      <div className="w-full py-4 sm:py-5 md:py-6 px-6 bg-[#002547] shadow-lg flex flex-row items-center justify-between gap-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <span className="material-symbols-outlined text-white text-xl md:text-2xl">
              school
            </span>
          </div>
          <h1 className="font-headline font-semibold text-lg md:text-xl tracking-wide text-white">
            Convocation 2026
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs md:text-sm font-medium text-white hover:bg-white/20 transition-all"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-8 md:pb-8 space-y-6 md:space-y-8">
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

        {/* Seat Details Card */}
        <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <div className="bg-surface-container-highest rounded-lg md:rounded-xl p-4 md:p-5 flex flex-col justify-center items-center lg:col-span-2">
            <span className="font-label text-xs md:text-sm uppercase tracking-widest text-on-secondary-container font-bold mb-1 md:mb-2">
              Row Number
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

        {/* Status Tracker Section */}
        <section className="bg-white rounded-xl md:rounded-2xl p-6 md:p-10 shadow-lg shadow-blue-900/5 border border-blue-50/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-headline font-bold text-xl md:text-2xl text-blue-950 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">
                  account_tree
                </span>
              </div>
              Progression Status
            </h3>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              Live updates
            </div>
          </div>

          <div className="flex flex-col relative space-y-0">
            {stages.map((stage, index) => (
              <div key={index} className="flex group">
                {/* Timeline Connector Column */}
                <div className="flex flex-col items-center mr-6 md:mr-8">
                  {/* Icon Node */}
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 border-2 ${
                      stage.active 
                        ? "ring-4 ring-blue-500/30 border-blue-600 bg-white shadow-xl scale-110" 
                        : stage.completed
                          ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
                          : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg md:text-xl transition-colors ${
                        stage.completed || stage.active
                          ? stage.active ? "text-blue-600 font-bold" : "text-white"
                          : "text-slate-500 font-bold"
                      }`}
                      style={{ fontVariationSettings: stage.completed ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {stage.completed ? "check" : stage.icon}
                    </span>
                  </div>
                  
                  {/* Vertical Line */}
                  {index !== stages.length - 1 && (
                    <div
                      className={`w-1.5 flex-1 my-1 transition-colors duration-500 rounded-full ${
                        stage.completed ? "bg-blue-600" : "bg-slate-200"
                      }`}
                      style={{ minHeight: '3rem' }}
                    ></div>
                  )}
                </div>

                {/* Label Column */}
                <div className={`flex flex-col pt-2 pb-12 ${index === stages.length - 1 ? "pb-0" : ""}`}>
                  <span className={`font-headline text-base md:text-xl transition-all duration-300 ${
                    stage.active 
                      ? "font-black text-blue-950 translate-x-1" 
                      : stage.completed 
                        ? "font-bold text-slate-800" 
                        : "font-bold text-slate-600"
                  }`}>
                    {stage.label}
                  </span>
                  {stage.active && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></div>
                      <span className="text-[10px] md:text-xs text-blue-700 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                        Currently here
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              {getCurrentAction(currentState, seatSection, seatNumber)}
            </p>
          </div>
        </section>

        {/* Removed Help and Hall Map section */}
      </main>

      {/* Removed Bottom Navigation Bar */}
    </div>
  );
}
