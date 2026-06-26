export default function Sidebar({
  activeItem,
  setActiveItem,
  open = false,
  setOpen = () => {},
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "candidate", label: "Candidate Ledger", icon: "school" },
    { id: "seating", label: "Seating Architecture", icon: "event_seat" },
    { id: "students", label: "Students", icon: "person_search" },
  ];

  const handleMenuClick = (id) => {
    setActiveItem(id);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-56 sm:w-64 bg-surface-container-low flex flex-col border-r border-outline-variant/20 fixed h-screen overflow-y-auto z-40 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 flex items-center gap-2 sm:gap-3">
          <div className="size-7 sm:size-8 signature-gradient rounded flex items-center justify-center text-on-primary flex-shrink-0">
            <span className="material-symbols-outlined text-sm">
              account_balance
            </span>
          </div>
          <h1 className="font-headline font-bold text-xs sm:text-lg text-primary leading-tight truncate">
            Convocation Ledger
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full p-2 flex items-center gap-3 rounded-lg transition-colors ${
                activeItem === item.id
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  activeItem === item.id
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {item.icon}
              </span>
              <span className="font-label font-semibold text-sm">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface font-label">
                Admin Console
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label">
                Super User
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
