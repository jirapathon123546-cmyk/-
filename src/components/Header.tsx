import React from 'react';
import { Volume2, VolumeX, Compass, Users, FileBarChart, BookOpen, UserCheck } from 'lucide-react';
import { Student } from '../types';
import { audioService } from '../services/audioSpeech';

interface HeaderProps {
  activeTab: 'adventure' | 'students' | 'reports' | 'manual';
  setActiveTab: (tab: 'adventure' | 'students' | 'reports' | 'manual') => void;
  activeStudent: Student | null;
  onSelectStudentClick: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeStudent,
  onSelectStudentClick,
  isMuted,
  setIsMuted,
}) => {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioService.setMuted(next);
    if (!next) {
      audioService.playTone('pop');
    }
  };

  const avatarEmojiMap: Record<string, string> = {
    lion: '🦁',
    dolphin: '🐬',
    bear: '🐻',
    rabbit: '🐰',
    tiger: '🐯',
    elephant: '🐘',
  };

  return (
    <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-40">
      {/* Top Banner with Satun Special Ed Center identity */}
      <div className="bg-gradient-to-r from-amber-600 via-teal-600 to-sky-700 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
          <div className="flex items-center space-x-2 font-medium">
            <span className="bg-white/20 px-2 py-0.5 rounded text-white font-semibold">
              ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล
            </span>
            <span className="hidden sm:inline text-amber-100">
              Satun Special Education Center • Motor Adventure AI
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ระบบตรวจจับท่าทาง Real-Time Pose AI
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('adventure')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-200 text-2xl font-bold font-kids">
              🏝️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                  Motor Adventure AI
                </h1>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-md font-semibold hidden md:inline">
                  อายุ 7-12 ปี
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                ส่งเสริมและประเมินทักษะกลไกเด็กที่มีความต้องการจำเป็นพิเศษ
              </p>
            </div>
          </div>

          {/* Active Student Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectStudentClick}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left ${
                activeStudent
                  ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100 text-amber-900 shadow-sm'
                  : 'bg-rose-50 border-rose-300 hover:bg-rose-100 text-rose-800 animate-pulse'
              }`}
              title="คลิกเพื่อเลือกหรือเปลี่ยนนักเรียน"
            >
              <div className="text-2xl">
                {activeStudent ? avatarEmojiMap[activeStudent.avatar] || '🧒' : '⚠️'}
              </div>
              <div className="leading-tight">
                <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-600" />
                  {activeStudent ? 'นักเรียนที่กำลังประเมิน' : 'ยังไม่ได้เลือกนักเรียน'}
                </div>
                <div className="text-sm font-bold truncate max-w-[140px] md:max-w-[200px]">
                  {activeStudent ? activeStudent.nickname : 'คลิกเลือกนักเรียน'}
                </div>
              </div>
            </button>

            {/* Sound Toggle Button */}
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-sm'
              }`}
              title={isMuted ? 'เปิดเสียงแนะนำ' : 'ปิดเสียงแนะนำ'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 mt-3 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('adventure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'adventure'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>ภารกิจผจญภัย 5 หมวด</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-200 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการข้อมูลนักเรียน</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-200 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileBarChart className="w-4 h-4" />
            <span>ผลการประเมินและสถิติ</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คู่มือครูและการตั้งค่ากล้อง</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
