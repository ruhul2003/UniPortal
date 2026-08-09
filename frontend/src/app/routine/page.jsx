'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, BookOpen, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import RoutineTable from '../../components/RoutineTable';
import AddRoutineModal from '../../components/AddRoutineModal';
import { useAuth } from '../../context/AuthContext';
import { fetchRoutines, createRoutine, updateRoutine, deleteRoutine } from '../../lib/api';

export default function RoutinePage() {
  const { user } = useAuth();
  const canManageRoutine = user?.role === 'faculty' || user?.role === 'admin' || user?.isCR === true;

  const [routines, setRoutines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState(null);
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

  const handleOpenAddModal = () => {
    setRoutineToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (routine) => {
    setRoutineToEdit(routine);
    setIsModalOpen(true);
  };

  const handleSaveRoutine = async (data) => {
    if (routineToEdit?._id) {
      const res = await updateRoutine(routineToEdit._id, data);
      if (res.routine) {
        setRoutines(routines.map(r => r._id === routineToEdit._id ? res.routine : r));
      }
    } else {
      const res = await createRoutine(data);
      if (res.routine) {
        setRoutines([...routines, res.routine]);
      }
    }
    setRoutineToEdit(null);
  };

  const handleDeleteRoutine = async (id) => {
    await deleteRoutine(id);
    setRoutines(routines.filter(r => r._id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Class Routine & Schedule</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
            <span>Interactive weekly class schedule for students, Class Representatives (CR), and faculty.</span>
            {user?.isCR && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                <Crown className="w-3 h-3 text-amber-500" /> Authorized CR Routine Manager
              </span>
            )}
          </p>
        </div>

        {canManageRoutine && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-indigo-400 dark:text-white" /> Add Routine Slot
          </motion.button>
        )}
      </div>

      {/* Routine Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Loading class timetable...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RoutineTable
            routines={routines}
            onDelete={handleDeleteRoutine}
            onEdit={handleOpenEditModal}
          />
        </motion.div>
      )}

      {/* Add / Edit Routine Modal */}
      <AddRoutineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRoutineToEdit(null);
        }}
        onSubmit={handleSaveRoutine}
        routineToEdit={routineToEdit}
      />
    </motion.div>
  );
}


