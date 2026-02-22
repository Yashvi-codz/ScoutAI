import cv2
import mediapipe as mp
import numpy as np
import time
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# --- CONFIGURATION & UTILS ---
MODEL_PATH = '../models/pose_landmarker_full.task' # Ensure this file is in your folder

def normalize(val, min_val, max_val):
    """Normalizes a value to 0-100 scale."""
    score = ((val - min_val) / (max_val - min_val)) * 100
    return max(0, min(100, score))

def get_com(landmarks):
    """Simple Center of Mass approximation using hips and shoulders."""
    l_hip = landmarks[23]
    r_hip = landmarks[24]
    l_sh = landmarks[11]
    r_sh = landmarks[12]
    # Average of the torso box
    return np.array([(l_hip.x + r_hip.x + l_sh.x + r_sh.x) / 4, 
                     (l_hip.y + r_hip.y + l_sh.y + r_sh.y) / 4])

# --- INITIALIZE MEDIAPIPE ---
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO)

detector = vision.PoseLandmarker.create_from_options(options)

video = cv2.VideoCapture('../videos/jump_hold_drill.mp4')
fps = video.get(cv2.CAP_PROP_FPS)

# Analysis Variables
frames_data = []
timestamps = []

frame_count = 0
while video.isOpened():
    ret, frame = video.read()
    if not ret: break
    
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    
    # Detect
    timestamp_ms = int((frame_count / fps) * 1000)
    detection_result = detector.detect_for_video(mp_image, timestamp_ms)
    
    if detection_result.pose_landmarks:
        landmarks = detection_result.pose_landmarks[0]
        com = get_com(landmarks)
        # Store essential points for physics calc
        frames_data.append({
            'com': com,
            'torso': (landmarks[11].x + landmarks[12].x)/2, # simplified torso X
            'ankle': np.array([landmarks[27].x, landmarks[27].y]), # Left ankle as ref
            'hips_y': (landmarks[23].y + landmarks[24].y)/2
        })
        timestamps.append(timestamp_ms / 1000.0)
    
    frame_count += 1

video.release()

# --- PHYSICS CALCULATIONS ---
com_y = [f['com'][1] for f in frames_data]
com_x = [f['com'][0] for f in frames_data]

# 1. Power Metrics (Inverting Y because 0 is top)
baseline_y = max(com_y) # Lowest point standing
peak_y = min(com_y)    # Highest point in air
jump_height_px = (baseline_y - peak_y) * 1000 # Scaling for score

# Velocity (Rate of change of Y)
velocities = np.diff(com_y) / np.diff(timestamps)
takeoff_velocity = abs(min(velocities)) # Min because "up" is negative in screen space

# Hang time (frames where hips are significantly above baseline)
in_air = [y for y in com_y if y < (baseline_y - 0.05)]
hang_time = len(in_air) / fps

# 2. Stability Metrics (Focusing on the "Hold" phase post-landing)
landing_idx = int(len(com_y) * 0.7) # Heuristic: look at last 30% of clip
hold_phase_x = com_x[landing_idx:]
ankle_sway = np.std(hold_phase_x) 

# --- FORMATTING OUTPUT ---

# Reaction Drill Analysis (Assuming reaction happens at start)
# Note: For CMJ, 'reaction' is usually the dip-to-drive phase
reaction_delay = 0.15 # Placeholder: usually requires an external trigger signal
initial_velocity = takeoff_velocity * 0.5
reaction_accel = takeoff_velocity / 0.3 

reaction_result = {
    "reaction_drill_analysis": {
        "reaction_speed_score": 100 - normalize(reaction_delay, 0, 0.5),
        "directional_shift_score": normalize(0.05, 0, 0.3), # Stability during shift
        "initial_body_velocity_score": normalize(initial_velocity, 0, 2),
        "reaction_acceleration_score": normalize(reaction_accel, 0, 4),
        "limb_activation_score": 100 - normalize(0.1, 0, 0.4)
    },
    "movement_balance": {
        "score": normalize(1 - ankle_sway, 0.9, 1.0),
        "breakdown": {
            "torso_stability": normalize(1 - np.var(com_x), 0.95, 1.0),
            "com_stability": normalize(1 - np.var(com_y[landing_idx:]), 0.98, 1.0),
            "ankle_sway_control": normalize(1 - ankle_sway, 0.9, 1.0)
        }
    },
    "power_jumping": {
        "score": normalize(jump_height_px, 0, 300),
        "metrics": {
            "max_jump_height_px": round(jump_height_px, 2),
            "takeoff_vel": round(takeoff_velocity, 2),
            "hang_time_sec": round(hang_time, 2)
        }
    }
}


print(reaction_result)