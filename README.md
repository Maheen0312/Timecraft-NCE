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

💻 Installation

Follow these steps to run NCE Timecraft locally.

1. Clone the Repository
git clone https://github.com/Maheen0312/Timecraft-NCE.git
2. Navigate to the Project
cd Timecraft-NCE
3. Install Dependencies

Using npm:

npm install

Or using Bun:

bun install
🔑 Environment Variables

Create a .env file in the project root.

Example:

GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
ADMIN_SECRET_CODE=your_admin_secret
⚠️ Environment Variable Security

Never commit sensitive credentials to GitHub.

Do not upload:

.env
.env.local
.env.production

Add them to .gitignore.

Example:

node_modules/
.env
.env.local
.env.production
dist/
build/
*.log
🔥 Firebase Configuration

NCE Timecraft uses Firebase Authentication and Cloud Firestore.

Before running the application:

Create a Firebase project.
Enable Firebase Authentication.
Configure the required authentication provider.
Create a Firestore database.
Configure the Firebase project credentials.
Configure Firestore security rules.
Add the application domain to Firebase Authentication authorized domains.
Verify Firestore permissions.
Verify authentication rules.
Test Admin and Staff role access.
▶️ Running the Application

Start the development server:

npm run dev

The application will start in development mode.

Open the local development URL displayed in your terminal.

🏭 Production Build

Create a production build:

npm run build

Start the production application:

npm start
🔍 Code Quality

Run the project's validation/lint command:

npm run lint

Make sure there are no TypeScript, ESLint, or build errors before deploying.

📱 Responsive Design

NCE Timecraft is designed to provide a responsive experience across different screen sizes.

Supported devices include:

💻 Desktop
🖥️ Large displays
📱 Mobile phones
📲 Tablets
💻 Laptops

The timetable interface should adapt to different screen sizes without breaking the layout.

🎨 User Interface

The application focuses on a clean and modern user experience.

UI Features
Modern dashboard
Responsive navigation
Interactive timetable grid
Light mode
Dark mode
Smooth animations
Loading states
Error states
Toast notifications
Confirmation dialogs
Responsive tables
Mobile-friendly views
Empty states
Offline status handling
📤 Timetable Export

The system supports multiple timetable output options.

Export Options
🖨️ Print timetable
📄 PDF export
🖼️ Image export
📥 Data import

Exported timetable layouts should preserve readable formatting and remain suitable for printing or sharing.

📊 Analytics

The Admin dashboard can provide timetable-related analytics such as:

Total staff
Total subjects
Total rooms
Total laboratories
Scheduled periods
Staff workload
Room utilization
Laboratory utilization
Timetable quality
Scheduling conflicts
🔔 Notifications

The notification system can be used to inform users about important timetable events.

Examples:

New timetable published
Timetable updated
Timetable changed
Schedule conflicts
Important announcements
Administrative updates
📝 Audit Logs

Important administrative actions can be recorded for tracking and accountability.

Examples include:

Timetable creation
Timetable modification
Timetable deletion
Timetable publishing
Staff changes
Subject changes
Room changes
Laboratory changes
Settings changes
🕘 Timetable History

Previous timetable versions can be maintained to provide a record of timetable changes.

This allows administrators to:

Review previous versions
Track timetable changes
Restore previous configurations when supported
Compare timetable updates
🏫 Academic Resources

NCE Timecraft supports management of academic resources including:

Staff
Staff name
Staff email
Department
Assigned subjects
Teaching hours
Availability
Subjects
Subject name
Subject code
Weekly hours
Theory/Lab type
Assigned staff
Rooms
Room number
Room type
Capacity
Availability
Laboratories
Laboratory name
Laboratory type
Capacity
Availability
Assigned practical sessions
📅 Time Slots

The timetable system supports configurable academic periods.

Typical timetable data may include:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday

Each day can contain configurable academic periods and fixed breaks.

🧪 Laboratory Scheduling

Laboratory sessions can require consecutive periods depending on the academic configuration.

The scheduler should ensure:

Laboratory availability
Staff availability
Room availability
Required consecutive periods
No resource conflicts
No scheduling during locked periods
⚡ Performance

The application is designed to provide a smooth experience even as timetable data grows.

Performance considerations include:

Efficient Firestore queries
Component-level rendering
Lazy loading where appropriate
Optimized timetable calculations
Client-side caching where appropriate
Reduced unnecessary API requests
Responsive UI rendering
🛡️ Security Best Practices

Security is an important part of the application.

The project should follow these principles:

Use Firebase Authentication for user authentication.
Use role-based authorization.
Protect admin routes.
Protect staff routes.
Validate user permissions.
Secure Firestore rules.
Never expose private server secrets.
Never commit API keys.
Validate user input.
Avoid trusting client-side role information.
Keep administrative secrets on the server.
Use HTTPS in production.
🚨 Error Handling

The application should gracefully handle common errors such as:

Authentication failures
Unauthorized access
Network failures
Firebase errors
Firestore errors
Invalid timetable data
Scheduling conflicts
API failures
Missing resources
Server errors

Users should receive clear and understandable error messages instead of raw technical errors whenever possible.

🧪 Testing Checklist

Before deployment, verify:

 Admin login works
 Staff login works
 Unauthorized users cannot access admin pages
 Staff cannot access admin-only functionality
 Staff timetable loads correctly
 Admin timetable loads correctly
 Staff data is correct
 Subject data is correct
 Room data is correct
 Laboratory data is correct
 Timetable generation works
 Timetable validation works
 Wednesday afternoon Naan Muthalvan rule is respected
 No staff conflicts occur
 No room conflicts occur
 No laboratory conflicts occur
 Export functions work
 Print layout works
 Mobile layout works
 Tablet layout works
 Desktop layout works
 Dark mode works
 Notifications work
 Firebase rules work correctly
 Production build succeeds
 No sensitive credentials are committed
🚀 Deployment

NCE Timecraft can be deployed using modern cloud hosting platforms.

Recommended deployment architecture:

                    ┌─────────────────────┐
                    │      Users          │
                    │ Admin / Staff       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Node / Express    │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │    Firebase     │        │   Gemini AI     │
        │ Auth + Firestore│        │   AI Services   │
        └─────────────────┘        └─────────────────┘
🌐 Production Checklist

Before deploying:

✓ Configure production environment variables
✓ Configure Firebase production project
✓ Configure authorized domains
✓ Configure Firestore security rules
✓ Verify authentication
✓ Verify Admin authorization
✓ Verify Staff authorization
✓ Test timetable generation
✓ Test timetable validation
✓ Test responsive layouts
✓ Test exports
✓ Test error handling
✓ Remove development credentials
✓ Run production build
✓ Check browser console
✓ Check server logs
🤝 Contributing

Contributions, suggestions, and improvements are welcome.

Contribution Steps
Fork the repository.
Create a new branch.
git checkout -b feature/new-feature
Make your changes.
Test your changes.
Commit your changes.
git add .
git commit -m "feat: add new feature"
Push the branch.
git push origin feature/new-feature
Create a Pull Request.
📌 Development Guidelines

When contributing to the project:

Keep components reusable.
Follow the existing project structure.
Use TypeScript wherever possible.
Keep UI responsive.
Avoid unnecessary dependencies.
Validate user input.
Follow existing naming conventions.
Keep authentication and authorization secure.
Do not commit secrets.
Test timetable rules before submitting changes.
Ensure the project builds successfully.
🔮 Future Improvements

Possible future improvements include:

📱 Dedicated mobile application
🔔 Push notifications
📊 Advanced timetable analytics
🤖 Improved AI scheduling optimization
📅 Academic calendar integration
📲 Progressive Web App support
👥 Multi-department management
☁️ Automated cloud deployment
📈 Advanced staff workload analytics
🧠 More advanced scheduling algorithms
🔄 Automatic timetable regeneration
📆 Holiday and event management
📚 Student timetable view
🎓 Project Information

Project Name: NCE Timecraft

Category: College Timetable Management System

Purpose: Academic timetable automation and management

Primary Users:

Administrators
Teaching Staff
👨‍💻 Developer
Mohideen Maheen P

B.E. Computer Science / Engineering Graduate

GitHub:

https://github.com/Maheen0312

Portfolio:

https://mohideenmaheen.vercel.app/

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

📄 License

This project is developed for educational and institutional purposes.

All rights reserved.

⏰ NCE Timecraft
Plan Smarter. Schedule Better. Teach Better.

Built with React, TypeScript, Firebase, Node.js, Express, and Gemini AI.


**Save it exactly as `README.md`** in your `TIMECRAFT` root folder.

Then run:

```powershell
git add README.md
git commit -m "docs: add complete README"
git push
