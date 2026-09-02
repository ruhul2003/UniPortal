'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, QrCode, ShieldCheck, GraduationCap, Calendar, UserCheck, AlertTriangle, FileCheck2, Building2, BadgeCheck } from 'lucide-react';

export default function PermissionSlipModal({ isOpen, onClose, permitData }) {
  const printRef = useRef(null);

  if (!isOpen || !permitData) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = permitData.studentName || permitData.student?.name || 'Student';
  const studentId = permitData.studentId || permitData.student?.studentId || 'N/A';
  const department = permitData.department || permitData.student?.department || 'Computer Science & Engineering';
  const section = permitData.section || permitData.student?.section || 'Section A';
  const dueAmount = permitData.dueAmount || permitData.student?.dueAmount || 28000;
  
  const facultyName = permitData.facultyName || permitData.faculty?.name || 'Faculty Member';
  const facultyId = permitData.facultyId || permitData.faculty?.facultyId || 'FACULTY';
  const facultyAcronym = permitData.facultyAcronym || permitData.faculty?.acronym || 'FAC';
  
  const permitDate = permitData.permitDate || new Date().toISOString().split('T')[0];
  const reason = permitData.reason || 'Academic Access Permission';
  const passCode = permitData.passCode || `PERMIT-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const facultyComment = permitData.facultyComment || 'Approved for 1-day academic attendance.';
  const approvedAt = permitData.approvedAt ? new Date(permitData.approvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static">
        {/* Printable CSS override for standard A4 document rendering */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #permission-slip-print-area, #permission-slip-print-area * {
              visibility: visible;
            }
            #permission-slip-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
              box-shadow: none !important;
              border: none !important;
              padding: 24px !important;
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
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none"
        >
          {/* Top Modal Navigation Header (Screen only) */}
          <div className="no-print px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">One-Day Permission Slip</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Official Special Academic Entry Pass</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                title="Close Permission Slip"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Body Area */}
          <div
            id="permission-slip-print-area"
            ref={printRef}
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible text-slate-900 dark:text-slate-100"
          >
            {/* Header / University Seal */}
            <div className="relative p-6 rounded-2xl bg-emerald-950 text-white overflow-hidden shadow-lg border border-emerald-800 print:bg-none print:text-black print:border-b-2 print:border-slate-900 print:p-0 print:pb-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/20 shrink-0 print:border-black print:text-black">
                    <GraduationCap className="w-10 h-10 text-emerald-300 print:text-black" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black uppercase">
                      Metropolitan University
                    </h1>
                    <p className="text-xs font-semibold text-emerald-300 print:text-slate-700 tracking-wide uppercase">
                      OFFICE OF ACADEMIC AFFAIRS & CONTROLLER
                    </p>
                    <p className="text-[11px] text-slate-300 print:text-slate-600">
                      Official Special One-Day Class & Exam Permission Slip
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-black text-xs tracking-wider uppercase print:border-black print:text-black">
                    OFFICIALLY APPROVED PASS
                  </span>
                  <p className="text-[10px] text-slate-300 print:text-slate-600 mt-1 font-mono font-bold">Token: {passCode}</p>
                </div>
              </div>
            </div>

            {/* Special Notice Banner for Due Amount */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 print:bg-white print:border-black print:text-black">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 no-print" />
              <div>
                <p className="font-extrabold uppercase text-[11px] tracking-wider text-amber-800 dark:text-amber-300 print:text-black">
                  Special Due Payment Permit Notice (Dues &gt; ৳25,000 Taka)
                </p>
                <p className="text-[11px] mt-0.5 text-amber-800/90 dark:text-amber-300/90 print:text-black">
                  This student has an outstanding tuition balance of <strong className="font-extrabold text-amber-950 dark:text-amber-100 print:text-black">৳{dueAmount.toLocaleString()} BDT</strong>. 
                  A special one-day permit has been officially granted by faculty member <strong>{facultyName} ({facultyAcronym})</strong> for academic access on <strong>{permitDate}</strong>.
                </p>
              </div>
            </div>

            {/* Two-Column Grid: Student Credentials & Faculty Approval info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Details Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 print:bg-white print:border-black">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-black print:text-black flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 no-print" />
                  <span>Student Information</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Student Name:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white print:text-black">{studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Student ID:</span>
                    <span className="font-bold text-slate-900 dark:text-white print:text-black">{studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Section:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">{section}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60 print:border-slate-400">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Outstanding Dues:</span>
                    <span className="font-black text-rose-600 dark:text-rose-400 print:text-black">৳{dueAmount.toLocaleString()} Taka</span>
                  </div>
                </div>
              </div>

              {/* Faculty Approval Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 print:bg-white print:border-black">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-black print:text-black flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 no-print" />
                  <span>Faculty Authorization</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Approved By:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white print:text-black">{facultyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty Acronym:</span>
                    <span className="font-bold text-slate-900 dark:text-white print:text-black">{facultyAcronym}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Permit Date Valid:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 print:text-black">{permitDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Approved On:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{approvedAt}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60 print:border-slate-400">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black uppercase text-[10px] print:border print:border-black print:text-black">
                      APPROVED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purpose & Reason Section */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs print:border-black">
              <p className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                Reason for Application
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-medium italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700 print:bg-white print:border-slate-300 print:text-black">
                "{reason}"
              </p>

              {facultyComment && (
                <div className="pt-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                    Faculty Remarks / Instructions
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 print:bg-white print:border-slate-300 print:text-black">
                    💬 {facultyComment}
                  </p>
                </div>
              )}
            </div>

            {/* Barcode & Verification Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 print:bg-white print:text-black print:border print:border-black">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white text-slate-900 p-1.5 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full" />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold tracking-widest">{passCode}</p>
                  <p className="text-[10px] text-slate-400 print:text-slate-600">Scan QR Code or enter token to verify permit authenticity on UniPortal System.</p>
                </div>
              </div>

              <div className="text-center sm:text-right text-[10px] text-slate-400 print:text-slate-600">
                <p>Valid exclusively on: <strong className="text-white print:text-black font-bold">{permitDate}</strong></p>
                <p>One-Time Use Academic Authorization Pass</p>
              </div>
            </div>

            {/* Official Signatures Section */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs print:border-black">
              <div className="text-center">
                <div className="h-10 flex items-center justify-center font-serif italic text-slate-400 text-sm">
                  [ {studentName} ]
                </div>
                <div className="w-36 h-0.5 bg-slate-300 dark:bg-slate-700 my-1 print:bg-black" />
                <p className="font-bold text-slate-600 dark:text-slate-400 print:text-black text-[11px]">Applicant Student Signature</p>
              </div>

              <div className="text-center">
                <div className="h-10 flex items-center justify-center font-serif italic font-bold text-emerald-700 dark:text-emerald-400 text-sm print:text-black">
                  {facultyName} ({facultyAcronym})
                </div>
                <div className="w-48 h-0.5 bg-slate-900 dark:bg-white my-1 print:bg-black" />
                <p className="font-extrabold text-slate-900 dark:text-white print:text-black uppercase text-[10px]">
                  Authorized Faculty Signature & Seal
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
