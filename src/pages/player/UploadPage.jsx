import { useState } from "react";

export default function UploadPage({ user, onComplete }) {
  const [files, setFiles] = useState({
    power: null,
    goalkeeping: null,
    speed: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (station, file) => {
    setFiles(prev => ({ ...prev, [station]: file }));
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

      // 1️⃣ Upload all 3 videos
      const powerUrl = await uploadToCloudinary(files.power);
      const gkUrl = await uploadToCloudinary(files.goalkeeping);
      const speedUrl = await uploadToCloudinary(files.speed);

      // 2️⃣ Send to backend once
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

  return (
    <div>
      <h2>Upload All 3 Station Videos</h2>

      <input type="file" accept="video/*" onChange={(e) => handleChange("power", e.target.files[0])} />
      <input type="file" accept="video/*" onChange={(e) => handleChange("goalkeeping", e.target.files[0])} />
      <input type="file" accept="video/*" onChange={(e) => handleChange("speed", e.target.files[0])} />

      <button onClick={runFullAnalysis} disabled={loading}>
        {loading ? "Processing..." : "Run Full Assessment"}
      </button>
    </div>
  );
}
