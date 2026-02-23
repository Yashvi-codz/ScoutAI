import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_PATH = os.path.join("models", "pose_landmarker_full.task")


def analyze_power_clip(video_path):

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
    hip_positions = []

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

            hip_y = (left_hip.y + right_hip.y) / 2
            hip_positions.append(hip_y)

        frame_index += 1

    cap.release()

    if not hip_positions:
        return {"error": "No pose detected"}

    min_hip = min(hip_positions)
    max_hip = max(hip_positions)

    jump_height = max_hip - min_hip
    score = min(100, jump_height * 300)

    return {
        "power_jump": {
            "score": round(score, 2),
            "metrics": {
                "hip_vertical_range": round(jump_height, 4)
            }
        }
    }