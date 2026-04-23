import { useState } from "react";
import ScannerTopBar from "../components/ScannerTopBar";
import ScannerFrame from "../components/ScannerFrame";
import ScanResultCard from "../components/ScanResultCard";
import ScannerBottomNav from "../components/ScannerBottomNav";

export default function EntryScan() {
  const [activeMode, setActiveMode] = useState("entry");
  const [showResult, _setShowResult] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <ScannerTopBar
        title="Scanner Ledger"
        counter="Entry Gate 1"
        onSettings={() => console.log("Settings")}
      />

      {/* Main Scanning Area */}
      <ScannerFrame>
        <ScanResultCard
          show={showResult}
          status="CHECKED IN"
          statusColor="bg-blue-500"
          time="13:45:22"
          student="John Anderson"
          idNumber="SC-2024-5421"
          nextPhase="Registration Desk"
          nextPhaseIcon="assignment"
        />
      </ScannerFrame>

      {/* Bottom Navigation */}
      <ScannerBottomNav activeMode={activeMode} setActiveMode={setActiveMode} />
    </div>
  );
}
