import { useState } from "react";
import ScannerTopBar from "../components/ScannerTopBar";
import ScannerFrame from "../components/ScannerFrame";
import ScanResultCard from "../components/ScanResultCard";
import ScannerBottomNav from "../components/ScannerBottomNav";

export default function GownScan() {
  const [activeMode, setActiveMode] = useState("gown");
  const [showResult, setShowResult] = useState(true);

  const handleScan = () => {
    setShowResult(true);
    setTimeout(() => setShowResult(false), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <ScannerTopBar
        title="Scanner Ledger"
        counter="Robe Counter A-2"
        onSettings={() => console.log("Settings")}
      />

      {/* Main Scanning Area */}
      <ScannerFrame>
        <ScanResultCard
          show={showResult}
          status="ROBE ISSUED"
          statusColor="bg-green-500"
          time="14:22:05"
          student="Amara Okafor"
          idNumber="SC-2024-8812"
          nextPhase="Seating Hall"
          nextPhaseIcon="chair"
        />
      </ScannerFrame>

      {/* Bottom Navigation */}
      <ScannerBottomNav activeMode={activeMode} setActiveMode={setActiveMode} />
    </div>
  );
}
