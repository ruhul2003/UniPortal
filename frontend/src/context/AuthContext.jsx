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
        name: 'Alex Rivera',
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

  const toggleRole = () => {
    if (!user) return;
    const newRole = user.role === 'student' ? 'faculty' : 'student';
    const updated = {
      ...user,
      role: newRole,
      name: newRole === 'faculty' ? 'Dr. Sarah Jenkins' : 'Alex Rivera',
      email: newRole === 'faculty' ? 'sarah.jenkins@univ.edu' : 'alex.rivera@student.univ.edu',
      designation: newRole === 'faculty' ? 'Associate Professor' : '',
    };
    setUser(updated);
    localStorage.setItem('uniportal_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
