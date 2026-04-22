import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function DepartmentChart({ token, refreshKey = 0 }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <div className="flex items-end justify-between h-40 xs:h-48 sm:h-56 lg:h-64 gap-1 xs:gap-1.5 md:gap-2 lg:gap-4 px-1 xs:px-2 overflow-x-auto pb-2 bg-surface-container rounded">
        {departments.map((dept) => (
          <div
            key={dept.name}
            className="flex-1 min-w-[24px] xs:min-w-[32px] md:min-w-[40px] flex flex-col items-center justify-end gap-1 xs:gap-1.5 md:gap-2 group h-full"
            title={`${dept.name}: ${dept.presentCount}/${dept.totalExpected} students`}
          >
            {/* Bar container with background */}
            <div className="w-full h-full bg-surface-container-low rounded-t flex flex-col justify-end relative">
              {/* Colored bar showing percentage */}
              <div
                className="w-full bg-primary rounded-t transition-all group-hover:brightness-110"
                style={{ height: `${Math.max(dept.present, 5)}%` }}
              ></div>
            </div>
            {/* Department label */}
            <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold text-outline uppercase tracking-tighter whitespace-nowrap flex-shrink-0">
              {dept.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
