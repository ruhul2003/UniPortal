import express from 'express';
import { ObjectId } from 'mongodb';
import { getRoutinesCollection } from '../config/db.js';

const router = express.Router();

let initialRoutines = [
  {
    _id: 'r_1',
    courseCode: 'CSE-3101',
    courseTitle: 'Database Management Systems',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    room: 'Lab 402',
    building: 'IT Complex',
    department: 'Computer Science & Engineering',
    semester: 'Spring 2026',
    section: 'Section A',
    facultyName: 'Dr. Sarah Jenkins'
  },
  {
    _id: 'r_2',
    courseCode: 'CSE-3105',
    courseTitle: 'Software Engineering & Agile Methodologies',
    day: 'Monday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    room: 'Room 305',
    building: 'Academic Building 1',
    department: 'Computer Science & Engineering',
    semester: 'Spring 2026',
    section: 'Section A',
    facultyName: 'Prof. Alan Vance'
  },
  {
    _id: 'r_3',
    courseCode: 'CSE-3109',
    courseTitle: 'Web Technologies & Next.js Architecture',
    day: 'Tuesday',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    room: 'Lab 201',
    building: 'Software Engineering Annex',
    department: 'Computer Science & Engineering',
    semester: 'Spring 2026',
    section: 'Section B',
    facultyName: 'Dr. Marcus Thorne'
  },
  {
    _id: 'r_4',
    courseCode: 'MAT-2103',
    courseTitle: 'Linear Algebra & Differential Equations',
    day: 'Wednesday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    room: 'Hall B',
    building: 'Main Academic Block',
    department: 'Computer Science & Engineering',
    semester: 'Spring 2026',
    section: 'Section A',
    facultyName: 'Dr. Elena Rostova'
  },
  {
    _id: 'r_5',
    courseCode: 'CSE-3112',
    courseTitle: 'Artificial Intelligence & Neural Networks',
    day: 'Thursday',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    room: 'Auditorium 2',
    building: 'Science & Tech Hub',
    department: 'Computer Science & Engineering',
    semester: 'Spring 2026',
    section: 'Section A',
    facultyName: 'Dr. Sarah Jenkins'
  }
];

// GET routines (Native MongoDB Driver)
router.get('/', async (req, res) => {
  try {
    try {
      const routinesCol = getRoutinesCollection();
      if (routinesCol) {
        const dbRoutines = await routinesCol.find().toArray();
        return res.json({ success: true, routines: dbRoutines });
      }
    } catch (e) {
      console.warn('[Routine DB Fetch Fallback]', e.message);
    }
    return res.json({ success: true, routines: initialRoutines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new routine slot (Native MongoDB Driver)
router.post('/', async (req, res) => {
  try {
    const { courseCode, courseTitle, day, startTime, endTime, room, building, department, semester, section, facultyName } = req.body;
    if (!courseCode || !courseTitle || !day || !startTime || !endTime || !room) {
      return res.status(400).json({ error: 'Please provide all required routine details' });
    }

    const item = {
      courseCode,
      courseTitle,
      day,
      startTime,
      endTime,
      room,
      building: building || 'Academic Building 1',
      department: department || 'Computer Science & Engineering',
      semester: semester || 'Spring 2026',
      section: section || 'Section A',
      facultyName: facultyName || 'Faculty Member',
      createdAt: new Date()
    };

    try {
      const routinesCol = getRoutinesCollection();
      if (routinesCol) {
        const result = await routinesCol.insertOne(item);
        const created = { _id: result.insertedId, ...item };
        return res.status(201).json({ success: true, routine: created });
      }
    } catch (e) {
      console.warn('[Routine Post DB Fallback]', e.message);
    }

    const newItem = { _id: 'r_' + Date.now(), ...item };
    initialRoutines.push(newItem);
    return res.status(201).json({ success: true, routine: newItem });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE routine slot (Native MongoDB Driver)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const routinesCol = getRoutinesCollection();
      if (routinesCol) {
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        await routinesCol.deleteOne(filter);
      }
    } catch (e) {}
    initialRoutines = initialRoutines.filter(r => r._id !== id);
    res.json({ success: true, message: 'Routine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
