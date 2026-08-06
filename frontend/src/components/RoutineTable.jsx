'use client';

import React, { useState } from 'react';
import { Clock, MapPin, User, BookOpen, Trash2, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function RoutineTable({ routines, onDelete }) {
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredRoutines = routines.filter(r => {
    const dayMatch = selectedDay === 'All' || r.day === selectedDay;
    const semMatch = selectedSemester === 'All' || r.semester === selectedSemester;
    return dayMatch && semMatch;
  });

  return (
    <div className="space-y-6">
      {/* Day Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Semester selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Semesters</option>
            <option value="Spring 2026">Spring 2026</option>
            <option value="Fall 2025">Fall 2025</option>
          </select>
        </div>
      </div>

      {/* Routine Cards / Matrix Grid */}
      {filteredRoutines.length === 0 ? (
        <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No classes scheduled for this selection</p>
          <p className="text-xs text-slate-400 mt-1">Try changing your day or semester filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredRoutines.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-lg transition-all duration-200 relative group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code + Day */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {item.courseCode}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.day}
                      </span>
                      {isFaculty && (
                        <button
                          onClick={() => onDelete?.(item._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                          title="Delete class slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Course Title */}
                  <h4 className="text-base font-bold text-slate-900 mb-3 leading-snug">
                    {item.courseTitle}
                  </h4>

                  {/* Details grid */}
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item.room} ({item.building || 'Academic Bldg'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{item.facultyName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Section info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Sec: {item.section || 'A'}</span>
                  <span>{item.semester || 'Spring 2026'}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
