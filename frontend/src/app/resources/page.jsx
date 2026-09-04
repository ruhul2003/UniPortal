'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchResources, createResource, upvoteResource, trackResourceDownload, deleteResource } from '../../lib/api';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  ThumbsUp, 
  Download, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  Trash2, 
  User, 
  XCircle,
  Sparkles,
  Filter,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadQuestionModal from '../../components/UploadQuestionModal';

const CATEGORIES = [
  'All',
  'CT Questions (Class Test)',
  'Midterm Questions',
  'Final Questions',
  'PYQs (Previous Year)',
  'Lecture Slides',
  'Class Notes',
  'Lab Manual',
  'Reference Book'
];

const EXAM_SUBTYPES = ['All', 'CT 1', 'CT 2', 'CT 3', 'CT 4', 'Midterm Exam', 'Final Exam'];

export default function ResourcesPage() {
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // General share form state
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CSE-101');
  const [courseTitle, setCourseTitle] = useState('Structured Programming Language');
  const [category, setCategory] = useState('Lecture Slides');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin' || user?.isCR;

  useEffect(() => {
    loadResources();
  }, [selectedCategory, selectedExamType, searchQuery]);

  async function loadResources() {
    setLoading(true);
    try {
      const data = await fetchResources({
        category: selectedCategory,
        examType: selectedExamType,
        search: searchQuery
      });

      if (data.length > 0) {
        setResources(data);
      } else {
        // Rich initial fallback data with official Faculty CT & Mid/Final questions
        setResources([
          {
            _id: 'res-ct1',
            title: 'CSE-101 Class Test 1 (CT-1) Question Paper & Key',
            courseCode: 'CSE-101',
            courseTitle: 'Structured Programming Language',
            semester: 'Spring 2026',
            category: 'CT Questions (Class Test)',
            examType: 'CT 1',
            fileUrl: 'https://drive.google.com',
            solutionUrl: 'https://drive.google.com',
            description: 'Official CT-1 Question paper covering C syntax, conditional statements, and nested loops.',
            uploadedBy: 'Dr. Sarah Abedin',
            uploadedByRole: 'faculty',
            isOfficial: true,
            upvotes: ['user1', 'user2', 'user3', 'user4'],
            downloadsCount: 64
          },
          {
            _id: 'res-mid',
            title: 'CSE-102 Midterm Exam Question Paper & Model Answer',
            courseCode: 'CSE-102',
            courseTitle: 'Data Structures & Algorithms',
            semester: 'Spring 2026',
            category: 'Midterm Questions',
            examType: 'Midterm Exam',
            fileUrl: 'https://drive.google.com',
            solutionUrl: 'https://drive.google.com',
            description: 'Midterm paper with handwritten step-by-step tree traversal & stack evaluation solutions.',
            uploadedBy: 'Dr. Sarah Abedin',
            uploadedByRole: 'faculty',
            isOfficial: true,
            upvotes: ['user1', 'user5', 'user6', 'user7', 'user8'],
            downloadsCount: 112
          },
          {
            _id: 'res-final',
            title: 'MAT-105 Final Examination Question Paper 2025',
            courseCode: 'MAT-105',
            courseTitle: 'Differential Calculus & Geometry',
            semester: 'Fall 2025',
            category: 'Final Questions',
            examType: 'Final Exam',
            fileUrl: 'https://drive.google.com',
            description: 'Final semester exam paper covering multi-variable integration and vector geometry.',
            uploadedBy: 'Prof. Hasan Mahmud',
            uploadedByRole: 'faculty',
            isOfficial: true,
            upvotes: ['user2', 'user3', 'user9'],
            downloadsCount: 95
          },
          {
            _id: 'res-1',
            title: 'CSE-101 Complete Lecture Slides (Week 1 - 6)',
            courseCode: 'CSE-101',
            courseTitle: 'Structured Programming Language',
            semester: 'Spring 2026',
            category: 'Lecture Slides',
            fileUrl: 'https://drive.google.com',
            description: 'Covers pointers, dynamic memory allocation, and structs with code snippets.',
            uploadedBy: 'Rahim Chowdhury (CR)',
            uploadedByRole: 'cr',
            isOfficial: false,
            upvotes: ['user1', 'user2', 'user3'],
            downloadsCount: 42
          }
        ]);
      }
    } catch (err) {
      console.warn('Resources fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl) return;

    setIsUploading(true);
    try {
      await createResource({
        title,
        courseCode,
        courseTitle,
        category,
        fileUrl,
        description,
        uploadedBy: user?.name || 'UniPortal User',
        uploadedByRole: user?.role === 'student' ? (user?.isCR ? 'cr' : 'student') : user?.role || 'faculty'
      });

      setShowUploadModal(false);
      resetForm();
      loadResources();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setFileUrl('');
    setDescription('');
  };

  const handleUpvote = async (id) => {
    const userId = user?.studentId || user?._id || user?.email || 'guest-user';
    try {
      await upvoteResource(id, userId);
      loadResources();
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };

  const handleDownloadClick = async (resource, targetUrl) => {
    try {
      await trackResourceDownload(resource._id);
    } catch (e) {}
    window.open(targetUrl || resource.fileUrl, '_blank');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    try {
      await deleteResource(id);
      loadResources();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-white shadow-md">
          <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>Question Bank & Study Materials Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Past Exam Question Bank & Notes 📚
              </h1>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                Access official faculty-verified <strong className="text-white font-semibold">Class Test (CT 1 - CT 4)</strong>, <strong className="text-white font-semibold">Midterm</strong>, and <strong className="text-white font-semibold">Final Exam</strong> question papers along with solved answer keys and study materials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 group active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Upload Past Question Paper</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Share General Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by course (e.g. CSE-101), topic, CT 1/2, Midterm, or Final..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Exam Tag Sub-Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0">Sub-Tag:</span>
              <div className="flex items-center gap-1.5">
                {EXAM_SUBTYPES.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedExamType(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedExamType === sub
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources & Question Papers Cards Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Fetching study materials & past question bank...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item) => {
              const userId = user?.studentId || user?._id || user?.email || 'guest-user';
              const hasUpvoted = item.upvotes?.includes(userId);
              const isOfficial = item.isOfficial || item.uploadedByRole === 'faculty';

              return (
                <div
                  key={item._id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md h-full w-full"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.courseCode}
                        </span>

                        {item.examType && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                            {item.examType}
                          </span>
                        )}
                      </div>

                      {isOfficial ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          Faculty Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || 'No additional remarks provided.'}
                    </p>

                    {/* Meta info */}
                    <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700 dark:text-slate-300 font-medium">{item.uploadedBy}</strong>
                      </span>
                      <span>{item.semester}</span>
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {/* Solution Key Button if available */}
                    {item.solutionUrl && (
                      <button
                        onClick={() => handleDownloadClick(item, item.solutionUrl)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span>View Model Solution / Answer Key</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpvote(item._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            hasUpvoted
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400' : ''}`} />
                          <span>{item.upvotes?.length || 0}</span>
                        </button>

                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 px-1">
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          {item.downloadsCount || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(user?.role === 'admin' || user?.role === 'faculty' || user?.name === item.uploadedBy) && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Delete resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadClick(item, item.fileUrl)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Open Paper</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Dedicated Faculty Upload Question Modal */}
        <UploadQuestionModal
          isOpen={showQuestionModal}
          onClose={() => setShowQuestionModal(false)}
          onQuestionUploaded={() => loadResources()}
          currentUser={user}
        />

        {/* Share General Material Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <h3 className="text-lg font-bold">Share Study Material 📚</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUploadResource} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Resource Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. CSE-101 Lecture Notes 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Course Code</label>
                      <input 
                        type="text"
                        required
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Lecture Slides">Lecture Slides</option>
                        <option value="Class Notes">Class Notes</option>
                        <option value="Lab Manual">Lab Manual</option>
                        <option value="Reference Book">Reference Book</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">File URL / Google Drive Link *</label>
                    <input 
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Brief Summary / Note</label>
                    <textarea 
                      rows={2}
                      placeholder="What is covered in this PDF / link..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-xs"
                    >
                      {isUploading ? 'Uploading...' : 'Publish Material'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
