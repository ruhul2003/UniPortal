'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, BookOpen, Clock, CheckCircle2, Copy, Check, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResourceSummarizerModal({ isOpen, onClose, resource }) {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      fetchSummary();
    }
  }, [isOpen, resource]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/resources/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resource.title,
          courseCode: resource.courseCode,
          description: resource.description
        })
      });
      const data = await res.json();
      if (data.success) {
        setSummaryData(data.summary);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn('Using client-side fallback summary:', err);
      setSummaryData({
        title: resource.title || 'Study Resource',
        courseCode: resource.courseCode || 'CSE',
        overview: resource.description || `Key study guide covering essential principles, problem solving steps, and exam revision topics for ${resource.courseCode}.`,
        keyTakeaways: [
          `Core concepts and definitions of ${resource.title || 'the subject'}`,
          'Step-by-step analytical methods and practical examples',
          'High-frequency exam preparation questions and solution patterns',
          'Key terminology and formula quick reference'
        ],
        highYieldTopics: [
          `${resource.courseCode} Main Theory & System Models`,
          'Practical Problem Applications',
          'Common Exam Misconceptions'
        ],
        readTimeMinutes: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const text = `📌 Summary: ${summaryData.title} (${summaryData.courseCode})\n\n📖 Overview: ${summaryData.overview}\n\nKey Takeaways:\n${summaryData.keyTakeaways.map(t => `- ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Resource Summarizer
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Smart Summary
                  </span>
                </div>
                <p className="text-xs text-slate-500">{resource?.courseCode} • {resource?.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {loading ? (
              <div className="p-12 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-purple-500 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Synthesizing key lecture points...
                </p>
              </div>
            ) : summaryData ? (
              <>
                {/* Meta info bar */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-xs">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Lecture Cheat Sheet
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    ~{summaryData.readTimeMinutes} min read
                  </span>
                </div>

                {/* Executive Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Executive Overview
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed font-medium">
                    {summaryData.overview}
                  </p>
                </div>

                {/* Key Bullet Takeaways */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Core Key Takeaways
                  </h4>
                  <div className="space-y-2">
                    {summaryData.keyTakeaways.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High Yield Exam Topics */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> High-Yield Exam Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.highYieldTopics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <button
              onClick={handleCopy}
              disabled={loading || !summaryData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard' : 'Copy Summary'}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
