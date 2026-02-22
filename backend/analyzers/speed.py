import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# --- CONFIGURATION ---
MODEL_PATH = '../models/pose_landmarker_full.task'

def normalize(val, min_val, max_val):
    """Clamps and normalizes values to a 0-100 scale."""
    if max_val == min_val: return 0
    score = ((val - min_val) / (max_val - min_val)) * 100
    return max(0, min(100, score))

def calculate_metrics(video_path):
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO)

    detector = vision.PoseLandmarker.create_from_options(options)
    video = cv2.VideoCapture(video_path)
    fps = video.get(cv2.CAP_PROP_FPS)
    
    com_history = []
    timestamps = []
    frame_count = 0

    while video.isOpened():
        ret, frame = video.read()
        if not ret: break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        timestamp_ms = int((frame_count / fps) * 1000)
        detection_result = detector.detect_for_video(mp_image, timestamp_ms)

        if detection_result.pose_landmarks:
            lm = detection_result.pose_landmarks[0]
            # Center of Mass (Mid-hip)
            cx = (lm[23].x + lm[24].x) / 2
            cy = (lm[23].y + lm[24].y) / 2
            com_history.append(np.array([cx, cy]))
            timestamps.append(timestamp_ms / 1000.0)

        frame_count += 1
    video.release()

    # --- SIGNAL PROCESSING ---
    com_history = np.array(com_history)
    dt = 1/fps
    
    # Horizontal Velocity (X-axis)
    velocities = np.diff(com_history[:, 0]) / dt
    accelerations = np.diff(velocities) / dt
    
    # 1. Sprint Speed Calculations
    max_vel = np.max(np.abs(velocities))
    avg_vel = np.mean(np.abs(velocities))
    max_accel = np.max(np.abs(accelerations))
    # Stride freq approximation (oscillations in Y-axis CoM)
    y_signal = com_history[:, 1]
    peaks = len([i for i in range(1, len(y_signal)-1) if y_signal[i-1] < y_signal[i] > y_signal[i+1]])
    stride_freq = peaks / timestamps[-1]

    # 2. Agility Calculations (Detecting the "Turns")
    # A turn is where velocity flips sign (positive to negative)
    direction_changes = np.where(np.diff(np.sign(velocities)))[0]
    turn_rate = len(direction_changes) / timestamps[-1]
    
    # Average Turn Angle (Simplified as deviation from linear path during turns)
    lateral_velocity = np.mean(np.abs(np.diff(com_history[:, 1]) / dt))

    # 3. Stamina & Consistency
    # Split velocities in half to see if second half slows down
    mid = len(velocities) // 2
    stamina_maintenance = np.mean(np.abs(velocities[mid:])) / (np.mean(np.abs(velocities[:mid])) + 1e-6)
    velocity_variance = np.std(np.abs(velocities))

    # --- FINAL OBJECTS ---
    
    movement_sprint_speed = {
        "score": normalize(avg_vel, 0, 1.5),
        "metrics": {
            "max_velocity_norm": normalize(max_vel, 0, 2.5),
            "acceleration_norm": normalize(max_accel, 0, 10),
            "stride_freq_norm": normalize(stride_freq, 0, 4),
            "avg_velocity_raw": round(float(avg_vel), 2)
        }
    }

    movement_agility = {
        "normalized": normalize(turn_rate, 0, 0.5),
        "children": {
            "direction_change_rate": normalize(turn_rate, 0, 0.5),
            "average_turn_angle": normalize(1 - lateral_velocity, 0.8, 1.0), # Higher score for tighter lines
            "lateral_velocity": normalize(lateral_velocity, 0, 0.2)
        }
    }

    stamina_drill_analysis = {
        "intensity_duration_score": normalize(timestamps[-1], 0, 10),
        "avg_stride_speed_score": normalize(avg_vel * stride_freq, 0, 5),
        "stamina_maintenance_score": normalize(stamina_maintenance, 0.5, 1.2),
        "fatigue_resistance": normalize(stamina_maintenance, 0.7, 1.0),
        "stride_consistency_score": 100 - normalize(velocity_variance, 0, 0.5)
    }

    return {
        "movement_sprint_speed": movement_sprint_speed,
        "movement_agility": movement_agility,
        "stamina_drill_analysis": stamina_drill_analysis
    }

# Execute
results = calculate_metrics('../videos/shuttle_run_drill.mp4')
print(results)