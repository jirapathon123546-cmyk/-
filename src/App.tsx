/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Motor Adventure AI - ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล
 * เว็บแอปพลิเคชันส่งเสริมและประเมินทักษะกลไกสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdventureHub } from './components/AdventureHub';
import { StudentManager } from './components/StudentManager';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { CameraAssessmentView } from './components/CameraAssessmentView';
import { AssessmentReportModal } from './components/AssessmentReportModal';
import { ReportsAndStats } from './components/ReportsAndStats';
import { TeacherManualModal } from './components/TeacherManualModal';
import { storageService } from './services/storage';
import { audioService } from './services/audioSpeech';
import { Student, Activity, ActivityCriteria, AssessmentRecord } from './types';
import { CheckCircle2, UserCheck, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'adventure' | 'students' | 'reports' | 'manual'>('adventure');
  const [students, setStudents] = useState<Student[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals & Active assessment flows
  const [activityDetailTarget, setActivityDetailTarget] = useState<Activity | null>(null);
  const [isStudentSelectModalOpen, setIsStudentSelectModalOpen] = useState<boolean>(false);

  // Camera assessment session
  const [cameraSession, setCameraSession] = useState<{
    activity: Activity;
    criteria: ActivityCriteria;
    student: Student;
  } | null>(null);

  // Completed assessment result waiting for teacher report confirmation
  const [reportSession, setReportSession] = useState<{
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
  } | null>(null);

  // Load initial data
  const loadData = () => {
    const sts = storageService.getStudents();
    setStudents(sts);
    const actSt = storageService.getActiveStudent();
    setActiveStudent(actSt);
    const recs = storageService.getAssessments();
    setAssessments(recs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStudent = (st: Student) => {
    storageService.setActiveStudentId(st.id);
    setActiveStudent(st);
    setIsStudentSelectModalOpen(false);
    audioService.playTone('pop');
    audioService.speak(`เลือก ${st.nickname} พร้อมเริ่มกิจกรรมแล้วครับ`);
  };

  const handleStartActivityFromHub = (activity: Activity) => {
    if (!activeStudent) {
      setIsStudentSelectModalOpen(true);
      return;
    }
    setCameraSession({
      activity,
      criteria: activity.defaultCriteria,
      student: activeStudent,
    });
  };

  const handleStartActivityWithCustomCriteria = (
    activity: Activity,
    customCriteria: ActivityCriteria
  ) => {
    if (!activeStudent) {
      setIsStudentSelectModalOpen(true);
      return;
    }
    setActivityDetailTarget(null);
    setCameraSession({
      activity,
      criteria: customCriteria,
      student: activeStudent,
    });
  };

  const handleCameraAssessmentFinished = (results: {
    aiRepsDetected: number;
    aiSuccessRate: number;
    aiDurationSeconds: number;
    aiDistanceMeters?: number;
    aiAverageConfidence: number;
    aiEvaluationStatus: 'passed' | 'failed' | 'insufficient_data';
    aiFeedbackNotes: string[];
    teacherConfirmedReps: number;
  }) => {
    if (!cameraSession) return;
    const sessionCopy = { ...cameraSession };
    setCameraSession(null);
    setReportSession({
      activity: sessionCopy.activity,
      criteria: sessionCopy.criteria,
      student: sessionCopy.student,
      aiResults: results,
    });
  };

  const handleReportSaved = () => {
    setReportSession(null);
    loadData();
    setActiveTab('reports');
    audioService.playTone('success');
  };

  // Filter student assessments for active student
  const activeStudentAssessments = activeStudent
    ? assessments.filter((a) => a.studentId === activeStudent.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-300 selection:text-amber-900">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeStudent={activeStudent}
        onSelectStudentClick={() => setIsStudentSelectModalOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'adventure' && (
          <AdventureHub
            activeStudent={activeStudent}
            studentAssessments={activeStudentAssessments}
            onSelectActivity={handleStartActivityFromHub}
            onOpenActivityDetails={(act) => setActivityDetailTarget(act)}
            onSelectStudentClick={() => setIsStudentSelectModalOpen(true)}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            activeStudent={activeStudent}
            onSelectStudent={handleSelectStudent}
            onRefreshStudents={loadData}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAndStats
            assessments={assessments}
            students={students}
            activeStudent={activeStudent}
            onRefreshAssessments={loadData}
          />
        )}

        {activeTab === 'manual' && <TeacherManualModal />}
      </main>

      {/* Activity Detail & Criteria Modal */}
      {activityDetailTarget && (
        <ActivityDetailModal
          activity={activityDetailTarget}
          activeStudent={activeStudent}
          onClose={() => setActivityDetailTarget(null)}
          onStartAssessment={handleStartActivityWithCustomCriteria}
        />
      )}

      {/* Camera Live Assessment Fullscreen View */}
      {cameraSession && (
        <CameraAssessmentView
          activity={cameraSession.activity}
          criteria={cameraSession.criteria}
          student={cameraSession.student}
          onFinishAssessment={handleCameraAssessmentFinished}
          onCancel={() => setCameraSession(null)}
        />
      )}

      {/* Assessment Scoring Report & Confirmation Modal */}
      {reportSession && (
        <AssessmentReportModal
          activity={reportSession.activity}
          criteria={reportSession.criteria}
          student={reportSession.student}
          aiResults={reportSession.aiResults}
          onClose={() => setReportSession(null)}
          onSaved={handleReportSaved}
        />
      )}

      {/* Student Selector Quick Modal */}
      {isStudentSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <span>เลือกนักเรียนที่ต้องการประเมิน</span>
              </h3>
              <button
                onClick={() => setIsStudentSelectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              กรุณาเลือกนักเรียนเพื่อผูกผลการประเมินและการวิเคราะห์ท่าทาง
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              {students.map((st) => {
                const isSelected = activeStudent?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStudent(st)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400/30'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl border border-amber-200 shrink-0">
                        🧒
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {st.name} ({st.nickname})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          รหัส: {st.code} • อายุ {st.age} ปี
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsStudentSelectModalOpen(false);
                  setActiveTab('students');
                }}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                + เพิ่มหรือแก้ไขรายชื่อนักเรียน
              </button>

              <button
                onClick={() => setIsStudentSelectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล (Satun Special Education Center)
        </p>
        <p>
          ระบบ Motor Adventure AI เพื่อส่งเสริมและประเมินทักษะกลไกพื้นฐานเด็กที่มีความต้องการจำเป็นพิเศษ
        </p>
        <p className="text-[11px] text-slate-400">
          ประมวลผลด้วย Edge AI Computer Vision (MediaPipe Pose) ภายในอุปกรณ์ ไม่มีการอัปโหลดภาพขึ้นเซิร์ฟเวอร์
        </p>
      </footer>
    </div>
  );
}
