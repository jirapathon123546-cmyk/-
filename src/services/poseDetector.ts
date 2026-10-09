/**
 * MediaPipe Pose Landmarker Service for Motor Adventure AI
 *ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล
 * Real-time 33-point human pose estimation with temporal smoothing
 */

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Landmark } from '../types';

// MediaPipe Pose Connections
export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12], // left shoulder to right shoulder
  [11, 23], // left shoulder to left hip
  [12, 24], // right shoulder to right hip
  [23, 24], // left hip to right hip
  // Left arm
  [11, 13], // left shoulder to left elbow
  [13, 15], // left elbow to left wrist
  // Right arm
  [12, 14], // right shoulder to right elbow
  [14, 16], // right elbow to right wrist
  // Left leg
  [23, 25], // left hip to left knee
  [25, 27], // left knee to left ankle
  [27, 29], // left ankle to left heel
  [29, 31], // left heel to left foot index
  [27, 31], // left ankle to left foot index
  // Right leg
  [24, 26], // right hip to right knee
  [26, 28], // right knee to right ankle
  [28, 30], // right ankle to right heel
  [30, 32], // right heel to right foot index
  [28, 32], // right ankle to right foot index
  // Head / Spine reference
  [0, 11],
  [0, 12],
];

export interface DetectionResult {
  landmarks: Landmark[] | null;
  worldLandmarks: Landmark[] | null;
  timestamp: number;
  confidence: number;
  isBodyVisible: boolean;
  warnings: string[];
}

class PoseDetectorService {
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private initError: string | null = null;
  private previousSmoothedLandmarks: Landmark[] | null = null;
  private smoothingAlpha: number = 0.65; // Temporal Exponential Moving Average filter (0 to 1)

  /**
   * Initialize MediaPipe PoseLandmarker
   */
  public async initialize(): Promise<boolean> {
    if (this.poseLandmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    this.initError = null;

    try {
      // Load WASM from Google / jsDelivr CDN
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitializing = false;
      return true;
    } catch (err) {
      console.error('Error initializing PoseLandmarker with GPU delegate, attempting CPU fallback:', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.45,
          minPosePresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });
        this.isInitializing = false;
        return true;
      } catch (fallbackErr) {
        this.isInitializing = false;
        this.initError = (fallbackErr as Error).message || 'Failed to load Pose Landmarker';
        console.error('Failed to initialize PoseLandmarker:', fallbackErr);
        return false;
      }
    }
  }

  public getInitError(): string | null {
    return this.initError;
  }

  public isReady(): boolean {
    return this.poseLandmarker !== null;
  }

  /**
   * Reset temporal smoothing cache
   */
  public resetSmoothing(): void {
    this.previousSmoothedLandmarks = null;
  }

  /**
   * Detect pose for current video frame
   */
  public detectVideoFrame(video: HTMLVideoElement, timestampMs: number): DetectionResult {
    if (!this.poseLandmarker || video.readyState < 2) {
      return {
        landmarks: null,
        worldLandmarks: null,
        timestamp: timestampMs,
        confidence: 0,
        isBodyVisible: false,
        warnings: ['กล้องยังไม่พร้อมประมวลผล'],
      };
    }

    try {
      const results = this.poseLandmarker.detectForVideo(video, timestampMs);

      if (!results.landmarks || results.landmarks.length === 0 || results.landmarks[0].length === 0) {
        this.previousSmoothedLandmarks = null;
        return {
          landmarks: null,
          worldLandmarks: null,
          timestamp: timestampMs,
          confidence: 0,
          isBodyVisible: false,
          warnings: ['ไม่พบร่างกายในกรอบภาพ กรุณาก้าวเข้ามายืนในระยะ 2-3 เมตร'],
        };
      }

      const rawLandmarks = results.landmarks[0] as Landmark[];
      const worldLandmarks = (results.worldLandmarks && results.worldLandmarks[0]) ? (results.worldLandmarks[0] as Landmark[]) : null;

      // Apply Exponential Moving Average (EMA) smoothing to reduce jitter
      const smoothedLandmarks: Landmark[] = rawLandmarks.map((pt, idx) => {
        if (!this.previousSmoothedLandmarks || !this.previousSmoothedLandmarks[idx]) {
          return { ...pt };
        }
        const prev = this.previousSmoothedLandmarks[idx];
        const a = this.smoothingAlpha;
        return {
          x: a * pt.x + (1 - a) * prev.x,
          y: a * pt.y + (1 - a) * prev.y,
          z: a * pt.z + (1 - a) * prev.z,
          visibility: pt.visibility,
        };
      });
      this.previousSmoothedLandmarks = smoothedLandmarks;

      // Calculate key joint confidence
      // Essential joints: shoulders (11, 12), hips (23, 24), knees (25, 26), ankles (27, 28)
      const keyJointIndices = [11, 12, 23, 24, 25, 26, 27, 28];
      let confidenceSum = 0;
      let count = 0;
      keyJointIndices.forEach((i) => {
        const joint = smoothedLandmarks[i];
        if (joint && joint.visibility !== undefined) {
          confidenceSum += joint.visibility;
          count++;
        }
      });
      const avgConfidence = count > 0 ? confidenceSum / count : 0.8;

      // Analyze framing warnings
      const warnings: string[] = [];
      const nose = smoothedLandmarks[0];
      const leftAnkle = smoothedLandmarks[27];
      const rightAnkle = smoothedLandmarks[28];
      const leftShoulder = smoothedLandmarks[11];
      const rightShoulder = smoothedLandmarks[12];

      if (nose && nose.y < 0.04) {
        warnings.push('ศีรษะอยู่ชิดขอบบนเกินไป ถอยหลังออกห่างจากกล้องเล็กน้อย');
      }
      if ((leftAnkle && leftAnkle.y > 0.98) || (rightAnkle && rightAnkle.y > 0.98)) {
        warnings.push('เท้าอาจหลุดออกจากขอบล่างของกล้อง');
      }
      if (leftShoulder && rightShoulder) {
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        if (shoulderWidth > 0.45) {
          warnings.push('นักเรียนยืนใกล้กล้องเกินไป กรุณาถอยห่างประมาณ 2-3 เมตร');
        } else if (shoulderWidth < 0.08) {
          warnings.push('นักเรียนอยู่ไกลเกินไป กรุณาขยับเข้ามาใกล้ขึ้น');
        }
      }

      const isBodyVisible = avgConfidence > 0.45;
      if (!isBodyVisible) {
        warnings.push('ความคมชัดของท่าทางยังไม่เพียงพอ ตรวจสอบแสงสว่างในห้อง');
      }

      return {
        landmarks: smoothedLandmarks,
        worldLandmarks,
        timestamp: timestampMs,
        confidence: avgConfidence,
        isBodyVisible,
        warnings,
      };
    } catch (err) {
      console.warn('detectVideoFrame execution exception:', err);
      return {
        landmarks: null,
        worldLandmarks: null,
        timestamp: timestampMs,
        confidence: 0,
        isBodyVisible: false,
        warnings: ['เกิดข้อผิดพลาดในการประมวลผลเฟรมภาพ'],
      };
    }
  }

  /**
   * Draw stylized skeleton and joints on canvas
   */
  public drawSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    mirrored: boolean = false
  ): void {
    ctx.save();

    // Line drawing styling for connections
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw connecting lines
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];

      if (!p1 || !p2) return;
      if ((p1.visibility ?? 1) < 0.35 || (p2.visibility ?? 1) < 0.35) return;

      const x1 = mirrored ? (1 - p1.x) * width : p1.x * width;
      const y1 = p1.y * height;
      const x2 = mirrored ? (1 - p2.x) * width : p2.x * width;
      const y2 = p2.y * height;

      // Color code by limb type: Torso (amber), Left limb (cyan), Right limb (pink/fuchsia)
      let strokeColor = '#38bdf8'; // sky blue
      if (startIdx >= 11 && startIdx <= 12 && endIdx >= 23 && endIdx <= 24) {
        strokeColor = '#fbbf24'; // amber for torso
      } else if (startIdx % 2 === 1 && endIdx % 2 === 1) {
        strokeColor = '#34d399'; // green for left limbs
      } else if (startIdx % 2 === 0 && endIdx % 2 === 0) {
        strokeColor = '#f472b6'; // pink for right limbs
      }

      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;

    // Draw key joint circles
    landmarks.forEach((p, index) => {
      // Only draw major joints: nose, shoulders, elbows, wrists, hips, knees, ankles, feet
      const majorJoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32];
      if (!majorJoints.includes(index)) return;
      if ((p.visibility ?? 1) < 0.35) return;

      const cx = mirrored ? (1 - p.x) * width : p.x * width;
      const cy = p.y * height;

      // Circle styling
      const radius = index === 0 ? 8 : 6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#facc15' : '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Outer glow ring for hands and feet
      if ([15, 16, 27, 28, 31, 32].includes(index)) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Draw Mid-Hip Center of Gravity point (CoG)
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    if (leftHip && rightHip && (leftHip.visibility ?? 1) > 0.4 && (rightHip.visibility ?? 1) > 0.4) {
      const midX = (leftHip.x + rightHip.x) / 2;
      const midY = (leftHip.y + rightHip.y) / 2;
      const cx = mirrored ? (1 - midX) * width : midX * width;
      const cy = midY * height;

      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b'; // amber gold
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Crosshair on CoG
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy);
      ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx, cy - 5);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export const poseDetector = new PoseDetectorService();
