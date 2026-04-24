import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getAuthSession, getStudentSession } from "../utils/api";

const ROLE_OPTIONS = [
  { id: "student", label: "Student" },
  { id: "staff", label: "Staff" },
  { id: "admin", label: "Admin" },
];

export default function RoleLogin() {
  const navigate = useNavigate();
  // Default to student tab
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [studentCompany, setStudentCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuthSession();
    if (auth?.token && auth?.role) {
      navigate(auth.role === "ADMIN" ? "/admin-dashboard" : "/staff-scanner", {
        replace: true,
      });
      return;
    }

    const student = getStudentSession();
    if (student?.qrToken || student?.studentId) {
      navigate("/student-dashboard", { replace: true });
    }
  }, [navigate]);

  const roleTitle = useMemo(() => {
    if (role === "admin") return "Admin Access";
    if (role === "staff") return "Staff Access";
    return "Student Access";
  }, [role]);

  const handleAdminOrStaffLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: email.trim(),
        password,
      },
    });

    if (!data?.success) {
      throw new Error(data?.message || "Unable to login.");
    }

    const apiRole = (data.role || "").toUpperCase();

    if (role === "admin" && apiRole !== "ADMIN") {
      throw new Error("This account is not an admin account.");
    }

    if (role === "staff" && apiRole === "ADMIN") {
      throw new Error("Please use Admin login for admin accounts.");
    }

    localStorage.setItem(
      "convocation.auth",
      JSON.stringify({
        token: data.token,
        role: apiRole,
        name: data.name,
        email: email.trim(),
      }),
    );

    if (apiRole === "ADMIN") {
      navigate("/admin-dashboard", { replace: true });
      return;
    }

    navigate("/staff-scanner", { replace: true });
  };

  const handleStudentLogin = async () => {
    const trimmedStudentId = studentId.trim();
    const trimmedMobile = studentMobile.trim();
    const trimmedCompany = studentCompany.trim();

    if (!trimmedStudentId) {
      setError("Student ID is required.");
      return;
    }
    if (!trimmedMobile) {
      setError("Mobile number is required.");
      return;
    }
    const mobileDigits = trimmedMobile.replace(/\D/g, "");
    if (mobileDigits.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (!trimmedCompany) {
      setError("Company / Employer is required.");
      return;
    }

    // Only send roll, mobile, company
    await apiRequest(
      `/api/student/${encodeURIComponent(trimmedStudentId)}/event-login`,
      {
        method: "POST",
        body: {
          phone: trimmedMobile,
          company: trimmedCompany,
        },
      },
    );

    localStorage.setItem(
      "convocation.student",
      JSON.stringify({
        qrToken: trimmedStudentId,
        studentId: trimmedStudentId,
        mobile: trimmedMobile,
        company: trimmedCompany,
      }),
    );

    navigate("/student-dashboard", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (role === "student") {
        await handleStudentLogin();
      } else {
        await handleAdminOrStaffLogin();
      }
    } catch (submitError) {
      setError(submitError.message || "Login failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f4faff_0%,#e6f1ff_45%,#d6e9ff_100%)] px-4 py-6 sm:px-6">
      <section className="w-full max-w-lg rounded-2xl border border-primary/10 bg-surface-container-lowest px-4 py-5 shadow-[0_16px_36px_rgba(0,37,71,0.12)] sm:px-5 sm:py-6">
        <h1 className="mb-4 text-center font-headline text-xl font-bold text-primary sm:text-2xl">
          Sign In
        </h1>

        <div className="mb-4 grid grid-cols-3 rounded-lg bg-surface-container p-1">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setRole(option.id);
                setError("");
              }}
              className={`rounded-md px-2 py-2 text-center font-label text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs ${
                role === option.id
                  ? "bg-primary text-white"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-center font-body text-xs text-on-surface-variant">
            {roleTitle}
          </p>

          {role === "student" ? (
            <>
              <label className="block">
                <span className="mb-1 block font-label text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  Student ID / Roll No. <span className="text-error">*</span>
                </span>
                <input
                  type="text"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="SC-2024-0001"
                  required
                  className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 font-body text-sm text-on-background outline-none transition-colors focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-label text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  Mobile Number <span className="text-error">*</span>
                </span>
                <input
                  type="tel"
                  value={studentMobile}
                  onChange={(event) => setStudentMobile(event.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 font-body text-sm text-on-background outline-none transition-colors focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-label text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  Company / Employer <span className="text-error">*</span>
                </span>
                <input
                  type="text"
                  value={studentCompany}
                  onChange={(event) => setStudentCompany(event.target.value)}
                  placeholder="e.g. Infosys, TCS, Google…"
                  required
                  className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 font-body text-sm text-on-background outline-none transition-colors focus:border-primary"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block font-label text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="name@convocation.com"
                  className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 font-body text-sm text-on-background outline-none transition-colors focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-label text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 font-body text-sm text-on-background outline-none transition-colors focus:border-primary"
                />
              </label>
            </>
          )}

          {error ? (
            <p className="rounded-xl border border-error/30 bg-error-container px-3 py-2 font-body text-sm text-on-error-container">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-label text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </div>
  );
}
