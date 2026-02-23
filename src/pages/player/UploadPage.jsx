// ═══════════════════════════════════════════════════════
//  ScoutAI — 3 Station Sequential Assessment
//  Flow: Cloudinary → FastAPI → UI Progress → Next Station
// ═══════════════════════════════════════════════════════

import { useState, useRef } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

import { classifyTier } from "../../engine/tierEngine";

// ───────────────────────────────────────────────────────
// 3 STATIONS
// ───────────────────────────────────────────────────────

const STATIONS = [
  {
    id: "power",
    label: "Power Station",
    icon: "🆙",
    color: "var(--gold)",
    description: "Explosive vertical jump power analysis.",
  },
  {
    id: "goalkeeping",
    label: "Goalkeeping Station",
    icon: "🧤",
    color: "var(--cyan)",
    description: "Dive extension + reflex mechanics.",
  },
  {
    id: "speed",
    label: "Speed Station",
    icon: "💨",
    color: "var(--green)",
    description: "Sprint acceleration & velocity analysis.",
  },
];

// ───────────────────────────────────────────────────────
// Processing Steps (shown in UI)
// ───────────────────────────────────────────────────────

const PROCESS_STEPS = [
  "Uploading to Cloudinary",
  "Sending video URL to FastAPI",
  "Extracting frames (OpenCV)",
  "Running MediaPipe Pose (33 landmarks)",
  "Computing biomechanical metrics",
  "Generating ML score",
  "Finalising report",
];

export default function UploadPage({ user, onComplete }) {
  const [step, setStep] = useState("station"); // station | upload | processing
  const [currentIndex, setCurrentIndex] = useState(0);
  const [file, setFile] = useState(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [results, setResults] = useState({});
  const [error, setError] = useState("");
  const fileRef = useRef();

  const currentStation = STATIONS[currentIndex];

  // ───────────────────────────────────────────────────────
  // File Handler
  // ───────────────────────────────────────────────────────

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) {
      setError("File must be under 200MB.");
      return;
    }
    setError("");
    setFile(f);
  };

  // ───────────────────────────────────────────────────────
  // MOCK CLOUDINARY UPLOAD
  // Replace URL + preset with real one later
  // ───────────────────────────────────────────────────────

  const uploadToCloudinary = async (file) => {
    setProcessingStep(0);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
    );

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();

    return data.secure_url; // This goes to FastAPI
  };

  // ───────────────────────────────────────────────────────
  // MOCK FASTAPI CALL
  // Replace endpoint with real backend later
  // ───────────────────────────────────────────────────────
  const sendToFastAPI = async (videoUrl, stationId) => {
    const API = process.env.VITE_FASTAPI_URL;

    setProcessingStep(1);

    const response = await fetch(`http://127.0.0.1:8000/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_url: videoUrl,
        station: stationId,
        athlete: user.name,
      }),
    });

    if (!response.ok) {
      throw new Error("FastAPI processing failed");
    }

    setProcessingStep(2);
    setProcessingStep(3);
    setProcessingStep(4);
    setProcessingStep(5);
    setProcessingStep(6);

    const data = await response.json();

    // IMPORTANT: adapt to backend structure
    const stationKey = Object.keys(data.analysis)[0];

    return {
      score: data.analysis[stationKey].score,
      metrics: data.analysis[stationKey].metrics,
    };
  };

  // ───────────────────────────────────────────────────────
  // Main Analysis Flow
  // ───────────────────────────────────────────────────────

  const runAnalysis = async () => {
    try {
      setStep("processing");

      // 1️⃣ Upload to Cloudinary
      const videoUrl = await uploadToCloudinary(file);

      // 2️⃣ Send URL to FastAPI
      const result = await sendToFastAPI(videoUrl, currentStation.id);

      const updatedResults = {
        ...results,
        [currentStation.id]: result,
      };

      setResults(updatedResults);

      // 3️⃣ Move to next station
      if (currentIndex < STATIONS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFile(null);
        setProcessingStep(0);
        setStep("station");
      } else {
        // Final composite score
        const avg =
          Object.values(updatedResults).reduce((a, b) => a + b.score, 0) / 3;

        onComplete({
          athlete: user.name,
          stations: updatedResults,
          overall: Math.round(avg),
          tier: classifyTier(avg),
        });
      }
    } catch (err) {
      setError("Analysis failed.");
      setStep("station");
    }
  };

  // ───────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────

  return (
    <div className="page-pad">
      {/* ───────── Station Screen ───────── */}
      {step === "station" && (
        <div>
          <h1 className="section-title">Station {currentIndex + 1} of 3</h1>

          <div
            className="card"
            style={{
              padding: 28,
              borderColor: currentStation.color,
              marginTop: 20,
            }}
          >
            <div style={{ fontSize: 48 }}>{currentStation.icon}</div>
            <h2
              style={{
                color: currentStation.color,
                marginTop: 10,
              }}
            >
              {currentStation.label}
            </h2>
            <p style={{ marginTop: 8 }}>{currentStation.description}</p>

            <button
              className="btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => setStep("upload")}
            >
              Start <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ───────── Upload Screen ───────── */}
      {step === "upload" && (
        <div>
          <h2>Upload Video — {currentStation.label}</h2>

          <div
            className="upload-zone"
            onClick={() => fileRef.current.click()}
            style={{ minHeight: 260, marginTop: 20 }}
          >
            {file ? (
              <div>
                <CheckCircle size={40} color="var(--green)" />
                <div>{file.name}</div>
                <div>{(file.size / (1024 * 1024)).toFixed(1)} MB</div>
              </div>
            ) : (
              <div>
                <Upload size={40} />
                <div>Click to select video</div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {error && (
            <div style={{ color: "red", marginTop: 10 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={!file}
            className="btn-primary"
            style={{ marginTop: 20 }}
          >
            <Zap size={16} /> Analyse
          </button>
        </div>
      )}

      {/* ───────── Processing Screen ───────── */}
      {step === "processing" && (
        <div style={{ marginTop: 40 }}>
          <h2>Processing — {currentStation.label}</h2>

          <div style={{ marginTop: 30 }}>
            {PROCESS_STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  marginBottom: 6,
                  background:
                    i <= processingStep
                      ? "rgba(0,255,135,0.08)"
                      : "transparent",
                  borderRadius: 8,
                  border:
                    i === processingStep
                      ? "1px solid var(--green)"
                      : "1px solid transparent",
                }}
              >
                {i < processingStep ? (
                  <CheckCircle size={14} color="var(--green)" />
                ) : (
                  "⏳"
                )}{" "}
                {s}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              height: 6,
              background: "var(--surface)",
              borderRadius: 99,
            }}
          >
            <div
              style={{
                width: `${
                  ((processingStep + 1) / PROCESS_STEPS.length) * 100
                }%`,
                height: "100%",
                background: "linear-gradient(90deg,var(--green),var(--cyan))",
                borderRadius: 99,
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
