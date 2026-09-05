# ⏰ NCE Timecraft

## Smart College Timetable Management System

NCE Timecraft is a modern web-based college timetable management system designed to simplify, automate, and optimize the process of creating, managing, validating, and publishing academic timetables.

The system provides dedicated **Admin** and **Staff** dashboards with timetable generation, scheduling rules, conflict detection, staff management, subject management, room and laboratory management, analytics, notifications, timetable history, and export functionality.

---

## 🚀 Features

### 👨‍💼 Admin Dashboard

Administrators can manage the complete timetable system.

- 📊 Dashboard with timetable statistics
- 👨‍🏫 Staff management
- 📚 Subject management
- 🏫 Classroom management
- 🧪 Laboratory management
- 🕐 Time-slot management
- 📅 Timetable management
- 🤖 AI-assisted timetable generation
- ⚙️ Scheduling rules
- ⚠️ Timetable conflict detection
- 🔍 Timetable validation
- 🔔 Notifications
- 📈 Analytics
- 📝 Audit logs
- 🕘 Timetable history
- 📥 Import timetable data
- 📤 Export timetable
- 🖨️ Print timetable
- 🖼️ Export timetable as image
- 📄 Export timetable as PDF
- 📢 Publish timetable
- ⚙️ Application settings

---

## 👨‍🏫 Staff Dashboard

Staff members can access their academic timetable and related information.

### Staff Features

- 📅 View personal timetable
- 🏫 View department timetable
- 📚 View assigned subjects
- ⏱️ View teaching hours
- 🔔 View notifications
- 👤 Manage profile
- 🌙 Light/Dark mode
- 📱 Responsive timetable view

Staff members can only access information permitted by their assigned role and account permissions.

---

# 🤖 Smart Timetable Generation

NCE Timecraft includes a timetable scheduling engine designed to automatically generate timetables while considering multiple academic and resource constraints.

The scheduling system can consider:

- Staff availability
- Staff workload
- Subject weekly hours
- Classroom availability
- Laboratory availability
- Theory classes
- Laboratory classes
- Room conflicts
- Staff conflicts
- Consecutive laboratory periods
- Subject distribution
- Morning theory preferences
- Afternoon laboratory preferences
- Fixed breaks
- Lunch periods
- Special academic sessions
- Institutional scheduling rules

The generated timetable can be validated before it is published.

---

# 📅 Special Scheduling Rules

The system supports fixed scheduling rules for institutional requirements.

## Wednesday – Naan Muthalvan

Wednesday afternoon is reserved for:

**Naan Muthalvan**

The afternoon periods are locked so that normal theory or laboratory classes are not automatically scheduled during the reserved session.

This rule is treated as a fixed scheduling constraint by the timetable system.

---

# 🧠 Timetable Optimization

The scheduling engine evaluates generated timetables using multiple quality factors.

### Optimization Factors

- Subject distribution
- Staff workload balance
- Room utilization
- Laboratory utilization
- Morning theory distribution
- Afternoon laboratory distribution
- Free-period efficiency
- Scheduling conflicts
- Consecutive class patterns
- Special session restrictions

A timetable quality score can be calculated based on these factors.

---

# 🔍 Timetable Validation

Before publishing a timetable, the system checks for potential scheduling problems.

### Validation Includes

- ❌ Staff double booking
- ❌ Classroom conflicts
- ❌ Laboratory conflicts
- ❌ Invalid consecutive laboratory scheduling
- ❌ Scheduling during locked periods
- ❌ Staff workload violations
- ❌ Missing subjects
- ❌ Invalid timetable entries
- ❌ Duplicate timetable entries
- ❌ Resource conflicts

Only validated timetable data should be published for staff usage.

---

# 🔐 Authentication & Authorization

NCE Timecraft uses role-based access control.

## Supported Roles

### Admin

Administrators have access to system management features.

Admin permissions may include:

- Staff management
- Subject management
- Room management
- Laboratory management
- Timetable management
- Scheduling rules
- Timetable generation
- Timetable publishing
- Analytics
- Audit logs
- Application settings

### Staff

Staff members can access:

- Personal timetable
- Assigned subjects
- Teaching schedule
- Notifications
- Profile information

Unauthorized users should not be able to access protected admin or staff routes.

---

# 🏗️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React

## Backend

- Node.js
- Express
- TypeScript
- ESBuild

## Database

- Firebase
- Cloud Firestore

## Authentication

- Firebase Authentication

## AI

- Google Gemini API
- Google GenAI SDK

## Additional Technologies

- html-to-image
- jsPDF
- React Hot Toast
- clsx
- tailwind-merge

---

# 📂 Project Structure

```text
TIMECRAFT/
│
├── assets/
│
├── src/
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── notifications/
│   │   ├── timetable/
│   │   └── ui/
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── firebase/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   └── firestore.ts
│   │
│   ├── layouts/
│   │   ├── AdminLayout.tsx
│   │   └── StaffLayout.tsx
│   │
│   ├── pages/
│   │   ├── admin/
│   │   └── staff/
│   │
│   ├── scheduler/
│   │   ├── constraints.ts
│   │   ├── optimizer.ts
│   │   ├── scheduler.ts
│   │   ├── types.ts
│   │   └── validator.ts
│   │
│   └── App.tsx
│
├── server.ts
├── firestore.rules
├── firebase-blueprint.json
├── .env.example
├── package.json
├── README.md
└── index.html
