import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Volume2,
  Maximize2,
  RefreshCw,
  Plus,
  Minus,
  MapPin,
  Sparkles,
  Award,
  X,
  FlipHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Activity, ActivityCriteria, Student, CameraCalibration, Landmark } from '../types';
import { poseDetector } from '../services/poseDetector';
import { ActivityAnalyzer, AnalysisFrameState } from '../services/activityAnalyzers';
import { audioService } from '../services/audioSpeech';

interface CameraAssessmentViewProps {
  activity: Activity;
  criteria: ActivityCriteria;
  student: Student;
  onFinishAssessment: (results: {
    aiRepsDetected: number;
    aiSuccessRate: number;
    aiDurationSeconds: number;
    aiDistanceMeters?: number;
    aiAverageConfidence: number;
    aiEvaluationStatus: 'passed' | 'failed' | 'insufficient_data';
    aiFeedbackNotes: string[];
    teacherConfirmedReps: number;
  }) => void;
  onCancel: () => void;
}

export const CameraAssessmentView: React.FC<CameraAssessmentViewProps> = ({
  activity,
  criteria,
  student,
  onFinishAssessment,
  onCancel,
}) => {
  // Video & Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isPoseModelLoading, setIsPoseModelLoading] = useState<boolean>(true);
  const [poseModelError, setPoseModelError] = useState<string | null>(null);

  // Assessment flow states: 'ready' | 'countdown' | 'assessing' | 'paused' | 'finished'
  const [assessmentState, setAssessmentState] = useState<
    'ready' | 'countdown' | 'assessing' | 'paused' | 'finished'
  >('ready');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [isTestingVisibility, setIsTestingVisibility] = useState<boolean>(false);

  // Live detection & analyzer metrics
  const [bodyDetected, setBodyDetected] = useState<boolean>(false);
  const [currentConfidence, setCurrentConfidence] = useState<number>(0);
  const [framingWarnings, setFramingWarnings] = useState<string[]>([]);
  const [repsCount, setRepsCount] = useState<number>(0);
  const [teacherRepsAdjustment, setTeacherRepsAdjustment] = useState<number>(0);
  const [repProgress, setRepProgress] = useState<number>(0);
  const [stabilityScore, setStabilityScore] = useState<number>(80);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('กรุณาเปิดกล้องและทดสอบการมองเห็นร่างกาย');
  const [cuePrompt, setCuePrompt] = useState<string | null>(null);

  // Tracking history for report
  const confidenceHistoryRef = useRef<number[]>([]);
  const feedbackNotesRef = useRef<Set<string>>(new Set());

  // Calibration and Zone settings
  const [calibration, setCalibration] = useState<CameraCalibration>({
    pixelsPerMeter: 120,
    calibrated: true,
    virtualStartLineY: 0.8,
    virtualFinishLineY: 0.2,
    virtualObstacleZones: [
      { id: 'obs-1', x: 0.35, y: 0.6, radius: 0.1, label: 'กรวยที่ 1' },
      { id: 'obs-2', x: 0.65, y: 0.4, radius: 0.1, label: 'กรวยที่ 2' },
    ],
  });
  const [isEditingZones, setIsEditingZones] = useState<boolean>(false);

  // Analyzer instance
  const analyzerRef = useRef<ActivityAnalyzer | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const sessionStartTimeRef = useRef<number>(0);

  // Initialize MediaPipe Pose Model
  useEffect(() => {
    let isMounted = true;
    const initPose = async () => {
      setIsPoseModelLoading(true);
      const ok = await poseDetector.initialize();
      if (!isMounted) return;
      if (ok) {
        setIsPoseModelLoading(false);
      } else {
        setIsPoseModelLoading(false);
        setPoseModelError(
          poseDetector.getInitError() ||
            'ไม่สามารถดาวน์โหลดโมเดลตรวจจับท่าทางได้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
        );
      }
    };
    initPose();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize or re-create analyzer
  useEffect(() => {
    analyzerRef.current = new ActivityAnalyzer(activity.id, criteria, calibration);
    analyzerRef.current.reset();
  }, [activity.id, criteria, calibration]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setStatusText('เปิดกล้องแล้ว ยืนในระยะ 2-3 เมตรเพื่อตรวจสอบร่างกาย');
          audioService.speak('เปิดกล้องแล้วครับ กรุณาก้าวเข้ามายืนในระยะ 2 ถึง 3 เมตร');
        };
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const msg = (err as Error).name === 'NotAllowedError'
        ? 'ไม่ได้รับอนุญาตให้เข้าถึงกล้อง กรุณากดอนุญาตสิทธิ์กล้องในเบราว์เซอร์'
        : 'ไม่พบอุปกรณ์กล้องหรือกล้องถูกใช้งานโดยโปรแกรมอื่น';
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCameraActive(false);
  };

  // Toggle Camera Facing mode
  const toggleFacingMode = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    setIsMirrored(next === 'user');
    // restart camera with new mode if currently running
    if (isCameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Trigger Confetti Celebration
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  // Start Assessment with 3-2-1 countdown
  const handleStartCountdown = () => {
    if (!isCameraActive) {
      alert('กรุณากดเปิดกล้องก่อนเริ่มการประเมิน');
      return;
    }

    setAssessmentState('countdown');
    setCountdownNum(3);
    audioService.playTone('countdown');
    audioService.speak('เตรียมพร้อม 3');

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        audioService.playTone('countdown');
        audioService.speak(`${count}`);
      } else {
        clearInterval(interval);
        setAssessmentState('assessing');
        sessionStartTimeRef.current = performance.now();
        lastFrameTimeRef.current = performance.now();
        analyzerRef.current?.reset();
        setRepsCount(0);
        setTeacherRepsAdjustment(0);
        setElapsedSeconds(0);
        audioService.playTone('pop');
        audioService.speak('เริ่มได้เลยครับ!');
      }
    }, 1000);
  };

  // Main Detection Loop (requestAnimationFrame)
  useEffect(() => {
    let isActive = true;

    const renderLoop = () => {
      if (!isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Sync canvas dimensions with video natural size
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }

          const now = performance.now();
          const deltaSec = (now - lastFrameTimeRef.current) / 1000;
          lastFrameTimeRef.current = now;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Run MediaPipe Pose Detection
          const detection = poseDetector.detectVideoFrame(video, now);

          setBodyDetected(detection.isBodyVisible);
          setCurrentConfidence(detection.confidence);
          setFramingWarnings(detection.warnings);

          if (detection.confidence > 0) {
            confidenceHistoryRef.current.push(detection.confidence);
          }

          // Draw skeleton joints and lines
          if (detection.landmarks) {
            poseDetector.drawSkeleton(
              ctx,
              detection.landmarks,
              canvas.width,
              canvas.height,
              isMirrored
            );
          }

          // Draw Virtual Obstacle Zones or Reference Lines if enabled
          if (activity.requiresZoneCalibration || isEditingZones) {
            drawVirtualZones(ctx, canvas.width, canvas.height);
          }

          // If assessing, feed landmarks into Activity Analyzer
          if (assessmentState === 'assessing' && analyzerRef.current) {
            const elapsed = (now - sessionStartTimeRef.current) / 1000;
            setElapsedSeconds(Math.floor(elapsed));

            const frameResult = analyzerRef.current.analyzeFrame(
              detection.landmarks,
              deltaSec,
              elapsed
            );

            setRepsCount(frameResult.currentReps);
            setRepProgress(frameResult.repProgress);
            setStabilityScore(frameResult.stabilityScore);
            setStatusText(frameResult.statusMessage);
            if (frameResult.cuePrompt) {
              setCuePrompt(frameResult.cuePrompt);
            }

            // Rep completion event
            if (frameResult.isRepCompletedThisFrame) {
              triggerConfetti();
              audioService.playTone('success');
              const currentTotal = frameResult.currentReps;
              audioService.speak(`เก่งมาก ครั้งที่ ${currentTotal}`);

              // Check if target criteria reached
              if (currentTotal >= criteria.targetReps) {
                audioService.playTone('complete');
                audioService.speak('ยินดีด้วยครับ ทำสำเร็จครบตามเป้าหมายแล้ว!');
                handleFinishAssessment();
              }
            }

            // Keep track of feedback notes
            if (frameResult.statusMessage && !feedbackNotesRef.current.has(frameResult.statusMessage)) {
              feedbackNotesRef.current.add(frameResult.statusMessage);
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      isActive = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isCameraActive, assessmentState, isMirrored, activity, criteria]);

  // Draw Virtual Zones & Start/Finish lines on Canvas
  const drawVirtualZones = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();

    // Start line
    const startY = calibration.virtualStartLineY * height;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(width, startY);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🏁 เส้นเริ่มต้น (Start Line)', 15, startY - 8);

    // Finish line
    const finishY = calibration.virtualFinishLineY * height;
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, finishY);
    ctx.lineTo(width, finishY);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('🏆 เส้นชัย (Finish Line)', 15, finishY - 8);

    // Obstacle circles
    calibration.virtualObstacleZones.forEach((obs) => {
      const cx = isMirrored ? (1 - obs.x) * width : obs.x * width;
      const cy = obs.y * height;
      const r = obs.radius * width;

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(obs.label, cx - 20, cy);
    });

    ctx.restore();
  };

  // Add / deduct teacher manual rep adjustments
  const handleAdjustRep = (delta: number) => {
    setTeacherRepsAdjustment((prev) => Math.max(-repsCount, prev + delta));
    audioService.playTone('pop');
  };

  // End Assessment and compile results
  const handleFinishAssessment = () => {
    stopCamera();
    setAssessmentState('finished');

    const totalReps = Math.max(0, repsCount + teacherRepsAdjustment);
    const avgConf =
      confidenceHistoryRef.current.length > 0
        ? confidenceHistoryRef.current.reduce((a, b) => a + b, 0) /
          confidenceHistoryRef.current.length
        : currentConfidence;

    const successRate = Math.min(
      100,
      Math.round((totalReps / Math.max(1, criteria.targetReps)) * 100)
    );

    let evalStatus: 'passed' | 'failed' | 'insufficient_data' = 'failed';
    if (avgConf < 0.4 && totalReps === 0) {
      evalStatus = 'insufficient_data';
    } else if (totalReps >= criteria.passReps) {
      evalStatus = 'passed';
    }

    const notes = Array.from(feedbackNotesRef.current).slice(0, 4);
    if (notes.length === 0) {
      notes.push(`ทำสำเร็จ ${totalReps} จากเป้าหมาย ${criteria.targetReps} ครั้ง`);
    }

    onFinishAssessment({
      aiRepsDetected: repsCount,
      aiSuccessRate: successRate,
      aiDurationSeconds: Math.max(1, elapsedSeconds),
      aiDistanceMeters: +(repsCount * 0.5).toFixed(1),
      aiAverageConfidence: avgConf,
      aiEvaluationStatus: evalStatus,
      aiFeedbackNotes: notes,
      teacherConfirmedReps: totalReps,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="ออกจากการประเมิน"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
                {activity.adventureZone}
              </span>
              <h2 className="text-base font-bold font-heading truncate max-w-xs md:max-w-md">
                {activity.name}
              </h2>
            </div>
            <div className="text-xs text-slate-400">
              นักเรียน: <span className="text-teal-400 font-semibold">{student.name} ({student.nickname})</span>
            </div>
          </div>
        </div>

        {/* Live Top Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {/* AI Confidence badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold ${
              currentConfidence > 0.65
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : currentConfidence > 0.4
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentConfidence > 0.5 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            ></div>
            <span>AI: {Math.round(currentConfidence * 100)}%</span>
          </div>

          {/* Body detected indicator */}
          <div
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-xs ${
              bodyDetected
                ? 'bg-teal-900/40 text-teal-300 border border-teal-800'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {bodyDetected ? '✓ ตรวจพบร่างกาย' : 'รอร่างกายในกรอบ'}
          </div>

          {/* Timer */}
          <div className="bg-slate-800 px-3 py-1 rounded-lg font-mono font-bold text-amber-400">
            ⏱️ {Math.floor(elapsedSeconds / 60)}:
            {String(elapsedSeconds % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Video & Canvas Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {/* Hidden video element supplying stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-contain ${
            isMirrored ? 'scale-x-[-1]' : ''
          }`}
        />

        {/* Canvas overlay for skeletons, joints, waypoints */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
        />

        {/* State: Camera Off Overlay */}
        {!isCameraActive && (
          <div className="relative z-20 text-center p-6 max-w-md bg-slate-900/90 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl">
              📹
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading">เปิดกล้องเพื่อเริ่มการประเมิน</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ระบบจะวิเคราะห์ท่าทางแบบเรียลไทม์ภายในอุปกรณ์โดยตรง
                ไม่มีการบันทึกหรืออัปโหลดวิดีโอออกภายนอกเพื่อความปลอดภัยสูงสุด
              </p>
            </div>

            {cameraError && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {poseModelError && (
              <div className="bg-amber-950/80 border border-amber-800 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{poseModelError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={startCamera}
                disabled={isPoseModelLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>
                  {isPoseModelLoading ? 'กำลังโหลดโมเดล AI...' : 'เปิดกล้องประเมิน'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* State: 3-2-1 Countdown Overlay */}
        {assessmentState === 'countdown' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="text-center animate-pulse">
              <div className="text-8xl md:text-9xl font-black text-amber-400 drop-shadow-[0_0_35px_rgba(251,191,36,0.6)] font-kids">
                {countdownNum}
              </div>
              <div className="text-xl font-bold text-white mt-2">เตรียมพร้อมท่าทาง!</div>
            </div>
          </div>
        )}

        {/* Live Cue Banner on Canvas */}
        {cuePrompt && assessmentState === 'assessing' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-6 py-2 rounded-2xl font-black text-base md:text-lg shadow-xl animate-bounce">
            🎯 {cuePrompt}
          </div>
        )}

        {/* Live Warnings Banner if framing is off */}
        {framingWarnings.length > 0 && isCameraActive && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-rose-900/90 border border-rose-600 text-rose-100 px-4 py-2 rounded-xl text-xs shadow-lg max-w-sm text-center">
            ⚠️ {framingWarnings[0]}
          </div>
        )}

        {/* Score & Rep HUD Box (Top Left) */}
        {isCameraActive && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-xl space-y-2 min-w-[170px]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>นับครั้งสำเร็จ:</span>
              <span className="text-amber-400 font-bold">
                เป้าหมาย {criteria.targetReps} ครั้ง
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono text-white">
                {repsCount + teacherRepsAdjustment}
              </span>
              <span className="text-sm text-slate-400">/ {criteria.targetReps}</span>
            </div>

            {/* Rep progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${repProgress}%` }}
              ></div>
            </div>

            {/* Stability meter */}
            <div className="pt-1 text-[11px] flex items-center justify-between text-slate-400">
              <span>ความเสถียรลำตัว:</span>
              <span
                className={`font-bold ${
                  stabilityScore > 75 ? 'text-teal-400' : 'text-amber-400'
                }`}
              >
                {stabilityScore}%
              </span>
            </div>
          </div>
        )}

        {/* Teacher Manual Rep Fine-Tune (Top Right) */}
        {isCameraActive && assessmentState === 'assessing' && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-xl text-xs space-y-1.5">
            <div className="text-[11px] text-slate-400 font-semibold text-center">
              ครูปรับจำนวนครั้ง:
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAdjustRep(-1)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                title="ลด 1 ครั้ง"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-teal-400">
                {teacherRepsAdjustment >= 0 ? `+${teacherRepsAdjustment}` : teacherRepsAdjustment}
              </span>
              <button
                onClick={() => handleAdjustRep(1)}
                className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-500 flex items-center justify-center text-white active:scale-95"
                title="เพิ่ม 1 ครั้ง (ยืนยันผลเตะ/โยน)"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Status Prompt Pill (Bottom Center) */}
        {isCameraActive && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-5 py-2 rounded-2xl text-xs text-slate-200 shadow-xl max-w-md text-center">
            {statusText}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Camera Utilities (Left) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isCameraActive
                  ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span>{isCameraActive ? 'ปิดกล้อง' : 'เปิดกล้อง'}</span>
            </button>

            <button
              onClick={toggleFacingMode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              title="สลับกล้องหน้า/กล้องหลัง"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className={`p-2 rounded-xl text-xs ${
                isMirrored
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
              title="กลับด้านภาพเหมือนกระจกเงา"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Assessment Controls (Center) */}
          <div className="flex items-center gap-2">
            {assessmentState === 'ready' && (
              <button
                onClick={handleStartCountdown}
                disabled={!isCameraActive}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>เริ่มประเมิน</span>
              </button>
            )}

            {assessmentState === 'assessing' && (
              <button
                onClick={() => setAssessmentState('paused')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" />
                <span>หยุดชั่วคราว</span>
              </button>
            )}

            {assessmentState === 'paused' && (
              <button
                onClick={() => setAssessmentState('assessing')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" />
                <span>ทำต่อ</span>
              </button>
            )}

            {(assessmentState === 'assessing' || assessmentState === 'paused') && (
              <button
                onClick={handleFinishAssessment}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>จบการประเมินและบันทึกผล</span>
              </button>
            )}
          </div>

          {/* Right Extras */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                audioService.speak(activity.name + ' ' + activity.tagline);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="ฟังคำแนะนำเสียงอีกครั้ง"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
