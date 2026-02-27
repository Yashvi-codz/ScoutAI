import { useState, useRef } from "react";
import { Zap, Gauge, Shield, AlertCircle, Video, CheckCircle } from "lucide-react";

const STATIONS = [
  { key: "power", label: "Power", icon: Zap, color: "var(--amber)", desc: "Strength & explosive movement drill" },
  { key: "speed", label: "Speed", icon: Gauge, color: "var(--cyan)", desc: "Sprint or acceleration drill" },
  { key: "goalkeeping", label: "Goal Keeping", icon: Shield, color: "var(--green)", desc: "Goalkeeper-specific drill" },
];

const VIDEO_CAUTIONS = [
  "Record in good lighting with full body visible from head to feet.",
  "Keep videos between 15–60 seconds for best analysis.",
  "Use a stable camera; avoid shaky or rotating shots.",
  "Wear contrasting clothing so the AI can track your pose clearly.",
  "Perform the drill at game intensity for accurate metrics.",
];

export default function UploadPage({ user, onComplete }) {
  const [files, setFiles] = useState({
    power: null,
    goalkeeping: null,
    speed: null,
  });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const inputRefs = { power: useRef(null), speed: useRef(null), goalkeeping: useRef(null) };

  const handleChange = (station, file) => {
    setFiles((prev) => ({ ...prev, [station]: file || null }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.secure_url;
  };

  const runFullAnalysis = async () => {
    try {
      setLoading(true);
      const powerUrl = await uploadToCloudinary(files.power);
      const gkUrl = await uploadToCloudinary(files.goalkeeping);
      const speedUrl = await uploadToCloudinary(files.speed);
      const response = await fetch("http://127.0.0.1:8000/analyze-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athlete: user.name,
          power_url: powerUrl,
          goalkeeping_url: gkUrl,
          speed_url: speedUrl,
        }),
      });
      const result = await response.json();
      setLoading(false);
      onComplete(result);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const allSelected = files.power && files.goalkeeping && files.speed;

  return (
    <div className="page-pad">
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>New Assessment</h1>
        <p style={{ fontSize: 15, color: "var(--muted2)", maxWidth: 560 }}>
          Upload one video per station: Power, Speed, and Goal Keeping. Our AI will analyze all three and compute your Elite Potential Index.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {STATIONS.map(({ key, label, icon: Icon, color, desc }, idx) => (
          <div
            key={key}
            className="card fade-up"
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animationDelay: `${idx * 0.06}s`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--surface)",
                  border: `1px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 20, letterSpacing: 1.2, color: "var(--text)" }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
            <input
              ref={inputRefs[key]}
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={(e) => handleChange(key, e.target.files?.[0])}
            />
            <div
              className={`upload-zone ${dragOver === key ? "drag-over" : ""}`}
              style={{ padding: 32, flex: 1, minHeight: 120 }}
              onClick={() => inputRefs[key].current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const f = e.dataTransfer.files?.[0];
                if (f?.type.startsWith("video/")) handleChange(key, f);
              }}
            >
              {files[key] ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={28} style={{ color: "var(--green)" }} />
                  <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
                    {files[key].name}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Click or drop to replace</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Video size={28} style={{ color: "var(--muted2)" }} />
                  <span style={{ fontSize: 14, color: "var(--text2)" }}>Click or drop video</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>MP4, WebM, etc.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card fade-up" style={{ marginBottom: 28, padding: 20, borderLeft: "4px solid var(--amber)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <AlertCircle size={20} style={{ color: "var(--amber)" }} />
          <span style={{ fontFamily: "var(--font-head)", fontSize: 18, letterSpacing: 1, color: "var(--text)" }}>
            Video guidelines
          </span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--text2)", lineHeight: 1.9 }}>
          {VIDEO_CAUTIONS.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </div>

      <div className="fade-up">
        <button
          className="btn-primary"
          onClick={runFullAnalysis}
          disabled={loading || !allSelected}
          style={{ minWidth: 220 }}
        >
          {loading ? "Processing..." : "Run Full Assessment"}
        </button>
        {!allSelected && (
          <p style={{ fontSize: 13, color: "var(--muted2)", marginTop: 12 }}>
            Upload all three station videos to continue.
          </p>
        )}
      </div>
    </div>
  );
}
