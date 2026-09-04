'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calculator, 
  Target, 
  Award, 
  Plus, 
  Trash2, 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRADE_POINTS = [
  { grade: 'A+', gpa: 4.00, label: '80% - 100%' },
  { grade: 'A',  gpa: 3.75, label: '75% - 79%' },
  { grade: 'A-', gpa: 3.50, label: '70% - 74%' },
  { grade: 'B+', gpa: 3.25, label: '65% - 69%' },
  { grade: 'B',  gpa: 3.00, label: '60% - 64%' },
  { grade: 'B-', gpa: 2.75, label: '55% - 59%' },
  { grade: 'C+', gpa: 2.50, label: '50% - 54%' },
  { grade: 'C',  gpa: 2.25, label: '45% - 49%' },
  { grade: 'D',  gpa: 2.00, label: '40% - 44%' },
  { grade: 'F',  gpa: 0.00, label: '0% - 39%' },
];

export default function CGPACalculatorPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([
    { id: 1, code: 'CSE-1101', name: 'Structured Programming', credits: 3, grade: 'A+', gpa: 4.00 },
    { id: 2, code: 'CSE-1102', name: 'Discrete Mathematics', credits: 3, grade: 'A', gpa: 3.75 },
    { id: 3, code: 'MAT-1103', name: 'Differential Calculus', credits: 3, grade: 'A-', gpa: 3.50 },
    { id: 4, code: 'ENG-1104', name: 'Communicative English', credits: 2, grade: 'B+', gpa: 3.25 },
  ]);

  const [futureCourses, setFutureCourses] = useState([
    { id: 101, code: 'CSE-2101', name: 'Data Structures', credits: 3, expectedGrade: 'A+' },
    { id: 102, code: 'CSE-2102', name: 'Object Oriented Programming', credits: 3, expectedGrade: 'A' },
    { id: 103, code: 'EEE-2103', name: 'Electrical Circuits', credits: 3, expectedGrade: 'A-' },
  ]);

  const [targetCGPA, setTargetCGPA] = useState(3.80);
  const [loadingMarks, setLoadingMarks] = useState(false);

  // Fetch actual student marks if logged in
  useEffect(() => {
    if (user?.studentId) {
      fetchStudentMarks();
    }
  }, [user]);

  const fetchStudentMarks = async () => {
    try {
      setLoadingMarks(true);
      const res = await fetch(`http://localhost:5000/api/marks/student/${user.studentId}`);
      const data = await res.json();
      if (data.success && data.marks?.length > 0) {
        const mapped = data.marks.map((m, idx) => ({
          id: idx + 1,
          code: m.courseCode || `CSE-${idx + 1}`,
          name: m.courseTitle || 'Course Title',
          credits: m.credits || 3,
          grade: m.letterGrade || 'A',
          gpa: typeof m.gpa === 'number' ? m.gpa : 3.75
        }));
        setCourses(mapped);
      }
    } catch (err) {
      console.warn('Using default course records for CGPA calculator:', err);
    } finally {
      setLoadingMarks(false);
    }
  };

  // Completed Course Handlers
  const addCourse = () => {
    setCourses(prev => [
      ...prev,
      {
        id: Date.now(),
        code: `CSE-${200 + prev.length}`,
        name: 'New Course',
        credits: 3,
        grade: 'A',
        gpa: 3.75
      }
    ]);
  };

  const updateCourse = (id, field, value) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (field === 'grade') {
        const found = GRADE_POINTS.find(g => g.grade === value);
        return { ...c, grade: value, gpa: found ? found.gpa : 0.00 };
      }
      return { ...c, [field]: field === 'credits' ? Number(value) || 1 : value };
    }));
  };

  const removeCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Future Course Handlers
  const addFutureCourse = () => {
    setFutureCourses(prev => [
      ...prev,
      {
        id: Date.now(),
        code: `FUT-${300 + prev.length}`,
        name: 'Planned Course',
        credits: 3,
        expectedGrade: 'A'
      }
    ]);
  };

  const updateFutureCourse = (id, field, value) => {
    setFutureCourses(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, [field]: field === 'credits' ? Number(value) || 1 : value };
    }));
  };

  const removeFutureCourse = (id) => {
    setFutureCourses(prev => prev.filter(c => c.id !== id));
  };

  // Calculations
  const totalCompletedCredits = courses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0);
  const totalGradePoints = courses.reduce((acc, c) => acc + ((Number(c.credits) || 0) * (Number(c.gpa) || 0)), 0);
  const currentCGPA = totalCompletedCredits > 0 ? (totalGradePoints / totalCompletedCredits) : 0.00;

  const totalFutureCredits = futureCourses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0);
  const futureGradePoints = futureCourses.reduce((acc, c) => {
    const found = GRADE_POINTS.find(g => g.grade === c.expectedGrade);
    const gpa = found ? found.gpa : 0.00;
    return acc + ((Number(c.credits) || 0) * gpa);
  }, 0);

  const projectedTotalCredits = totalCompletedCredits + totalFutureCredits;
  const projectedTotalGradePoints = totalGradePoints + futureGradePoints;
  const projectedCGPA = projectedTotalCredits > 0 ? (projectedTotalGradePoints / projectedTotalCredits) : 0.00;

  // Target SGPA needed for upcoming semester to hit Target CGPA
  const requiredTotalGradePoints = targetCGPA * projectedTotalCredits;
  const neededFutureGradePoints = requiredTotalGradePoints - totalGradePoints;
  const requiredFutureSGPA = totalFutureCredits > 0 ? (neededFutureGradePoints / totalFutureCredits) : 0.00;

  const getDifficultyStatus = (sgpa) => {
    if (sgpa <= 0) return { label: 'Already Achieved!', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (sgpa <= 3.25) return { label: 'Modest Effort Required (B+ Average)', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    if (sgpa <= 3.75) return { label: 'High Focus Needed (A/A- Average)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    if (sgpa <= 4.00) return { label: 'Top Honor Needed (A+ Average)', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' };
    return { label: 'Mathematically Impossible with Current Credits', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const status = getDifficultyStatus(requiredFutureSGPA);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  CGPA Calculator & Target Simulator
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  Interactive
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Calculate your current academic standing and project grades required for target honors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudentMarks}
              disabled={loadingMarks}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMarks ? 'animate-spin' : ''}`} />
              Sync Published Marks
            </button>
          </div>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Current CGPA */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current CGPA</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentCGPA.toFixed(2)}
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                Based on {totalCompletedCredits} Completed Credits
              </p>
            </div>
          </div>

          {/* Projected CGPA */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected CGPA</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {projectedCGPA.toFixed(2)}
              </div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                With {totalFutureCredits} Upcoming Credits
              </p>
            </div>
          </div>

          {/* Target Goal */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target CGPA Goal</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                min="2.00"
                max="4.00"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(Math.min(4.0, Math.max(0, Number(e.target.value) || 0)))}
                className="w-24 px-3 py-1.5 rounded-xl text-2xl font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-slate-500">Out of 4.00</span>
            </div>
          </div>

          {/* Required Target SGPA */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Target SGPA</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {requiredFutureSGPA <= 0 ? '0.00' : requiredFutureSGPA > 4.0 ? '> 4.00' : requiredFutureSGPA.toFixed(2)}
              </div>
              <p className={`text-[11px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block ${status.color}`}>
                {status.label}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid: Completed Courses & Target Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Completed Courses (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Completed Courses</h2>
                  <p className="text-xs text-slate-500">Edit course credits and earned letter grades</p>
                </div>
              </div>
              <button
                onClick={addCourse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </div>

            {/* Courses Table / Cards */}
            <div className="space-y-3">
              {courses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  layout
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                      placeholder="Course Code"
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                      placeholder="Course Name"
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value={1}>1.0 Credit</option>
                      <option value={1.5}>1.5 Credit</option>
                      <option value={2}>2.0 Credits</option>
                      <option value={3}>3.0 Credits</option>
                      <option value={4}>4.0 Credits</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300"
                    >
                      {GRADE_POINTS.map(g => (
                        <option key={g.grade} value={g.grade}>
                          {g.grade} ({g.gpa.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Row */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span>Total Completed: {courses.length} Courses ({totalCompletedCredits} Credits)</span>
              <span>Earned Points: {totalGradePoints.toFixed(2)} / CGPA: {currentCGPA.toFixed(2)}</span>
            </div>
          </div>

          {/* Right Column: Target Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Semester Simulator</h2>
                  <p className="text-xs text-slate-500">Plan upcoming courses & target grades</p>
                </div>
              </div>
              <button
                onClick={addFutureCourse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Planned
              </button>
            </div>

            {/* Future Courses List */}
            <div className="space-y-3">
              {futureCourses.map((fc) => (
                <div key={fc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fc.code}
                      onChange={(e) => updateFutureCourse(fc.id, 'code', e.target.value)}
                      className="w-1/3 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={fc.name}
                      onChange={(e) => updateFutureCourse(fc.id, 'name', e.target.value)}
                      className="w-2/3 px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Credits:</span>
                      <select
                        value={fc.credits}
                        onChange={(e) => updateFutureCourse(fc.id, 'credits', e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value={1}>1.0</option>
                        <option value={1.5}>1.5</option>
                        <option value={2}>2.0</option>
                        <option value={3}>3.0</option>
                        <option value={4}>4.0</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Target Grade:</span>
                      <select
                        value={fc.expectedGrade}
                        onChange={(e) => updateFutureCourse(fc.id, 'expectedGrade', e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300"
                      >
                        {GRADE_POINTS.map(g => (
                          <option key={g.grade} value={g.grade}>{g.grade}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeFutureCourse(fc.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grading System Reference Legend */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-blue-500" /> Grading Scale Legend</span>
                <span className="text-[10px] text-slate-400">Metropolitan Univ.</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {GRADE_POINTS.slice(0, 6).map(g => (
                  <div key={g.grade} className="flex justify-between px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{g.grade}</span>
                    <span className="text-slate-500">{g.gpa.toFixed(2)} pts</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
