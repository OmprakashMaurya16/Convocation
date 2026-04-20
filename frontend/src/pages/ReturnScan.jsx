import { useState } from 'react';
import ScannerTopBar from '../components/ScannerTopBar';
import ScannerFrame from '../components/ScannerFrame';
import ScanResultCard from '../components/ScanResultCard';
import ScannerBottomNav from '../components/ScannerBottomNav';

export default function ReturnScan() {
  const [activeMode, setActiveMode] = useState('return');
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
        counter="Return Counter C-3"
        onSettings={() => console.log('Settings')}
      />

      {/* Main Scanning Area */}
      <ScannerFrame>
        <ScanResultCard
          show={showResult}
          status="GOWN RETURNED"
          statusColor="bg-amber-500"
          time="15:08:47"
          student="David Okonkwo"
          idNumber="SC-2024-7634"
          nextPhase="Exit Gate"
          nextPhaseIcon="logout"
        />
      </ScannerFrame>

      {/* Bottom Navigation */}
      <ScannerBottomNav activeMode={activeMode} setActiveMode={setActiveMode} />
    </div>
  );
}
