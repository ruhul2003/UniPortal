'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, BookOpen } from 'lucide-react';
import RoutineTable from '../../components/RoutineTable';
import AddRoutineModal from '../../components/AddRoutineModal';
import { useAuth } from '../../context/AuthContext';
import { fetchRoutines, createRoutine, deleteRoutine } from '../../lib/api';

export default function RoutinePage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const [routines, setRoutines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutines() {
      setLoading(true);
      const data = await fetchRoutines();
      setRoutines(data);
      setLoading(false);
    }
    loadRoutines();
  }, []);

  const handleAddRoutine = async (data) => {
    const res = await createRoutine(data);
    if (res.routine) {
      setRoutines([...routines, res.routine]);
    }
  };

  const handleDeleteRoutine = async (id) => {
    await deleteRoutine(id);
    setRoutines(routines.filter(r => r._id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CalendarDays className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Class Routine & Schedule</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive weekly class schedule for students and faculty course planning.
          </p>
        </div>

        {isFaculty && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-indigo-400" /> Add Routine Slot
          </button>
        )}
      </div>

      {/* Routine Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Loading class timetable...</p>
        </div>
      ) : (
        <RoutineTable routines={routines} onDelete={handleDeleteRoutine} />
      )}

      {/* Faculty Add Modal */}
      <AddRoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRoutine}
      />
    </div>
  );
}
