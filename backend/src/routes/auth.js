import express from 'express';
import { getUsersCollection } from '../config/db.js';

const router = express.Router();

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

    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const existing = await usersCol.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const SECTION_DEPARTMENT_MAP = {
      'Section A': 'Computer Science & Engineering',
      'Section B': 'Computer Science & Engineering',
      'Section C': 'Software Engineering',
      'Section D': 'Electrical & Electronic Engineering'
    };

    const studentSec = req.body.section || 'Section A';
    const studentDept = targetRole === 'student'
      ? (SECTION_DEPARTMENT_MAP[studentSec] || department || 'Computer Science & Engineering')
      : (department || 'Computer Science & Engineering');

    const newUserDoc = {
      name: name.trim(),
      email: cleanEmail,
      password,
      role: targetRole,
      department: studentDept,
      studentId: targetRole === 'student' ? studentId.trim() : '',
      section: targetRole === 'student' ? studentSec : '',
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

    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const user = await usersCol.findOne({ email: cleanEmail, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userObj = { ...user };
    delete userObj.password;
    return res.json({ success: true, user: userObj });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
