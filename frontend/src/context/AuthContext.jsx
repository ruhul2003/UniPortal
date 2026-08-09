'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem('uniportal_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default initial state: Student view for immediate demo
      const defaultStudent = {
        _id: 'usr_demo_student',
        name: 'Rahim Chowdhury',
        email: 'alex.rivera@student.univ.edu',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: 'CSE-2024-042'
      };
      setUser(defaultStudent);
      localStorage.setItem('uniportal_user', JSON.stringify(defaultStudent));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('uniportal_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uniportal_user');
  };

  const switchRole = (targetMode) => {
    if (!user) return;
    let updated = { ...user };
    if (targetMode === 'student') {
      updated = {
        ...user,
        role: 'student',
        isCR: false,
        name: 'Rahim Chowdhury',
        email: 'alex.rivera@student.univ.edu',
        section: user.section || 'Section A',
        studentId: 'CSE-2024-042',
        department: 'Computer Science & Engineering'
      };
    } else if (targetMode === 'cr') {
      updated = {
        ...user,
        role: 'student',
        isCR: true,
        name: 'Rahim Chowdhury (CR)',
        email: 'alex.rivera@student.univ.edu',
        section: user.section || 'Section A',
        studentId: 'CSE-2024-042',
        department: 'Computer Science & Engineering'
      };
    } else if (targetMode === 'faculty') {
      updated = {
        ...user,
        role: 'faculty',
        isCR: false,
        name: 'Dr. Sarah Abedin',
        email: 'sarah.jenkins@univ.edu',
        designation: 'Associate Professor',
        department: 'Computer Science & Engineering',
        facultyId: 'FAC-8088'
      };
    } else if (targetMode === 'admin') {
      updated = {
        ...user,
        role: 'admin',
        isCR: false,
        name: 'System Administrator',
        email: 'admin@gmail.com',
        designation: 'Head Admin',
        department: 'System Administration'
      };
    }
    setUser(updated);
    localStorage.setItem('uniportal_user', JSON.stringify(updated));
  };

  const toggleRole = () => {
    if (!user) return;
    let currentMode = 'student';
    if (user.role === 'admin') currentMode = 'admin';
    else if (user.role === 'faculty') currentMode = 'faculty';
    else if (user.isCR) currentMode = 'cr';

    const modes = ['student', 'cr', 'faculty', 'admin'];
    const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
    switchRole(modes[nextIndex]);
  };

  const updateUser = (updateData) => {
    if (!user) return;
    const updated = { ...user, ...updateData };
    setUser(updated);
    localStorage.setItem('uniportal_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, toggleRole, switchRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
