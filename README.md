# NOVA — Project Management Platform

> Plan. Collaborate. Deliver.

NOVA is a full-stack project management platform designed to help teams organize projects, manage tasks, assign responsibilities, track deadlines, and monitor project activity from a single workspace.

## 🚀 Features

- 🔐 Secure authentication with session-based access
- 📊 Project dashboard with task statistics
- 📁 Create, edit, and delete projects
- 👥 Project member management
- 🛡️ Role-based permissions for project admins and members
- ✅ Create, edit, and delete tasks
- 🎯 Assign tasks to project members
- 📅 Task due dates
- ⚠️ Automatic overdue indicators
- 🔎 Task search
- 🎛️ Filter tasks by status, priority, and assignee
- 👤 My Tasks filter
- 📝 Project activity history
- 📱 Responsive interface
- 🗄️ SQLite database with Prisma ORM

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- CSS

### Backend
- Next.js API Routes
- Prisma ORM
- SQLite
- JWT-based authentication
- Zod validation

### Development Tools
- VS Code
- Git
- npm

## 📂 Project Structure

```text
nova-app/
│
├── app/
│   ├── api/
│   │   ├── activity/
│   │   ├── auth/
│   │   ├── members/
│   │   ├── projects/
│   │   └── tasks/
│   │
│   ├── dashboard/
│   ├── login/
│   ├── projects/
│   ├── tasks/
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── DashboardClient.tsx
│   ├── ProjectClient.tsx
│   └── TasksClient.tsx
│
├── lib/
│   ├── auth.ts
│   └── db.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── .env
├── package.json
└── README.md
Getting Started
1. Clone the repository
git clone <your-repository-url>
cd nova-app
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file:
DATABASE_URL="file:./dev.db"
4. Generate Prisma Client
npx prisma generate
5. Setup the database
npx prisma db push
6. Seed sample data
npm run db:seed
7. Start the development server
npm run dev
Open:
http://localhost:3000
🔑 Available Scripts
Command
Description
npm run dev
Start development server
npm run build
Create production build
npm run start
Start production server
npm run db:push
Push Prisma schema to database
npm run db:seed
Seed sample data
🔒 Security
NOVA includes:
HTTP-only authentication cookies
Protected API routes
Project membership validation
Role-based project permissions
Assignee membership validation
Input validation using Zod
Protected project and task operations
📌 Core Workflow
Login
  ↓
Dashboard
  ↓
Create / Open Project
  ↓
Add Members
  ↓
Create Tasks
  ↓
Assign Tasks + Due Dates
  ↓
Track Progress
  ↓
View Activity History
🎯 Future Improvements
Potential future enhancements include:
Real-time notifications
Email notifications
Advanced analytics
Calendar integration
File attachments
Team chat
Production deployment
👩‍💻 Author
Arpita Mishra
B.Tech — Computer Science & Engineering

⭐ If you found NOVA useful, consider giving the repository a star!
