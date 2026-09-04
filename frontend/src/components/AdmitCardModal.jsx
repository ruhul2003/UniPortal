'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, QrCode, ShieldCheck, GraduationCap, Calendar, Clock, MapPin, AlertCircle, FileCheck2 } from 'lucide-react';

export default function AdmitCardModal({ isOpen, onClose, admitCardData, user }) {
  const printRef = useRef(null);

  if (!isOpen || !admitCardData) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = admitCardData.studentName || user?.name || 'Student';
  const studentId = admitCardData.studentId || user?.studentId || 'N/A';
  const department = admitCardData.department || user?.department || 'Computer Science & Engineering';
  const section = admitCardData.section || user?.section || 'Section A';
  const avatar = admitCardData.avatar || user?.avatar || '';
  const exams = admitCardData.exams || [];
  const verificationCode = admitCardData.verificationCode || `MPU-${studentId.replace(/[^a-zA-Z0-9]/g, '')}-2026`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static">
        {/* Printable CSS override */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #admit-card-print-area, #admit-card-print-area * {
              visibility: visible;
            }
            #admit-card-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none"
        >
          {/* Top Modal Navigation Header (Screen only) */}
          <div className="no-print px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Official Digital Admit Card</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Spring Semester 2026 Examination Pass</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Admit Card</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                title="Close Admit Card"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Admit Card Document Area */}
          <div
            id="admit-card-print-area"
            ref={printRef}
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-6 print:overflow-visible text-slate-900 dark:text-slate-100"
          >
            {/* Header / Seal Banner */}
            <div className="relative p-6 rounded-2xl bg-slate-900 text-white overflow-hidden shadow-lg border border-slate-800 print:bg-none print:text-black print:border-b-2 print:border-slate-900 print:p-0 print:pb-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-400 border border-white/20 shrink-0 print:border-black print:text-black">
                    <GraduationCap className="w-10 h-10 text-white print:text-black" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black uppercase">
                      Metropolitan University
                    </h1>
                    <p className="text-xs font-semibold text-blue-300 print:text-slate-700 tracking-wide uppercase">
                      Office of the Controller of Examinations
                    </p>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">
                      Spring Semester Midterm & Final Examinations 2026
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs tracking-wider uppercase print:border-black print:text-black">
                      VERIFIED HALL PASS
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-200 text-[10px] font-bold border border-blue-400/30">
                      Attendance Eligibility Verified (≥75%)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1">Ref: {verificationCode}</p>
                </div>
              </div>
            </div>

            {/* Student Info & Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
              <div className="flex items-center justify-center md:justify-start gap-4 md:col-span-3">
                <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border-2 border-white dark:border-slate-800">
                  {avatar ? (
                    <img src={avatar} alt={studentName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{studentName.charAt(0)}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white print:text-black">{studentName}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                      {section}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5 text-slate-600 dark:text-slate-300 print:text-slate-800 font-medium">
                    <p><span className="font-bold text-slate-400">Student ID:</span> {studentId}</p>
                    <p><span className="font-bold text-slate-400">Department:</span> {department}</p>
                    <p><span className="font-bold text-slate-400">Semester:</span> Spring 2026</p>
                  </div>
                </div>
              </div>

              {/* QR Verification Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center print:border-black">
                <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded-lg shadow-sm flex items-center justify-center">
                  <QrCode className="w-full h-full" />
                </div>
                <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">{verificationCode}</p>
              </div>
            </div>

            {/* Scheduled Courses Table */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Enrolled Exam Timetable</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 print:border-black">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider print:bg-slate-200 print:text-black">
                    <tr>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Exam Type</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Room / Hall</th>
                      <th className="py-3 px-4">Invigilator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-400">
                    {exams.length > 0 ? (
                      exams.map((exam, idx) => (
                        <tr key={exam._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-white print:text-black block">
                              {exam.courseCode}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{exam.courseTitle}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase print:border print:border-black print:text-black">
                              {exam.examType || 'Midterm'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {exam.examDate}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {exam.startTime} - {exam.endTime}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500 no-print" />
                              <span>Room {exam.room} ({exam.building || 'Main Bldg'})</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {exam.invigilator || 'Faculty Member'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                          No published exams found for {section}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exam Instructions & Conduct Rules */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2 print:bg-white print:border-black print:text-black">
              <div className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-wider text-amber-800 dark:text-amber-300 print:text-black">
                <AlertCircle className="w-4 h-4 text-amber-600 no-print" />
                <span>Mandatory Hall Regulations</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 dark:text-amber-300/90 print:text-black font-medium">
                <li>Candidates must present this Admit Card along with their official Student Identity Card at the hall entrance.</li>
                <li>Smartphones, smartwatches, and unauthorized electronic gadgets are strictly prohibited inside the exam hall.</li>
                <li>Candidates must report to the allocated room at least 15 minutes prior to commencement of the exam.</li>
                <li>This admit card remains valid for all official Spring Semester 2026 assessments.</li>
              </ul>
            </div>

            {/* Official Signatures Section */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs print:border-black">
              <div className="text-center">
                <div className="h-10 flex items-center justify-center font-serif italic text-slate-400 text-sm">
                  [ Verified Student ]
                </div>
                <div className="w-36 h-0.5 bg-slate-300 dark:bg-slate-700 my-1 print:bg-black" />
                <p className="font-bold text-slate-600 dark:text-slate-400 print:text-black">Student Signature</p>
              </div>

              <div className="text-center">
                <div className="h-10 flex items-center justify-center font-serif italic font-bold text-blue-700 dark:text-blue-400 text-sm print:text-black">
                  Dr. Sarah Abedin
                </div>
                <div className="w-44 h-0.5 bg-slate-900 dark:bg-white my-1 print:bg-black" />
                <p className="font-extrabold text-slate-900 dark:text-white print:text-black uppercase text-[10px]">
                  Controller of Examinations
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
