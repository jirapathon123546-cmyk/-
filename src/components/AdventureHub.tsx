import React, { useState } from 'react';
import {
  Scale,
  Activity,
  Target,
  Layers,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Play,
  Settings2,
  Award,
  Info,
} from 'lucide-react';
import { DOMAINS } from '../data/curriculum';
import { Domain, Activity as ActivityType, Student, AssessmentRecord } from '../types';

interface AdventureHubProps {
  activeStudent: Student | null;
  studentAssessments: AssessmentRecord[];
  onSelectActivity: (activity: ActivityType) => void;
  onOpenActivityDetails: (activity: ActivityType) => void;
  onSelectStudentClick: () => void;
}

export const AdventureHub: React.FC<AdventureHubProps> = ({
  activeStudent,
  studentAssessments,
  onSelectActivity,
  onOpenActivityDetails,
  onSelectStudentClick,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('balance');

  const selectedDomain = DOMAINS.find((d) => d.id === selectedDomainId) || DOMAINS[0];

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale':
        return <Scale className="w-6 h-6" />;
      case 'Activity':
        return <Activity className="w-6 h-6" />;
      case 'Target':
        return <Target className="w-6 h-6" />;
      case 'Layers':
        return <Layers className="w-6 h-6" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  // Check if an activity has been evaluated for this student
  const getActivityStatus = (activityId: string) => {
    const record = studentAssessments.find((r) => r.activityId === activityId);
    if (!record) return null;
    return {
      passed: record.teacherPassed,
      reps: record.teacherConfirmedReps,
      level: record.teacherAssistanceLevel,
      date: new Date(record.date).toLocaleDateString('th-TH'),
    };
  };

  return (
    <div className="space-y-6">
      {/* Student Warning Banner if not selected */}
      {!activeStudent && (
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <div className="font-bold text-base">กรุณาเลือกนักเรียนก่อนเริ่มทำกิจกรรม</div>
              <div className="text-xs text-amber-100">
                ระบบต้องผูกผลการประเมิน ท่าทาง และเกณฑ์การช่วยเหลือกับนักเรียนแต่ละคนอย่างชัดเจน
              </div>
            </div>
          </div>
          <button
            onClick={onSelectStudentClick}
            className="px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs shadow hover:bg-amber-50 transition-all"
          >
            เลือกนักเรียนทันที
          </button>
        </div>
      )}

      {/* Hero Adventure Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span>🗺️ การผจญภัยทักษะกลไก 5 หมวด</span>
            <span>•</span>
            <span>อุทยานธรณีโลกสตูล</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight">
            ดินแดนผจญภัย Motor Adventure
          </h2>
          <p className="text-amber-100 text-sm mt-2 leading-relaxed">
            ระบบฝึกและประเมินทักษะการเคลื่อนไหวผ่าน Computer Vision สำหรับเด็กที่มีความต้องการจำเป็นพิเศษ
            เลือกหมวดหมู่เพื่อออกผจญภัยในเกาะและป่าโบราณของจังหวัดสตูล!
          </p>

          {activeStudent && (
            <div className="mt-4 flex items-center gap-2 bg-white/15 backdrop-blur-xs rounded-xl p-2.5 max-w-md">
              <span className="text-2xl">🧒</span>
              <div className="text-xs">
                <div className="text-amber-200 font-medium">กำลังเตรียมพร้อมสำหรับ:</div>
                <div className="font-bold text-white text-sm">
                  {activeStudent.name} ({activeStudent.nickname}) • อายุ {activeStudent.age} ปี
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5 Domain Selector Tabs (Big, accessible, colorful) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DOMAINS.map((domain) => {
          const isSelected = selectedDomainId === domain.id;
          const completedCount = domain.activities.filter((act) =>
            studentAssessments.some((r) => r.activityId === act.id)
          ).length;

          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomainId(domain.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400/40 -translate-y-1'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${domain.color} shadow-sm`}
                  >
                    {getDomainIcon(domain.icon)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    หมวดที่ {domain.number}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug font-heading">
                  {domain.title}
                </h3>
                <p className="text-xs text-slate-700 mt-1 line-clamp-1">{domain.englishTitle}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                <span>ทำแล้ว</span>
                <span className="font-bold text-teal-600">
                  {completedCount} / {domain.activities.length}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Domain Banner & Activities list */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                หมวดที่ {selectedDomain.number}: {selectedDomain.englishTitle}
              </span>
              <span className="text-xs text-slate-700">📍 {selectedDomain.themeZone}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-heading mt-1">
              {selectedDomain.title}
            </h3>
            <p className="text-sm text-slate-700 mt-0.5">{selectedDomain.description}</p>
          </div>
        </div>

        {/* 5 Activities in this domain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedDomain.activities.map((activity, index) => {
            const status = getActivityStatus(activity.id);

            return (
              <div
                key={activity.id}
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-5 transition-all flex flex-col justify-between group hover:border-amber-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                          {activity.name}
                        </h4>
                        <div className="text-xs text-slate-700 font-medium">
                          {activity.englishName}
                        </div>
                      </div>
                    </div>

                    {/* Past status tag */}
                    {status && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                          status.passed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {status.passed ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}
                      </span>
                    )}
                  </div>

                  {/* Adventure theme storyline */}
                  <div className="mt-2.5 inline-block text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                    🌴 ภารกิจ: {activity.tagline} ({activity.adventureZone})
                  </div>

                  {/* Objective */}
                  <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-800">เป้าหมาย: </span>
                    {activity.objective}
                  </p>

                  {/* Special tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      🎯 เป้าหมาย {activity.defaultCriteria.targetReps} ครั้ง
                    </span>
                    {activity.defaultCriteria.targetDurationSeconds > 0 && (
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        ⏱️ {activity.defaultCriteria.targetDurationSeconds} วินาที
                      </span>
                    )}
                    {activity.requiresTeacherVerification && (
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                        👨‍🏫 ครูร่วมยืนยันผล
                      </span>
                    )}
                    {activity.requiresZoneCalibration && (
                      <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-md font-semibold">
                        📐 ปรับเทียบพื้นที่
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenActivityDetails(activity)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all"
                  >
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>คำแนะนำ / ตั้งค่าเกณฑ์</span>
                  </button>

                  <button
                    onClick={() => onSelectActivity(activity)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl shadow-md shadow-amber-200 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>เริ่มเปิดกล้องประเมิน</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
