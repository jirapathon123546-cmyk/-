/**
 * Types for Motor Adventure AI
 * ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล
 */

export interface Landmark {
  x: number; // 0 to 1
  y: number; // 0 to 1
  z: number; // depth
  visibility?: number; // 0 to 1
}

export type AssistanceLevel = 1 | 2 | 3 | 4 | 5;

export interface AssistanceInfo {
  level: AssistanceLevel;
  title: string;
  shortDesc: string;
  description: string;
  color: string;
}

export interface Student {
  id: string;
  code: string; // e.g. ST-01
  name: string;
  nickname: string;
  age: number; // 7-12
  gender: 'male' | 'female';
  motorLevel: string; // e.g. "ระดับ 1 (เริ่มต้น)", "ระดับ 2 (ปานกลาง)", "ระดับ 3 (ก้าวหน้า)"
  adaptations: string; // ข้อจำกัดหรือการปรับกิจกรรม
  avatar: string; // icon or image name
  notes?: string;
  createdAt: string;
}

export interface ActivityCriteria {
  targetReps: number; // จำนวนครั้งเป้าหมาย (เช่น 5 ครั้ง)
  passReps: number; // จำนวนครั้งที่ถือว่าผ่าน (เช่น 3 ครั้ง)
  targetDurationSeconds: number; // ระยะเวลาเป้าหมาย (เช่น 10 วินาที)
  targetDistanceMeters?: number; // ระยะทางเป้าหมาย (หากมี)
  minConfidence: number; // ค่าความเชื่อมั่นขั้นต่ำ (เช่น 0.6)
  customInstructions?: string; // คำแนะนำเฉพาะสำหรับเด็กคนนี้
}

export interface Activity {
  id: string;
  domainId: string;
  name: string;
  englishName: string;
  tagline: string;
  adventureZone: string; // ธีมสตูล เช่น "หาดทรายเกาะหลีเป๊ะ", "ถ้ำเลสเตโกดอน"
  objective: string;
  trainingMethod: string;
  testProcedure: string;
  aiDetectionDetails: string;
  defaultCriteria: ActivityCriteria;
  iconName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiresTeacherVerification?: boolean;
  requiresObject?: boolean;
  requiresZoneCalibration?: boolean;
}

export interface Domain {
  id: string;
  number: number;
  title: string;
  englishTitle: string;
  description: string;
  themeZone: string;
  icon: string;
  color: string;
  accentBg: string;
  activities: Activity[];
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  activityId: string;
  activityName: string;
  domainId: string;
  domainTitle: string;
  date: string; // ISO string
  timestamp: number;
  
  // AI Metrics
  aiRepsDetected: number;
  aiSuccessRate: number; // 0 - 100
  aiDurationSeconds: number;
  aiDistanceMeters?: number;
  aiAverageConfidence: number; // 0 - 1
  aiEvaluationStatus: 'passed' | 'failed' | 'insufficient_data';
  aiFeedbackNotes: string[];

  // Teacher Confirmation & Adjustments
  teacherConfirmedReps: number;
  teacherAssistanceLevel: AssistanceLevel;
  teacherPassed: boolean;
  teacherNotes: string;
  nextStepsRecommendations: string;

  // Criteria used at test time
  criteriaUsed: ActivityCriteria;
}

export interface CameraCalibration {
  pixelsPerMeter: number;
  calibrated: boolean;
  virtualStartLineY: number; // 0 to 1
  virtualFinishLineY: number; // 0 to 1
  virtualObstacleZones: Array<{ id: string; x: number; y: number; radius: number; label: string }>;
}
