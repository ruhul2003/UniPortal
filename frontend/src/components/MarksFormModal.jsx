'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, AlertCircle, Save, Send, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarksFormModal({ isOpen, onClose, initialData, onSave, isFaculty }) {
  const [formData, setFormData] = useState({
    _id: '',
    studentId: '',
    studentName: '',
    studentEmail: '',
    courseCode: 'CSE-3101',
    courseTitle: 'Database Management Systems',
    section: 'Section A',
    semester: 'Spring 2026',
    ct1: 0,
    ct2: 0,
    mid: 0,
    final: 0,
    assignment: 0,
    attendence: 0,
    ctRule: 'best',
    published: false,
    remarks: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id || '',
        studentId: initialData.studentId || '',
        studentName: initialData.studentName || '',
        studentEmail: initialData.studentEmail || '',
        courseCode: initialData.courseCode || 'CSE-3101',
        courseTitle: initialData.courseTitle || 'Database Management Systems',
        section: initialData.section || 'Section A',
        semester: initialData.semester || 'Spring 2026',
        ct1: initialData.ct1 !== undefined ? initialData.ct1 : 0,
        ct2: initialData.ct2 !== undefined ? initialData.ct2 : 0,
        mid: initialData.mid !== undefined ? initialData.mid : 0,
        final: initialData.final !== undefined ? initialData.final : 0,
        assignment: initialData.assignment !== undefined ? initialData.assignment : 0,
        attendence: initialData.attendence !== undefined ? initialData.attendence : 0,
        ctRule: initialData.ctRule || 'best',
        published: initialData.published !== undefined ? initialData.published : false,
        remarks: initialData.remarks || ''
      });
    } else {
      setFormData({
        _id: '',
        studentId: '',
        studentName: '',
        studentEmail: '',
        courseCode: 'CSE-3101',
        courseTitle: 'Database Management Systems',
        section: 'Section A',
        semester: 'Spring 2026',
        ct1: 0,
        ct2: 0,
        mid: 0,
        final: 0,
        assignment: 0,
        attendence: 0,
        ctRule: 'best',
        published: false,
        remarks: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  // Compute total, letter grade, gpa on the fly
  const computeStats = () => {
    const c1 = Number(formData.ct1) || 0;
    const c2 = Number(formData.ct2) || 0;
    const m = Number(formData.mid) || 0;
    const f = Number(formData.final) || 0;
    const a = Number(formData.assignment) || 0;
    const att = Number(formData.attendence) || 0;
    const rule = formData.ctRule || 'best';

    let effectiveCT = 0;
    if (rule === 'best') {
      effectiveCT = Math.max(c1, c2);
    } else if (rule === 'average') {
      effectiveCT = (c1 + c2) / 2;
    } else {
      effectiveCT = c1 + c2;
    }

    const total = Math.min(100, Math.max(0, Math.round((effectiveCT + m + f + a + att) * 100) / 100));

    let letterGrade = 'F';
    let gpa = 0.00;

    if (total >= 80) { letterGrade = 'A+'; gpa = 4.00; }
    else if (total >= 75) { letterGrade = 'A'; gpa = 3.75; }
    else if (total >= 70) { letterGrade = 'A-'; gpa = 3.50; }
    else if (total >= 65) { letterGrade = 'B+'; gpa = 3.25; }
    else if (total >= 60) { letterGrade = 'B'; gpa = 3.00; }
    else if (total >= 55) { letterGrade = 'B-'; gpa = 2.75; }
    else if (total >= 50) { letterGrade = 'C+'; gpa = 2.50; }
    else if (total >= 45) { letterGrade = 'C'; gpa = 2.25; }
    else if (total >= 40) { letterGrade = 'D'; gpa = 2.00; }
    else { letterGrade = 'F'; gpa = 0.00; }

    return { total, letterGrade, gpa, effectiveCT };
  };

  const { total, letterGrade, gpa, effectiveCT } = computeStats();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e, forcePublish = null) => {
    e.preventDefault();
    if (!formData.studentId.trim()) {
      setError('Student ID is required');
      return;
    }
    if (!formData.courseCode.trim()) {
      setError('Course code is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const payload = {
        ...formData,
        ct1: Number(formData.ct1) || 0,
        ct2: Number(formData.ct2) || 0,
        mid: Number(formData.mid) || 0,
        final: Number(formData.final) || 0,
        assignment: Number(formData.assignment) || 0,
        attendence: Number(formData.attendence) || 0,
        ctRule: formData.ctRule || 'best',
        published: forcePublish !== null ? forcePublish : formData.published
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save marks entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {initialData ? 'Edit Student Marks' : 'Publish New Student Marks'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Fill in component scores: CT1, CT2, Mid, Final, Assignment & Attendance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close marks form modal"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="mt-6 space-y-6">
            {/* Student & Course Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. CSE-2024-042"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="e.g. Rahim Chowdhury"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  placeholder="e.g. CSE-3101"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                  <option value="Section 9A">Section 9A</option>
                </select>
              </div>
            </div>

            {/* Marks Input Grid: CT1, CT2, Mid, Final, Assignment, Attendance */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-500" />
                  Assessment Component Scores
                </h4>

                {/* CT Calculation Rule Selector */}
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">CT Rule:</span>
                  <select
                    name="ctRule"
                    value={formData.ctRule}
                    onChange={handleChange}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-700 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="best">Best CT (Highest score)</option>
                    <option value="average">Average of CTs ((CT1 + CT2) / 2)</option>
                    <option value="sum">Sum of CTs (CT1 + CT2)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                {/* CT1 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CT 1 <span className="text-slate-400 font-normal">(Max 15)</span>
                  </label>
                  <input
                    type="number"
                    name="ct1"
                    min="0"
                    max="15"
                    step="0.5"
                    value={formData.ct1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-center focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* CT2 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CT 2 <span className="text-slate-400 font-normal">(Max 15)</span>
                  </label>
                  <input
                    type="number"
                    name="ct2"
                    min="0"
                    max="15"
                    step="0.5"
                    value={formData.ct2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-center focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Midterm */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mid <span className="text-slate-400 font-normal">(Max 25)</span>
                  </label>
                  <input
                    type="number"
                    name="mid"
                    min="0"
                    max="25"
                    step="0.5"
                    value={formData.mid}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-center focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Final Exam */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Final <span className="text-slate-400 font-normal">(Max 40)</span>
                  </label>
                  <input
                    type="number"
                    name="final"
                    min="0"
                    max="40"
                    step="0.5"
                    value={formData.final}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-center focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment <span className="text-slate-400 font-normal">(Max 10)</span>
                  </label>
                  <input
                    type="number"
                    name="assignment"
                    min="0"
                    max="10"
                    step="0.5"
                    value={formData.assignment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-center focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Attendance */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Attendance <span className="text-slate-400 font-normal">(Max 10)</span>
                  </label>
                  <input
                    type="number"
                    name="attendence"
                    min="0"
                    max="10"
                    step="0.5"
                    value={formData.attendence}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-center focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Total / Grade Preview Card */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
                  Calculated Total Marks
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {total} <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                  CT Contribution: {effectiveCT} marks ({formData.ctRule === 'best' ? 'Best CT' : formData.ctRule === 'average' ? 'Average' : 'Sum'})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
                    Grade & GPA
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    GPA: {gpa.toFixed(2)}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {letterGrade}
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Faculty Remarks / Notes
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Excellent conceptual clarity in exams."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
              />
            </div>

            {/* Publication Status Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="published" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Publish marks immediately to student portal
                </label>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                formData.published
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {formData.published ? 'Will be Published' : 'Draft Only'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-colors text-sm disabled:opacity-50 shadow-md shadow-indigo-500/20"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Publish Marks'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
