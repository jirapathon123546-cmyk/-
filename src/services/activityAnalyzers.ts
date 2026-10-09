/**
 * Biomechanical Analysis Algorithms for Motor Adventure AI
 *ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล
 * Real geometric, angular, and temporal tracking for 5 domains
 */

import { Landmark, ActivityCriteria, CameraCalibration } from '../types';

export interface AnalysisFrameState {
  currentReps: number;
  currentDuration: number; // seconds
  currentDistance: number; // meters
  stabilityScore: number; // 0 to 100
  repProgress: number; // 0 to 100% towards current rep
  statusMessage: string;
  isRepCompletedThisFrame: boolean;
  cuePrompt?: string;
  debugValues?: Record<string, number | string>;
}

// Helper: Calculate 2D Euclidean distance
export function distance2D(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Helper: Calculate angle at point B given points A, B, C in degrees
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

// Helper: Calculate trunk lean angle relative to vertical (0 deg = perfectly upright)
export function calculateTrunkLean(leftShoulder: Landmark, rightShoulder: Landmark, leftHip: Landmark, rightHip: Landmark): number {
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  const dx = midShoulderX - midHipX;
  const dy = midShoulderY - midHipY; // dy is negative because Y increases downwards
  const radians = Math.atan2(dx, -dy);
  return Math.abs((radians * 180.0) / Math.PI);
}

export class ActivityAnalyzer {
  private activityId: string;
  private criteria: ActivityCriteria;
  private calibration: CameraCalibration;
  
  // State variables across frames
  private completedReps: number = 0;
  private statePhase: string = 'idle'; // e.g. 'ready', 'holding', 'swing_back', 'step_left', etc.
  private phaseTimer: number = 0; // accumulated seconds in current state
  private baselineHipX: number | null = null;
  private baselineHipY: number | null = null;
  private stepCount: number = 0;
  private lastStepLeg: 'left' | 'right' | null = null;
  private currentCueDirection: 'left' | 'right' = 'left';
  private cueStartTime: number = 0;
  private sequenceStep: number = 1; // For 3-step routine
  private activeWaypointIndex: number = 0; // For obstacle waypoints

  constructor(activityId: string, criteria: ActivityCriteria, calibration: CameraCalibration) {
    this.activityId = activityId;
    this.criteria = criteria;
    this.calibration = calibration;
  }

  public reset(): void {
    this.completedReps = 0;
    this.statePhase = 'idle';
    this.phaseTimer = 0;
    this.baselineHipX = null;
    this.baselineHipY = null;
    this.stepCount = 0;
    this.lastStepLeg = null;
    this.sequenceStep = 1;
    this.activeWaypointIndex = 0;
  }

  /**
   * Main per-frame analysis tick
   */
  public analyzeFrame(
    landmarks: Landmark[] | null,
    deltaSeconds: number,
    sessionElapsedSeconds: number
  ): AnalysisFrameState {
    if (!landmarks || landmarks.length < 33) {
      return {
        currentReps: this.completedReps,
        currentDuration: this.phaseTimer,
        currentDistance: 0,
        stabilityScore: 0,
        repProgress: 0,
        statusMessage: 'กรุณายืนให้กล้องมองเห็นร่างกายชัดเจน',
        isRepCompletedThisFrame: false,
      };
    }

    // Extract key landmarks
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    const midHipX = (leftHip.x + rightHip.x) / 2;
    const midHipY = (leftHip.y + rightHip.y) / 2;

    if (this.baselineHipX === null) {
      this.baselineHipX = midHipX;
      this.baselineHipY = midHipY;
    }

    let isRepCompleted = false;
    let statusMessage = 'กำลังวิเคราะห์ท่าทาง...';
    let stabilityScore = 80;
    let repProgress = 0;
    let cuePrompt: string | undefined = undefined;
    const debugValues: Record<string, number | string> = {};

    // -------------------------------------------------------------
    // DOMAIN 1: BALANCE SKILLS
    // -------------------------------------------------------------
    if (this.activityId === 'bal-1') {
      // Bipedal Static Balance
      const trunkLean = calculateTrunkLean(leftShoulder, rightShoulder, leftHip, rightHip);
      const hipDrift = Math.abs(midHipX - this.baselineHipX);
      debugValues['Trunk Lean (deg)'] = trunkLean.toFixed(1);
      debugValues['Hip Drift'] = hipDrift.toFixed(3);

      const isStable = trunkLean < 14 && hipDrift < 0.08;
      stabilityScore = Math.max(0, Math.min(100, Math.round(100 - trunkLean * 3 - hipDrift * 300)));

      if (isStable) {
        this.phaseTimer += deltaSeconds;
        statusMessage = `ทรงตัวได้มั่นคง! (${this.phaseTimer.toFixed(1)} / ${this.criteria.targetDurationSeconds} วินาที)`;
        repProgress = Math.min(100, (this.phaseTimer / this.criteria.targetDurationSeconds) * 100);

        if (this.phaseTimer >= this.criteria.targetDurationSeconds) {
          this.completedReps++;
          isRepCompleted = true;
          this.phaseTimer = 0;
          this.baselineHipX = midHipX;
        }
      } else {
        statusMessage = 'พยายามตั้งลำตัวตรงและยืนนิ่ง ๆ ครับ';
        this.phaseTimer = Math.max(0, this.phaseTimer - deltaSeconds * 0.5);
      }
    } else if (this.activityId === 'bal-2') {
      // Single-Leg Balance
      const leftAnkleLift = rightAnkle.y - leftAnkle.y; // Positive if left ankle is higher (y is downwards)
      const rightAnkleLift = leftAnkle.y - rightAnkle.y; // Positive if right ankle is higher
      const ankleDelta = Math.abs(leftAnkle.y - rightAnkle.y);

      const isLeftLifted = leftAnkleLift > 0.07;
      const isRightLifted = rightAnkleLift > 0.07;
      const isOneLegLifted = isLeftLifted || isRightLifted;

      debugValues['Ankle Delta'] = ankleDelta.toFixed(3);
      debugValues['Leg Lifted'] = isLeftLifted ? 'ซ้าย' : isRightLifted ? 'ขวา' : 'ยังไม่ยก';

      if (isOneLegLifted) {
        this.phaseTimer += deltaSeconds;
        statusMessage = `ยกขาค้างไว้ได้ดีมาก! (${this.phaseTimer.toFixed(1)} / ${this.criteria.targetDurationSeconds} วิ)`;
        repProgress = Math.min(100, (this.phaseTimer / this.criteria.targetDurationSeconds) * 100);
        stabilityScore = 85;

        if (this.phaseTimer >= this.criteria.targetDurationSeconds) {
          this.completedReps++;
          isRepCompleted = true;
          this.phaseTimer = 0;
        }
      } else {
        statusMessage = 'ยกเท้าข้างหนึ่งขึ้นเหนือพื้นค้างไว้ครับ';
        this.phaseTimer = Math.max(0, this.phaseTimer - deltaSeconds * 0.8);
      }
    } else if (this.activityId === 'bal-3') {
      // Tandem / Straight Line Walk
      // Analyze foot placement close to central corridor
      const ankleCorrDrift = Math.abs(midHipX - 0.5);
      const ankleDistance = Math.abs(leftAnkle.y - rightAnkle.y);

      if (ankleDistance > 0.09) {
        if (this.statePhase !== 'step') {
          this.statePhase = 'step';
          this.stepCount++;
          if (this.stepCount % 2 === 0) {
            this.completedReps++;
            isRepCompleted = true;
          }
        }
      } else {
        this.statePhase = 'stance';
      }

      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
      statusMessage = `ก้าวเดินตามเส้นตรงอย่างต่อเนื่อง (ก้าวที่ ${this.stepCount})`;
      debugValues['Step Count'] = this.stepCount;
      debugValues['Line Deviation'] = ankleCorrDrift.toFixed(3);
    } else if (this.activityId === 'bal-4') {
      // Lateral Weight Shift (ซ้าย-ขวา)
      const shiftX = midHipX - this.baselineHipX;
      debugValues['Shift X'] = shiftX.toFixed(3);

      if (this.statePhase === 'idle' || this.statePhase === 'center') {
        statusMessage = 'โยกถ่ายน้ำหนักตัวไปทางขวาครับ';
        cuePrompt = 'โยกขวา';
        if (shiftX > 0.05) {
          this.statePhase = 'shifted_right';
        }
      } else if (this.statePhase === 'shifted_right') {
        statusMessage = 'เยี่ยมมาก! ตอนนี้โยกสลับมาทางซ้ายครับ';
        cuePrompt = 'โยกซ้าย';
        if (shiftX < -0.05) {
          this.statePhase = 'shifted_left';
          this.completedReps++;
          isRepCompleted = true;
        }
      } else if (this.statePhase === 'shifted_left') {
        statusMessage = 'โยกกลับมาทางขวาอีกครั้งครับ';
        cuePrompt = 'โยกขวา';
        if (shiftX > 0.05) {
          this.statePhase = 'shifted_right';
        }
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'bal-5') {
      // Sustained Static Stance (15s)
      const trunkLean = calculateTrunkLean(leftShoulder, rightShoulder, leftHip, rightHip);
      const isHolding = trunkLean < 15;

      if (isHolding) {
        this.phaseTimer += deltaSeconds;
        statusMessage = `รักษาสมดุลค้างไว้ (${this.phaseTimer.toFixed(1)} / ${this.criteria.targetDurationSeconds} วินาที)`;
        repProgress = (this.phaseTimer / this.criteria.targetDurationSeconds) * 100;

        if (this.phaseTimer >= this.criteria.targetDurationSeconds) {
          this.completedReps++;
          isRepCompleted = true;
          this.phaseTimer = 0;
        }
      } else {
        statusMessage = 'พยายามยืนนิ่งๆ ไม่ส่ายตัวนะครับ';
      }
    }

    // -------------------------------------------------------------
    // DOMAIN 2: LOCOMOTOR SKILLS
    // -------------------------------------------------------------
    else if (this.activityId === 'loc-1' || this.activityId === 'loc-2') {
      // Forward Walking / Path Tracking Walk
      const leftAnkleY = leftAnkle.y;
      const rightAnkleY = rightAnkle.y;
      const legYDelta = leftAnkleY - rightAnkleY;

      if (Math.abs(legYDelta) > 0.07) {
        const activeLeg = legYDelta > 0 ? 'left' : 'right';
        if (activeLeg !== this.lastStepLeg) {
          this.lastStepLeg = activeLeg;
          this.stepCount++;
          if (this.stepCount % 2 === 0) {
            this.completedReps++;
            isRepCompleted = true;
          }
        }
      }

      const calculatedMeters = (this.stepCount * 0.45).toFixed(1);
      debugValues['ก้าวทั้งหมด'] = this.stepCount;
      debugValues['ระยะประมาณ (ม.)'] = calculatedMeters;
      statusMessage = `กำลังเดินก้าวไปข้างหน้า (${this.stepCount} ก้าว, ~${calculatedMeters} ม.)`;
      repProgress = Math.min(100, (this.completedReps / this.criteria.targetReps) * 100);
    } else if (this.activityId === 'loc-3') {
      // Jogging / Fast Step Pace
      const kneeDelta = Math.abs(leftKnee.y - rightKnee.y);
      if (kneeDelta > 0.08) {
        this.phaseTimer += deltaSeconds;
      }
      if (this.phaseTimer >= 1.0) {
        this.completedReps++;
        isRepCompleted = true;
        this.phaseTimer = 0;
      }
      statusMessage = `วิ่งเหยาะยกเข่าสลับต่อเนื่อง (${this.completedReps} / ${this.criteria.targetReps})`;
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'loc-4') {
      // Two-Foot Jump
      // State machine: Crouch -> Air takeoff (hip higher than baseline) -> Landing
      const baseHipY = this.baselineHipY ?? midHipY;
      const hipDelta = baseHipY - midHipY; // Positive = hip went UP
      debugValues['Hip Lift'] = hipDelta.toFixed(3);

      if (this.statePhase === 'idle' || this.statePhase === 'standing') {
        statusMessage = 'ย่อเข่าเตรียมพร้อมแล้วกระโดดขึ้นครับ!';
        if (midHipY > baseHipY + 0.04) {
          this.statePhase = 'crouch';
        }
      } else if (this.statePhase === 'crouch') {
        statusMessage = 'ดีมาก! ส่งแรงกระโดดลอยตัวขึ้นเลย!';
        if (hipDelta > 0.05) {
          this.statePhase = 'airborne';
        }
      } else if (this.statePhase === 'airborne') {
        // Landing back
        if (Math.abs(midHipY - baseHipY) < 0.04) {
          this.statePhase = 'standing';
          this.completedReps++;
          isRepCompleted = true;
          statusMessage = 'กระโดดสำเร็จสองเท้าพร้อมกัน!';
        }
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'loc-5') {
      // Agility Directional Cue Change
      const timeSinceCue = sessionElapsedSeconds - this.cueStartTime;
      if (this.cueStartTime === 0 || timeSinceCue > 4.5) {
        this.currentCueDirection = Math.random() > 0.5 ? 'right' : 'left';
        this.cueStartTime = sessionElapsedSeconds;
        this.statePhase = 'waiting_cue';
      }

      cuePrompt = this.currentCueDirection === 'left' ? 'ก้าวไปทางซ้าย!' : 'ก้าวไปทางขวา!';
      statusMessage = `สัญญาณ: ${cuePrompt}`;

      const lateralShift = midHipX - this.baselineHipX;
      if (this.statePhase === 'waiting_cue') {
        if (
          (this.currentCueDirection === 'right' && lateralShift > 0.07) ||
          (this.currentCueDirection === 'left' && lateralShift < -0.07)
        ) {
          this.completedReps++;
          isRepCompleted = true;
          this.statePhase = 'completed_cue';
          statusMessage = 'เปลี่ยนทิศทางตามสัญญาณสำเร็จ!';
        }
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    }

    // -------------------------------------------------------------
    // DOMAIN 3: OBJECT CONTROL SKILLS
    // -------------------------------------------------------------
    else if (this.activityId === 'obj-1') {
      // Underhand Ball Roll: Arm pendulum
      const wristBelowHip = leftWrist.y > leftHip.y || rightWrist.y > rightHip.y;
      const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      debugValues['Arm Angle'] = rightArmAngle.toFixed(0);

      if (wristBelowHip) {
        if (this.statePhase === 'idle') {
          this.statePhase = 'swing_prep';
          statusMessage = 'ย่อตัวเตรียมวาดแขนปล่อยลูกบอล';
        } else if (this.statePhase === 'swing_prep') {
          this.phaseTimer += deltaSeconds;
          if (this.phaseTimer > 1.2) {
            this.statePhase = 'idle';
            this.completedReps++;
            isRepCompleted = true;
            this.phaseTimer = 0;
            statusMessage = 'วาดแขนกลิ้งลูกบอลสำเร็จ! (ครูช่วยยืนยันเป้าหมาย)';
          }
        }
      } else {
        statusMessage = 'ย่อเข่าต่ำแล้ววาดแขนจากด้านหลังไปข้างหน้าครับ';
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'obj-2') {
      // Ball Toss: Arm raised and extended forward
      const wristAboveElbow = rightWrist.y < rightElbow.y || leftWrist.y < leftElbow.y;
      if (wristAboveElbow) {
        if (this.statePhase !== 'toss') {
          this.statePhase = 'toss';
          this.completedReps++;
          isRepCompleted = true;
          statusMessage = 'ตรวจจับท่าโยนบอล! (ครูกดบันทึกว่าลงตะกร้าหรือไม่)';
        }
      } else {
        this.statePhase = 'ready';
        statusMessage = 'ยกมือโยนลูกบอลไปยังตะกร้าครับ';
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'obj-3') {
      // Ball Catch: Arms extended forward then drawn to chest
      const wristDist = distance2D(leftWrist, rightWrist);
      debugValues['Wrist Distance'] = wristDist.toFixed(3);

      if (wristDist < 0.22 && (leftWrist.y < leftHip.y || rightWrist.y < rightHip.y)) {
        this.phaseTimer += deltaSeconds;
        if (this.phaseTimer > 1.0 && this.statePhase !== 'caught') {
          this.statePhase = 'caught';
          this.completedReps++;
          isRepCompleted = true;
          statusMessage = 'รับบอลและโอบเข้าหาตัวสำเร็จ!';
        }
      } else {
        this.statePhase = 'waiting';
        this.phaseTimer = 0;
        statusMessage = 'กางสองแขนรอรับลูกบอลนุ่มๆ นะครับ';
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'obj-4') {
      // Ball Kick: Leg swing
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      debugValues['Knee Angle R'] = rightKneeAngle.toFixed(0);

      if (rightKneeAngle < 130 || leftKneeAngle < 130) {
        this.statePhase = 'kick_prep';
        statusMessage = 'งอเข่าเตรียมเหวี่ยงขาเตะลูกบอล!';
      } else if (this.statePhase === 'kick_prep') {
        this.statePhase = 'kicked';
        this.completedReps++;
        isRepCompleted = true;
        statusMessage = 'เตะลูกบอลสำเร็จ!';
      } else {
        statusMessage = 'ก้าวเท้าหลักข้างลูกบอลแล้วเหวี่ยงขาเตะครับ';
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'obj-5') {
      // Grasp & Object Carry
      const handsTogether = distance2D(leftWrist, rightWrist) < 0.25;
      if (handsTogether) {
        this.phaseTimer += deltaSeconds;
        statusMessage = `ถืออุปกรณ์สองมือมั่นคง (${this.phaseTimer.toFixed(1)} วิ)`;
        if (this.phaseTimer >= 3.0) {
          this.completedReps++;
          isRepCompleted = true;
          this.phaseTimer = 0;
        }
      } else {
        statusMessage = 'ใช้สองมือจับถืออุปกรณ์แนบอกแล้วก้าวเดินครับ';
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    }

    // -------------------------------------------------------------
    // DOMAIN 4: BODY COORDINATION SKILLS
    // -------------------------------------------------------------
    else if (this.activityId === 'coor-1') {
      // Mirror Stance: Arm abduction
      const leftArmAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
      const rightArmAngle = calculateAngle(rightHip, rightShoulder, rightElbow);
      debugValues['Arm R Angle'] = rightArmAngle.toFixed(0);
      debugValues['Arm L Angle'] = leftArmAngle.toFixed(0);

      const bothArmsRaised = leftArmAngle > 70 && rightArmAngle > 70;
      if (bothArmsRaised) {
        this.phaseTimer += deltaSeconds;
        statusMessage = `กางปีกเหมือนว่าวควายสตูลได้สวยงาม! (${this.phaseTimer.toFixed(1)} / 3 วิ)`;
        if (this.phaseTimer >= 3.0) {
          this.completedReps++;
          isRepCompleted = true;
          this.phaseTimer = 0;
        }
      } else {
        statusMessage = 'กางแขนทั้งสองข้างขึ้นเสมอไหล่ครับ';
        this.phaseTimer = 0;
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'coor-2') {
      // Cross-lateral Hand-to-Knee Touch
      const leftHandToRightKneeDist = distance2D(leftWrist, rightKnee);
      const rightHandToLeftKneeDist = distance2D(rightWrist, leftKnee);
      debugValues['L Hand to R Knee'] = leftHandToRightKneeDist.toFixed(2);
      debugValues['R Hand to L Knee'] = rightHandToLeftKneeDist.toFixed(2);

      if (this.statePhase === 'idle' || this.statePhase === 'ready_left') {
        cuePrompt = 'มือซ้ายแตะเข่าขวา';
        statusMessage = 'ใช้มือซ้ายเอื้อมแตะเข่าขวาครับ';
        if (leftHandToRightKneeDist < 0.22) {
          this.statePhase = 'touched_left';
          statusMessage = 'เยี่ยม! ต่อไปมือขวาแตะเข่าซ้ายครับ';
        }
      } else if (this.statePhase === 'touched_left') {
        cuePrompt = 'มือขวาแตะเข่าซ้าย';
        statusMessage = 'ใช้มือขวาแตะเข่าซ้ายครับ';
        if (rightHandToLeftKneeDist < 0.22) {
          this.statePhase = 'ready_left';
          this.completedReps++;
          isRepCompleted = true;
          statusMessage = 'แตะสลับเข่าครบ 1 คู่ สำเร็จ!';
        }
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'coor-3' || this.activityId === 'coor-4') {
      // Alternating Step / Rhythmic Movement
      const ankleDiff = Math.abs(leftAnkle.y - rightAnkle.y);
      if (ankleDiff > 0.08) {
        if (this.statePhase !== 'step_up') {
          this.statePhase = 'step_up';
          this.stepCount++;
          if (this.stepCount % 2 === 0) {
            this.completedReps++;
            isRepCompleted = true;
          }
        }
      } else {
        this.statePhase = 'step_down';
      }
      statusMessage = `ย่ำเท้าเข้าจังหวะต่อเนื่อง (${this.stepCount} ก้าว)`;
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    } else if (this.activityId === 'coor-5') {
      // Multi-step Routine: 1) Clap hands 2) Hands on hips 3) Hands in air
      const wristDist = distance2D(leftWrist, rightWrist);
      const handsNearHips = distance2D(leftWrist, leftHip) < 0.2 && distance2D(rightWrist, rightHip) < 0.2;
      const handsInAir = leftWrist.y < nose.y && rightWrist.y < nose.y;

      if (this.sequenceStep === 1) {
        cuePrompt = 'ขั้นที่ 1: ปรบมือ';
        statusMessage = 'ท่าที่ 1: ปรบมือสองข้างเข้าหากัน';
        if (wristDist < 0.15) {
          this.sequenceStep = 2;
        }
      } else if (this.sequenceStep === 2) {
        cuePrompt = 'ขั้นที่ 2: มือเท้าเอว';
        statusMessage = 'ท่าที่ 2: วางมือทั้งสองข้างไว้ที่เอว';
        if (handsNearHips) {
          this.sequenceStep = 3;
        }
      } else if (this.sequenceStep === 3) {
        cuePrompt = 'ขั้นที่ 3: ชูสองมือขึ้นฟ้า';
        statusMessage = 'ท่าที่ 3: ชูสองแขนขึ้นเหนือศีรษะ!';
        if (handsInAir) {
          this.sequenceStep = 1;
          this.completedReps++;
          isRepCompleted = true;
          statusMessage = 'ทำครบทั้ง 3 ท่าตามลำดับ ยอดเยี่ยมมาก!';
        }
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    }

    // -------------------------------------------------------------
    // DOMAIN 5: OBSTACLE NAVIGATION SKILLS
    // -------------------------------------------------------------
    else if (this.activityId.startsWith('obs-')) {
      // Cone Weaving, Low Obstacle, Waypoints
      // Check position relative to virtual zones and obstacle zones
      const obstacles = this.calibration.virtualObstacleZones;
      let nearObstacle = false;

      obstacles.forEach((obs) => {
        const dist = Math.sqrt(Math.pow(midHipX - obs.x, 2) + Math.pow(midHipY - obs.y, 2));
        if (dist < obs.radius) {
          nearObstacle = true;
        }
      });

      if (nearObstacle) {
        statusMessage = 'ระวังใกล้ชิดสิ่งกีดขวาง! เลี้ยวหลบเบา ๆ ครับ';
        stabilityScore = 60;
      } else {
        statusMessage = 'นำทางผ่านเส้นทางได้คล่องตัวดีมาก!';
      }

      this.phaseTimer += deltaSeconds;
      if (this.phaseTimer >= 4.0) {
        this.completedReps++;
        isRepCompleted = true;
        this.phaseTimer = 0;
      }
      repProgress = (this.completedReps / this.criteria.targetReps) * 100;
    }

    return {
      currentReps: this.completedReps,
      currentDuration: sessionElapsedSeconds,
      currentDistance: +(this.stepCount * 0.45).toFixed(1),
      stabilityScore,
      repProgress: Math.min(100, Math.max(0, repProgress)),
      statusMessage,
      isRepCompletedThisFrame: isRepCompleted,
      cuePrompt,
      debugValues,
    };
  }
}
