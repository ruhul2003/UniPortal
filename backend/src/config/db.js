import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Notice } from '../models/Notice.js';
import { Routine } from '../models/Routine.js';
import { Announcement } from '../models/Announcement.js';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uniportal';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    // Auto-seed database if empty
    await seedInitialData();
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.log(`[MongoDB Notice] Backend will operate using fallback database mode if DB unreachable.`);
  }
};

async function seedInitialData() {
  try {
    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create([
        {
          name: 'Dr. Sarah Jenkins',
          email: 'sarah.jenkins@univ.edu',
          password: 'password123',
          role: 'faculty',
          department: 'Computer Science & Engineering',
          facultyId: 'FAC-2024-101',
          designation: 'Associate Professor'
        },
        {
          name: 'Alex Rivera',
          email: 'alex.rivera@student.univ.edu',
          password: 'password123',
          role: 'student',
          department: 'Computer Science & Engineering',
          studentId: 'CSE-2024-042'
        }
      ]);
      console.log('[MongoDB Seed] Sample users created.');
    }

    // Seed Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.create([
        {
          title: 'Spring 2026 Midterm Examination Schedule Released',
          content: 'The official schedule for Midterm Examinations Spring 2026 has been published. All students are advised to check their respective course dates and room allocations carefully.',
          category: 'Exam',
          department: 'All Departments',
          isUrgent: true,
          publishedBy: 'Dr. Sarah Jenkins',
          facultyRole: 'Controller of Examinations'
        },
        {
          title: 'Submission Deadline for Capstone Project Proposal',
          content: 'All 7th & 8th-semester CSE students must submit their initial Capstone Project design document to the department office by February 15th, 2026.',
          category: 'Academic',
          department: 'Computer Science & Engineering',
          isUrgent: false,
          publishedBy: 'Prof. Alan Vance',
          facultyRole: 'Head of CSE'
        },
        {
          title: 'Campus Maintenance & Library Hours Update',
          content: 'The Central Library will operate with extended opening hours (8:00 AM - 10:00 PM) during the upcoming exam week. Wi-Fi maintenance will occur on Sunday midnight.',
          category: 'Administrative',
          department: 'All Departments',
          isUrgent: false,
          publishedBy: 'Admin Office',
          facultyRole: 'System Administrator'
        }
      ]);
      console.log('[MongoDB Seed] Sample notices created.');
    }

    // Seed Routines
    const routineCount = await Routine.countDocuments();
    if (routineCount === 0) {
      await Routine.create([
        {
          courseCode: 'CSE-3101',
          courseTitle: 'Database Management Systems',
          day: 'Monday',
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          room: 'Lab 402',
          building: 'IT Complex',
          department: 'Computer Science & Engineering',
          semester: 'Spring 2026',
          section: 'A',
          facultyName: 'Dr. Sarah Jenkins'
        },
        {
          courseCode: 'CSE-3105',
          courseTitle: 'Software Engineering & Agile Methodologies',
          day: 'Monday',
          startTime: '11:00 AM',
          endTime: '12:30 PM',
          room: 'Room 305',
          building: 'Academic Building 1',
          department: 'Computer Science & Engineering',
          semester: 'Spring 2026',
          section: 'A',
          facultyName: 'Prof. Alan Vance'
        },
        {
          courseCode: 'CSE-3109',
          courseTitle: 'Web Technologies & Next.js Architecture',
          day: 'Tuesday',
          startTime: '02:00 PM',
          endTime: '03:30 PM',
          room: 'Lab 201',
          building: 'Software Engineering Annex',
          department: 'Computer Science & Engineering',
          semester: 'Spring 2026',
          section: 'B',
          facultyName: 'Dr. Marcus Thorne'
        }
      ]);
      console.log('[MongoDB Seed] Sample routines created.');
    }

    // Seed Announcements
    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      await Announcement.create([
        {
          title: 'Annual Tech Symposium & Hackathon 2026 Registration Open',
          description: 'We are excited to announce the annual UniPortal Hackathon! Register your team of up to 4 members by February 20th. Cash prizes up to $5,000 for top projects!',
          tag: 'Seminar',
          isPinned: true,
          publishedBy: 'Department of Computer Science'
        },
        {
          title: 'Spring Festival Holiday Notice (Feb 21)',
          description: 'All academic and administrative activities will remain closed on February 21st in observance of International Mother Language Day.',
          tag: 'Holiday',
          isPinned: true,
          publishedBy: 'Registrar Office'
        }
      ]);
      console.log('[MongoDB Seed] Sample announcements created.');
    }
  } catch (err) {
    console.error('[MongoDB Seed Error]', err.message);
  }
}

