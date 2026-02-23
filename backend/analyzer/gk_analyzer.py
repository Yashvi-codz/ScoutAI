import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_PATH = os.path.join("models", "pose_landmarker_full.task")


def calculate_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def analyze_gk_clip(video_path):

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
    wrist_movements = []
    hip_drop = []

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

            left_wrist = landmarks[15]
            right_wrist = landmarks[16]
            left_hip = landmarks[23]
            right_hip = landmarks[24]

            wrist_distance = calculate_distance(
                (left_wrist.x, left_wrist.y),
                (right_wrist.x, right_wrist.y)
            )

            hip_y = (left_hip.y + right_hip.y) / 2

            wrist_movements.append(wrist_distance)
            hip_drop.append(hip_y)

        frame_index += 1

    cap.release()

    if not wrist_movements:
        return {"error": "No pose detected"}

    max_reach = float(max(wrist_movements))
    dive_depth = float(max(hip_drop) - min(hip_drop))

    score = min(100, (max_reach * 100) + (dive_depth * 100))

    return {
        "goalkeeping": {
            "score": round(score, 2),
            "metrics": {
                "max_wrist_reach": round(max_reach, 4),
                "hip_vertical_range": round(dive_depth, 4)
            }
        }
    }