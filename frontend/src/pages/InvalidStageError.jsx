import { useState, useEffect } from "react";
import ScannerTopBar from "../components/ScannerTopBar";
import ScannerFrame from "../components/ScannerFrame";
import ScannerBottomNav from "../components/ScannerBottomNav";
import ErrorStateCard from "../components/ErrorStateCard";

const ERROR_STATES = {
  invalidStage: {
    title: "INVALID STAGE",
    message: "Student has not checked in at the main entry yet.",
    protocol:
      "Advise the attendee to return to the North Gate Entrance to complete the initial registration scan before proceeding to this station.",
    icon: "close",
  },
  missingSeating: {
    title: "SEAT NOT ALLOCATED",
    message:
      "Student must have a seat allocated before proceeding to robe issuance.",
    protocol:
      "Please direct the student to the Seating Hall to complete seating assignment. Return here once seating is confirmed.",
    icon: "event_seat",
  },
  alreadyProcessed: {
    title: "ALREADY PROCESSED",
    message: "This student has already completed this stage.",
    protocol:
      "Verify the student ID is correct. If duplicate scan, advise student to proceed to the next checkpoint.",
    icon: "check_circle",
  },
  invalidQR: {
    title: "INVALID QR CODE",
    message: "The scanned QR code is not recognized.",
    protocol:
      "Ensure the QR code is clearly visible and undamaged. Ask the student for their ID number and manually enter it.",
    icon: "error",
  },
};

export default function InvalidStageError() {
  const [activeMode, setActiveMode] = useState("gown");
  const [errorState, setErrorState] = useState("invalidStage");
  const [showError, setShowError] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Countdown timer for auto-reset
  useEffect(() => {
    if (!showError) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowError(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showError]);

  const currentError = ERROR_STATES[errorState];

  const handleBackToScan = () => {
    setShowError(false);
    setCountdown(5);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      {/* Top Bar */}
      <ScannerTopBar
        title="Scanner Ledger"
        counter="SECURE ACCESS SYSTEM"
        onSettings={() => console.log("Settings")}
      />

      {/* Main Area with Error Overlay */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden pb-24 md:pb-32">
        {/* Blurred Background Content */}
        <div className="absolute inset-0 z-0 p-4 md:p-8 grid grid-cols-2 gap-3 md:gap-4 opacity-20 blur-sm pointer-events-none">
          <div className="col-span-2 h-32 md:h-48 bg-surface-container-low rounded-xl"></div>
          <div className="h-24 md:h-32 bg-surface-container-low rounded-xl"></div>
          <div className="h-24 md:h-32 bg-surface-container-low rounded-xl"></div>
          <div className="col-span-2 h-40 md:h-64 bg-surface-container-low rounded-xl"></div>
        </div>

        {/* Error Overlay */}
        {showError && (
          <ErrorStateCard
            title={currentError.title}
            message={currentError.message}
            protocol={currentError.protocol}
            icon={currentError.icon}
            onBackToScan={handleBackToScan}
            countdown={countdown}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <ScannerBottomNav activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* Debug: Error State Selector (Remove in Production) */}
      <div className="hidden md:block fixed top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-4 max-w-xs">
        <p className="text-xs font-bold text-gray-600 mb-2">
          Debug: Select Error State
        </p>
        <select
          value={errorState}
          onChange={(e) => {
            setErrorState(e.target.value);
            setShowError(true);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
        >
          <option value="invalidStage">Invalid Stage</option>
          <option value="missingSeating">Missing Seating</option>
          <option value="alreadyProcessed">Already Processed</option>
          <option value="invalidQR">Invalid QR Code</option>
        </select>
      </div>
    </div>
  );
}
