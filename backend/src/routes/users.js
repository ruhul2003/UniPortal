import express from 'express';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '../config/db.js';

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
    section: 'Section A',
    isCR: true
  }
];

// GET all users (Native MongoDB Driver)
router.get('/', async (req, res) => {
  try {
    try {
      const usersCol = getUsersCollection();
      if (usersCol) {
        const users = await usersCol.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
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

// PATCH toggle CR (Class Representative) status (Native MongoDB Driver)
router.patch('/:id/cr', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCR } = req.body;

    try {
      const usersCol = getUsersCollection();
      if (usersCol) {
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const user = await usersCol.findOne(filter);
        if (user) {
          const newStatus = typeof isCR === 'boolean' ? isCR : !user.isCR;
          await usersCol.updateOne(filter, { $set: { isCR: newStatus, updatedAt: new Date() } });
          const updatedUser = await usersCol.findOne(filter, { projection: { password: 0 } });
          return res.json({ success: true, message: 'Class Representative (CR) status updated', user: updatedUser });
        }
      }
    } catch (dbErr) {
      console.warn('[User CR Update DB Fallback]', dbErr.message);
    }

    const mockItem = mockUserStore.find(u => u._id === id);
    if (mockItem) {
      mockItem.isCR = typeof isCR === 'boolean' ? isCR : !mockItem.isCR;
      return res.json({ success: true, message: 'Class Representative (CR) status updated', user: mockItem });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH change user role (Native MongoDB Driver)
router.patch('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    try {
      const usersCol = getUsersCollection();
      if (usersCol) {
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const user = await usersCol.findOne(filter);
        if (user) {
          await usersCol.updateOne(filter, { $set: { role, updatedAt: new Date() } });
          const updatedUser = await usersCol.findOne(filter, { projection: { password: 0 } });
          return res.json({ success: true, message: `User role updated to ${role}`, user: updatedUser });
        }
      }
    } catch (dbErr) {
      console.warn('[User Role Update DB Fallback]', dbErr.message);
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

// PUT update user profile (Native MongoDB Driver)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar, section, department, studentId, facultyId, designation } = req.body;

    try {
      const usersCol = getUsersCollection();
      if (usersCol) {
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const user = await usersCol.findOne(filter);
        if (user) {
          const updateFields = { updatedAt: new Date() };
          if (name !== undefined) updateFields.name = name;
          if (avatar !== undefined) updateFields.avatar = avatar;
          if (section !== undefined) updateFields.section = section;
          if (department !== undefined) updateFields.department = department;
          // Student ID immutability rule: Only allow setting if studentId is currently blank
          if (studentId !== undefined && (!user.studentId || user.role !== 'student')) {
            updateFields.studentId = studentId;
          }
          if (facultyId !== undefined) updateFields.facultyId = facultyId;
          if (designation !== undefined) updateFields.designation = designation;

          await usersCol.updateOne(filter, { $set: updateFields });
          const updatedUser = await usersCol.findOne(filter, { projection: { password: 0 } });
          return res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
        }
      }
    } catch (dbErr) {
      console.warn('[User Profile Update DB Fallback]', dbErr.message);
    }

    // Mock fallback
    const mockItem = mockUserStore.find(u => u._id === id);
    if (mockItem) {
      if (name !== undefined) mockItem.name = name;
      if (avatar !== undefined) mockItem.avatar = avatar;
      if (section !== undefined) mockItem.section = section;
      if (department !== undefined) mockItem.department = department;
      if (studentId !== undefined && (!mockItem.studentId || mockItem.role !== 'student')) {
        mockItem.studentId = studentId;
      }
      if (facultyId !== undefined) mockItem.facultyId = facultyId;
      if (designation !== undefined) mockItem.designation = designation;
      return res.json({ success: true, message: 'Profile updated successfully', user: mockItem });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user (Native MongoDB Driver)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const usersCol = getUsersCollection();
      if (usersCol) {
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const result = await usersCol.deleteOne(filter);
        if (result.deletedCount > 0) {
          mockUserStore = mockUserStore.filter(u => u._id !== id);
          return res.json({ success: true, message: 'User deleted successfully' });
        }
      }
    } catch (dbErr) {
      console.warn('[User Delete DB Fallback]', dbErr.message);
    }

    mockUserStore = mockUserStore.filter(u => u._id !== id);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
