export default function Footer() {
  return (
    <footer className="mt-auto p-4 md:p-8 border-t border-outline-variant/10 bg-surface-container-low flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
      <div>© 2024 Architectural Ledger Systems</div>
      <div className="flex gap-4 flex-wrap justify-center">
        <a className="hover:text-primary transition-colors" href="#">
          System Health
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          Data Export
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          Support
        </a>
      </div>
    </footer>
  );
}
