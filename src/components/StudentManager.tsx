import React, { useState } from 'react';
import {
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  Award,
  Calendar,
  AlertTriangle,
  Heart,
  X,
  History,
  Search,
} from 'lucide-react';
import { Student, AssessmentRecord } from '../types';
import { storageService } from '../services/storage';

interface StudentManagerProps {
  students: Student[];
  activeStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onRefreshStudents: () => void;
}

const AVATARS = [
  { id: 'lion', emoji: '🦁', label: 'สิงโตน้อย' },
  { id: 'dolphin', emoji: '🐬', label: 'โลมาแสนรู้' },
  { id: 'bear', emoji: '🐻', label: 'หมีใจดี' },
  { id: 'rabbit', emoji: '🐰', label: 'กระต่ายว่องไว' },
  { id: 'tiger', emoji: '🐯', label: 'เสือนักสู้' },
  { id: 'elephant', emoji: '🐘', label: 'ช้างผู้กล้า' },
];

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  activeStudent,
  onSelectStudent,
  onRefreshStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewHistoryStudent, setViewHistoryStudent] = useState<Student | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<number>(8);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [motorLevel, setMotorLevel] = useState('ระดับ 2 (ปานกลาง - ต้องประคองก้าว)');
  const [adaptations, setAdaptations] = useState('');
  const [avatar, setAvatar] = useState('lion');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    const nextCodeNum = students.length + 1;
    setCode(`ST-${String(nextCodeNum).padStart(3, '0')}`);
    setName('');
    setNickname('');
    setAge(8);
    setGender('male');
    setMotorLevel('ระดับ 2 (ปานกลาง - ต้องประคองก้าว)');
    setAdaptations('');
    setAvatar('lion');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setCode(student.code);
    setName(student.name);
    setNickname(student.nickname);
    setAge(student.age);
    setGender(student.gender);
    setMotorLevel(student.motorLevel);
    setAdaptations(student.adaptations);
    setAvatar(student.avatar);
    setNotes(student.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nickname.trim()) {
      alert('กรุณากรอกชื่อและชื่อเล่นของนักเรียน');
      return;
    }

    if (editingStudent) {
      storageService.updateStudent(editingStudent.id, {
        code,
        name,
        nickname,
        age: Number(age),
        gender,
        motorLevel,
        adaptations,
        avatar,
        notes,
      });
    } else {
      const newSt = storageService.addStudent({
        code,
        name,
        nickname,
        age: Number(age),
        gender,
        motorLevel,
        adaptations,
        avatar,
        notes,
      });
      // auto select newly created student
      onSelectStudent(newSt);
    }

    setIsModalOpen(false);
    onRefreshStudents();
  };

  const handleDelete = (student: Student) => {
    if (confirm(`คุณต้องการลบข้อมูลของ "${student.name} (${student.nickname})" หรือไม่?`)) {
      storageService.deleteStudent(student.id);
      onRefreshStudents();
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentAssessments = (studentId: string): AssessmentRecord[] => {
    return storageService.getAssessmentsByStudent(studentId);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <span>รายชื่อนักเรียนและข้อมูลการเคลื่อนไหว</span>
            <span className="text-sm bg-teal-100 text-teal-800 font-medium px-2.5 py-0.5 rounded-full">
              {students.length} คน
            </span>
          </h2>
          <p className="text-sm text-slate-700 mt-1">
            ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล (กรุณาเลือกนักเรียนก่อนเริ่มทำการประเมินทุกครั้ง)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ รหัสนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-200 transition-all whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มนักเรียนใหม่</span>
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((st) => {
          const isSelected = activeStudent?.id === st.id;
          const assessments = getStudentAssessments(st.id);
          const avatarData = AVATARS.find((a) => a.id === st.avatar) || AVATARS[0];

          return (
            <div
              key={st.id}
              className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-50/60 to-white border-teal-500 shadow-md ring-2 ring-teal-400/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 right-4 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  กำลังประเมินคนนี้
                </div>
              )}

              <div>
                {/* Header Profile */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200 shrink-0">
                    {avatarData.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {st.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        อายุ {st.age} ปี ({st.gender === 'male' ? 'ชาย' : 'หญิง'})
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">
                      {st.name}
                    </h3>
                    <div className="text-xs font-semibold text-teal-700">
                      ชื่อเล่น: {st.nickname}
                    </div>
                  </div>
                </div>

                {/* Motor Level Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1">
                    ระดับความสามารถในการเคลื่อนไหว:
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    {st.motorLevel}
                  </div>
                </div>

                {/* Accommodations / Constraints */}
                {st.adaptations && (
                  <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900">
                    <div className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                      <Heart className="w-3.5 h-3.5 text-amber-600" />
                      ข้อจำกัดหรือการปรับกิจกรรม:
                    </div>
                    <p className="line-clamp-2 leading-relaxed">{st.adaptations}</p>
                  </div>
                )}

                {/* Assessment History Count */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    ประเมินแล้ว {assessments.length} ครั้ง
                  </span>
                  {assessments.length > 0 && (
                    <button
                      onClick={() => setViewHistoryStudent(st)}
                      className="text-teal-600 hover:text-teal-800 font-semibold underline text-xs"
                    >
                      ดูประวัติย้อนหลัง
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(st)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(st)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบนักเรียน"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectStudent(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-teal-50 text-teal-800 hover:bg-teal-600 hover:text-white border border-teal-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'เลือกแล้ว' : 'เลือกคนนี้'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสนักเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                    placeholder="ST-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อเล่น <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                    placeholder="น้องนนท์"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  placeholder="ด.ช. อานนท์ ยิ้มสยาม"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อายุ (7-12 ปี)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="12"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เพศ
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกรูปสัญลักษณ์ประจำตัว
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={`p-2 rounded-xl text-2xl border text-center transition-all ${
                        avatar === av.id
                          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-400'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระดับความสามารถในการเคลื่อนไหว
                </label>
                <select
                  value={motorLevel}
                  onChange={(e) => setMotorLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ระดับ 1 (เริ่มต้น - ต้องการการพยุง/จับมือ)">
                    ระดับ 1 (เริ่มต้น - ต้องการการพยุง/จับมือ)
                  </option>
                  <option value="ระดับ 2 (ปานกลาง - ต้องประคองก้าว/คำสั่งชี้แนะ)">
                    ระดับ 2 (ปานกลาง - ต้องประคองก้าว/คำสั่งชี้แนะ)
                  </option>
                  <option value="ระดับ 3 (ก้าวหน้า - ปฏิบัติได้อิสระ)">
                    ระดับ 3 (ก้าวหน้า - ปฏิบัติได้อิสระ)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อจำกัดหรือการปรับกิจกรรมที่จำเป็น (บันทึกเฉพาะที่จำเป็น)
                </label>
                <textarea
                  rows={2}
                  value={adaptations}
                  onChange={(e) => setAdaptations(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  placeholder="เช่น สวมกายอุปกรณ์ AFO, มีปัญหาการกะระยะ, ต้องการเวลาพักระหว่างรอบ..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อสังเกตเพิ่มเติมของครู
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  placeholder="เช่น ชอบเสียงปรบมือ, กลัวเสียงหวีด..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-200 transition-all"
                >
                  {editingStudent ? 'บันทึกการแก้ไข' : 'บันทึกนักเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal for Selected Student */}
      {viewHistoryStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  ประวัติการประเมินย้อนหลัง: {viewHistoryStudent.name} ({viewHistoryStudent.nickname})
                </h3>
              </div>
              <button
                onClick={() => setViewHistoryStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {getStudentAssessments(viewHistoryStudent.id).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  ยังไม่มีประวัติการประเมินสำหรับนักเรียนคนนี้
                </div>
              ) : (
                getStudentAssessments(viewHistoryStudent.id).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {rec.domainTitle} • {rec.activityName}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rec.date).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-700 font-medium">ตรวจจับ AI</div>
                        <div className="font-bold text-slate-800">{rec.aiRepsDetected} ครั้ง</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-700 font-medium">ครูยืนยัน</div>
                        <div className="font-bold text-teal-700">{rec.teacherConfirmedReps} ครั้ง</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-700 font-medium">การช่วยเหลือ</div>
                        <div className="font-bold text-amber-700">ระดับ {rec.teacherAssistanceLevel}</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-700 font-medium">ผลประเมิน</div>
                        <div
                          className={`font-bold ${
                            rec.teacherPassed ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {rec.teacherPassed ? '✓ ผ่านเกณฑ์' : '✗ ยังไม่ผ่าน'}
                        </div>
                      </div>
                    </div>

                    {rec.teacherNotes && (
                      <div className="text-xs text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">ข้อสังเกต: </span>
                        {rec.teacherNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewHistoryStudent(null)}
                className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
