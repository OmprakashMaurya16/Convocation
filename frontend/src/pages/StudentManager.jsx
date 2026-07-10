import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Header } from "../components";
import { apiRequest, clearAuthSession, getAuthSession, getApiBaseUrl } from "../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATE_META = {
  REGISTERED: { label: "Registered", color: "bg-blue-50 text-blue-600" },
  CHECKED_IN: { label: "Checked-In", color: "bg-amber-50 text-amber-600" },
  SEAT_ALLOCATED: { label: "Seated", color: "bg-indigo-50 text-indigo-600" },
  GOWN_ISSUED: { label: "Gown Issued", color: "bg-purple-50 text-purple-600" },
  COMPLETED: { label: "Completed", color: "bg-emerald-50 text-emerald-600" },
  CANTEEN_TOKEN_ISSUED: { label: "Canteen", color: "bg-orange-50 text-orange-600" },
};

const DEPARTMENTS = ["INFT", "CMPN", "EXTC", "ETRX", "BIOMD", "MMS"];

function AddStudentModal({ onClose, onSuccess, token }) {
  const [form, setForm] = useState({ name: "", studentId: "", department: "", phone: "", convocationYear: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest("/api/admin/students", {
        method: "POST",
        token,
        body: {
          name: form.name,
          studentId: form.studentId,
          department: form.department,
          phone: form.phone || undefined,
          convocationYear: form.convocationYear || undefined,
        },
      });
      onSuccess(result.student);
    } catch (err) {
      setError(err.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[modalIn_0.2s_ease]">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl signature-gradient flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">person_add</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-slate-800">Add New Student</h2>
              <p className="text-xs text-slate-400 font-label">Fill in the candidate details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-label">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
              Student ID <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={form.studentId}
              onChange={set("studentId")}
              placeholder="e.g. 2021INFT001"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
                Department <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.department}
                onChange={set("department")}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
              >
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
                Convocation Year <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                value={form.convocationYear}
                onChange={set("convocationYear")}
                placeholder="e.g. 2026"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
              Phone <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-label font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg signature-gradient text-white text-sm font-label font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Adding...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkImportModal({ onClose, onSuccess, token }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [convocationYear, setConvocationYear] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const acceptFile = (f) => {
    if (!f) return;
    if (!/\.(xlsx|xls|pdf)$/i.test(f.name)) {
      setError("Only Excel (.xlsx / .xls) or PDF files are supported.");
      return;
    }
    setError("");
    setResult(null);
    setPhase("idle");
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!convocationYear.trim()) {
      setError("Convocation Year is required (e.g. 2026).");
      return;
    }
    setPhase("uploading");
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("convocationYear", convocationYear.trim());

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/admin/students/bulk-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");
      setResult(data);
      setPhase("success");
      setFile(null);
      onSuccess(data);
    } catch (err) {
      setError(err.message || "Upload failed");
      setPhase("error");
    }
  };

  const isUploading = phase === "uploading";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-[modalIn_0.2s_ease]">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-violet-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">drive_folder_upload</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-slate-800">Add using Excel / PDF</h2>
              <p className="text-xs text-slate-400 font-label">Bulk import students from a file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {phase === "success" && result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
                <div>
                  <p className="text-sm font-label font-bold text-emerald-800">Import Complete</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {result.inserted} inserted &bull; {result.skipped} skipped &bull; {result.total} total
                  </p>
                </div>
              </div>
              {result.skipped > 0 && (
                <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-label font-semibold text-amber-800 mb-1">Skipped (already exist):</p>
                  <p className="text-[10px] font-mono text-amber-700 break-all leading-relaxed">
                    {result.skippedIds.join(", ")}
                  </p>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl signature-gradient text-white text-sm font-label font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
                  Convocation Year <span className="text-red-400">*</span>
                </label>
                <input
                  value={convocationYear}
                  onChange={(e) => setConvocationYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition font-mono"
                />
                <p className="text-[10px] text-slate-400 font-label mt-1">
                  All imported students will be tagged with this year for filtering.
                </p>
              </div>

              <div>
                <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
                  File <span className="text-red-400">*</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => !isUploading && inputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all select-none
                    ${dragOver ? "border-violet-400 bg-violet-50 scale-[1.01]" : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"}
                    ${isUploading ? "pointer-events-none opacity-60" : ""}
                  `}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,.pdf"
                    className="hidden"
                    onChange={(e) => { acceptFile(e.target.files[0]); e.target.value = ""; }}
                  />
                  {file ? (
                    <>
                      <span className="material-symbols-outlined text-3xl text-violet-500">
                        {file.name.endsWith(".pdf") ? "picture_as_pdf" : "table_view"}
                      </span>
                      <p className="text-sm font-label font-bold text-slate-700 truncate max-w-[260px]">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB &bull; Click to change</p>
                    </>
                  ) : (
                    <>
                      <span className={`material-symbols-outlined text-3xl ${dragOver ? "text-violet-500" : "text-slate-300"}`}>
                        cloud_upload
                      </span>
                      <p className="text-sm font-label font-semibold text-slate-500">
                        {dragOver ? "Release to upload" : "Drop file or click to browse"}
                      </p>
                      <p className="text-[10px] text-slate-400">Excel (.xlsx / .xls) or PDF &mdash; max 10 MB</p>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                  <span className="material-symbols-outlined text-red-500 text-base mt-0.5 flex-shrink-0">error</span>
                  <p className="text-xs font-label text-red-700">{error}</p>
                </div>
              )}

              <div className="pt-1 space-y-2">
                <p className="text-[10px] text-slate-400 font-label">
                  Required columns: <span className="font-mono font-semibold text-slate-600">Name, Student ID</span>.
                  Optional: <span className="font-mono font-semibold text-slate-600">Department, Phone</span>.
                  Existing IDs are skipped.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-label font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-label font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        Importing...
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DownloadReportModal({ onClose, token }) {
  const [convocationYear, setConvocationYear] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingYears, setFetchingYears] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/admin/students/convocation-years`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.years) {
          setAvailableYears(data.years);
          if (data.years.length > 0) setConvocationYear(data.years[0]);
        }
      } catch (err) {
        console.error("Failed to fetch convocation years", err);
      } finally {
        setFetchingYears(false);
      }
    };
    fetchYears();
  }, [token]);

  const handleDownload = async () => {
    if (!convocationYear.trim()) {
      setError("Please select a convocation year.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams({ convocationYear: convocationYear.trim(), department });
      const response = await fetch(`${baseUrl}/api/admin/students/attendance-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch report data");
      if (!data.students || data.students.length === 0) {
        throw new Error("No attendance records found for this year.");
      }

      const doc = new jsPDF();

      const grouped = data.students.reduce((acc, student) => {
        const dept = student.department || "GENERAL";
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(student);
        return acc;
      }, {});

      const departments = Object.keys(grouped).sort();

      departments.forEach((dept, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(`Department: ${dept}`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

        const rows = grouped[dept].map((student, i) => [
          i + 1,
          student.studentId,
          student.name
        ]);

        autoTable(doc, {
          startY: 35,
          head: [["Sr. No.", "Roll No.", "Name"]],
          body: rows,
          theme: "grid",
          headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 30 },
            1: { halign: "center", cellWidth: 60 },
            2: { halign: "center" },
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          styles: {
            fontSize: 11,
            cellPadding: 6,
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
          },
        });
      });

      doc.save(`Attendance_Report_${convocationYear.trim()}.pdf`);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-[modalIn_0.2s_ease]">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-slate-800">Download Report</h2>
              <p className="text-xs text-slate-400 font-label">Export attendance as PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <span className="material-symbols-outlined text-red-500 text-base mt-0.5 flex-shrink-0">error</span>
              <p className="text-xs font-label text-red-700">{error}</p>
            </div>
          )}

          {fetchingYears ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined text-3xl animate-spin text-blue-500">progress_activity</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
                  Convocation Year <span className="text-red-400">*</span>
                </label>
                {availableYears.length > 0 ? (
                  <select
                    value={convocationYear}
                    onChange={(e) => setConvocationYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition font-mono bg-white"
                  >
                    {availableYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={convocationYear}
                    onChange={(e) => setConvocationYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition font-mono"
                  />
                )}
                <p className="text-[10px] text-slate-400 font-label mt-1">
                  Downloads a PDF of all students in this year who have attended.
                </p>
              </div>

              <div>
                <label className="block text-xs font-label font-semibold text-slate-600 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition bg-white"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-label font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-label font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">download</span>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentRow({ student }) {
  const meta = STATE_META[student.state] || { label: student.state, color: "bg-slate-100 text-slate-600" };
  const initials = (student.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors rounded-xl group">
      <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-label font-semibold text-slate-800 truncate">{student.name}</p>
        <p className="text-[11px] text-slate-400 font-mono">{student.studentId}</p>
      </div>
      {student.convocationYear && (
        <span className="hidden sm:inline text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 whitespace-nowrap">
          {student.convocationYear}
        </span>
      )}
      <div className="hidden sm:block text-xs text-slate-500 font-label w-14 text-center">{student.department}</div>
      <div className="hidden sm:block text-xs text-slate-400 font-mono w-12 text-center">{student.seat}</div>
      <span className={`text-[10px] font-label font-semibold px-2 py-0.5 rounded-full ${meta.color} whitespace-nowrap`}>
        {meta.label}
      </span>
    </div>
  );
}

export default function StudentManager({ onMenuClick = () => {}, onLogout = null }) {
  const auth = useMemo(() => getAuthSession(), []);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(
    async (q, dept) => {
      if (!q.trim()) {
        setResults([]);
        setSearchState("idle");
        return;
      }
      setSearchState("loading");
      setErrorMsg("");
      try {
        const params = new URLSearchParams({ q: q.trim(), department: dept, limit: "20" });
        const data = await apiRequest(`/api/admin/students/search?${params}`, { token: auth?.token });
        setResults(data.items || []);
        setSearchState("done");
      } catch (err) {
        setErrorMsg(err.message || "Search failed");
        setSearchState("error");
        if (
          err.message?.toLowerCase().includes("invalid token") ||
          err.message?.toLowerCase().includes("no token")
        ) {
          clearAuthSession();
          if (onLogout) onLogout();
        }
      }
    },
    [auth, onLogout],
  );

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val, deptFilter), 350);
  };

  const handleDeptChange = (e) => {
    const val = e.target.value;
    setDeptFilter(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, val), 100);
  };

  const handleAddSuccess = (student) => {
    setShowModal(false);
    setSuccessBanner({ type: "single", name: student.name, studentId: student.studentId, qrToken: student.qrToken });
    setTimeout(() => setSuccessBanner(null), 5000);
    if (query.trim()) doSearch(query, deptFilter);
  };

  const handleImportSuccess = (data) => {
    setSuccessBanner({ type: "bulk", inserted: data.inserted, skipped: data.skipped, total: data.total });
    setTimeout(() => setSuccessBanner(null), 6000);
    if (query.trim()) doSearch(query, deptFilter);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto md:ml-56 lg:ml-64 w-full min-w-0">
      <Header onMenuClick={onMenuClick} onLogout={onLogout} />

      <main className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 min-h-screen pb-12">
        <nav className="flex items-center gap-1.5 text-[7px] xs:text-[8px] sm:text-xs font-label text-slate-400 mb-2 xs:mb-3 md:mb-4 uppercase tracking-tighter">
          <span>Portal</span>
          <span className="material-symbols-outlined text-[8px] xs:text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">Student Manager</span>
        </nav>

        <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-2 md:gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="font-headline font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary tracking-tight">
              Student Manager
            </h2>
            <p className="text-slate-500 font-body mt-0.5 xs:mt-1 text-[8px] xs:text-[9px] sm:text-xs md:text-sm">
              Search registered students or enrol new candidates.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-label font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span className="hidden xs:inline">Download Report</span>
              <span className="xs:hidden">Report</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-label font-bold text-sm shadow-lg shadow-violet-500/20 hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">drive_folder_upload</span>
              <span className="hidden xs:inline">Add using Excel/PDF</span>
              <span className="xs:hidden">Import</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 signature-gradient text-white rounded-xl font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span className="hidden xs:inline">Add Student</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {successBanner && (
          <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${successBanner.type === "bulk" ? "bg-violet-50 border-violet-200" : "bg-emerald-50 border-emerald-200"}`}>
            <span className={`material-symbols-outlined text-lg ${successBanner.type === "bulk" ? "text-violet-500" : "text-emerald-600"}`}>
              {successBanner.type === "bulk" ? "drive_folder_upload" : "check_circle"}
            </span>
            <div className="flex-1 min-w-0">
              {successBanner.type === "bulk" ? (
                <>
                  <p className="text-sm font-label font-semibold text-violet-800">
                    Import complete: <span className="font-bold">{successBanner.inserted}</span> added, <span className="font-bold">{successBanner.skipped}</span> skipped
                  </p>
                  <p className="text-xs text-violet-500 mt-0.5">{successBanner.total} records processed from file</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-label font-semibold text-emerald-800">
                    Student added: <span className="font-bold">{successBanner.name}</span>
                  </p>
                  <p className="text-xs text-emerald-600 font-mono mt-0.5">
                    ID: {successBanner.studentId} &bull; QR: {successBanner.qrToken}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by name or student ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              {searchState === "loading" && (
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-base animate-spin">
                  progress_activity
                </span>
              )}
            </div>

            <select
              value={deptFilter}
              onChange={handleDeptChange}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
            <div className="size-9 flex-shrink-0" />
            <div className="flex-1 text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Name / ID</div>
            <div className="w-20 text-center text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Year</div>
            <div className="w-14 text-center text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Dept</div>
            <div className="w-12 text-center text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Seat</div>
            <div className="text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Stage</div>
          </div>

          <div className="p-2 min-h-[200px]">
            {searchState === "idle" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-3">manage_search</span>
                <p className="text-sm font-label text-slate-400">Type a name or ID to search students</p>
              </div>
            )}

            {searchState === "error" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-3xl text-red-300 mb-2">error</span>
                <p className="text-sm font-label text-red-500">{errorMsg}</p>
              </div>
            )}

            {searchState === "done" && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-3">person_search</span>
                <p className="text-sm font-label font-semibold text-slate-500">No students found</p>
                <p className="text-xs text-slate-400 mt-1">Try a different name, ID, or add a new student.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 signature-gradient text-white text-xs font-label font-bold rounded-lg shadow-md shadow-primary/20 hover:shadow-lg transition"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Student
                </button>
              </div>
            )}

            {searchState === "done" && results.length > 0 && (
              <div className="space-y-0.5">
                {results.map((s) => (
                  <StudentRow key={s.studentId} student={s} />
                ))}
                {results.length === 20 && (
                  <p className="text-center text-[10px] text-slate-400 font-label pt-2 pb-1">
                    Showing top 20 results — narrow your search for more precise results.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <AddStudentModal
          token={auth?.token}
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showImportModal && (
        <BulkImportModal
          token={auth?.token}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {showReportModal && (
        <DownloadReportModal
          token={auth?.token}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 xs:bottom-6 md:bottom-8 md:right-8 w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 signature-gradient text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-lg xs:text-xl md:text-3xl group-hover:rotate-90 transition-transform duration-300">
          person_add
        </span>
      </button>
    </div>
  );
}
