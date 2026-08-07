import express from 'express';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '../config/db.js';

const router = express.Router();

// GET all users directly from MongoDB database
router.get('/', async (req, res) => {
  try {
    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    const users = await usersCol.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
    return res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle CR (Class Representative) status directly in MongoDB
router.patch('/:id/cr', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCR } = req.body;

    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const user = await usersCol.findOne(filter);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const newStatus = typeof isCR === 'boolean' ? isCR : !user.isCR;
    await usersCol.updateOne(filter, { $set: { isCR: newStatus, updatedAt: new Date() } });
    const updatedUser = await usersCol.findOne(filter, { projection: { password: 0 } });

    return res.json({ 
      success: true, 
      message: 'Class Representative (CR) status updated', 
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH change user role directly in MongoDB
router.patch('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const user = await usersCol.findOne(filter);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    await usersCol.updateOne(filter, { $set: { role, updatedAt: new Date() } });
    const updatedUser = await usersCol.findOne(filter, { projection: { password: 0 } });

    return res.json({ 
      success: true, 
      message: `User role updated to ${role}`, 
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user profile directly in MongoDB
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar, section, department, studentId, facultyId, designation } = req.body;

    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const user = await usersCol.findOne(filter);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const updateFields = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (section !== undefined) updateFields.section = section;
    if (department !== undefined) updateFields.department = department;
    if (studentId !== undefined && (!user.studentId || user.role !== 'student')) {
      updateFields.studentId = studentId;
    }
    if (facultyId !== undefined) updateFields.facultyId = facultyId;
    if (designation !== undefined) updateFields.designation = designation;

    await usersCol.updateOne(filter, { $set: updateFields });
    const updatedUser = await usersCol.findOne(filter, { projection: { password: 0 } });

    return res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user directly from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usersCol = getUsersCollection();
    if (!usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await usersCol.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'User deleted successfully' });
    }

    return res.status(404).json({ error: 'User not found in database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
