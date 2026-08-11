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

    // Seed Routines
    const routineCount = await routinesCol.countDocuments();
    if (routineCount === 0) {
      await routinesCol.insertMany([
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
          section: 'Section A',
          facultyName: 'Dr. Sarah Jenkins',
          createdAt: new Date(),
          updatedAt: new Date()
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
          section: 'Section A',
          facultyName: 'Prof. Alan Vance',
          createdAt: new Date(),
          updatedAt: new Date()
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
          section: 'Section B',
          facultyName: 'Dr. Marcus Thorne',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('[MongoDB Native Seed] Sample routines created.');
    }

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
  } catch (err) {

    console.error('[MongoDB Native Seed Error]', err.message);
  }
}
