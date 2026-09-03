'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, User, Lock, Award, BookOpen, MessageSquare, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers, submitFeedback } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function SubmitFeedbackModal({ isOpen, onClose, onSubmitSuccess, initialFaculty = null }) {
  const { user } = useAuth();
  
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [semester, setSemester] = useState('Spring 2026');

  // Star Ratings (1-5)
  const [rating, setRating] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [courseContent, setCourseContent] = useState(5);
  const [communication, setCommunication] = useState(5);

  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill faculty list and default values
  useEffect(() => {
    async function loadFaculty() {
      try {
        const users = await fetchUsers();
        const facultyList = users.filter(u => u.role === 'faculty');
        setFaculties(facultyList);

        if (initialFaculty && initialFaculty._id) {
          setSelectedFacultyId(initialFaculty._id);
        } else if (facultyList.length > 0) {
          setSelectedFacultyId(facultyList[0]._id);
        }
      } catch (err) {
        console.error('Error loading faculties in modal:', err);
      }
    }

    if (isOpen) {
      loadFaculty();
    }
  }, [isOpen, initialFaculty]);

  if (!isOpen) return null;

  const handleSelectFaculty = (e) => {
    setSelectedFacultyId(e.target.value);
  };

  const handleSuggestionClick = (text) => {
    if (!comment) {
      setComment(text);
    } else {
      setComment(prev => `${prev} ${text}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetFaculty = faculties.find(f => f._id === selectedFacultyId) || initialFaculty;

    if (!selectedFacultyId && !targetFaculty) {
      setError('Please select a course teacher to evaluate.');
      return;
    }
    if (!courseCode.trim() || !courseTitle.trim()) {
      setError('Please enter both Course Code and Course Title.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facultyId: selectedFacultyId || targetFaculty?._id || 'FAC-101',
        facultyName: targetFaculty?.name || 'Faculty Member',
        facultyEmail: targetFaculty?.email || '',
        department: targetFaculty?.department || user?.department || 'Computer Science & Engineering',
        courseCode: courseCode.trim(),
        courseTitle: courseTitle.trim(),
        semester,
        rating,
        teachingQuality,
        courseContent,
        communication,
        comment: comment.trim(),
        isAnonymous,
        studentId: user?.studentId || '',
        studentName: user?.name || 'Student',
        studentEmail: user?.email || ''
      };

      const res = await submitFeedback(payload);
      if (res.success) {
        if (onSubmitSuccess) onSubmitSuccess(res.feedback);
        onClose();
        // Reset state
        setCourseCode('');
        setCourseTitle('');
        setComment('');
        setRating(5);
      } else {
        setError(res.error || 'Failed to submit course teacher feedback.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-slate-800 dark:fill-slate-200" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Course Teacher Evaluation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide constructive feedback about your course instructor
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Select Faculty Teacher */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Course Teacher / Faculty Member *
              </label>
              <select
                value={selectedFacultyId}
                onChange={handleSelectFaculty}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                required
              >
                {faculties.length === 0 && (
                  <option value="">Loading faculty members...</option>
                )}
                {faculties.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.department} • {fac.designation || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Code & Title Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Course Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSE-3101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Summer 2025">Summer 2025</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Course Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>

            {/* Interactive Rating Component */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
              {/* Overall Rating */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Overall Rating *</span>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

              {/* Sub Metrics */}
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Teaching Quality & Clarity</span>
                  <StarPicker value={teachingQuality} onChange={setTeachingQuality} size="small" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Course Content & Organization</span>
                  <StarPicker value={courseContent} onChange={setCourseContent} size="small" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Punctuality & Communication</span>
                  <StarPicker value={communication} onChange={setCommunication} size="small" />
                </div>
              </div>
            </div>

            {/* Comment / Written Review */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Constructive Comments / Written Review
              </label>
              <textarea
                rows={3}
                placeholder="Share specific details about teaching methodology, course materials, or suggestions..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-semibold text-slate-400">Suggestions:</span>
                {[
                  'Crystal clear explanations.',
                  'Very approachable during lab.',
                  'Well organized lecture slides.',
                  'Punctual & responsive.'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSuggestionClick(chip)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymity Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  isAnonymous ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {isAnonymous ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    {isAnonymous ? 'Submit Anonymously' : 'Submit as Identified Student'}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isAnonymous
                      ? 'Your name and student ID will remain hidden from the teacher.'
                      : `Submitted under ${user?.name || 'your profile'}.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
                  isAnonymous ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isAnonymous ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* Reusable Star Picker Component */
function StarPicker({ value, onChange, size = 'normal' }) {
  const stars = [1, 2, 3, 4, 5];
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`${isSmall ? 'w-4 h-4' : 'w-6 h-6'} ${
              s <= value
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
      <span className={`ml-1.5 font-black text-amber-500 ${isSmall ? 'text-xs' : 'text-sm'}`}>
        {value}.0
      </span>
    </div>
  );
}
