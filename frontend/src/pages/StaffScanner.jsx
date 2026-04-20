import { useState } from 'react';
import ScannerTopBar from '../components/ScannerTopBar';
import ScannerFrame from '../components/ScannerFrame';
import ScanResultCard from '../components/ScanResultCard';
import ScannerBottomNav from '../components/ScannerBottomNav';

const SCANNER_MODES = {
  entry: {
    counter: 'Entry Gate 1',
    lastResult: {
      status: 'CHECKED IN',
      statusColor: 'bg-blue-500',
      time: '13:45:22',
      student: 'John Anderson',
      idNumber: 'SC-2024-5421',
      nextPhase: 'Registration Desk',
      nextPhaseIcon: 'assignment',
    },
  },
  seating: {
    counter: 'Seating Station B-5',
    lastResult: {
      status: 'SEATED',
      statusColor: 'bg-emerald-500',
      time: '14:15:33',
      student: 'Priya Sharma',
      idNumber: 'SC-2024-3847',
      nextPhase: 'Procession Hall',
      nextPhaseIcon: 'walk',
    },
  },
  gown: {
    counter: 'Gown Counter A-2',
    lastResult: {
      status: 'GOWN ISSUED',
      statusColor: 'bg-green-500',
      time: '14:22:05',
      student: 'Amara Okafor',
      idNumber: 'SC-2024-8812',
      nextPhase: 'Seating Hall',
      nextPhaseIcon: 'chair',
    },
  },
  return: {
    counter: 'Return Counter C-3',
    lastResult: {
      status: 'GOWN RETURNED',
      statusColor: 'bg-amber-500',
      time: '15:08:47',
      student: 'David Okonkwo',
      idNumber: 'SC-2024-7634',
      nextPhase: 'Exit Gate',
      nextPhaseIcon: 'logout',
    },
  },
};

export default function StaffScanner() {
  const [activeMode, setActiveMode] = useState('gown');
  const [showResult, setShowResult] = useState(true);

  const currentMode = SCANNER_MODES[activeMode];
  const result = currentMode.lastResult;

  const handleScan = () => {
    setShowResult(true);
    setTimeout(() => setShowResult(false), 3500);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <ScannerTopBar 
        title="Scanner Ledger" 
        counter={currentMode.counter}
        onSettings={() => console.log('Settings')}
      />

      {/* Main Scanning Area */}
      <ScannerFrame>
        <ScanResultCard
          show={showResult}
          status={result.status}
          statusColor={result.statusColor}
          time={result.time}
          student={result.student}
          idNumber={result.idNumber}
          nextPhase={result.nextPhase}
          nextPhaseIcon={result.nextPhaseIcon}
        />
      </ScannerFrame>

      {/* Bottom Navigation */}
      <ScannerBottomNav activeMode={activeMode} setActiveMode={setActiveMode} />
    </div>
  );
}
