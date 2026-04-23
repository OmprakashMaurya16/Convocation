import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function DepartmentChart({ token, refreshKey = 0 }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDeptColors = (deptName) => {
    // Use only existing theme tokens (see tailwind.config.js) to keep visuals consistent.
    // Returns Tailwind class names for the bar front gradient + side face.
    const palette = {
      INFT: {
        front: "bg-gradient-to-t from-primary to-primary-fixed-dim",
        side: "bg-primary",
      },
      CMPN: {
        front: "bg-gradient-to-t from-secondary to-secondary-fixed",
        side: "bg-secondary",
      },
      EXTC: {
        front: "bg-gradient-to-t from-surface-tint to-primary-fixed",
        side: "bg-surface-tint",
      },
      EXCS: {
        front: "bg-gradient-to-t from-tertiary-container to-tertiary-fixed-dim",
        side: "bg-tertiary-container",
      },
      BIOMD: {
        front: "bg-gradient-to-t from-error to-error-container",
        side: "bg-error",
      },
    };

    return (
      palette[String(deptName || "").toUpperCase()] || {
        front: "bg-gradient-to-t from-primary to-primary-fixed-dim",
        side: "bg-primary",
      }
    );
  };

  useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        setLoading(true);
        console.log("Fetching department stats with refreshKey:", refreshKey);

        if (!token) {
          throw new Error("No authentication token found");
        }

        const data = await apiRequest("/api/admin/department-stats", {
          token,
        });
        console.log("Department stats fetched:", data);
        setDepartments(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch department stats:", err);
        setError(err.message || "Failed to load department statistics");
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDepartmentStats();
    }
  }, [token, refreshKey]);

  if (loading) {
    return (
      <div className="lg:col-span-8 bg-surface-container-lowest p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg md:rounded-xl">
        <h4 className="font-headline font-bold text-xs xs:text-sm md:text-base text-on-surface mb-4">
          Department-wise Attendance
        </h4>
        <div className="flex items-center justify-center h-40 xs:h-48 sm:h-56 lg:h-64">
          <span className="text-on-surface-variant">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-8 bg-surface-container-lowest p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg md:rounded-xl">
        <h4 className="font-headline font-bold text-xs xs:text-sm md:text-base text-on-surface mb-4">
          Department-wise Attendance
        </h4>
        <div className="flex items-center justify-center h-40 xs:h-48 sm:h-56 lg:h-64">
          <span className="text-error">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg md:rounded-xl">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-3 xs:mb-4 md:mb-6 lg:mb-8 gap-2 xs:gap-3 md:gap-4">
        <h4 className="font-headline font-bold text-xs xs:text-sm md:text-base text-on-surface">
          Department-wise Attendance
        </h4>
        <div className="flex gap-2 xs:gap-3 md:gap-4 flex-wrap text-[8px] xs:text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-on-surface-variant uppercase font-bold">
            <div className="size-1.5 xs:size-2 bg-primary rounded-sm"></div>{" "}
            Present
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant uppercase font-bold">
            <div className="size-1.5 xs:size-2 bg-surface-variant rounded-sm"></div>{" "}
            Expected
          </span>
        </div>
      </div>

      <div className="relative h-40 xs:h-48 sm:h-56 lg:h-64 bg-surface-container rounded-lg overflow-x-auto">
        <div className="flex h-full">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between py-3 pl-2 pr-1 xs:pl-3 xs:pr-2 text-[9px] xs:text-[10px] font-bold text-on-surface-variant select-none">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Plot area */}
          <div className="relative flex-1 h-full px-2 xs:px-3 md:px-4 pb-2">
            {/* subtle gridlines for readability */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-2 xs:px-3 md:px-4 py-3 opacity-60">
              <div className="h-px bg-outline-variant" />
              <div className="h-px bg-outline-variant" />
              <div className="h-px bg-outline-variant" />
              <div className="h-px bg-outline-variant" />
              <div className="h-px bg-outline-variant" />
            </div>

            <div className="relative z-10 flex items-end justify-between h-full gap-4 xs:gap-6 md:gap-8 lg:gap-10">
              {departments.map((dept) => {
                const presentPct = Number.isFinite(dept?.present)
                  ? Math.max(0, Math.min(100, dept.present))
                  : 0;
                const presentHeight =
                  presentPct === 0 ? "3px" : `${Math.max(presentPct, 2)}%`;
                const colors = getDeptColors(dept?.name);

                return (
                  <div
                    key={dept.name}
                    className="flex-1 min-w-[72px] xs:min-w-[84px] md:min-w-[96px] flex flex-col items-center justify-end gap-2 group h-full"
                    title={`${dept.name}: ${dept.presentCount}/${dept.totalExpected} present (${presentPct}%)`}
                    aria-label={`${dept.name} attendance ${dept.presentCount} out of ${dept.totalExpected} present`}
                  >
                    <div className="flex-1 w-full flex items-end justify-center relative">
                      {/* Expected track (100%) */}
                      <div className="absolute bottom-0 h-full w-10 xs:w-11 md:w-12 rounded-sm bg-transparent ring-1 ring-outline-variant opacity-40" />

                      {/* Shadow */}
                      <div className="absolute -bottom-1 w-12 xs:w-14 h-2 bg-outline-variant opacity-30 blur-sm" />

                      {/* Present bar (with slight 3D side face) */}
                      <div className="relative w-10 xs:w-11 md:w-12">
                        <div
                          className={`absolute bottom-0 left-0 w-[80%] rounded-sm ${colors.front} group-hover:brightness-110 transition-all duration-300`}
                          style={{ height: presentHeight }}
                        />
                        <div
                          className={`absolute bottom-0 left-[80%] w-[20%] rounded-sm ${colors.side} opacity-90 transition-all duration-300`}
                          style={{ height: presentHeight }}
                        />

                        {/* value label (hover) */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] xs:text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                          {presentPct}%
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] xs:text-[10px] md:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                      {dept.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
