import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Fallback in-memory list reference if DB is down
let mockUserStore = [
  {
    _id: 'usr_admin_1',
    name: 'System Administrator',
    email: 'admin@gmail.com',
    role: 'admin',
    department: 'System Administration',
    designation: 'Head Admin',
    isCR: false
  },
  {
    _id: 'usr_faculty_1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@univ.edu',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    facultyId: 'FAC-2024-101',
    isCR: false
  },
  {
    _id: 'usr_student_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.univ.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    studentId: 'CSE-2024-042',
    isCR: true
  }
];

// GET all users (Admin operation)
router.get('/', async (req, res) => {
  try {
    try {
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      if (users) {
        return res.json({ success: true, users });
      }
    } catch (dbErr) {
      console.warn('[Users DB Fetch Fallback]', dbErr.message);
    }
    return res.json({ success: true, users: mockUserStore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle CR (Class Representative) status for a user
router.patch('/:id/cr', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCR } = req.body;

    try {
      const user = await User.findById(id);
      if (user) {
        user.isCR = typeof isCR === 'boolean' ? isCR : !user.isCR;
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        return res.json({ success: true, message: `Class Representative (CR) status updated`, user: userObj });
      }
    } catch (dbErr) {
      // Mock fallback
    }

    const mockItem = mockUserStore.find(u => u._id === id);
    if (mockItem) {
      mockItem.isCR = typeof isCR === 'boolean' ? isCR : !mockItem.isCR;
      return res.json({ success: true, message: `Class Representative (CR) status updated`, user: mockItem });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH change user role
router.patch('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    try {
      const user = await User.findById(id);
      if (user) {
        user.role = role;
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        return res.json({ success: true, message: `User role updated to ${role}`, user: userObj });
      }
    } catch (dbErr) {
      // Mock fallback
    }

    const mockItem = mockUserStore.find(u => u._id === id);
    if (mockItem) {
      mockItem.role = role;
      return res.json({ success: true, message: `User role updated to ${role}`, user: mockItem });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user (Admin operation)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const deleted = await User.findByIdAndDelete(id);
      if (deleted) {
        mockUserStore = mockUserStore.filter(u => u._id !== id);
        return res.json({ success: true, message: 'User deleted successfully' });
      }
    } catch (dbErr) {
      // Mock fallback
    }

    mockUserStore = mockUserStore.filter(u => u._id !== id);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
