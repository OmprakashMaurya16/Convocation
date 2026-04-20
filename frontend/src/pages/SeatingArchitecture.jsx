import { Header, StatsCard } from '../components';
import SeatMap from '../components/SeatMap';
import SectionDistribution from '../components/SectionDistribution';
import MissingCandidates from '../components/MissingCandidates';

export default function SeatingArchitecture({ onMenuClick = () => {} }) {
  return (
    <div className="flex flex-col h-screen overflow-y-auto md:ml-56 lg:ml-64">
      {/* Header with Hamburger Menu */}
      <Header onMenuClick={onMenuClick} />

      {/* Page Title & Stats */}
      <div className="px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 md:py-5 border-b border-outline-variant/10">
        <div>
          <h2 className="font-headline font-extrabold text-sm xs:text-base sm:text-lg md:text-2xl lg:text-3xl text-primary tracking-tight line-clamp-1">
            Seating Architecture
          </h2>
          <p className="text-on-surface-variant mt-0.5 xs:mt-1 text-[9px] xs:text-[10px] sm:text-xs md:text-sm line-clamp-1">Real-time occupancy for Grand Hall A & B.</p>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 xs:gap-2 md:gap-3 w-full mt-2 xs:mt-3 md:mt-4">
          <StatsCard label="Capacity" value="2,450" color="primary" />
          <StatsCard label="Seated" value="1,892" color="emerald" />
          <StatsCard label="Pending" value="342" color="tertiary" />
          <StatsCard label="Occupancy" value="77.2%" color="primary" />
        </div>
      </div>

      {/* Main Content */}
      <main className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 min-h-screen pb-6 sm:pb-8 md:pb-12">
        <div className="grid grid-cols-12 gap-2 xs:gap-2.5 md:gap-3 lg:gap-4 xl:gap-6">
          {/* Seat Map - Full width on mobile, left side on desktop */}
          <div className="col-span-12 xl:col-span-8">
            <SeatMap />
          </div>

          {/* Right Panel - Below on mobile, side on desktop */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-2 xs:gap-2.5 md:gap-3 lg:gap-4 xl:gap-6">
            <SectionDistribution />
            <MissingCandidates />
          </div>
        </div>
      </main>

      {/* FAB Button */}
      <button className="fixed bottom-4 right-4 xs:bottom-6 md:bottom-8 md:right-8 w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-[0_12px_48px_rgba(0,31,42,0.3)] hover:scale-105 transition-transform group z-40 touch-none">
        <span className="material-symbols-outlined text-sm xs:text-base md:text-xl lg:text-2xl transition-transform group-hover:rotate-12">
          qr_code_scanner
        </span>
        <span className="absolute right-14 xs:right-16 md:right-20 bg-primary text-white text-[8px] xs:text-xs md:text-sm font-bold px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl hidden sm:block">
          Scan
        </span>
      </button>
    </div>
  );
}
