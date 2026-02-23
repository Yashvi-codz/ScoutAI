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
from db.mongo import assessments_collection
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Dict, Any ,Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FullAnalyzeRequest(BaseModel):
    athlete: str
    power_url: str
    goalkeeping_url: str
    speed_url: str

class SaveAssessmentRequest(BaseModel):
    athlete: str
    stations: Dict[str, Any]
    metrics: Dict[str, Any]
    overall_score: float
    tier: str

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
    
@app.post("/analyze-full")
def analyze_full(request: FullAnalyzeRequest):

    try:
        def process_clip(url, analyzer_func):
            file_id = str(uuid.uuid4()) + ".mp4"
            local_path = os.path.join(TEMP_DIR, file_id)

            download_video(url, local_path)
            result = analyzer_func(local_path)
            os.remove(local_path)

            return result

        # 1️⃣ Run all 3 analyzers
        power_result = process_clip(request.power_url, analyze_power_clip)
        gk_result = process_clip(request.goalkeeping_url, analyze_gk_clip)
        speed_result = process_clip(request.speed_url, analyze_speed_clip)

        # Extract scores safely
        power_score = list(power_result.values())[0]["score"]
        gk_score = list(gk_result.values())[0]["score"]
        speed_score = list(speed_result.values())[0]["score"]

        # 2️⃣ Compute average
        overall_score = round((power_score + gk_score + speed_score) / 3, 2)

        # 3️⃣ Build unified metrics
        unified_metrics = {
            "speed": speed_score,
            "acceleration": speed_score,
            "agility": power_score,
            "balance": gk_score,
            "technique": gk_score,
            "stamina": power_score,
        }

        # 4️⃣ Tier logic
        if overall_score >= 90:
            tier = "A"
        elif overall_score >= 75:
            tier = "B"
        elif overall_score >= 60:
            tier = "C"
        else:
            tier = "D"

        # 5️⃣ Create document
        document = {
            "athlete": request.athlete,
            "stations": {
                "power": power_result,
                "goalkeeping": gk_result,
                "speed": speed_result,
            },
            "metrics": unified_metrics,
            "overall_score": overall_score,
            "tier": tier,
            "created_at": datetime.now(timezone.utc),
        }

        # 6️⃣ Save to MongoDB
        result = assessments_collection.insert_one(document)

        saved_doc = assessments_collection.find_one({"_id": result.inserted_id})

        saved_doc["_id"] = str(saved_doc["_id"])

        return saved_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))