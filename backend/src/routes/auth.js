import express from 'express';
import { getUsersCollection } from '../config/db.js';

const router = express.Router();

// Mock store fallback if MongoDB is unreachable
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
    section: 'Section A',
    isCR: true,
    password: 'password123'
  }
];

// Register endpoint (Native MongoDB Driver)
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
      const usersCol = getUsersCollection();
      if (usersCol) {
        const existing = await usersCol.findOne({ email: cleanEmail });
        if (existing) {
          return res.status(400).json({ error: 'Email address already registered' });
        }

        const newUserDoc = {
          name: name.trim(),
          email: cleanEmail,
          password,
          role: targetRole,
          department: department || 'Computer Science & Engineering',
          studentId: targetRole === 'student' ? studentId.trim() : '',
          section: targetRole === 'student' ? 'Section A' : '',
          facultyId: targetRole === 'faculty' ? facultyId.trim() : '',
          designation: targetRole === 'faculty' ? designation.trim() : '',
          isCR: false,
          avatar: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await usersCol.insertOne(newUserDoc);
        const createdUser = { _id: result.insertedId, ...newUserDoc };
        delete createdUser.password;
        return res.status(201).json({ success: true, user: createdUser });
      }
    } catch (dbErr) {
      console.warn('[Register DB Fallback]', dbErr.message);
    }

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
      section: targetRole === 'student' ? 'Section A' : '',
      facultyId: targetRole === 'faculty' ? facultyId.trim() : '',
      designation: targetRole === 'faculty' ? designation.trim() : '',
      isCR: false,
      avatar: ''
    };
    mockUsers.push(newUser);
    const userObj = { ...newUser };
    delete userObj.password;
    return res.status(201).json({ success: true, user: userObj });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint (Native MongoDB Driver)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const usersCol = getUsersCollection();
      if (usersCol) {
        const user = await usersCol.findOne({ email: cleanEmail, password });
        if (user) {
          const userObj = { ...user };
          delete userObj.password;
          return res.json({ success: true, user: userObj });
        }
      }
    } catch (dbErr) {
      console.warn('[Login DB Fallback]', dbErr.message);
    }

    // Check mockUsers
    const mockUser = mockUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!mockUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const mockUserObj = { ...mockUser };
    delete mockUserObj.password;
    res.json({ success: true, user: mockUserObj });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
