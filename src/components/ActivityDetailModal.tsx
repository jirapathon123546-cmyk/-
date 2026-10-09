import React, { useState } from 'react';
import {
  X,
  Play,
  Settings,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Activity, ActivityCriteria, Student } from '../types';

interface ActivityDetailModalProps {
  activity: Activity;
  activeStudent: Student | null;
  onClose: () => void;
  onStartAssessment: (activity: Activity, customCriteria: ActivityCriteria) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  activeStudent,
  onClose,
  onStartAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'criteria'>('demo');

  // Criteria settings
  const [targetReps, setTargetReps] = useState(activity.defaultCriteria.targetReps);
  const [passReps, setPassReps] = useState(activity.defaultCriteria.passReps);
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(
    activity.defaultCriteria.targetDurationSeconds
  );
  const [minConfidence, setMinConfidence] = useState(activity.defaultCriteria.minConfidence);
  const [customInstructions, setCustomInstructions] = useState('');

  const handleStart = () => {
    const customCriteria: ActivityCriteria = {
      targetReps: Number(targetReps),
      passReps: Number(passReps),
      targetDurationSeconds: Number(targetDurationSeconds),
      minConfidence: Number(minConfidence),
      customInstructions: customInstructions.trim() || undefined,
    };
    onStartAssessment(activity, customCriteria);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-block bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2">
            📍 {activity.adventureZone}
          </div>
          <h2 className="text-2xl font-bold font-heading">{activity.name}</h2>
          <p className="text-amber-100 text-sm mt-0.5">{activity.englishName}</p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'demo'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คำอธิบายและการสาธิต</span>
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'criteria'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ปรับเกณฑ์เฉพาะบุคคล (IEP)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 flex-1 space-y-5">
          {activeTab === 'demo' ? (
            <div className="space-y-4">
              {/* Visual Demonstration Box */}
              <div className="bg-gradient-to-b from-sky-50 to-amber-50/40 rounded-2xl p-4 border border-sky-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-32 h-36 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-2 text-center shrink-0">
                  <div className="text-4xl mb-1 animate-bounce">🤸‍♂️</div>
                  <span className="text-[11px] font-bold text-slate-700">แบบอย่างท่าทาง</span>
                  <span className="text-[10px] text-teal-600 font-semibold">{activity.tagline}</span>
                </div>
                <div className="text-xs space-y-1.5 flex-1">
                  <div className="font-bold text-sm text-slate-900">
                    ภารกิจผจญภัย: {activity.tagline}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    ให้นักเรียนเตรียมยืนหน้ากล้องในระยะ 2-3 เมตร ให้กล้องเห็นตั้งแต่ศีรษะจรดเท้า
                    เมื่อพร้อมแล้วระบบจะมีเสียงนับถอยหลัง 3-2-1
                  </p>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200 text-amber-800 font-medium">
                    💡 คำแนะนำสำหรับครู: ตรวจสอบแสงสว่างและพื้นที่ว่างรอบตัวนักเรียนเพื่อความปลอดภัย
                  </div>
                </div>
              </div>

              {/* Objectives & Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-sm">
                    <Target className="w-4 h-4 text-teal-600" />
                    วัตถุประสงค์
                  </div>
                  <p className="text-slate-600 leading-relaxed">{activity.objective}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    วิธีฝึก
                  </div>
                  <p className="text-slate-600 leading-relaxed">{activity.trainingMethod}</p>
                </div>
              </div>

              {/* Test Procedure & AI Detection details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-800">ขั้นตอนการทดสอบ: </span>
                  <span className="text-slate-600">{activity.testProcedure}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="font-bold text-indigo-700">กลไก AI Computer Vision: </span>
                  <span className="text-slate-600">{activity.aiDetectionDetails}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <div className="font-bold">
                  ปรับเกณฑ์การประเมินให้เหมาะสมกับความสามารถของนักเรียน (IEP)
                </div>
                <p className="text-slate-600 mt-0.5">
                  ตามมาตรฐานการศึกษาพิเศษ ครูสามารถปรับลดหรือเพิ่มจำนวนครั้ง ระยะเวลา หรือเงื่อนไขความสำเร็จได้
                </p>
              </div>

              {activeStudent && (
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>นักเรียน: <b>{activeStudent.name}</b></span>
                  <span className="text-teal-700 font-semibold">{activeStudent.motorLevel}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    จำนวนครั้งเป้าหมาย (ครั้ง)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={targetReps}
                    onChange={(e) => setTargetReps(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                  <span className="text-[11px] text-slate-700">ค่าเริ่มต้น: 5 ครั้ง</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เกณฑ์จำนวนครั้งที่ผ่าน (ครั้ง)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={targetReps}
                    value={passReps}
                    onChange={(e) => setPassReps(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                  <span className="text-[11px] text-slate-700">ค่าเริ่มต้น: 3 ครั้ง</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ระยะเวลาเป้าหมาย (วินาที)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={targetDurationSeconds}
                    onChange={(e) => setTargetDurationSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ค่าความเชื่อมั่น AI ขั้นต่ำ (Confidence)
                  </label>
                  <select
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value={0.5}>0.50 (สำหรับแสงน้อย/อุปกรณ์มีข้อจำกัด)</option>
                    <option value={0.65}>0.65 (ค่ามาตรฐานแนะนำ)</option>
                    <option value={0.75}>0.75 (ความแม่นยำสูง)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำแนะนำหรือการปรับกิจกรรมเฉพาะสำหรับนักเรียนคนนี้
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="เช่น ยืนจับราวข้างเดียว, ให้เวลาพัก 30 วินาที..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            ย้อนกลับ
          </button>

          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-200 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>เปิดกล้องและเริ่มประเมิน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
