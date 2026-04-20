export default function ActiveDevices() {
  const devices = [
    { id: 'DEV-SCN-01', location: 'Main Entrance Gate 1', status: 'online' },
    { id: 'DEV-SCN-02', location: 'Gown Desk A-1', status: 'online' },
    { id: 'DEV-SCN-05', location: 'North Hall Seating', status: 'disconnected' },
  ];

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl">
      <h4 className="font-headline font-bold text-on-surface mb-4">Active Devices</h4>
      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`size-2 rounded-full shadow-[0_0_8px] ${
                  device.status === 'online'
                    ? 'bg-emerald-500 shadow-emerald-500/60'
                    : 'bg-error animate-pulse shadow-red-500/60'
                }`}
              ></div>
              <div>
                <p className="text-xs font-bold font-label">{device.id}</p>
                <p className="text-[10px] text-on-surface-variant">{device.location}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase ${device.status === 'online' ? 'text-emerald-600' : 'text-error'}`}>
              {device.status === 'online' ? 'Online' : 'Disconnected'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
