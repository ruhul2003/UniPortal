'use client';

import React from 'react';
import { Printer, Download, X, Award, CheckCircle2, ShieldCheck, GraduationCap, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DigitalTranscriptModal({ isOpen, onClose, studentData, marksList = [] }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = studentData?.name || 'Rahim Chowdhury';
  const studentId = studentData?.studentId || 'CSE-2024-042';
  const department = studentData?.department || 'Computer Science & Engineering';
  const section = studentData?.section || 'Section A';

  // Calculate totals
  const totalCredits = marksList.reduce((acc, curr) => acc + (curr.credits || 3.0), 0);
  const totalGradePoints = marksList.reduce((acc, curr) => acc + ((curr.credits || 3.0) * (curr.gpa || 4.0)), 0);
  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '3.85';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md print:p-0 print:bg-white print:static">
        
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        >
          {/* Top Modal Controls (Hidden during print) */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Official Digital Transcript Preview
                </h3>
                <p className="text-xs text-slate-500">Verified Academic Grade Sheet</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="p-8 sm:p-12 overflow-y-auto print:p-0 space-y-8 text-slate-900 dark:text-white bg-white print:text-black">
            
            {/* University Header */}
            <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 print:border-black pb-6 space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  MU
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white print:text-black">
                    Metropolitan University
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 print:text-slate-700 uppercase tracking-widest">
                    Office of the Controller of Examinations • Sylhet, Bangladesh
                  </p>
                </div>
              </div>
              <div className="inline-block mt-3 px-4 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs uppercase tracking-widest print:border print:border-black">
                OFFICIAL ACADEMIC TRANSCRIPT & GRADE SHEET
              </div>
            </div>

            {/* Student Profile Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs print:bg-slate-50 print:border-slate-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                <span className="font-extrabold text-slate-900 dark:text-white print:text-black">{studentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
                <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 print:text-black">{studentId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">{department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Section / Session</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">{section} • Spring 2026</span>
              </div>
            </div>

            {/* Transcript Course Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Academic Course Performance Breakdown
              </h4>
              
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 print:bg-slate-200">
                      <th className="py-3 px-4">Course Code</th>
                      <th className="py-3 px-4">Course Title</th>
                      <th className="py-3 px-3 text-center">Credit Hours</th>
                      <th className="py-3 px-3 text-center">Marks (100)</th>
                      <th className="py-3 px-3 text-center">Letter Grade</th>
                      <th className="py-3 px-4 text-right">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {(marksList.length > 0 ? marksList : [
                      { courseCode: 'CSE-3101', courseTitle: 'Database Management Systems', credits: 3.0, totalMarks: 88, letterGrade: 'A+', gpa: 4.00 },
                      { courseCode: 'CSE-3102', courseTitle: 'Computer Networks', credits: 3.0, totalMarks: 78, letterGrade: 'A', gpa: 3.75 },
                      { courseCode: 'CSE-3103', courseTitle: 'Software Engineering & Architecture', credits: 3.0, totalMarks: 82, letterGrade: 'A+', gpa: 4.00 },
                      { courseCode: 'MAT-3104', courseTitle: 'Applied Mathematics & Statistics', credits: 3.0, totalMarks: 72, letterGrade: 'A-', gpa: 3.50 }
                    ]).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold">{row.courseCode}</td>
                        <td className="py-3 px-4 font-semibold">{row.courseTitle || row.courseCode}</td>
                        <td className="py-3 px-3 text-center font-semibold">{(row.credits || 3.0).toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-bold">{row.totalMarks || 80}</td>
                        <td className="py-3 px-3 text-center font-black text-blue-600 dark:text-blue-400 print:text-black">
                          {row.letterGrade || 'A+'}
                        </td>
                        <td className="py-3 px-4 text-right font-black">{(row.gpa || 4.0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transcript Summary Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 print:bg-slate-100 print:border-black gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                  {cgpa}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumulative Grade Point Average (CGPA)</span>
                  <span className="text-sm font-extrabold text-blue-900 dark:text-blue-200 print:text-black">
                    Result Status: PASSED WITH HONORS
                  </span>
                </div>
              </div>

              <div className="text-right text-xs font-semibold space-y-0.5">
                <p>Total Completed Credits: <span className="font-extrabold">{totalCredits > 0 ? totalCredits : 12.0}</span></p>
                <p>Grade Scale: <span className="font-extrabold">4.00 Maximum</span></p>
              </div>
            </div>

            {/* Stamp & Controller Signature */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between print:pt-12">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 text-center text-[9px] font-bold text-slate-400 print:border-black">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  SEAL
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black">Digital Verification</p>
                  <p>Issue Date: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="font-mono text-[9px] text-slate-400">Hash: 8f9b2a7c4e1d</p>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="w-40 border-b border-slate-900 dark:border-white print:border-black pb-1 font-serif italic text-xs font-bold">
                  Prof. Dr. M. Rahman
                </div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
