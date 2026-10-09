import React, { useState } from 'react';
import {
  Camera,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  Eye,
} from 'lucide-react';

export const TeacherManualModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'camera_setup' | 'teacher_guide' | 'ai_limits' | 'verification' | 'privacy'
  >('camera_setup');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              คู่มือมาตรฐานการปฏิบัติงาน
            </span>
            <span className="text-xs text-slate-500">ศูนย์การศึกษาพิเศษ ประจำจังหวัดสตูล</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading mt-1">
            คู่มือการใช้งานและเอกสารกำกับระบบ Motor Adventure AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            แนวทางการติดตั้งกล้อง การให้คะแนนระดับการช่วยเหลือ ข้อจำกัดของ AI และการทดสอบระบบ
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSection('camera_setup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'camera_setup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>1. คู่มือการติดตั้งและเปิดกล้อง</span>
        </button>

        <button
          onClick={() => setActiveSection('teacher_guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'teacher_guide'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. คู่มือการใช้งานสำหรับครู (IEP)</span>
        </button>

        <button
          onClick={() => setActiveSection('ai_limits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'ai_limits'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>3. รายการข้อจำกัดของ AI</span>
        </button>

        <button
          onClick={() => setActiveSection('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'verification'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>4. วิธีทดสอบว่าตรวจจับจริง</span>
        </button>

        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'privacy'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5. ความเป็นส่วนตัวและความปลอดภัย</span>
        </button>
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm leading-relaxed text-sm text-slate-700">
        {activeSection === 'camera_setup' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg font-heading">
              <Camera className="w-5 h-5" />
              <span>คู่มือการติดตั้งและการเปิดใช้งานกล้อง (Camera Setup Guide)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">📐 1. ระยะห่างและความสูงของกล้อง</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>ระยะห่างที่เหมาะสมที่สุดระหว่างกล้องกับนักเรียนคือ <b>2.0 - 3.0 เมตร</b></li>
                  <li>ความสูงของกล้องควรอยู่ที่ระดับเอวหรืออกของนักเรียน (ประมาณ <b>80 - 100 ซม.</b> จากพื้น)</li>
                  <li>แนะนำให้ใช้ขาตั้งกล้อง (Tripod) สำหรับโทรศัพท์หรือแท็บเล็ต เพื่อภาพที่นิ่งเสถียร</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">💡 2. แสงสว่างและฉากหลัง</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>ควรมีแสงสว่างสม่ำเสมอทั่วทั้งห้อง หลีกเลี่ยงการยืนย้อนแสงหน้าต่าง</li>
                  <li>ฉากหลังควรเรียบและตัดกับสีเสื้อผ้าของนักเรียนเพื่อความแม่นยำของจุดข้อต่อ</li>
                  <li>ควรเคลียร์สิ่งของที่อาจกีดขวางการเคลื่อนไหวเพื่อความปลอดภัยของเด็ก</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">📱 3. การอนุญาตสิทธิ์กล้องในเบราว์เซอร์</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>เมื่อเปิดแอปครั้งแรก ให้กด <b>"อนุญาต" (Allow)</b> เมื่อเบราว์เซอร์ถามการเข้าถึงกล้อง</li>
                  <li>สามารถสลับระหว่าง <b>กล้องหน้า</b> และ <b>กล้องหลัง</b> ได้ด้วยปุ่มสลับกล้อง</li>
                  <li>มีปุ่ม <b>"กลับด้านภาพ (Mirror)"</b> เพื่อให้นักเรียนเห็นตัวเองเหมือนกระจกเงา</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">⚡ 4. การจัดการกรณีเกิดข้อผิดพลาด</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>หากภาพไม่ขึ้น ให้ตรวจสอบว่าไม่มีแอปอื่นเปิดใช้งานกล้องค้างอยู่</li>
                  <li>หากจุดข้อต่อกระตุก ให้ตรวจสอบสถานะการเชื่อมต่อหรือรีเฟรชหน้าเว็บ 1 ครั้ง</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'teacher_guide' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg font-heading">
              <BookOpen className="w-5 h-5" />
              <span>คู่มือการใช้งานสำหรับครูการศึกษาพิเศษ (Teacher & IEP Guide)</span>
            </div>

            <p className="text-xs text-slate-600">
              การประเมินทักษะกลไกสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ มิได้มุ่งเน้นเพียงคะแนนเชิงตัวเลข
              แต่ให้ความสำคัญกับ <b>ระดับการช่วยเหลือ (Prompt Hierarchy)</b> เพื่อนำไปสู่การจัดทำแผน IEP
            </p>

            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm">เกณฑ์ระดับการช่วยเหลือ 5 ระดับ:</div>
              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800">ระดับ 5: ปฏิบัติได้ด้วยตนเอง (Independent)</span>
                  <p className="text-emerald-950 mt-0.5">ทำได้ถูกต้องตามคำสั่ง โดยไม่ต้องได้รับคำเตือนหรือการช่วยเหลือทางกาย</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="font-bold text-blue-800">ระดับ 4: ได้รับคำเตือนหรือคำบอกใบ้ (Verbal/Visual Prompt)</span>
                  <p className="text-blue-950 mt-0.5">ทำได้เมื่อครูส่งเสียงเตือน ใช้ภาษามือ หรือชี้ภาพสัญลักษณ์</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800">ระดับ 3: ช่วยเหลือทางกายร่วมกับวาจา (Gestural/Partial Prompt)</span>
                  <p className="text-amber-950 mt-0.5">ครูช่วยสัมผัสแตะข้อศอก สะกิดหัวเข่า หรือประคองเบา ๆ ร่วมกับการบอก</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <span className="font-bold text-orange-800">ระดับ 2: จับมือช่วยประคองอย่างใกล้ชิด (Full Physical Prompt)</span>
                  <p className="text-orange-950 mt-0.5">ครูต้องช่วยพยุงทั้งสองมือ จับขา หรือประคองตัวตลอดการทำกิจกรรมเพื่อความปลอดภัย</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="font-bold text-rose-800">ระดับ 1: ยังไม่สามารถปฏิบัติได้หรือปฏิเสธ (Unable / Refused)</span>
                  <p className="text-rose-950 mt-0.5">นักเรียนไม่เริ่มทำท่าทาง ไม่ทรงตัว หรือปฏิเสธการทำกิจกรรมในครั้งนี้</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800">📋 บทบาทของครูในการตัดสินผล:</div>
              <p className="text-slate-600">
                AI ทำหน้าที่เป็นเครื่องมือช่วยบันทึกการเคลื่อนไหว แต่ <b>ครูเป็นผู้ตัดสินใจขั้นสุดท้ายเสมอ</b>
                สามารถปรับเพิ่ม/ลดจำนวนครั้งที่ถูกต้อง และเลือกบันทึกผลว่า "ผ่าน" หรือ "ยังไม่ผ่าน" ตามบริบทจริง
              </p>
            </div>
          </div>
        )}

        {activeSection === 'ai_limits' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-lg font-heading">
              <AlertTriangle className="w-5 h-5" />
              <span>รายการข้อจำกัดของ AI และกิจกรรมที่ต้องสังเกตเพิ่มเติม</span>
            </div>

            <p className="text-xs text-slate-600">
              เพื่อความโปร่งใสทางวิชาการและการวัดผลที่เที่ยงตรง ระบบ Motor Adventure AI
              ไม่มีการสร้างข้อมูลเท็จ และขอแจ้งข้อจำกัดทางเทคนิคอย่างตรงไปตรงมาดังนี้:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900">
                <div className="font-bold text-rose-800">1. การควบคุมวัตถุ (ลูกบอล / อุปกรณ์)</div>
                <p className="mt-1 leading-relaxed">
                  โมเดล Pose Estimation ตรวจจับเฉพาะโครงร่างร่างกายมนุษย์ (33 จุด)
                  ไม่สามารถยืนยันได้ 100% ว่าลูกบอลลงตะกร้าหรือกลิ้งเข้าเป้าหมายหรือไม่
                  ดังนั้นในกิจกรรมหมวดที่ 3 <b>ครูต้องเป็นผู้กดปุ่มยืนยันผลความสำเร็จของวัตถุร่วมด้วยเสมอ</b>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                <div className="font-bold text-amber-800">2. การสัมผัสหรือชนสิ่งกีดขวาง</div>
                <p className="mt-1 leading-relaxed">
                  กล้อง 2D มีข้อจำกัดเรื่องมิติความลึก (Depth Occlusion)
                  หากนักเรียนก้าวเฉียดกรวยหรือเหยียบสิ่งกีดขวาง ระบบจะตรวจจับแนวลำตัวเทียบกับโซนเสมือน
                  แต่ครูผู้สอนต้องเป็นผู้สังเกตและบันทึกผลจริงหากเกิดการสะดุดหรือชน
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <div className="font-bold text-slate-800">3. ข้อจำกัดเมื่อมีกายอุปกรณ์บดบัง (AFO / รถเข็น / วอล์กเกอร์)</div>
                <p className="mt-1 leading-relaxed">
                  เด็กพิเศษบางคนสวมกายอุปกรณ์ดามข้อเท้า ซึ่งอาจทำให้ตำแหน่งข้อเท้าในภาพมีความแปรปรวน
                  ระบบได้รับการออกแบบให้ปรับลดเกณฑ์ค่าความเชื่อมั่น (Confidence Threshold) ได้ในหน้าตั้งค่าเกณฑ์
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'verification' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg font-heading">
              <Eye className="w-5 h-5" />
              <span>วิธีทดสอบว่าระบบตรวจจับและให้คะแนนได้จริง (System Verification)</span>
            </div>

            <p className="text-xs text-slate-600">
              ครูและผู้ประเมินสามารถทดสอบความเที่ยงตรงของระบบด้วยวิธีการต่อไปนี้:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">1. สังเกตเส้นโครงร่างสดบนหน้าจอ</div>
                <p className="text-slate-600">
                  เมื่อเปิดกล้องและยืนหน้ากล้อง จุดข้อต่อ 33 จุดและเส้นกระดูกสีต่าง ๆ
                  จะขยับตามร่างกายจริงทุกมิลลิวินาที (Real-Time Skeleton Overlay)
                  หากเอามือบดบังกล้อง จุดข้อต่อจะหายไปทันที แสดงว่าไม่มีการสุ่มข้อมูล
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">2. ตรวจสอบค่าความเชื่อมั่น (AI Confidence)</div>
                <p className="text-slate-600">
                  ตัวเลขเปอร์เซ็นต์ที่มุมขวาบนคำนวณจากค่า Visibility เฉลี่ยของข้อต่อจริง
                  เมื่อแสงสว่างลดลงหรือยืนไกลเกินไป ค่าเปอร์เซ็นต์จะลดลงตามสภาพจริง
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">3. การทดสอบยืนขาเดียว (Single-Leg Balance)</div>
                <p className="text-slate-600">
                  เมื่อยืนสองเท้า ตัวนับเวลาจะไม่ทำงาน
                  แต่ทันทีที่ยกเท้าข้างหนึ่งขึ้นเหนือระดับ 8 เซนติเมตร
                  ระบบจะเริ่มนับเวลาค้างและแจ้งสถานะ "ยกขาค้างไว้ได้ดีมาก" ทันที
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">4. นโยบายห้ามสุ่มคะแนน (Zero Fake Score Policy)</div>
                <p className="text-slate-600">
                  หากไม่มีคนในภาพหรือร่างกายออกนอกกรอบ ระบบจะไม่เพิ่มจำนวนครั้งหรือสุ่มผลลัพธ์ใด ๆ ทั้งสิ้น
                  และจะแสดงสถานะ "ข้อมูลไม่เพียงพอ" อย่างตรงไปตรงมา
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-lg font-heading">
              <ShieldCheck className="w-5 h-5" />
              <span>ความเป็นส่วนตัวและความปลอดภัยของข้อมูลเด็ก (Child Privacy Protection)</span>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-950 space-y-2">
              <div className="font-bold text-sm text-teal-900">🔒 มาตรการรักษาความปลอดภัยข้อมูลสูงสุด:</div>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>
                  <b>ประมวลผลบนเครื่อง (Client-Side Edge Computing):</b> ภาพจากกล้องและจุดข้อต่อทั้งหมด
                  ถูกคำนวณภายในหน่วยประมวลผลของเบราว์เซอร์ของท่านโดยตรง
                </li>
                <li>
                  <b>ไม่มีการอัปโหลดภาพหรือวิดีโอ:</b> ระบบไม่เคยส่งภาพนิ่ง วิดีโอ หรือสตรีมกล้องขึ้นสู่คลาวด์หรือเซิร์ฟเวอร์ใด ๆ
                </li>
                <li>
                  <b>ไม่บังคับบันทึกใบหน้า:</b> ระบบใช้เฉพาะพิกัดข้อต่อของร่างกายเพื่อวิเคราะห์การทรงตัว
                </li>
                <li>
                  <b>จัดเก็บข้อมูลในเครื่อง (LocalStorage):</b> คะแนนและข้อมูลนักเรียนจะถูกจัดเก็บในอุปกรณ์ของศูนย์ฯ
                  และครูสามารถลบหรือสำรองข้อมูลออกเป็น CSV ได้ทุกเมื่อ
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
