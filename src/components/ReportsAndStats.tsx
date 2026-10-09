import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Filter,
  Eye,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';
import { AssessmentRecord, Student } from '../types';
import { DOMAINS, ASSISTANCE_LEVELS_INFO } from '../data/curriculum';
import { storageService } from '../services/storage';

interface ReportsAndStatsProps {
  assessments: AssessmentRecord[];
  students: Student[];
  activeStudent: Student | null;
  onRefreshAssessments: () => void;
}

export const ReportsAndStats: React.FC<ReportsAndStatsProps> = ({
  assessments,
  students,
  activeStudent,
  onRefreshAssessments,
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(
    activeStudent ? activeStudent.id : 'all'
  );
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [viewRecordDetail, setViewRecordDetail] = useState<AssessmentRecord | null>(null);

  // Filter records
  const filteredRecords = assessments.filter((r) => {
    const matchStudent = selectedStudentFilter === 'all' || r.studentId === selectedStudentFilter;
    const matchDomain = selectedDomainFilter === 'all' || r.domainId === selectedDomainFilter;
    return matchStudent && matchDomain;
  });

  // Calculate stats
  const totalCount = filteredRecords.length;
  const passedCount = filteredRecords.filter((r) => r.teacherPassed).length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const avgAssistance =
    totalCount > 0
      ? (
          filteredRecords.reduce((acc, r) => acc + r.teacherAssistanceLevel, 0) / totalCount
        ).toFixed(1)
      : '0.0';

  // Domain breakdown
  const domainStats = DOMAINS.map((domain) => {
    const domainRecords = filteredRecords.filter((r) => r.domainId === domain.id);
    const domainPassed = domainRecords.filter((r) => r.teacherPassed).length;
    return {
      domain,
      total: domainRecords.length,
      passed: domainPassed,
      rate: domainRecords.length > 0 ? Math.round((domainPassed / domainRecords.length) * 100) : 0,
    };
  });

  const handleDeleteRecord = (id: string) => {
    if (confirm('คุณต้องการลบข้อมูลผลการประเมินนี้หรือไม่?')) {
      storageService.deleteAssessment(id);
      onRefreshAssessments();
    }
  };

  const handleExportCSV = () => {
    storageService.exportAssessmentsToCSV(
      selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Export Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            รายงานและสถิติผลการประเมินทักษะกลไก
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล • ประมวลผลจากข้อมูลที่บันทึกไว้ในอุปกรณ์
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน (Print)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก Excel (CSV ภาษาไทย)</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>ตัวกรองข้อมูล:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">นักเรียน:</span>
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">นักเรียนทุกคน ({assessments.length} รายการ)</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.nickname})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">หมวดทักษะ:</span>
          <select
            value={selectedDomainFilter}
            onChange={(e) => setSelectedDomainFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">ทุกหมวดทักษะ (5 หมวด)</option>
            {DOMAINS.map((dom) => (
              <option key={dom.id} value={dom.id}>
                หมวดที่ {dom.number}: {dom.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-700 font-medium">การประเมินทั้งหมด</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{totalCount} ครั้ง</div>
          <div className="text-[11px] text-slate-700 mt-0.5">บันทึกในระบบ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-700 font-medium">ผ่านตามเกณฑ์</div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {passedCount} ครั้ง
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">คิดเป็น {passRate}%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-700 font-medium">ระดับการช่วยเหลือเฉลี่ย</div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">
            ระดับ {avgAssistance}
          </div>
          <div className="text-[11px] text-slate-700 mt-0.5">จาก 5 ระดับ (5 = อิสระ)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-700 font-medium">การพัฒนาการ</div>
          <div className="text-2xl font-black font-mono text-sky-600 mt-1">
            {passRate >= 70 ? 'ก้าวหน้าดี' : 'กำลังฝึกฝน'}
          </div>
          <div className="text-[11px] text-sky-700 mt-0.5">ตามเป้าหมาย IEP</div>
        </div>
      </div>

      {/* Domain Mastery Bars */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm font-heading flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-teal-600" />
          <span>สัดส่วนความก้าวหน้าแยกตาม 5 หมวดทักษะ</span>
        </h3>

        <div className="space-y-3">
          {domainStats.map(({ domain, total, passed, rate }) => (
            <div key={domain.id} className="text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-800">
                  หมวดที่ {domain.number}: {domain.title} ({domain.englishTitle})
                </span>
                <span className="text-slate-500 font-mono">
                  {passed}/{total} ครั้ง ({total > 0 ? `${rate}%` : 'ยังไม่มีการประเมิน'})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${domain.color} transition-all duration-500`}
                  style={{ width: `${total > 0 ? rate : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm font-heading">
            ตารางรายการผลการประเมิน ({filteredRecords.length} รายการ)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">วันที่ / เวลา</th>
                <th className="px-4 py-3">นักเรียน</th>
                <th className="px-4 py-3">กิจกรรม</th>
                <th className="px-4 py-3 text-center">AI ตรวจจับ</th>
                <th className="px-4 py-3 text-center">ครูยืนยัน</th>
                <th className="px-4 py-3 text-center">การช่วยเหลือ</th>
                <th className="px-4 py-3 text-center">ผลการตัดสิน</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    ไม่พบรายการประเมินที่ตรงกับเงื่อนไขตัวกรอง
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const dateStr = new Date(r.date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit',
                  });

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {r.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{r.activityName}</div>
                        <div className="text-[11px] text-slate-400">{r.domainTitle}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-indigo-600">
                        {r.aiRepsDetected} ครั้ง
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-teal-700">
                        {r.teacherConfirmedReps} ครั้ง
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                          ระดับ {r.teacherAssistanceLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full ${
                            r.teacherPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.teacherPassed ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> ผ่าน
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> ยังไม่ผ่าน
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setViewRecordDetail(r)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors mr-1"
                          title="ดูรายละเอียดฉบับเต็ม"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {viewRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-heading">
                รายละเอียดผลการประเมิน
              </h3>
              <button
                onClick={() => setViewRecordDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div><b>นักเรียน:</b> {viewRecordDetail.studentName}</div>
                <div><b>กิจกรรม:</b> {viewRecordDetail.activityName}</div>
                <div><b>หมวด:</b> {viewRecordDetail.domainTitle}</div>
                <div><b>วันที่:</b> {new Date(viewRecordDetail.date).toLocaleString('th-TH')}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                  <div className="font-bold text-indigo-900">ผลการตรวจจับ AI</div>
                  <div className="mt-1">จำนวนครั้ง: {viewRecordDetail.aiRepsDetected}</div>
                  <div>ความเชื่อมั่น: {Math.round(viewRecordDetail.aiAverageConfidence * 100)}%</div>
                  <div>ระยะเวลา: {viewRecordDetail.aiDurationSeconds} วินาที</div>
                </div>

                <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-100">
                  <div className="font-bold text-teal-900">ผลการประเมินโดยครู</div>
                  <div className="mt-1">จำนวนครั้งยืนยัน: {viewRecordDetail.teacherConfirmedReps}</div>
                  <div>ระดับความช่วยเหลือ: {viewRecordDetail.teacherAssistanceLevel}</div>
                  <div>ผลตัดสิน: {viewRecordDetail.teacherPassed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่านเกณฑ์'}</div>
                </div>
              </div>

              {viewRecordDetail.teacherNotes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">ข้อสังเกตของครู:</div>
                  <div className="text-slate-600 mt-0.5">{viewRecordDetail.teacherNotes}</div>
                </div>
              )}

              {viewRecordDetail.nextStepsRecommendations && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div className="font-bold text-amber-900">ข้อเสนอแนะในการฝึกครั้งต่อไป (IEP):</div>
                  <div className="text-amber-800 mt-0.5">{viewRecordDetail.nextStepsRecommendations}</div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewRecordDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
