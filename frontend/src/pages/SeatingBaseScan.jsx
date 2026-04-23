import { useState } from "react";
import ScannerTopBar from "../components/ScannerTopBar";
import ScannerFrame from "../components/ScannerFrame";
import ScanResultCard from "../components/ScanResultCard";
import ScannerBottomNav from "../components/ScannerBottomNav";

export default function SeatingBaseScan() {
  const [activeMode, setActiveMode] = useState("seating");
  const [showResult, _setShowResult] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <ScannerTopBar
        title="Scanner Ledger"
        counter="Seating Station B-5"
        onSettings={() => console.log("Settings")}
      />

      {/* Main Scanning Area */}
      <ScannerFrame>
        <ScanResultCard
          show={showResult}
          status="SEATED"
          statusColor="bg-emerald-500"
          time="14:15:33"
          student="Priya Sharma"
          idNumber="SC-2024-3847"
          nextPhase="Procession Hall"
          nextPhaseIcon="walk"
        />
      </ScannerFrame>

      {/* Bottom Navigation */}
      <ScannerBottomNav activeMode={activeMode} setActiveMode={setActiveMode} />
    </div>
  );
}
