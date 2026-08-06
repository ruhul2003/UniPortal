import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Mock store in case local MongoDB instance isn't running
const mockUsers = [
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
    password: 'password123'
  }
];

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, designation } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
        department: department || 'Computer Science & Engineering',
        studentId: studentId || '',
        designation: designation || ''
      });
      return res.status(201).json({ success: true, user });
    } catch (dbErr) {
      // Fallback in-memory
      const existsMock = mockUsers.find(u => u.email === email);
      if (existsMock) return res.status(400).json({ error: 'Email already registered' });
      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email,
        password,
        role: role || 'student',
        department: department || 'Computer Science & Engineering',
        studentId: studentId || '',
        designation: designation || ''
      };
      mockUsers.push(newUser);
      return res.status(201).json({ success: true, user: newUser });
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
