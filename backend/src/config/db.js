import { MongoClient } from 'mongodb';

let client;
let db;

export const connectDB = async () => {
  if (db) return db;
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb+srv://hire_loop_db_user:wwiIRfECMOKwPwpl@tilux-server.cltfmst.mongodb.net/?appName=Tilux-server';
    client = new MongoClient(connStr);
    await client.connect();
    db = client.db('UniPortal');
    console.log(`[MongoDB Native Driver] Connected to database: ${db.databaseName}`);

    // Auto-seed database if empty
    await seedInitialData();
    return db;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.log(`[MongoDB Notice] Backend will operate using fallback database mode if DB unreachable.`);
  }
};

export const getDb = () => db;
export const getMongoClient = () => client;

export const getUsersCollection = () => db?.collection('users');
export const getNoticesCollection = () => db?.collection('notices');
export const getRoutinesCollection = () => db?.collection('routines');
export const getAnnouncementsCollection = () => db?.collection('announcements');
export const getSectionRequestsCollection = () => db?.collection('section_requests');
export const getFeedbackCollection = () => db?.collection('feedback');
export const getMarksCollection = () => db?.collection('marks');
export const getExamsCollection = () => db?.collection('exams');

async function seedInitialData() {
  if (!db) return;
  try {
    const usersCol = db.collection('users');
    const noticesCol = db.collection('notices');
    const routinesCol = db.collection('routines');
    const announcementsCol = db.collection('announcements');

    // Seed Admin User
    const adminExists = await usersCol.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      await usersCol.insertOne({
        name: 'System Administrator',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        department: 'System Administration',
        designation: 'Head Admin',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('[MongoDB Native Seed] Admin user (admin@gmail.com) created.');
    }

    // Seed Faculty and Students with Bengali Names
    const initialUsers = [
      {
        name: 'Dr. Sarah Abedin',
        email: 'sarah.jenkins@univ.edu', // retain email for backward compatibility
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science & Engineering',
        facultyId: 'FAC-2024-101',
        designation: 'Associate Professor',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rahim Chowdhury',
        email: 'alex.rivera@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: 'CSE-2024-042',
        section: 'Section A',
        isCR: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: 'CSE-2024-089',
        section: 'Section B',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tanvir Hossain',
        email: 'tanvir.hossain@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Software Engineering',
        studentId: 'SWE-2024-015',
        section: 'Section C',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Anika Rahman',
        email: 'anika.rahman@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: 'CSE-2024-104',
        section: 'Section A',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mahmudul Hasan',
        email: 'mahmudul.hasan@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: 'CSE-2024-055',
        section: 'Section B',
        isCR: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sadia Islam',
        email: 'sadia.islam@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Electrical & Electronic Engineering',
        studentId: 'EEE-2024-022',
        section: 'Section D',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Arifur Rahman',
        email: 'arifur.rahman@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Software Engineering',
        studentId: 'SWE-2024-077',
        section: 'Section A',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Farhana Akter',
        email: 'farhana.akter@student.univ.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: 'CSE-2024-112',
        section: 'Section C',
        isCR: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const uDoc of initialUsers) {
      await usersCol.updateOne(
        { email: uDoc.email },
        { $set: uDoc },
        { upsert: true }
      );
    }
    console.log('[MongoDB Native Seed] Student & Faculty user records updated with CSE department faculty list.');

    // Seed Notices
    const noticeCount = await noticesCol.countDocuments();
    if (noticeCount === 0) {
      await noticesCol.insertMany([
        {
          title: 'Spring 2026 Midterm Examination Schedule Released',
          content: 'The official schedule for Midterm Examinations Spring 2026 has been published. All students are advised to check their respective course dates and room allocations carefully.',
          category: 'Exam',
          department: 'All Departments',
          isUrgent: true,
          publishedBy: 'Dr. Sarah Jenkins',
          facultyRole: 'Controller of Examinations',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Submission Deadline for Capstone Project Proposal',
          content: 'All 7th & 8th-semester CSE students must submit their initial Capstone Project design document to the department office by February 15th, 2026.',
          category: 'Academic',
          department: 'Computer Science & Engineering',
          isUrgent: false,
          publishedBy: 'Prof. Alan Vance',
          facultyRole: 'Head of CSE',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Campus Maintenance & Library Hours Update',
          content: 'The Central Library will operate with extended opening hours (8:00 AM - 10:00 PM) during the upcoming exam week. Wi-Fi maintenance will occur on Sunday midnight.',
          category: 'Administrative',
          department: 'All Departments',
          isUrgent: false,
          publishedBy: 'Admin Office',
          facultyRole: 'System Administrator',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('[MongoDB Native Seed] Sample notices created.');
    }

    // Seed Routines (including Section 9A 9th semester timetable)
    const section9ARoutines = [
      {
        courseCode: 'CN',
        courseTitle: 'Computer Networks (Room 413)',
        day: 'Saturday',
        startTime: '09:30 AM',
        endTime: '10:50 AM',
        room: '413',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Sarah Abedin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'CNLW',
        courseTitle: 'Computer Networks Lab Work (Room 407)',
        day: 'Saturday',
        startTime: '11:00 AM',
        endTime: '12:20 PM',
        room: '407',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Sarah Abedin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'MACS',
        courseTitle: 'Mathematical Analysis & Computer Simulation (Room 417)',
        day: 'Sunday',
        startTime: '09:30 AM',
        endTime: '10:50 AM',
        room: '417',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Prof. Alan Vance',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'CN',
        courseTitle: 'Computer Networks (Room 414)',
        day: 'Monday',
        startTime: '09:30 AM',
        endTime: '10:50 AM',
        room: '414',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Sarah Abedin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'CGMSD',
        courseTitle: 'Computer Graphics & Multimedia System Design (Room 418)',
        day: 'Monday',
        startTime: '11:00 AM',
        endTime: '12:20 PM',
        room: '418',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Marcus Thorne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'CGLW',
        courseTitle: 'Computer Graphics Lab Work (Room 408)',
        day: 'Monday',
        startTime: '01:00 PM',
        endTime: '02:20 PM',
        room: '408',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Marcus Thorne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'SD3',
        courseTitle: 'Software Development 3 (Room 407)',
        day: 'Tuesday',
        startTime: '09:30 AM',
        endTime: '10:50 AM',
        room: '407',
        building: 'Academic Building 1',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Sarah Abedin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'MACS',
        courseTitle: 'Mathematical Analysis & Computer Simulation (Room B013)',
        day: 'Tuesday',
        startTime: '11:00 AM',
        endTime: '12:20 PM',
        room: 'B013',
        building: 'Building B',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Prof. Alan Vance',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseCode: 'CGMSD',
        courseTitle: 'Computer Graphics & Multimedia System Design (Room TB305)',
        day: 'Tuesday',
        startTime: '01:00 PM',
        endTime: '02:20 PM',
        room: 'TB305',
        building: 'Tower Building 305',
        department: 'Computer Science & Engineering',
        semester: '9th Semester',
        section: 'Section 9A',
        facultyName: 'Dr. Marcus Thorne',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const rDoc of section9ARoutines) {
      await routinesCol.updateOne(
        { section: rDoc.section, day: rDoc.day, startTime: rDoc.startTime },
        { $set: rDoc },
        { upsert: true }
      );
    }
    console.log('[MongoDB Native Seed] Section 9A (9th Semester) routine slots upserted successfully.');

    // Seed Announcements

    const annCount = await announcementsCol.countDocuments();
    if (annCount === 0) {
      await announcementsCol.insertMany([
        {
          title: 'Annual Tech Symposium & Hackathon 2026 Registration Open',
          description: 'We are excited to announce the annual UniPortal Hackathon! Register your team of up to 4 members by February 20th. Cash prizes up to $5,000 for top projects!',
          tag: 'Seminar',
          isPinned: true,
          publishedBy: 'Department of Computer Science',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Spring Festival Holiday Notice (Feb 21)',
          description: 'All academic and administrative activities will remain closed on February 21st in observance of International Mother Language Day.',
          tag: 'Holiday',
          isPinned: true,
          publishedBy: 'Registrar Office',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('[MongoDB Native Seed] Sample announcements created.');
    }

    // Seed Course Teacher Feedback
    const feedbackCol = db.collection('feedback');
    const feedbackCount = await feedbackCol.countDocuments();
    if (feedbackCount === 0) {
      // Find faculty users to link
      const facultyUser = await usersCol.findOne({ role: 'faculty' });
      const facId = facultyUser?._id?.toString() || 'FAC-2024-101';
      const facName = facultyUser?.name || 'Dr. Sarah Abedin';
      const facEmail = facultyUser?.email || 'sarah.jenkins@univ.edu';

      await feedbackCol.insertMany([
        {
          studentId: 'CSE-2024-042',
          studentName: 'Rahim Chowdhury',
          studentEmail: 'alex.rivera@student.univ.edu',
          facultyId: facId,
          facultyName: facName,
          facultyEmail: facEmail,
          department: 'Computer Science & Engineering',
          courseCode: 'CSE-3101',
          courseTitle: 'Database Management Systems',
          semester: 'Spring 2026',
          rating: 5,
          teachingQuality: 5,
          courseContent: 5,
          communication: 4,
          comment: 'Dr. Sarah explains complex database index structures and query optimization remarkably well. The practical lab sessions were extremely insightful!',
          isAnonymous: false,
          createdAt: new Date(Date.now() - 3 * 86400000),
          updatedAt: new Date(Date.now() - 3 * 86400000)
        },
        {
          studentId: '',
          studentName: 'Anonymous Student',
          studentEmail: '',
          facultyId: facId,
          facultyName: facName,
          facultyEmail: facEmail,
          department: 'Computer Science & Engineering',
          courseCode: 'CSE-3105',
          courseTitle: 'Software Engineering & Agile Methodologies',
          semester: 'Spring 2026',
          rating: 5,
          teachingQuality: 5,
          courseContent: 4,
          communication: 5,
          comment: 'Excellent teaching style, highly encouraging environment, and very punctual lectures. Would love more hands-on project reviews.',
          isAnonymous: true,
          createdAt: new Date(Date.now() - 1 * 86400000),
          updatedAt: new Date(Date.now() - 1 * 86400000)
        }
      ]);
      console.log('[MongoDB Native Seed] Sample course teacher feedback entries created.');
    }

    // Seed Student Marks
    const marksCol = db.collection('marks');
    const marksCount = await marksCol.countDocuments();
    if (marksCount === 0) {
      await marksCol.insertMany([
        {
          studentId: 'CSE-2024-042',
          studentName: 'Rahim Chowdhury',
          studentEmail: 'alex.rivera@student.univ.edu',
          courseCode: 'CSE-3101',
          courseTitle: 'Database Management Systems',
          section: 'Section A',
          semester: 'Spring 2026',
          ct1: 13,
          ct2: 14,
          mid: 22,
          final: 34,
          assignment: 9,
          attendence: 9,
          totalMarks: 100,
          letterGrade: 'A+',
          gpa: 4.00,
          published: true,
          publishedBy: 'Dr. Sarah Abedin',
          remarks: 'Excellent performance throughout the semester.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          studentId: 'CSE-2024-042',
          studentName: 'Rahim Chowdhury',
          studentEmail: 'alex.rivera@student.univ.edu',
          courseCode: 'CN',
          courseTitle: 'Computer Networks',
          section: 'Section 9A',
          semester: '9th Semester',
          ct1: 12,
          ct2: 13,
          mid: 20,
          final: 30,
          assignment: 8,
          attendence: 9,
          totalMarks: 92,
          letterGrade: 'A+',
          gpa: 4.00,
          published: true,
          publishedBy: 'Dr. Sarah Abedin',
          remarks: 'Strong lab work and final exam scores.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          studentId: 'CSE-2024-089',
          studentName: 'Nusrat Jahan',
          studentEmail: 'nusrat.jahan@student.univ.edu',
          courseCode: 'CSE-3101',
          courseTitle: 'Database Management Systems',
          section: 'Section B',
          semester: 'Spring 2026',
          ct1: 11,
          ct2: 12,
          mid: 19,
          final: 28,
          assignment: 8,
          attendence: 8,
          totalMarks: 86,
          letterGrade: 'A+',
          gpa: 4.00,
          published: true,
          publishedBy: 'Dr. Sarah Abedin',
          remarks: 'Good progress.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          studentId: 'CSE-2024-104',
          studentName: 'Anika Rahman',
          studentEmail: 'anika.rahman@student.univ.edu',
          courseCode: 'CSE-3101',
          courseTitle: 'Database Management Systems',
          section: 'Section A',
          semester: 'Spring 2026',
          ct1: 10,
          ct2: 11,
          mid: 18,
          final: 26,
          assignment: 7,
          attendence: 9,
          totalMarks: 81,
          letterGrade: 'A+',
          gpa: 4.00,
          published: false,
          publishedBy: 'Dr. Sarah Abedin',
          remarks: 'Draft marks entry.',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('[MongoDB Native Seed] Sample student marks records created.');
    }

    // Seed Exam Schedule
    const examsCol = db.collection('exams');
    const examsCount = await examsCol.countDocuments();
    if (examsCount === 0) {
      await examsCol.insertMany([
        {
          courseCode: 'CN',
          courseTitle: 'Computer Networks',
          examType: 'Midterm Exam',
          semester: 'Spring 2026',
          section: 'Section 9A',
          department: 'Computer Science & Engineering',
          examDate: '2026-09-05',
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          room: '413',
          building: 'Academic Building 1',
          invigilator: 'Dr. Sarah Abedin',
          instructions: 'Bring your official Student ID card and non-programmable calculator. Mobile phones prohibited.',
          publishedBy: 'Dr. Sarah Abedin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          courseCode: 'SD3',
          courseTitle: 'Software Development 3',
          examType: 'Midterm Exam',
          semester: 'Spring 2026',
          section: 'Section 9A',
          department: 'Computer Science & Engineering',
          examDate: '2026-09-07',
          startTime: '02:00 PM',
          endTime: '04:00 PM',
          room: '407',
          building: 'Academic Building 1',
          invigilator: 'Prof. Alan Vance',
          instructions: 'Practical lab exam environment setup will start 15 minutes before the exam time.',
          publishedBy: 'Dr. Sarah Abedin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          courseCode: 'CSE-3101',
          courseTitle: 'Database Management Systems',
          examType: 'Midterm Exam',
          semester: 'Spring 2026',
          section: 'Section A',
          department: 'Computer Science & Engineering',
          examDate: '2026-09-09',
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          room: '302',
          building: 'Main Building',
          invigilator: 'Dr. Sarah Abedin',
          instructions: 'Answer any 4 out of 5 questions. Direct ER-diagram drawing tools allowed.',
          publishedBy: 'Dr. Sarah Abedin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          courseCode: 'CGMSD',
          courseTitle: 'Computer Graphics & Multimedia System Design',
          examType: 'Midterm Exam',
          semester: 'Spring 2026',
          section: 'Section 9A',
          department: 'Computer Science & Engineering',
          examDate: '2026-09-12',
          startTime: '11:30 AM',
          endTime: '01:30 PM',
          room: '418',
          building: 'Academic Building 1',
          invigilator: 'Dr. Marcus Thorne',
          instructions: 'Calculators and graphics cheat sheets provided in hall.',
          publishedBy: 'Dr. Marcus Thorne',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('[MongoDB Native Seed] Sample exam schedule records created.');
    }
  } catch (err) {

    console.error('[MongoDB Native Seed Error]', err.message);
  }
}
