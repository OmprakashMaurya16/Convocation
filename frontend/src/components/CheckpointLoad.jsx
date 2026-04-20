export default function CheckpointLoad() {
  const checkpoints = [
    { label: 'Gate 1 Intake', load: 82, color: 'bg-error' },
    { label: 'Gown Counter A', load: 45, color: 'bg-primary' },
    { label: 'Gate 4 Intake', load: 12, color: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl">
      <h4 className="font-headline font-bold text-on-surface mb-4">Checkpoint Load</h4>
      <div className="space-y-5">
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint.label} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-on-surface-variant">{checkpoint.label}</span>
              <span className="text-on-surface">{checkpoint.load}% Load</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
              <div className={`${checkpoint.color} h-full transition-all`} style={{ width: `${checkpoint.load}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
