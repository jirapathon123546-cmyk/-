import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Save,
  Printer,
  Sparkles,
  HelpCircle,
  Calendar,
  User,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  Activity,
  ActivityCriteria,
  Student,
  AssistanceLevel,
  AssessmentRecord,
} from '../types';
import { ASSISTANCE_LEVELS_INFO } from '../data/curriculum';
import { storageService } from '../services/storage';

interface AssessmentReportModalProps {
  activity: Activity;
  criteria: ActivityCriteria;
  student: Student;
  aiResults: {
    aiRepsDetected: number;
    aiSuccessRate: number;
    aiDurationSeconds: number;
    aiDistanceMeters?: number;
    aiAverageConfidence: number;
    aiEvaluationStatus: 'passed' | 'failed' | 'insufficient_data';
    aiFeedbackNotes: string[];
    teacherConfirmedReps: number;
  };
  onClose: () => void;
  onSaved: () => void;
}

export const AssessmentReportModal: React.FC<AssessmentReportModalProps> = ({
  activity,
  criteria,
  student,
  aiResults,
  onClose,
  onSaved,
}) => {
  // Teacher inputs
  const [confirmedReps, setConfirmedReps] = useState<number>(aiResults.teacherConfirmedReps);
  const [assistanceLevel, setAssistanceLevel] = useState<AssistanceLevel>(
    aiResults.aiRepsDetected >= criteria.passReps ? 5 : 3
  );
  const [teacherPassed, setTeacherPassed] = useState<boolean>(
    aiResults.teacherConfirmedReps >= criteria.passReps
  );
  const [teacherNotes, setTeacherNotes] = useState<string>(
    aiResults.aiFeedbackNotes.join('; ')
  );
  const [nextSteps, setNextSteps] = useState<string>(
    teacherPassed
      ? 'ส่งเสริมทักษะในระดับที่ท้าทายขึ้นตามแผน IEP'
      : 'ฝึกซ้ำโดยใช้การบอกใบ้ด้วยภาพและการจับประคองเบา ๆ'
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    storageService.addAssessment({
      studentId: student.id,
      studentName: `${student.name} (${student.nickname})`,
      activityId: activity.id,
      activityName: activity.name,
      domainId: activity.domainId,
      domainTitle: activity.adventureZone,
      date: new Date().toISOString(),
      aiRepsDetected: aiResults.aiRepsDetected,
      aiSuccessRate: aiResults.aiSuccessRate,
      aiDurationSeconds: aiResults.aiDurationSeconds,
      aiDistanceMeters: aiResults.aiDistanceMeters,
      aiAverageConfidence: aiResults.aiAverageConfidence,
      aiEvaluationStatus: aiResults.aiEvaluationStatus,
      aiFeedbackNotes: aiResults.aiFeedbackNotes,
      teacherConfirmedReps: Number(confirmedReps),
      teacherAssistanceLevel: assistanceLevel,
      teacherPassed: teacherPassed,
      teacherNotes: teacherNotes.trim(),
      nextStepsRecommendations: nextSteps.trim(),
      criteriaUsed: criteria,
    });

    setIsSaved(true);
    setTimeout(() => {
      onSaved();
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-sky-800 text-white p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="no-print absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs text-teal-200 mb-1">
            <span>ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล</span>
            <span>•</span>
            <span>แบบบันทึกผลการประเมินทักษะกลไก</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-heading">
            รายงานผลการประเมิน: {activity.name}
          </h2>
          <p className="text-teal-100 text-xs mt-1">
            หมวด: {activity.domainId} • {activity.adventureZone}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 space-y-6">
          {/* Student Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl border border-amber-200">
                🧒
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {student.name} ({student.nickname})
                </div>
                <div className="text-slate-500">
                  รหัส: {student.code} • อายุ {student.age} ปี • {student.motorLevel}
                </div>
              </div>
            </div>

            <div className="text-right text-slate-500">
              <div className="flex items-center gap-1 justify-end font-medium">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>วันที่: {new Date().toLocaleDateString('th-TH')}</span>
              </div>
              <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                เกณฑ์ผ่าน: {criteria.passReps} / {criteria.targetReps} ครั้ง
              </div>
            </div>
          </div>

          {/* Section 1: AI Detection Results */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">
                ผลการตรวจจับจากระบบ AI (Computer Vision Analysis)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 mb-0.5">จำนวนครั้งที่ตรวจพบ</div>
                <div className="text-2xl font-black font-mono text-indigo-600">
                  {aiResults.aiRepsDetected}
                </div>
                <div className="text-[10px] text-slate-400">จาก {criteria.targetReps} ครั้ง</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 mb-0.5">อัตราความสำเร็จ</div>
                <div className="text-2xl font-black font-mono text-emerald-600">
                  {aiResults.aiSuccessRate}%
                </div>
                <div className="text-[10px] text-slate-400">เปรียบเทียบเกณฑ์</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 mb-0.5">ระยะเวลา / ระยะทาง</div>
                <div className="text-lg font-black font-mono text-slate-800 mt-0.5">
                  {aiResults.aiDurationSeconds} วิ
                </div>
                <div className="text-[10px] text-slate-400">
                  {aiResults.aiDistanceMeters ? `~${aiResults.aiDistanceMeters} ม.` : 'อยู่กับที่'}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 mb-0.5">ความเชื่อมั่นเฉลี่ย</div>
                <div className="text-2xl font-black font-mono text-teal-600">
                  {Math.round(aiResults.aiAverageConfidence * 100)}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {aiResults.aiAverageConfidence >= 0.65 ? 'ความคมชัดสูง' : 'ยอมรับได้'}
                </div>
              </div>
            </div>

            {/* AI Notes */}
            {aiResults.aiFeedbackNotes.length > 0 && (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900">
                <div className="font-bold mb-1 flex items-center gap-1 text-indigo-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  ข้อสังเกตเชิงชีวกลศาสตร์จาก AI:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {aiResults.aiFeedbackNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 2: Teacher Evaluation & Prompt Hierarchy */}
          <div className="space-y-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">
                ผลการประเมินและการยืนยันโดยครูผู้สอน (Teacher Confirmation & Prompt Hierarchy)
              </h3>
            </div>

            {/* Confirmed Reps & Pass Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-700">
                  จำนวนครั้งที่ครูยืนยัน (ปรับแก้หากมีมุมอับกล้อง)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={confirmedReps}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setConfirmedReps(val);
                      setTeacherPassed(val >= criteria.passReps);
                    }}
                    className="w-24 px-3 py-1.5 text-base font-bold font-mono border rounded-lg bg-white"
                  />
                  <span className="text-slate-500">
                    เกณฑ์ผ่านคืออย่างน้อย {criteria.passReps} ครั้ง
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-700">
                  ผลการตัดสินผ่านเกณฑ์
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="passStatus"
                      checked={teacherPassed}
                      onChange={() => setTeacherPassed(true)}
                      className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> ผ่านเกณฑ์
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="passStatus"
                      checked={!teacherPassed}
                      onChange={() => setTeacherPassed(false)}
                      className="text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> ยังไม่ผ่านเกณฑ์
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Special Education 5-Level Assistance Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระดับการช่วยเหลือที่นักเรียนได้รับ (Assistance Hierarchy 1 - 5)
              </label>
              <div className="space-y-2">
                {ASSISTANCE_LEVELS_INFO.map((info) => {
                  const isChecked = assistanceLevel === info.level;
                  return (
                    <label
                      key={info.level}
                      onClick={() => setAssistanceLevel(info.level)}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="assistanceLevel"
                          checked={isChecked}
                          onChange={() => setAssistanceLevel(info.level)}
                          className="mt-0.5 text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">{info.title}</div>
                          <div className="text-slate-500 mt-0.5">{info.description}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Qualitative Notes */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ข้อสังเกตของครูต่อพฤติกรรมและการเคลื่อนไหว
                </label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="เช่น นักเรียนมีความมั่นใจขึ้น การทรงตัวดี แต่ต้องการการเตือนสติ..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ข้อเสนอแนะในการฝึกครั้งต่อไป / แผนการศึกษาเฉพาะบุคคล (IEP)
                </label>
                <textarea
                  rows={2}
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="เช่น ลดการพยุงข้อศอก, ฝึกต่อเท้าบนเส้นทางแคบลง..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex items-center justify-between gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              ปิด
            </button>

            <button
              onClick={handleSave}
              disabled={isSaved}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'บันทึกสำเร็จแล้ว!' : 'บันทึกผลการประเมิน'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
