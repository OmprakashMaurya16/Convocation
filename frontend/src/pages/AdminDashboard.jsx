import { useState } from 'react';
import { Sidebar, Header, AnalyticsCard, DepartmentChart, GownLogistics, LiveScanTable, Footer } from '../components';
import SeatingArchitecture from './SeatingArchitecture';
import CandidateLedger from './CandidateLedger';

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const analyticsData = [
    { title: 'Total Registered', value: '2,450', percentage: '+100%', color: 'primary' },
    { title: 'Checked-in', value: '1,820', percentage: '74.2%', color: 'secondary' },
    { title: 'Seated', value: '1,650', percentage: '67.3%', color: 'surface-tint' },
    { title: 'Gowns Issued', value: '1,780', percentage: '97.8%', color: 'tertiary-container' },
    { title: 'Gowns Returned', value: '42', percentage: '2.3%', color: 'error', isNegative: true },
  ];

  // Render different pages based on activePage
  if (activePage === 'seating') {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
        <Sidebar activeItem={activePage} setActiveItem={setActivePage} open={sidebarOpen} setOpen={setSidebarOpen} />
        <SeatingArchitecture onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    );
  }

  if (activePage === 'candidate') {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
        <Sidebar activeItem={activePage} setActiveItem={setActivePage} open={sidebarOpen} setOpen={setSidebarOpen} />
        <CandidateLedger onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    );
  }

  // Default: Dashboard
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col md:flex-row bg-surface overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar activeItem={activePage} setActiveItem={setActivePage} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-screen overflow-y-auto md:ml-56 lg:ml-64" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <div className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8 pb-6 sm:pb-8 md:pb-12">
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
            <GownLogistics />
          </section>

          {/* 3. Live Scan Table */}
          <section className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6">
            <LiveScanTable />
          </section>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
