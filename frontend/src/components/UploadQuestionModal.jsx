'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Upload, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Link2, 
  Award,
  ShieldCheck
} from 'lucide-react';
import { createResource } from '../lib/api';

const COURSES = [
  { code: 'CSE-101', title: 'Structured Programming Language' },
  { code: 'CSE-102', title: 'Data Structures & Algorithms' },
  { code: 'CSE-201', title: 'Object-Oriented Programming' },
  { code: 'MAT-105', title: 'Differential Calculus & Geometry' },
  { code: 'EEE-103', title: 'Electrical Circuit Analysis' },
  { code: 'ENG-101', title: 'Technical English Communication' },
];

const SEMESTERS = [
  'Spring 2026',
  'Fall 2025',
  'Spring 2025',
  'Fall 2024',
  'Spring 2024'
];

export default function UploadQuestionModal({ isOpen, onClose, onQuestionUploaded, currentUser }) {
  const [courseCode, setCourseCode] = useState('CSE-101');
  const [courseTitle, setCourseTitle] = useState('Structured Programming Language');
  const [semester, setSemester] = useState('Spring 2026');
  const [category, setCategory] = useState('CT Questions (Class Test)');
  const [examType, setExamType] = useState('CT 1');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCourseChange = (selectedCode) => {
    setCourseCode(selectedCode);
    const found = COURSES.find(c => c.code === selectedCode);
    if (found) {
      setCourseTitle(found.title);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat === 'CT Questions (Class Test)') {
      setExamType('CT 1');
    } else if (cat === 'Midterm Questions') {
      setExamType('Midterm Exam');
    } else if (cat === 'Final Questions') {
      setExamType('Final Exam');
    } else {
      setExamType('PYQ');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fileUrl) {
      setErrorMsg('Question paper File URL / Google Drive link is required.');
      return;
    }

    const defaultTitle = title.trim() || `${courseCode} ${examType} Question Paper (${semester})`;
    const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'admin';

    setIsSubmitting(true);
    try {
      const payload = {
        title: defaultTitle,
        courseCode,
        courseTitle,
        semester,
        category,
        examType,
        fileUrl,
        solutionUrl,
        description,
        uploadedBy: currentUser?.name || 'Faculty Member',
        uploadedByRole: currentUser?.role === 'student' ? (currentUser?.isCR ? 'cr' : 'student') : currentUser?.role || 'faculty',
        isOfficial: isFaculty
      };

      const result = await createResource(payload);
      if (result.success) {
        if (onQuestionUploaded) {
          onQuestionUploaded(result.resource);
        }
        resetForm();
        onClose();
      } else {
        setErrorMsg(result.error || 'Failed to upload question paper.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setFileUrl('');
    setSolutionUrl('');
    setDescription('');
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="p-6 bg-indigo-900 text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-purple-300 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight">Upload Question Paper</h3>
                  {currentUser?.role === 'faculty' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      Official Faculty Upload
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-200 font-medium">
                  Publish Class Test (CT), Midterm, and Final examination question papers & solutions.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close question paper upload modal"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Course & Semester Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Code & Title *
                </label>
                <select
                  value={courseCode}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {COURSES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Semester / Term *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {SEMESTERS.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Category & Sub-Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assessment Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="CT Questions (Class Test)">CT Questions (Class Test)</option>
                  <option value="Midterm Questions">Midterm Questions</option>
                  <option value="Final Questions">Final Questions</option>
                  <option value="PYQs (Previous Year)">PYQs (Previous Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Exam Sub-Tag / Identifier *
                </label>
                {category === 'CT Questions (Class Test)' ? (
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-black focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="CT 1">CT 1 (Class Test 1)</option>
                    <option value="CT 2">CT 2 (Class Test 2)</option>
                    <option value="CT 3">CT 3 (Class Test 3)</option>
                    <option value="CT 4">CT 4 (Class Test 4)</option>
                  </select>
                ) : category === 'Midterm Questions' ? (
                  <input
                    type="text"
                    readOnly
                    value="Midterm Exam"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black"
                  />
                ) : category === 'Final Questions' ? (
                  <input
                    type="text"
                    readOnly
                    value="Final Exam"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black"
                  />
                ) : (
                  <input
                    type="text"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    placeholder="e.g. 2024 Solved"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                  />
                )}
              </div>
            </div>

            {/* Custom Title */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Paper Title <span className="text-slate-400 font-normal">(Optional custom title)</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. ${courseCode} ${examType} Question Paper & Answer Key`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Question PDF Link */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Question Paper URL / Google Drive Link *
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... or PDF link"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Solution Key Link (Optional) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Solution / Answer Key Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <CheckCircle2 className="w-4 h-4 absolute left-3.5 top-3 text-emerald-500" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... (Official solution key)"
                  value={solutionUrl}
                  onChange={(e) => setSolutionUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Description / Instructions */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Topics Covered / Faculty Remarks <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Covers modules 1-3. Total marks 20. Allowed duration 45 mins."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Publishing as: <strong className="text-slate-700 dark:text-slate-300">{currentUser?.name || 'Faculty Member'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Question Paper'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
