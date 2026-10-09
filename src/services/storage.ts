import { Student, AssessmentRecord } from '../types';
import { INITIAL_STUDENTS, INITIAL_ASSESSMENTS } from '../data/initialStudents';

const STORAGE_KEYS = {
  STUDENTS: 'motor_adventure_students_v1',
  ASSESSMENTS: 'motor_adventure_assessments_v1',
  ACTIVE_STUDENT_ID: 'motor_adventure_active_student_id',
  APP_SETTINGS: 'motor_adventure_settings_v1',
};

export const storageService = {
  // Students
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('LocalStorage error, using defaults:', e);
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage:', e);
    }
  },

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: 'st-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  },

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    students[idx] = { ...students[idx], ...updates };
    this.saveStudents(students);
    return students[idx];
  },

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter((s) => s.id !== id);
    if (filtered.length === students.length) return false;
    this.saveStudents(filtered);
    
    // If active was deleted, clear active
    if (this.getActiveStudentId() === id) {
      this.setActiveStudentId(filtered[0]?.id || null);
    }
    return true;
  },

  // Active Student
  getActiveStudentId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
      if (id) return id;
      const students = this.getStudents();
      if (students.length > 0) {
        this.setActiveStudentId(students[0].id);
        return students[0].id;
      }
      return null;
    } catch {
      return null;
    }
  },

  setActiveStudentId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
      }
    } catch (e) {
      console.error('Failed to set active student:', e);
    }
  },

  getActiveStudent(): Student | null {
    const id = this.getActiveStudentId();
    if (!id) return null;
    const students = this.getStudents();
    return students.find((s) => s.id === id) || students[0] || null;
  },

  // Assessments
  getAssessments(): AssessmentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
        return INITIAL_ASSESSMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSESSMENTS;
    }
  },

  saveAssessments(records: AssessmentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save assessments:', e);
    }
  },

  addAssessment(record: Omit<AssessmentRecord, 'id' | 'timestamp'>): AssessmentRecord {
    const records = this.getAssessments();
    const newRecord: AssessmentRecord = {
      ...record,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
    };
    records.unshift(newRecord); // newest first
    this.saveAssessments(records);
    return newRecord;
  },

  deleteAssessment(id: string): boolean {
    const records = this.getAssessments();
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length === records.length) return false;
    this.saveAssessments(filtered);
    return true;
  },

  getAssessmentsByStudent(studentId: string): AssessmentRecord[] {
    return this.getAssessments().filter((r) => r.studentId === studentId);
  },

  // Reset to initial demo data
  resetAllData(): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    this.setActiveStudentId(INITIAL_STUDENTS[0].id);
  },

  // CSV Export with UTF-8 BOM for Microsoft Excel compatibility
  exportAssessmentsToCSV(filteredStudentId?: string): void {
    const allRecords = this.getAssessments();
    const records = filteredStudentId
      ? allRecords.filter((r) => r.studentId === filteredStudentId)
      : allRecords;

    if (records.length === 0) {
      alert('ไม่มีข้อมูลการประเมินสำหรับส่งออก');
      return;
    }

    const headers = [
      'รหัสการประเมิน',
      'วันที่ประเมิน',
      'รหัสนักเรียน',
      'ชื่อนักเรียน',
      'หมวดทักษะ',
      'ชื่อกิจกรรม',
      'เป้าหมายจำนวนครั้ง',
      'AI ตรวจจับได้ (ครั้ง)',
      'อัตราสำเร็จ AI (%)',
      'ความเชื่อมั่น AI เฉลี่ย',
      'สถานะการประเมิน AI',
      'ครูยืนยันจำนวนครั้ง',
      'ระดับความช่วยเหลือ (1-5)',
      'ผลการประเมินโดยครู (ผ่าน/ไม่ผ่าน)',
      'ข้อสังเกตของครู',
      'ข้อเสนอแนะในการฝึกต่อไป (IEP)',
    ];

    const assistanceLabels: Record<number, string> = {
      5: 'ระดับ 5 (ทำได้ด้วยตนเอง)',
      4: 'ระดับ 4 (ได้รับคำเตือน/คำบอกใบ้)',
      3: 'ระดับ 3 (ช่วยเหลือทางกายร่วมกับวาจา)',
      2: 'ระดับ 2 (จับมือประคองใกล้ชิด)',
      1: 'ระดับ 1 (ยังไม่ทำ/ปฏิเสธ)',
    };

    const rows = records.map((r) => {
      const dateFormatted = new Date(r.date).toLocaleString('th-TH');
      const aiStatus =
        r.aiEvaluationStatus === 'passed'
          ? 'ผ่านเกณฑ์'
          : r.aiEvaluationStatus === 'failed'
          ? 'ยังไม่ผ่าน'
          : 'ข้อมูลไม่เพียงพอ';
      const teacherPassStr = r.teacherPassed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่านเกณฑ์';

      return [
        `"${r.id}"`,
        `"${dateFormatted}"`,
        `"${r.studentId}"`,
        `"${r.studentName.replace(/"/g, '""')}"`,
        `"${r.domainTitle.replace(/"/g, '""')}"`,
        `"${r.activityName.replace(/"/g, '""')}"`,
        r.criteriaUsed?.targetReps ?? 5,
        r.aiRepsDetected,
        `${r.aiSuccessRate}%`,
        r.aiAverageConfidence.toFixed(2),
        `"${aiStatus}"`,
        r.teacherConfirmedReps,
        `"${assistanceLabels[r.teacherAssistanceLevel] || r.teacherAssistanceLevel}"`,
        `"${teacherPassStr}"`,
        `"${(r.teacherNotes || '').replace(/"/g, '""')}"`,
        `"${(r.nextStepsRecommendations || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // \uFEFF is essential for Excel to read Thai UTF-8 text properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `motor_adventure_satun_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
