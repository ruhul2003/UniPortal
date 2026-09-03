'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, BookOpen, Trash2, Edit3, Calendar, Filter, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getClassStatus(item, todayName) {
  const isToday = item.day?.toLowerCase() === todayName?.toLowerCase();
  if (!isToday) return { isToday: false };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = parseTimeToMinutes(item.startTime);
  const endMin = parseTimeToMinutes(item.endTime);

  if (startMin !== null && endMin !== null) {
    if (currentMinutes >= startMin && currentMinutes <= endMin) {
      return { isToday: true, status: 'live', label: 'Live Now', badgeBg: 'bg-slate-900 dark:bg-slate-800 text-white border border-slate-700' };
    } else if (currentMinutes < startMin) {
      return { isToday: true, status: 'upcoming', label: 'Upcoming Today', badgeBg: 'bg-slate-800 text-slate-100 border border-slate-700' };
    } else {
      return { isToday: true, status: 'completed', label: 'Completed Today', badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' };
    }
  }
  return { isToday: true, status: 'today', label: 'Today', badgeBg: 'bg-slate-800 text-slate-100 border border-slate-700' };
}

export default function RoutineTable({ routines, onDelete, onEdit }) {
  const [todayName, setTodayName] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const { user } = useAuth();
  
  // Faculty, Admin, or Class Representative (CR) can manage routine
  const canManageRoutine = user?.role === 'faculty' || user?.role === 'admin' || user?.isCR === true;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'];

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setTodayName(today);
    // Auto select today's day tab on load
    setSelectedDay(today);
  }, []);

  const getDayCount = (day) => {
    return routines.filter(r => {
      const dayMatch = day === 'All' || r.day?.toLowerCase() === day.toLowerCase();
      const semMatch = selectedSemester === 'All' || r.semester === selectedSemester;
      const secMatch = selectedSection === 'All' || r.section === selectedSection || (r.section && r.section.includes(selectedSection));
      return dayMatch && semMatch && secMatch;
    }).length;
  };

  const todayClassCount = routines.filter(r => r.day?.toLowerCase() === todayName.toLowerCase()).length;

  const filteredRoutines = routines
    .filter(r => {
      const dayMatch = selectedDay === 'All' || r.day?.toLowerCase() === selectedDay.toLowerCase();
      const semMatch = selectedSemester === 'All' || r.semester === selectedSemester;
      const secMatch = selectedSection === 'All' || r.section === selectedSection || (r.section && r.section.includes(selectedSection));
      return dayMatch && semMatch && secMatch;
    })
    .sort((a, b) => {
      const minA = parseTimeToMinutes(a.startTime) ?? 0;
      const minB = parseTimeToMinutes(b.startTime) ?? 0;
      return minA - minB;
    });


  return (
    <div className="space-y-6">
      {/* Today Banner summary */}
      {todayName && (
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Today's Schedule
              </span>
              <span className="text-xs text-slate-300">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {user?.isCR && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold uppercase flex items-center gap-1">
                  <Crown className="w-3 h-3 text-slate-300" /> Class Rep (CR) Editor
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{todayName}</span>
              <span className="text-sm font-medium text-slate-300">
                ({todayClassCount} {todayClassCount === 1 ? 'class' : 'classes'})
              </span>
            </h3>
          </div>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Day Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {days.map((day) => {
            const count = getDayCount(day);
            const isTodayTab = day.toLowerCase() === todayName.toLowerCase();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <span>{day}</span>

                {/* Today Badge */}
                {isTodayTab && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                    isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}>
                    Today
                  </span>
                )}

                {/* Count Badge */}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isSelected 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section & Semester Selectors */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          >
            <option value="All">All Sections</option>
            <option value="Section 9A">Section 9A (9th Sem)</option>
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          >
            <option value="All">All Semesters</option>
            <option value="9th Semester">9th Semester</option>
            <option value="Spring 2026">Spring 2026</option>
            <option value="Fall 2025">Fall 2025</option>
          </select>
        </div>
      </div>


      {/* Routine Cards / Matrix Grid */}
      {filteredRoutines.length === 0 ? (
        <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No classes scheduled for {selectedDay}</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting a different day tab or semester filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredRoutines.map((item, index) => {
              const statusInfo = getClassStatus(item, todayName);

              return (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className={`rounded-2xl p-5 transition-all duration-200 relative group flex flex-col justify-between ${
                    statusInfo.isToday
                      ? 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Bar: Code + Day / Today Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {item.courseCode}
                      </span>

                      <div className="flex items-center gap-2">
                        {statusInfo.isToday ? (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusInfo.badgeBg}`}>
                            {statusInfo.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                            {statusInfo.label}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {item.day}
                          </span>
                        )}

                        {canManageRoutine && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => onEdit?.(item)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Edit class slot"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete?.(item._id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 transition-colors"
                              title="Delete class slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Title */}
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                      {item.courseTitle}
                    </h4>

                    {/* Details grid */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{item.room} ({item.building || 'Academic Bldg'})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{item.facultyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section info */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>Sec: {item.section || 'A'}</span>
                    <span>{item.semester || 'Spring 2026'}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}


