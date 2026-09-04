'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  MessageSquare, 
  ChevronDown, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  Award,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendAIChatQuery } from '../lib/api';

const DEFAULT_CHIPS = [
  { label: '⚠️ Attendance Rules', query: 'What is the minimum attendance required for exams?' },
  { label: '🎓 Section Transfer', query: 'How do I request a section transfer?' },
  { label: '💳 1-Day Permit', query: 'How does the 1-Day Dues Permit work?' },
  { label: '📊 CGPA Grading', query: 'Explain the CGPA calculation and grading scale' },
  { label: '📄 Exam Admit Card', query: 'How do I get my exam admit card pass?' }
];

export default function AIChatbox() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am **UniBot AI**, your official Metropolitan University assistant.\n\nAsk me anything about **attendance requirements**, **section transfers**, **1-day permits**, or **CGPA calculation**!`,
      isRealAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text || !text.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation context
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const context = {
        name: user?.name || 'Student',
        role: user?.role || 'student',
        section: user?.section || 'Section A'
      };

      const res = await sendAIChatQuery(text.trim(), history, context);

      const botMessage = {
        role: 'assistant',
        content: res.reply || 'I am happy to assist you with any questions regarding UniPortal!',
        isRealAI: res.isRealAI !== false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Oops! I ran into an issue connecting to the AI server. Please try asking your question again.',
          isRealAI: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat history cleared! 👋 How can I help you today?`,
        isRealAI: true,
        timestamp: new Date()
      }
    ]);
  };

  // Simple Markdown Formatter Helper for bullet points & bold text
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let formattedLine = line;

      // Handle bold **text**
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={lineIdx} className="flex items-start space-x-2 my-1 pl-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>{renderedParts.slice(0)}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line.trim())) {
        const num = line.trim().match(/^(\d+\.)\s/)[1];
        const rest = line.trim().replace(/^\d+\.\s/, '');
        return (
          <div key={lineIdx} className="flex items-start space-x-2 my-1 pl-2">
            <span className="font-bold text-blue-600 dark:text-blue-400">{num}</span>
            <span>{rest}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className={lineIdx > 0 && line === '' ? 'h-2' : 'my-1'}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-lg animate-bounce">
            {unreadCount}
          </span>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center justify-center p-4 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${
            isOpen
              ? 'bg-slate-800 text-white rotate-90 scale-95'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:scale-110 hover:shadow-blue-500/25 ring-4 ring-white dark:ring-slate-900'
          }`}
          title={isOpen ? 'Close AI Chat' : 'Ask UniBot AI Assistant'}
        >
          {/* Pulsing ring indicator when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <div className="flex items-center space-x-2 px-1">
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="hidden sm:inline font-bold text-sm tracking-wide pr-1">UniBot AI</span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full ring-2 ring-emerald-400/50" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base leading-tight">UniBot AI</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-blue-100 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini 2.5
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 font-medium">Metropolitan University Helper</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearHistory}
                className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Minimize Window"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Chips Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> FAQs:
            </span>
            {DEFAULT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                disabled={isLoading}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 whitespace-nowrap transition-all shadow-sm flex-shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {formatMarkdown(msg.content)}
                  </div>

                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    {msg.role === 'assistant' && (
                      <span className="flex items-center gap-1 font-medium">
                        {msg.isRealAI ? (
                          <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Gemini
                          </span>
                        ) : (
                          <span className="text-amber-500 dark:text-amber-400">Policy Matcher</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm flex-shrink-0 mt-0.5">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex items-start space-x-2.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">UniBot is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask UniBot any question..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
