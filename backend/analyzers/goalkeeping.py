import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# --- CONFIGURATION ---
MODEL_PATH = '../models/pose_landmarker_full.task'

def normalize(val, min_val, max_val):
    """Normalizes value to 0-100 scale with clamping."""
    if max_val == min_val: return 0
    score = ((val - min_val) / (max_val - min_val)) * 100
    return max(0, min(100, score))

def analyze_gk_clip(video_path):
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO)

    detector = vision.PoseLandmarker.create_from_options(options)
    video = cv2.VideoCapture(video_path)
    fps = video.get(cv2.CAP_PROP_FPS)
    
    data = []
    frame_count = 0

    while video.isOpened():
        ret, frame = video.read()
        if not ret: break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        ts_ms = int((frame_count / fps) * 1000)
        result = detector.detect_for_video(mp_image, ts_ms)

        if result.pose_landmarks:
            lm = result.pose_landmarks[0]
            # Tracking wrists (reflexes) and hips (dive power)
            row = {
                't': ts_ms / 1000.0,
                'l_wrist': np.array([lm[15].x, lm[15].y]),
                'r_wrist': np.array([lm[16].x, lm[16].y]),
                'hips': np.array([(lm[23].x + lm[24].x)/2, (lm[23].y + lm[24].y)/2]),
                'l_ankle': np.array([lm[27].x, lm[27].y]),
                'r_ankle': np.array([lm[28].x, lm[28].y])
            }
            data.append(row)
        frame_count += 1
    video.release()

    # --- CALCULATIONS ---
    # 1. Reflex & Hand Speed (Tracking the fastest moving wrist)
    l_wrist_pos = np.array([d['l_wrist'] for d in data])
    r_wrist_pos = np.array([d['r_wrist'] for d in data])
    
    l_vel = np.linalg.norm(np.diff(l_wrist_pos, axis=0), axis=1) * fps
    r_vel = np.linalg.norm(np.diff(r_wrist_pos, axis=0), axis=1) * fps
    
    peak_hand_vel = max(np.max(l_vel), np.max(r_vel))
    avg_hand_speed = (np.mean(l_vel) + np.mean(r_vel)) / 2
    
    # Hand Travel Distance (Total path of dominant hand)
    hand_travel = np.sum(np.max([l_vel, r_vel], axis=0)) / fps

    # 2. Dive Metrics
    hip_pos = np.array([d['hips'] for d in data])
    lateral_displacement = np.ptp(hip_pos[:, 0]) # Peak-to-peak X movement
    
    # Body Extension (Distance between furthest ankle and furthest wrist)
    extensions = [np.linalg.norm(d['l_wrist'] - d['r_ankle']) for d in data]
    max_extension = max(extensions)

    # 3. Reaction Logic (Time from first hip movement to peak velocity)
    hip_vel = np.linalg.norm(np.diff(hip_pos, axis=0), axis=1)
    # Simplified: reaction delay is time to reach 10% of peak velocity
    reaction_frame = np.where(hip_vel > (np.max(hip_vel) * 0.1))[0][0]
    reaction_delay = data[reaction_frame]['t'] - data[0]['t']

    # --- SCORE GENERATION ---
    reaction_score = 100 - normalize(reaction_delay, 0, 0.5)
    lateral_score = normalize(lateral_displacement, 0, 0.6)
    extension_score = normalize(max_extension, 0.4, 0.9)
    velocity_score = normalize(peak_hand_vel, 0, 4)

    result_object = {
        "gk_dive_analysis": {
            "overall_score": round((reaction_score + lateral_score + extension_score) / 3, 2),
            "metrics_0_to_100": {
                "reaction_speed": round(reaction_score, 2),
                "lateral_dive_distance": round(lateral_score, 2),
                "body_extension": round(extension_score, 2),
                "velocity_rating": round(velocity_score, 2)
            }
        },
        "gk_reflex_analysis": {
            "reaction_speed_score": round(reaction_score, 2),
            "hand_travel_distance": round(normalize(hand_travel, 0, 0.5), 2),
            "hand_speed": round(normalize(avg_hand_speed, 0, 2), 2),
            "torso_shift": round(normalize(lateral_displacement, 0, 0.3), 2),
            "hand_peak_velocity": round(normalize(peak_hand_vel, 0, 3), 2)
        }
    }

    return result_object

# Execute
results = analyze_gk_clip('../videos/gk_dive_drill.mp4')
print(results)