import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_PATH = os.path.join("models", "pose_landmarker_full.task")


def analyze_speed_clip(video_path):

    if not os.path.exists(video_path):
        raise Exception("Video file not found")

    BaseOptions = python.BaseOptions
    PoseLandmarker = vision.PoseLandmarker
    PoseLandmarkerOptions = vision.PoseLandmarkerOptions
    VisionRunningMode = vision.RunningMode

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=VisionRunningMode.VIDEO
    )

    landmarker = PoseLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    frame_index = 0
    hip_x_positions = []

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        timestamp = int((frame_index / fps) * 1000)
        result = landmarker.detect_for_video(mp_image, timestamp)

        if result.pose_landmarks:
            landmarks = result.pose_landmarks[0]

            left_hip = landmarks[23]
            right_hip = landmarks[24]

            hip_x = (left_hip.x + right_hip.x) / 2
            hip_x_positions.append(hip_x)

        frame_index += 1

    cap.release()

    if len(hip_x_positions) < 2:
        return {"error": "Not enough movement detected"}

    displacement = max(hip_x_positions) - min(hip_x_positions)
    speed_estimate = displacement * fps

    score = min(100, speed_estimate * 100)

    return {
        "sprint_speed": {
            "score": round(score, 2),
            "metrics": {
                "horizontal_displacement": round(displacement, 4),
                "speed_estimate": round(speed_estimate, 4)
            }
        }
    }