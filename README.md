# UniPortal - Metropolitan Academic Management System 🎓

**UniPortal** is a modern, full-stack Academic Management & Student Information Portal built with Next.js 16 (App Router), React, TailwindCSS, Express.js, and MongoDB. It provides an intuitive, high-performance platform for students, Class Representatives (CRs), faculty members, and system administrators.

---

## ✨ Key Features

### 🎓 1. Student Portal & Profile Management
- **Section Transfer Request Workflow**: Students cannot directly alter their assigned section. They submit transfer requests specifying a target section (`Section A` to `Section E`) and reason, with live status updates (**Pending**, **Approved**, **Rejected**).
- **Profile Customization**: Avatar updates, department display, student ID mapping, and locked section indicator.

### 👑 2. Class Representative (CR) Governance
- **CR Capacity Control**: Automated enforcement of maximum 2 CRs per academic section.
- **CR Routine Editing**: Authorized CRs (`isCR: true`), Faculty, and Admins can create, update, and delete class schedule slots.

### 📅 3. Day-Tabwise Interactive Routine & Timetable
- **Daily Day Tabs**: Seamless tabbed schedule browsing (`Monday` – `Sunday` + `All Days`), automatically opening to today's weekday.
- **Real-Time Badges**: Dynamic status badges (`Live Now`, `Upcoming`, `Completed`) with current class accent highlighting.

### 📢 4. Notices & Announcements
- **Urgent Notice Broadcasts**: Priority notice posting with pinging urgency badges.
- **Course & Department Announcements**: Targeted communication for students and faculty.

### ⚡ 5. Admin Control Center & Analytics
- **Section Request Approval Desk**: Review student section transfer requests with one-click **Approve** (automatically updates user database record) or **Reject** actions.
- **User Governance Directory**: Manage system roles (Student, Faculty, Admin), appoint/revoke CR status, search users, and filter by section.
- **Portal Analytics**: Live statistics cards tracking Total Users, Students, Faculty, CRs, and Pending Section Requests.

### 🔄 6. 4-Way Navbar Role View Switcher
- Instant 1-click view toggling in the top navbar between:
  - 🎓 **Student View** (Green badge)
  - 👑 **CR View** (Amber badge with Crown)
  - 💼 **Faculty View** (Indigo badge)
  - ⚡ **Admin View** (Purple badge with Crown)

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, TailwindCSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB
- **Styling & Aesthetics**: Dark/Light mode theme system, Glassmorphism, Responsive UI

---

## 🚀 Getting Started

### 1. Repository Setup
```bash
git clone https://github.com/ruhul2003/UniPortal.git
cd UniPortal
```

### 2. Backend Installation & Execution
```bash
cd backend
npm install
npm run dev # Runs Express backend on http://localhost:5000
```

### 3. Frontend Installation & Execution
```bash
cd frontend
npm install
npm run dev # Runs Next.js app on http://localhost:3000
```

---

## 📁 Project Structure

```
UniPortal/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── routes/          # API endpoints (users, routines, notices, sectionRequests)
│   │   └── server.js        # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (admin, profile, routine, etc.)
│   │   ├── components/      # UI Components (Navbar, RoutineTable, AddRoutineModal)
│   │   ├── context/         # AuthContext & ThemeContext
│   │   └── lib/             # API client helper functions
│   └── package.json
└── README.md
```

---

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
