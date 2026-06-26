import { useCallback, useMemo, useRef, useState } from "react";
import { Header } from "../components";
import { apiRequest, clearAuthSession, getAuthSession } from "../utils/api";

/* ─── State badge colours ─────────────────────────────── */
const STATE_META = {
  REGISTERED: { label: "Registered", color: "bg-blue-50 text-blue-600" },
  CHECKED_IN: { label: "Checked-In", color: "bg-amber-50 text-amber-600" },
  SEAT_ALLOCATED: { label: "Seated", color: "bg-indigo-50 text-indigo-600" },
  GOWN_ISSUED: { label: "Gown Issued", color: "bg-purple-50 text-purple-600" },
  COMPLETED: { label: "Completed", color: "bg-emerald-50 text-emerald-600" },
  CANTEEN_TOKEN_ISSUED: { label: "Canteen", color: "bg-orange-50 text-orange-600" },
};

const DEPARTMENTS = ["INFT", "CMPN", "EXTC", "ETRX", "BIOMD", "MMS"];

/* ─── Add Student Modal ───────────────────────────────── */
function AddStudentModal({ onClose, onSuccess, token }) {
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    department: "",
    phone: "",
  });
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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[modalIn_0.2s_ease]">
        {/* Modal Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-label">
              {error}
            </div>
          )}

          {/* Name */}
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

          {/* Student ID */}
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

          {/* Department */}
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

          {/* Phone */}
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

          {/* Actions */}
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
                  Adding…
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

/* ─── Search result row ───────────────────────────────── */
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
      <div className="hidden sm:block text-xs text-slate-500 font-label w-14 text-center">{student.department}</div>
      <div className="hidden sm:block text-xs text-slate-400 font-mono w-12 text-center">{student.seat}</div>
      <span className={`text-[10px] font-label font-semibold px-2 py-0.5 rounded-full ${meta.color} whitespace-nowrap`}>
        {meta.label}
      </span>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────── */
export default function StudentManager({ onMenuClick = () => {}, onLogout = null }) {
  const auth = useMemo(() => getAuthSession(), []);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState("idle"); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
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
    setSuccessBanner(student);
    setTimeout(() => setSuccessBanner(null), 5000);
    // Refresh search results if a query is active
    if (query.trim()) doSearch(query, deptFilter);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto md:ml-56 lg:ml-64 w-full min-w-0">
      <Header onMenuClick={onMenuClick} onLogout={onLogout} />

      <main className="p-1.5 xs:p-2 sm:p-3 md:p-5 lg:p-8 min-h-screen pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[7px] xs:text-[8px] sm:text-xs font-label text-slate-400 mb-2 xs:mb-3 md:mb-4 uppercase tracking-tighter">
          <span>Portal</span>
          <span className="material-symbols-outlined text-[8px] xs:text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">Student Manager</span>
        </nav>

        {/* Page heading */}
        <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-2 md:gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="font-headline font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary tracking-tight">
              Student Manager
            </h2>
            <p className="text-slate-500 font-body mt-0.5 xs:mt-1 text-[8px] xs:text-[9px] sm:text-xs md:text-sm">
              Search registered students or enrol a new candidate.
            </p>
          </div>

          {/* Add Student button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 signature-gradient text-white rounded-xl font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Add Student
          </button>
        </div>

        {/* Success banner */}
        {successBanner && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            <div>
              <p className="text-sm font-label font-semibold text-emerald-800">
                Student added: <span className="font-bold">{successBanner.name}</span>
              </p>
              <p className="text-xs text-emerald-600 font-mono mt-0.5">
                ID: {successBanner.studentId} · QR: {successBanner.qrToken}
              </p>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="ml-auto text-emerald-400 hover:text-emerald-600 transition"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Search Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Search input bar */}
          <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            {/* Search field */}
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by name or student ID…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              {searchState === "loading" && (
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-base animate-spin">
                  progress_activity
                </span>
              )}
            </div>

            {/* Department filter */}
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

          {/* Column headers (desktop) */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
            <div className="size-9 flex-shrink-0" />
            <div className="flex-1 text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Name / ID</div>
            <div className="w-14 text-center text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Dept</div>
            <div className="w-12 text-center text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Seat</div>
            <div className="text-[10px] font-label font-semibold text-slate-400 uppercase tracking-wider">Stage</div>
          </div>

          {/* Results list */}
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

      {/* Add Student Modal */}
      {showModal && (
        <AddStudentModal
          token={auth?.token}
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* FAB for quick add */}
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
