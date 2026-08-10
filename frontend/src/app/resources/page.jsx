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
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'All',
  'Lecture Slides',
  'Class Notes',
  'PYQs (Previous Year)',
  'Lab Manual',
  'Reference Book'
];

export default function ResourcesPage() {
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CSE-101');
  const [courseTitle, setCourseTitle] = useState('Structured Programming Language');
  const [category, setCategory] = useState('Lecture Slides');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadResources();
  }, [selectedCategory, searchQuery]);

  async function loadResources() {
    setLoading(true);
    try {
      const data = await fetchResources({
        category: selectedCategory,
        search: searchQuery
      });

      if (data.length > 0) {
        setResources(data);
      } else {
        // Fallback demo data if fresh collection
        setResources([
          {
            _id: 'res-1',
            title: 'CSE-101 Complete Lecture Slides (Week 1 - 6)',
            courseCode: 'CSE-101',
            courseTitle: 'Structured Programming Language',
            semester: 'Spring 2026',
            category: 'Lecture Slides',
            fileUrl: 'https://drive.google.com',
            description: 'Covers pointers, dynamic memory allocation, and structs with code snippets.',
            uploadedBy: 'CR Sabbir',
            uploadedByRole: 'cr',
            upvotes: ['user1', 'user2', 'user3'],
            downloadsCount: 42
          },
          {
            _id: 'res-2',
            title: 'Midterm PYQs 2024 & 2025 Solved Papers',
            courseCode: 'MAT-105',
            courseTitle: 'Differential Calculus & Geometry',
            semester: 'Spring 2026',
            category: 'PYQs (Previous Year)',
            fileUrl: 'https://drive.google.com',
            description: 'Contains handwritten step-by-step solutions for 2024 midterm exam questions.',
            uploadedBy: 'Ruhul Amin',
            uploadedByRole: 'student',
            upvotes: ['user1', 'user2', 'user4', 'user5'],
            downloadsCount: 88
          },
          {
            _id: 'res-3',
            title: 'Data Structures Lab Manual & Code Templates',
            courseCode: 'CSE-102',
            courseTitle: 'Data Structures & Algorithms',
            semester: 'Spring 2026',
            category: 'Lab Manual',
            fileUrl: 'https://github.com',
            description: 'Official lab assignment guide for stack, queue, and tree implementations.',
            uploadedBy: 'Dr. Sarah Ahmed',
            uploadedByRole: 'faculty',
            upvotes: ['user1', 'user6'],
            downloadsCount: 35
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

  const handleDownloadClick = async (resource) => {
    try {
      await trackResourceDownload(resource._id);
    } catch (e) {}
    window.open(resource.fileUrl, '_blank');
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                <FolderOpen className="w-4 h-4 text-purple-300" />
                <span>Resource Locker</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Study Materials & Notes Sharing 📚
              </h1>
              <p className="mt-2 text-purple-100 text-sm sm:text-base max-w-xl">
                Access verified lecture slides, course notes, Previous Year Questions (PYQs), and lab manuals shared by peer students and faculty.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 group shrink-0"
            >
              <Plus className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span>Share Study Material</span>
            </button>
          </div>
        </div>

        {/* Search & Category Navigation */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources by title, course code (e.g. CSE-101), or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => {
            const userId = user?.studentId || user?._id || user?.email || 'guest-user';
            const hasUpvoted = item.upvotes?.includes(userId);

            return (
              <div
                key={item._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                      {item.courseCode}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Uploaded by <strong className="text-slate-700 dark:text-slate-300">{item.uploadedBy}</strong></span>
                    <span>{item.semester}</span>
                  </div>
                </div>

                {/* Footer Controls: Upvote & Open / Download */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpvote(item._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        hasUpvoted
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-purple-600 text-purple-600' : ''}`} />
                      <span>{item.upvotes?.length || 0}</span>
                    </button>

                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Download className="w-3 h-3 text-slate-400" />
                      {item.downloadsCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(user?.role === 'admin' || user?.name === item.uploadedBy) && (
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadClick(item)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Open File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Upload Resource Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-lg font-bold">Share Study Material 📚</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUploadResource} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Resource Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. CSE-101 Midterm Solved Notes 2025"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Course Code</label>
                      <input 
                        type="text"
                        required
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      >
                        <option value="Lecture Slides">Lecture Slides</option>
                        <option value="Class Notes">Class Notes</option>
                        <option value="PYQs (Previous Year)">PYQs (Previous Year)</option>
                        <option value="Lab Manual">Lab Manual</option>
                        <option value="Reference Book">Reference Book</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">File URL / Google Drive Link *</label>
                    <input 
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Brief Summary / Note</label>
                    <textarea 
                      rows={2}
                      placeholder="What is covered in this PDF / link..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
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
