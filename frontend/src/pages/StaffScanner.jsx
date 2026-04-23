import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import ScannerTopBar from "../components/ScannerTopBar";
import ScannerFrame from "../components/ScannerFrame";
import ScanResultCard from "../components/ScanResultCard";
import ScannerBottomNav from "../components/ScannerBottomNav";
import { apiRequest, clearAuthSession, getAuthSession } from "../utils/api";

const QR_READER_ELEMENT_ID = "staff-scanner-qr-reader";

const SCANNER_MODES = {
  entry: {
    counter: "Entry Gate 1",
    scanType: "ENTRY",
  },
  gown: {
    counter: "Robe Counter A-2",
    scanType: "GOWN",
  },
  return: {
    counter: "Return Counter C-3",
    scanType: "RETURN",
  },
  canteen: {
    counter: "Canteen Token Desk",
    scanType: "CANTEEN",
  },
};

const STATE_TO_NEXT_PHASE = {
  REGISTERED: { label: "Entry Scan", icon: "login" },
  CHECKED_IN: { label: "Seating Scan", icon: "chair" },
  SEATED: { label: "Robe Counter", icon: "checkroom" },
  GOWN_ISSUED: { label: "Return Counter", icon: "assignment_return" },
  COMPLETED: { label: "Canteen Token", icon: "restaurant" },
  CANTEEN_TOKEN_ISSUED: { label: "Done", icon: "check_circle" },
};

const STATE_LABEL = {
  REGISTERED: "REGISTERED",
  CHECKED_IN: "CHECKED IN",
  SEATED: "SEATED",
  GOWN_ISSUED: "ROBE ISSUED",
  COMPLETED: "ROBE RETURN",
  CANTEEN_TOKEN_ISSUED: "CANTEEN TOKEN ISSUED",
};

export default function StaffScanner() {
  const navigate = useNavigate();
  const auth = useMemo(() => getAuthSession(), []);
  const initialMode =
    auth?.role && auth.role !== "ADMIN"
      ? auth.role === "SEATING"
        ? "entry"
        : auth.role.toLowerCase()
      : "entry";
  const [activeMode, setActiveMode] = useState(
    SCANNER_MODES[initialMode] ? initialMode : "entry",
  );
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [startingCamera, setStartingCamera] = useState(false);
  const cameraScannerRef = useRef(null);

  const normalizeScannedValue = (value) => {
    const raw = value.trim();

    // Accept plain token, URL token (?qrToken=...), or last path segment token.
    if (!raw) return "";

    // Support internal payloads like "<studentId>|A-12" (seat QR)
    if (raw.includes("|")) {
      const tokenPart = raw.split("|")[0]?.trim();
      if (tokenPart) return tokenPart;
    }

    if (raw.includes("http://") || raw.includes("https://")) {
      try {
        const url = new URL(raw);
        const fromQuery = url.searchParams.get("qrToken");
        if (fromQuery) return fromQuery.trim();

        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length) return segments[segments.length - 1].trim();
      } catch {
        return raw;
      }
    }

    return raw;
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!auth?.token || !auth?.role) {
      navigate("/");
    }
  }, [auth, navigate]);

  useEffect(() => {
    return () => {
      if (cameraScannerRef.current) {
        cameraScannerRef.current
          .stop()
          .catch(() => null)
          .finally(() => {
            cameraScannerRef.current?.clear().catch(() => null);
          });
      }
    };
  }, []);

  const currentMode = SCANNER_MODES[activeMode];
  const enabledModes =
    auth?.role === "ADMIN"
      ? undefined
      : auth?.role
        ? [auth.role === "SEATING" ? "entry" : auth.role.toLowerCase()]
        : undefined;

  const hiddenModes = ["seating"];

  const submitScan = async (rawToken) => {
    const normalizedToken = normalizeScannedValue(rawToken);

    if (!normalizedToken) {
      setError("Enter a QR token to scan.");
      return;
    }

    if (!auth?.token) {
      setError("Your session has expired. Please login again.");
      clearAuthSession();
      navigate("/");
      return;
    }

    setError("");

    try {
      const [scanResponse, studentResponse] = await Promise.all([
        apiRequest("/api/scan", {
          method: "POST",
          body: {
            qrToken: normalizedToken,
            scanType: currentMode.scanType,
          },
          token: auth.token,
        }),
        apiRequest(`/api/student/${encodeURIComponent(normalizedToken)}`),
      ]);

      const nextPhase =
        STATE_TO_NEXT_PHASE[scanResponse.state] ||
        STATE_TO_NEXT_PHASE.REGISTERED;

      const seatLabel = scanResponse.seat
        ? scanResponse.seat.replace(/^([A-Z]+)(\d+)$/, "$1-$2")
        : studentResponse.seat?.section && studentResponse.seat?.number
          ? `${studentResponse.seat.section}-${studentResponse.seat.number}`
          : null;

      setResult({
        status: scanResponse.success
          ? STATE_LABEL[scanResponse.state] || "SUCCESS"
          : "REJECTED",
        statusColor: scanResponse.success ? "bg-emerald-600" : "bg-error",
        time: new Date().toLocaleTimeString(),
        student: studentResponse.name || "Unknown Student",
        idNumber: normalizedToken,
        seat: seatLabel,
        nextPhase: nextPhase.label,
        nextPhaseIcon: nextPhase.icon,
      });
      setShowResult(true);
    } catch (scanError) {
      const message = scanError.message || "Scan failed";
      setResult({
        status: "REJECTED",
        statusColor: "bg-error",
        time: new Date().toLocaleTimeString(),
        student: "Unknown Student",
        idNumber: normalizedToken,
        seat: null,
        nextPhase: "Verify Student Record",
        nextPhaseIcon: "error",
      });
      setShowResult(true);
      setError(message);

      if (
        message.toLowerCase().includes("invalid token") ||
        message.toLowerCase().includes("no token")
      ) {
        clearAuthSession();
        navigate("/");
      }
    }
  };

  const stopCamera = async () => {
    const scanner = cameraScannerRef.current;
    if (!scanner) return;

    try {
      await scanner.stop();
    } catch {
      // noop - scanner may already be stopped
    }

    try {
      await scanner.clear();
    } catch {
      // noop - scanner cleanup best effort
    }

    cameraScannerRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    if (startingCamera || cameraActive) return;

    // Hide the last scan result card when opening the camera.
    setShowResult(false);
    setStartingCamera(true);
    setCameraError("");

    try {
      const scanner = new Html5Qrcode(QR_READER_ELEMENT_ID);
      cameraScannerRef.current = scanner;

      const config = {
        fps: 12,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.floor(
            Math.min(viewfinderWidth, viewfinderHeight) * 0.72,
          );
          return {
            width: Math.max(180, edge),
            height: Math.max(180, edge),
          };
        },
      };

      const onSuccess = async (decodedText) => {
        await stopCamera();
        await submitScan(decodedText);
      };

      const onError = () => {
        // Ignore per-frame decode errors while scanning live stream.
      };

      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          onSuccess,
          onError,
        );
      } catch {
        // Fallback for browsers/devices that don't expose environment facing mode.
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras?.length) {
          throw new Error("No camera found");
        }

        await scanner.start(
          { deviceId: { exact: cameras[0].id } },
          config,
          onSuccess,
          onError,
        );
      }

      setCameraActive(true);
    } catch {
      setCameraError(
        "Unable to start camera. Allow camera permission and reload once, then try again.",
      );
      await stopCamera();
    } finally {
      setStartingCamera(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-hidden">
      {/* Top Bar */}
      <ScannerTopBar
        title="Scanner Ledger"
        counter={currentMode.counter}
        onSettings={() => console.log("Settings")}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-y-auto bg-surface-container-low/30 pb-24 md:pb-28">
        <div className="mx-auto w-full max-w-5xl px-3 pt-3 sm:px-5 sm:pt-4 md:px-6 md:pt-5">
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm sm:p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${cameraActive ? "bg-emerald-500" : "bg-outline"}`}
                />
                <span className="text-xs font-semibold text-on-surface-variant">
                  {cameraActive ? "Camera active" : "Camera off"}
                </span>
              </div>

              <button
                type="button"
                onClick={cameraActive ? stopCamera : startCamera}
                disabled={startingCamera}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {startingCamera
                  ? "Starting camera..."
                  : cameraActive
                    ? "Stop Camera"
                    : "Use Camera"}
              </button>
            </div>

            <p className="mt-2 text-xs text-on-surface-variant">
              Point your camera at a QR code. Scan triggers automatically.
            </p>

            {error ? (
              <p className="mt-2 text-xs font-medium text-error">{error}</p>
            ) : null}
            {cameraError ? (
              <p className="mt-2 text-xs font-medium text-error">
                {cameraError}
              </p>
            ) : null}
          </div>

          {/* Main Scanning Area */}
          <div className="mt-4">
            <ScannerFrame
              centerContent={
                <div className="relative h-full w-full bg-surface-container-low">
                  <div id={QR_READER_ELEMENT_ID} className="h-full w-full" />
                  {!cameraActive ? (
                    <div className="absolute inset-0 grid place-items-center text-center px-6">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          Camera preview will appear here
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Click "Use Camera" to begin scanning.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              }
            >
              <ScanResultCard
                show={showResult && !cameraActive && !startingCamera}
                status={result?.status}
                statusColor={result?.statusColor}
                time={result?.time}
                student={result?.student}
                idNumber={result?.idNumber}
                seat={result?.seat}
                nextPhase={result?.nextPhase}
                nextPhaseIcon={result?.nextPhaseIcon}
              />
            </ScannerFrame>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <ScannerBottomNav
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        enabledModes={enabledModes}
        hiddenModes={hiddenModes}
      />
    </div>
  );
}
