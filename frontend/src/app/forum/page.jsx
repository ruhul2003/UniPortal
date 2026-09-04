'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchForumPosts, createForumPost, upvoteForumPost, addForumComment, verifyForumComment, deleteForumPost } from '../../lib/api';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  ThumbsUp, 
  CheckCircle2, 
  UserCheck, 
  Send, 
  Trash2, 
  User, 
  XCircle,
  MessageCircle,
  ShieldCheck,
  Crown,
  ImageIcon,
  Upload,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForumPage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';
  const isFacultyOrCR = user?.role === 'faculty' || user?.role === 'admin' || user?.isCR;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Ask question modal state
  const [showAskModal, setShowAskModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseCode, setCourseCode] = useState('CSE-102');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Comment state per post
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    loadPosts();
  }, [searchQuery]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await fetchForumPosts({ search: searchQuery });
      if (data.length > 0) {
        setPosts(data);
      } else {
        // Fallback demo posts
        setPosts([
          {
            _id: 'post-1',
            title: 'How does time complexity of QuickSort become O(n^2) in worst case?',
            content: 'Can someone explain why choosing the smallest or largest element repeatedly as pivot leads to O(n^2) time complexity? Attached recursion tree diagram below.',
            imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
            courseCode: 'CSE-102',
            section: 'Section A',
            authorName: 'Ruhul Amin',
            authorRole: 'student',
            upvotes: ['u1', 'u2', 'u3'],
            isResolved: true,
            comments: [
              {
                _id: 'c1',
                authorName: 'Dr. Sarah Ahmed',
                authorRole: 'faculty',
                content: 'Great question! When the pivot selected is always the minimum or maximum, the recursion tree reduces to n depth with n comparisons at each level (n + (n-1) + ... + 1 = n(n+1)/2 = O(n^2)). Using Randomized QuickSort avoids this.',
                isVerifiedAnswer: true,
                createdAt: new Date()
              }
            ]
          },
          {
            _id: 'post-2',
            title: 'Is Chapter 5 (Partial Derivatives) included in Midterm 1 syllabus?',
            content: 'Instructor mentioned Chapter 4, but syllabus outline shows Chapter 5 as well. Please clarify.',
            imageUrl: '',
            courseCode: 'MAT-105',
            section: 'Section A',
            authorName: 'Sabbir Ahmed',
            authorRole: 'cr',
            upvotes: ['u1'],
            isResolved: false,
            comments: [
              {
                _id: 'c2',
                authorName: 'Prof. Anisur Rahman',
                authorRole: 'faculty',
                content: 'Chapter 5 topics up to section 5.3 are included.',
                isVerifiedAnswer: true,
                createdAt: new Date()
              }
            ]
          }
        ]);
      }
    } catch (err) {
      console.warn('Forum load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (isFaculty) {
      alert('Faculty members are not permitted to post questions in the discussion forum.');
      return;
    }
    if (!title || !content) return;

    setIsPosting(true);
    try {
      await createForumPost({
        title,
        content,
        courseCode,
        section: user?.section || 'Section A',
        authorName: user?.name || 'Student User',
        authorEmail: user?.email || '',
        authorRole: user?.role === 'student' ? (user?.isCR ? 'cr' : 'student') : user?.role || 'faculty',
        authorAvatar: user?.avatar || '',
        imageUrl
      });

      setShowAskModal(false);
      setTitle('');
      setContent('');
      setImageUrl('');
      loadPosts();
    } catch (err) {
      alert('Failed to publish question: ' + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpvote = async (postId) => {
    const userId = user?.studentId || user?._id || user?.email || 'guest-user';
    try {
      await upvoteForumPost(postId, userId);
      loadPosts();
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;

    try {
      await addForumComment(postId, {
        authorName: user?.name || 'UniPortal User',
        authorRole: user?.role === 'student' ? (user?.isCR ? 'cr' : 'student') : user?.role || 'faculty',
        authorAvatar: user?.avatar || '',
        content: text
      });

      setCommentInputs({ ...commentInputs, [postId]: '' });
      loadPosts();
    } catch (err) {
      alert('Failed to add answer: ' + err.message);
    }
  };

  const handleVerifyComment = async (postId, commentId) => {
    try {
      await verifyForumComment(postId, commentId);
      loadPosts();
    } catch (err) {
      alert('Failed to verify answer: ' + err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this discussion post?')) return;
    try {
      await deleteForumPost(postId);
      loadPosts();
    } catch (err) {
      alert('Failed to delete post: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3 text-blue-400">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Class Discussion & Q&A</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Course Q&A & Academic Forum 💬
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl">
                Ask questions with attached diagrams/images, collaborate on course topics, and get instructor-verified answers.
              </p>
            </div>

            {!isFaculty && (
              <button
                onClick={() => setShowAskModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2.5 group shrink-0 text-xs"
              >
                <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span>Ask a Question</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussion threads by title, question content, or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Questions Thread List */}
        <div className="space-y-4">
          {posts.map((post) => {
            const userId = user?.studentId || user?._id || user?.email || 'guest-user';
            const hasUpvoted = post.upvotes?.includes(userId);
            const isExpanded = expandedPostId === post._id;

            return (
              <div 
                key={post._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                        {post.courseCode}
                      </span>

                      {post.isResolved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Resolved
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {post.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleUpvote(post._id)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      hasUpvoted
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400' : ''}`} />
                    <span>{post.upvotes?.length || 0}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {post.content}
                </p>

                {/* Attached Image Display */}
                {post.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 max-h-96 flex items-center justify-center p-2">
                    <img
                      src={post.imageUrl}
                      alt="Question Attachment / Diagram"
                      className="max-h-88 w-auto object-contain rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                      onClick={() => window.open(post.imageUrl, '_blank')}
                      title="Click to view full image"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{post.authorName}</span>
                    <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {post.authorRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Answers</span>
                    </button>

                    {(user?.role === 'admin' || user?.name === post.authorName) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-rose-500 hover:text-rose-600"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Answers Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Answers & Discussion ({post.comments?.length || 0})
                    </h3>

                    {/* Comments list */}
                    <div className="space-y-3">
                      {post.comments?.map((comment) => (
                        <div 
                          key={comment._id}
                          className={`p-4 rounded-2xl border transition-all ${
                            comment.isVerifiedAnswer
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.authorName}</span>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                comment.authorRole === 'faculty' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {comment.authorRole}
                              </span>
                            </div>

                            {comment.isVerifiedAnswer ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Instructor Verified Answer
                              </span>
                            ) : (
                              isFacultyOrCR && (
                                <button
                                  onClick={() => handleVerifyComment(post._id, comment._id)}
                                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Verify Answer
                                </button>
                              )
                            )}
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write your answer or response..."
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Ask Question Modal with Image Upload Support */}
        <AnimatePresence>
          {showAskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold">Ask Course Question 💬</h3>
                  </div>
                  <button onClick={() => setShowAskModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAskQuestion} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Course Code *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. CSE-102"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Question Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Summary of your question..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Details & Problem Description *</label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Describe what you are trying to understand or solve..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Image Attachment Section */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span>Attach Question Image / Diagram</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                    </label>

                    {/* Image Source Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        <Upload className="w-4 h-4 text-blue-500" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>

                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="url"
                          placeholder="Image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Image Preview */}
                    {imageUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950/40 p-2 mt-2 group">
                        <img
                          src={imageUrl}
                          alt="Attachment preview"
                          className="max-h-48 w-full object-contain rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAskModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-xs"
                    >
                      {isPosting ? 'Posting...' : 'Post Question'}
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
