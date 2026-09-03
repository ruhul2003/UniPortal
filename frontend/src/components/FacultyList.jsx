'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Search, 
  UserCheck, 
  GraduationCap, 
  Sparkles,
  Award,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers } from '../lib/api';
import SubmitFeedbackModal from './SubmitFeedbackModal';

const ITEMS_PER_PAGE = 30;

export default function FacultyList() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = A-Z, 'desc' = Z-A
  const [currentPage, setCurrentPage] = useState(1);

  // Feedback Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacultyForModal, setSelectedFacultyForModal] = useState(null);

  const handleOpenFeedbackModal = (facultyObj) => {
    setSelectedFacultyForModal(facultyObj);
    setIsModalOpen(true);
  };


  useEffect(() => {
    async function loadFaculties() {
      setLoading(true);
      try {
        const allUsers = await fetchUsers();
        const facultyOnly = allUsers.filter(u => u.role === 'faculty');
        setFaculties(facultyOnly);
      } catch (err) {
        console.error('Failed to load faculty members:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFaculties();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept, searchQuery, sortOrder]);

  // Department List
  const departments = [
    'all',
    'Computer Science & Engineering',
    'Software Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration'
  ];

  // Filtering & Sorting Logic (A-Z)
  const filteredFaculties = faculties
    .filter(f => {
      const matchesDept = selectedDept === 'all' || f.department === selectedDept;
      const matchesSearch = 
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.acronym?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDept && matchesSearch;
    })
    .sort((a, b) => {
      const nameA = (a.name || '').trim().toLowerCase();
      const nameB = (b.name || '').trim().toLowerCase();
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  // Pagination Calculation
  const totalPages = Math.ceil(filteredFaculties.length / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFaculties = filteredFaculties.slice(startIndex, endIndex);

  // Group by Department for the current paginated items if "all" selected
  const groupedFaculties = departments.filter(d => d !== 'all').reduce((acc, dept) => {
    const list = paginatedFaculties.filter(f => f.department === dept);
    if (list.length > 0) {
      acc[dept] = list;
    }
    return acc;
  }, {});

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            University Academic Directory
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Department-wise Faculty List
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Browse our distinguished academic faculty members, program heads, and professors filtered department-wise with full contact details and official acronyms.
          </p>
        </div>
      </div>

      {/* Control Bar: Department Tabs, Search & Sort */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Department Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {departments.map((dept) => {
              const count = dept === 'all' 
                ? faculties.length 
                : faculties.filter(f => f.department === dept).length;

              const label = dept === 'all' ? 'All Departments' : dept;

              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedDept === dept
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 opacity-80" />
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                    selectedDept === dept ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Sort Toggle */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, acronym..."
                aria-label="Search faculty by name, email, or acronym"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Z-A' : 'A-Z'}`}
              className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading faculty members from database...</p>
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs shadow-sm">
          No faculty members found matching the selected criteria.
        </div>
      ) : selectedDept !== 'all' ? (
        /* Single Selected Department Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedDept} ({filteredFaculties.length})
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {startIndex + 1}–{Math.min(endIndex, filteredFaculties.length)} of {filteredFaculties.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedFaculties.map((faculty) => (
              <FacultyCard 
                key={faculty._id} 
                faculty={faculty} 
                onFeedbackClick={() => handleOpenFeedbackModal(faculty)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Grouped Department-wise Sections */
        <div className="space-y-10">
          {Object.entries(groupedFaculties).map(([deptName, deptList]) => (
            <div key={deptName} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {deptName}
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {deptList.length} Faculty Member{deptList.length > 1 ? 's' : ''} on this page
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                  {deptList.length} Staff
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deptList.map((faculty) => (
                  <FacultyCard 
                    key={faculty._id} 
                    faculty={faculty} 
                    onFeedbackClick={() => handleOpenFeedbackModal(faculty)}
                  />
                ))}
              </div>
            </div>

          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredFaculties.length > 0 && totalPages > 1 && (
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="font-extrabold text-slate-900 dark:text-white">{startIndex + 1}</span> to{' '}
            <span className="font-extrabold text-slate-900 dark:text-white">{Math.min(endIndex, filteredFaculties.length)}</span> of{' '}
            <span className="font-extrabold text-blue-600 dark:text-blue-400">{filteredFaculties.length}</span> Faculty Members
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(validCurrentPage - 1)}
              disabled={validCurrentPage === 1}
              className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-2xl text-xs font-extrabold transition-all shadow-sm ${
                  validCurrentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-blue-500/25 scale-105'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(validCurrentPage + 1)}
              disabled={validCurrentPage === totalPages}
              className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Course Teacher Feedback Modal */}
      <SubmitFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFaculty={selectedFacultyForModal}
      />
    </section>
  );
}

/* Individual Faculty Card Component */
function FacultyCard({ faculty, onFeedbackClick }) {
  const acronym = faculty.acronym || faculty.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900/60 transition-all"
    >
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />

      <div>
        {/* Top Avatar & Acronym Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 shadow-md overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-slate-500/30 transition-all">
              {faculty.avatar ? (
                <img 
                  src={faculty.avatar} 
                  alt={faculty.name} 
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-extrabold text-xl border border-slate-200 dark:border-slate-700">
                  {faculty.name ? faculty.name.charAt(0) : 'F'}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900" title="Active Academic Staff" />
          </div>

          {/* Acronym Badge */}
          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black tracking-wider shadow-2xs">
              {acronym}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
              Acronym
            </span>
          </div>
        </div>

        {/* Name & Designation */}
        <div className="space-y-1 mb-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {faculty.name}
          </h3>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 shrink-0" />
            {faculty.designation || 'Faculty Member'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {faculty.department}
          </p>
        </div>
      </div>

      {/* Contact Details Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
        {/* Email */}
        <a
          href={`mailto:${faculty.email}`}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors truncate font-medium group/link"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="truncate">{faculty.email}</span>
        </a>

        {/* Phone Number */}
        <a
          href={`tel:${faculty.phone || '+880 1700-000000'}`}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors truncate font-medium group/link"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="truncate font-mono text-[11px]">{faculty.phone || '+880 1711-000000'}</span>
        </a>

        {/* Feedback Button */}
        {onFeedbackClick && (
          <button
            onClick={onFeedbackClick}
            className="w-full mt-3 py-2 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Evaluate Course Teacher
          </button>
        )}
      </div>
    </motion.div>
  );
}

