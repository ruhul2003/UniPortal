import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Mock store in case local MongoDB instance isn't running
const mockUsers = [
  {
    _id: 'usr_admin_1',
    name: 'System Administrator',
    email: 'admin@gmail.com',
    role: 'admin',
    department: 'System Administration',
    designation: 'Head Admin',
    password: 'admin123'
  },
  {
    _id: 'usr_faculty_1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@univ.edu',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    password: 'password123'
  },
  {
    _id: 'usr_student_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.univ.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    studentId: 'CSE-2024-042',
    isCR: true,
    password: 'password123'
  }
];

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, facultyId, designation } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const targetRole = role === 'faculty' ? 'faculty' : 'student';
    const cleanEmail = email.trim().toLowerCase();

    // Validation per role
    if (targetRole === 'student' && !studentId) {
      return res.status(400).json({ error: 'Student ID is required for student registration' });
    }

    if (targetRole === 'faculty' && (!designation || !facultyId)) {
      return res.status(400).json({ error: 'Faculty Designation and Faculty ID are required for faculty registration' });
    }

    try {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: 'Email address already registered' });
      }
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: targetRole,
        department: department || 'Computer Science & Engineering',
        studentId: targetRole === 'student' ? studentId.trim() : '',
        facultyId: targetRole === 'faculty' ? facultyId.trim() : '',
        designation: targetRole === 'faculty' ? designation.trim() : ''
      });
      
      const userObj = user.toObject ? user.toObject() : { ...user };
      delete userObj.password;
      return res.status(201).json({ success: true, user: userObj });
    } catch (dbErr) {
      // Fallback in-memory
      const existsMock = mockUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existsMock) return res.status(400).json({ error: 'Email address already registered' });
      const newUser = {
        _id: 'usr_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password,
        role: targetRole,
        department: department || 'Computer Science & Engineering',
        studentId: targetRole === 'student' ? studentId.trim() : '',
        facultyId: targetRole === 'faculty' ? facultyId.trim() : '',
        designation: targetRole === 'faculty' ? designation.trim() : ''
      };
      mockUsers.push(newUser);
      const userObj = { ...newUser };
      delete userObj.password;
      return res.status(201).json({ success: true, user: userObj });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const user = await User.findOne({ email, password });
      if (user) {
        return res.json({ success: true, user });
      }
    } catch (dbErr) {
      // ignore
    }

    // Check mockUsers
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
