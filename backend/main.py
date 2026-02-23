# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os

from analyzer.gk_analyzer import analyze_gk_clip
from analyzer.power_analyzer import analyze_power_clip
from analyzer.speed_analyzer import analyze_speed_clip
from utils.downloader import download_video

app = FastAPI()

# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_videos"
os.makedirs(TEMP_DIR, exist_ok=True)


# ─────────────────────────────────────────
# Request Model
# ─────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    video_url: str
    station: str
    athlete: str


# ─────────────────────────────────────────
# Health Checkpip install fastapi uvicorn pydantic numpy opencv-python mediapipe requests
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ScoutAI FastAPI Running"}


# ─────────────────────────────────────────
# Main Analyze Endpoint
# ─────────────────────────────────────────

@app.post("/analyze")
def analyze_video(request: AnalyzeRequest):

    try:
        file_id = str(uuid.uuid4()) + ".mp4"
        local_path = os.path.join(TEMP_DIR, file_id)

        print("Downloading video...")
        download_video(request.video_url, local_path)
        print("Download complete:", local_path)

        if request.station == "goalkeeping":
            print("Running GK analyzer...")
            result = analyze_gk_clip(local_path)

        elif request.station == "power":
            print("Running Power analyzer...")
            result = analyze_power_clip(local_path)

        elif request.station == "speed":
            print("Running Speed analyzer...")
            result = analyze_speed_clip(local_path)

        else:
            raise HTTPException(status_code=400, detail="Invalid station")

        print("Analysis complete.")

        os.remove(local_path)

        return {
            "athlete": request.athlete,
            "station": request.station,
            "analysis": result
        }

    except Exception as e:
        print("ERROR OCCURRED:", e)
        raise HTTPException(status_code=500, detail=str(e))