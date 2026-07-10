import { useCallback, useMemo, useRef, useState } from "react";
import { Header } from "../components";
import { clearAuthSession, getAuthSession, getApiBaseUrl } from "../utils/api";

function fmt(n) {
  return Number(n).toLocaleString();
}

function StatPill({ icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${color}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <div>
        <p className="text-[10px] font-label font-semibold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-xl font-headline font-extrabold leading-none">{fmt(value)}</p>
      </div>
    </div>
  );
}

export default function ImportStudents({ onMenuClick = () => {}, onLogout = null }) {
  const auth = useMemo(() => getAuthSession(), []);
  const inputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const acceptFile = useCallback((f) => {
    if (!f) return;
    const ok = /\.(xlsx|xls|pdf)$/i.test(f.name);
    if (!ok) {
      setErrorMsg("Only Excel (.xlsx / .xls) or PDF files are supported.");
      return;
    }
    setErrorMsg("");
    setResult(null);
    setPhase("idle");
    setFile(f);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    acceptFile(f);
  };

  const onInputChange = (e) => {
    const f = e.target.files[0];
    acceptFile(f);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file || !auth?.token) return;
    setPhase("uploading");
    setErrorMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const baseUrl = getApiBaseUrl();

      const response = await fetch(`${baseUrl}/api/admin/students/bulk-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setResult(data);
      setPhase("success");
      setFile(null);
    } catch (err) {
      setErrorMsg(err.message || "Upload failed");
      setPhase("error");
      if (
        err.message?.toLowerCase().includes("invalid token") ||
        err.message?.toLowerCase().includes("no token")
      ) {
        clearAuthSession();
        if (onLogout) onLogout();
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setPhase("idle");
    setResult(null);
    setErrorMsg("");
  };

  const isUploading = phase === "uploading";

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto md:ml-56 lg:ml-64 w-full min-w-0">
      <Header onMenuClick={onMenuClick} onLogout={onLogout} />

      <main className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 min-h-screen pb-12">
        <nav className="flex items-center gap-1.5 text-[7px] xs:text-[8px] sm:text-xs font-label text-slate-400 mb-2 xs:mb-3 md:mb-4 uppercase tracking-tighter">
          <span>Portal</span>
          <span className="material-symbols-outlined text-[8px] xs:text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">Import Students</span>
        </nav>

        <div className="mb-6 md:mb-8">
          <h2 className="font-headline font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary tracking-tight">
            Import Students
          </h2>
          <p className="text-slate-500 font-body mt-0.5 xs:mt-1 text-[8px] xs:text-[9px] sm:text-xs md:text-sm">
            Upload an Excel (.xlsx / .xls) or PDF file to bulk-register candidates — same as running the seed script.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3">
              <div className="size-9 rounded-xl signature-gradient flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-base">upload_file</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-slate-800">Upload File</h3>
                <p className="text-[10px] text-slate-400 font-label">Drag &amp; drop or click to browse</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !isUploading && inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none py-12
                  ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-slate-200 hover:border-primary/40 hover:bg-slate-50"}
                  ${isUploading ? "pointer-events-none opacity-60" : ""}
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  className="hidden"
                  onChange={onInputChange}
                />

                {file ? (
                  <>
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        {file.name.endsWith(".pdf") ? "picture_as_pdf" : "table_view"}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-label font-bold text-slate-800 truncate max-w-[220px]">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`size-16 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-primary/20" : "bg-slate-100"}`}>
                      <span className={`material-symbols-outlined text-3xl transition-colors ${dragOver ? "text-primary" : "text-slate-400"}`}>
                        cloud_upload
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-label font-semibold text-slate-700">
                        {dragOver ? "Release to upload" : "Drop your file here"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Excel (.xlsx / .xls) or PDF — max 10 MB</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-label font-semibold text-slate-600 bg-white shadow-sm">
                      Browse Files
                    </span>
                  </>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                  <span className="material-symbols-outlined text-red-500 text-base mt-0.5 flex-shrink-0">error</span>
                  <p className="text-xs font-label text-red-700">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-3">
                {file && !isUploading && (
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-label font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex-1 py-2.5 rounded-xl signature-gradient text-white text-sm font-label font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      Processing…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">rocket_launch</span>
                      Import to Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {phase === "success" && result && (
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-emerald-100 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm text-emerald-800">Import Complete</h3>
                    <p className="text-[10px] text-emerald-500 font-label">Students saved to database</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="ml-auto text-slate-400 hover:text-slate-600 transition"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <StatPill
                      icon="group"
                      label="Total"
                      value={result.total}
                      color="border-slate-200 text-slate-700"
                    />
                    <StatPill
                      icon="person_add"
                      label="Inserted"
                      value={result.inserted}
                      color="border-emerald-200 text-emerald-700 bg-emerald-50"
                    />
                    <StatPill
                      icon="person_off"
                      label="Skipped"
                      value={result.skipped}
                      color="border-amber-200 text-amber-700 bg-amber-50"
                    />
                  </div>

                  {result.skipped > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                      <p className="text-xs font-label font-semibold text-amber-800 mb-1">
                        {result.skipped} duplicate{result.skipped > 1 ? "s" : ""} skipped (already in DB):
                      </p>
                      <p className="text-[10px] font-mono text-amber-700 break-all leading-relaxed">
                        {result.skippedIds.join(", ")}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-label font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Import Another File
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-base">info</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-800">File Format Guide</h3>
                  <p className="text-[10px] text-slate-400 font-label">How to prepare your spreadsheet or PDF</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base">table_view</span>
                    <p className="text-xs font-label font-bold text-slate-700">Excel (.xlsx / .xls)</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-label mb-2">
                    First row must be column headers. These column names are recognised (case-insensitive):
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-[10px] font-mono">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-1.5 text-left text-slate-500 font-label font-semibold">Field</th>
                          <th className="px-3 py-1.5 text-left text-slate-500 font-label font-semibold">Accepted Headers</th>
                          <th className="px-3 py-1.5 text-left text-slate-500 font-label font-semibold">Required?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { field: "Name", headers: "Name, Student Name, Full Name, Candidate Name", req: true },
                          { field: "Student ID", headers: "Student ID, Roll No, Roll Number, Enrollment, GR No", req: true },
                          { field: "Department", headers: "Department, Dept, Branch, Program", req: false },
                          { field: "Phone", headers: "Phone, Mobile, Contact, Phone No", req: false },
                        ].map((r) => (
                          <tr key={r.field} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 text-slate-700 font-semibold">{r.field}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.headers}</td>
                            <td className="px-3 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-label font-bold ${r.req ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                                {r.req ? "Required" : "Optional"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-red-500 text-base">picture_as_pdf</span>
                    <p className="text-xs font-label font-bold text-slate-700">PDF</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-label">
                    The system will automatically detect rows from your PDF table. For best results, make sure the PDF contains a proper table or structured list with Name, Student ID, and Department clearly separated by spaces, tabs, commas, or pipes.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[9px] font-label font-bold text-slate-500 uppercase tracking-wider mb-2">Example Excel Layout</p>
                  <div className="overflow-x-auto">
                    <table className="text-[10px] font-mono border-collapse w-full">
                      <thead>
                        <tr className="bg-white">
                          {["Name", "Student ID", "Department", "Phone"].map((h) => (
                            <th key={h} className="border border-slate-200 px-2 py-1 text-left text-slate-600 font-label font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Aarav Sharma", "21103A0001", "ETRX", "9876543210"],
                          ["Priya Patel", "21104B0022", "EXTC", ""],
                          ["Rohit Kumar", "21103B0015", "INFT", "8765432109"],
                        ].map((row, i) => (
                          <tr key={i} className="odd:bg-white even:bg-slate-50">
                            {row.map((cell, j) => (
                              <td key={j} className="border border-slate-200 px-2 py-1 text-slate-600 whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[
                    { icon: "check_circle", color: "text-emerald-500", text: "Existing students (same Student ID) are skipped — no duplicates." },
                    { icon: "check_circle", color: "text-emerald-500", text: "All new students get state REGISTERED and an auto-generated QR token." },
                    { icon: "info", color: "text-blue-400", text: "If Department is blank, it defaults to GENERAL." },
                  ].map((n) => (
                    <div key={n.text} className="flex items-start gap-2">
                      <span className={`material-symbols-outlined text-sm flex-shrink-0 mt-0.5 ${n.color}`}>{n.icon}</span>
                      <p className="text-[11px] text-slate-600 font-label">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
