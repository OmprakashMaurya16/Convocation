import { useState, useEffect } from "react";
import { apiRequest, getAuthSession } from "../utils/api";

export default function DepartmentSeatingConfig({ open, onClose }) {
  const [departments] = useState([
    "INFT",
    "CMPN",
    "EXTC",
    "EXCS",
    "BIOMD",
    "MMS",
  ]);
  const [selectedDept, setSelectedDept] = useState("INFT");
  const [startSeat, setStartSeat] = useState("");
  const [endSeat, setEndSeat] = useState("");
  const [allSeats, setAllSeats] = useState([]);
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (configs[selectedDept]) {
      setStartSeat(configs[selectedDept].startSeat || "");
      setEndSeat(configs[selectedDept].endSeat || "");
    } else {
      setStartSeat("");
      setEndSeat("");
    }
    setError("");
    setSuccess("");
  }, [selectedDept, configs]);

  const loadData = async () => {
    const auth = getAuthSession();
    if (!auth?.token) return;

    setLoading(true);
    setError("");
    try {
      const [seatsRes, configsRes] = await Promise.all([
        apiRequest("/api/admin/all-seats", { token: auth.token }),
        apiRequest("/api/admin/department-configs", { token: auth.token }),
      ]);
      setAllSeats(seatsRes.seats || []);

      const configMap = {};
      (configsRes.configs || []).forEach((c) => {
        configMap[c.department] = c;
      });
      setConfigs(configMap);
    } catch (err) {
      setError("Failed to load configuration data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const auth = getAuthSession();
    if (!auth?.token) return;

    if (!startSeat || !endSeat) {
      setError("Both Start Seat and End Seat are required.");
      return;
    }

    const startIndex = allSeats.indexOf(startSeat);
    const endIndex = allSeats.indexOf(endSeat);

    if (startIndex === -1 || endIndex === -1) {
      setError("Invalid seat selected.");
      return;
    }

    if (startIndex > endIndex) {
      setError("Start Seat must come before End Seat.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiRequest("/api/admin/department-configs", {
        method: "POST",
        token: auth.token,
        body: {
          department: selectedDept,
          startSeat,
          endSeat,
        },
      });

      setConfigs((prev) => ({
        ...prev,
        [selectedDept]: res.config,
      }));
      setSuccess("Configuration saved successfully.");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
          <h2 className="text-lg font-bold text-on-surface">
            Department Seating Config
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="p-2 text-sm text-error bg-error-container rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2 text-sm text-emerald-700 bg-emerald-50 rounded-md">
              {success}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-on-surface-variant text-sm">
              Loading...
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-2 border border-outline-variant/30 rounded-md bg-surface"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Start Seat
                  </label>
                  <select
                    value={startSeat}
                    onChange={(e) => setStartSeat(e.target.value)}
                    className="w-full p-2 border border-outline-variant/30 rounded-md bg-surface"
                  >
                    <option value="">Select...</option>
                    {allSeats.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    End Seat
                  </label>
                  <select
                    value={endSeat}
                    onChange={(e) => setEndSeat(e.target.value)}
                    className="w-full p-2 border border-outline-variant/30 rounded-md bg-surface"
                  >
                    <option value="">Select...</option>
                    {allSeats.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Config"}
          </button>
        </div>
      </div>
    </div>
  );
}
