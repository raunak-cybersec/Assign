# Assign — Task Management Application

> "Delegate. Track. Done." — A production-grade task management platform built for teams.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🔗 Live Demo

| Service | URL |
|--------|-----|
| **Frontend** | [assign-git-main-raunak-cybersecs-projects.vercel.app](https://assign-git-main-raunak-cybersecs-projects.vercel.app) |
| **Backend API** | [assign-fma7.onrender.com](https://assign-fma7.onrender.com) |

> **Note:** Backend is hosted on Render free tier — may take 30–60 seconds to wake up on first request.

---

## 📌 Features

- **Google OAuth 2.0** — Sign in with Gmail, profile photo and name pulled automatically
- **Create & Assign Tasks** — Title, description, due date, priority (Low / Medium / High), assign to any registered user
- **Email Notifications** — HTML-branded email sent via Resend API when a task is assigned, and when a task is marked complete
- **Kanban Board** — Drag and drop tasks between Todo → In Progress → Completed columns
- **Task List View** — Table view with sorting and filtering by status, priority, assignee
- **Task Detail Page** — Full details, due date countdown, activity log, assignee avatar
- **In-App Notifications** — Bell icon with unread count, dropdown of recent activity
- **Overdue Detection** — Tasks past due date automatically show a red "Overdue" badge
- **Dashboard** — Summary cards (Total, Todo, In Progress, Completed) + Recent Activity feed
- **Loading Skeletons** — Skeleton loaders instead of spinners for a polished experience
- **Toast Notifications** — Feedback on every action (create, update, delete)
- **Fully Responsive** — Mobile-first layout with hamburger menu

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│              Next.js 14 + TypeScript + Tailwind              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST API calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FLASK BACKEND (Render)                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ /api/tasks  │  │  /api/users  │  │ /api/notifications│  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘            │
│                          │                                   │
│                  ┌───────▼────────┐                         │
│                  │  Supabase SDK  │                         │
│                  └───────┬────────┘                         │
│                          │  Resend API                       │
│                  ┌───────▼────────┐                         │
│                  │  Email Service │                         │
│                  └────────────────┘                         │
└───────────────────────────┬─────────────────────────────────┘
                            │ PostgreSQL queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                      │
│                                                              │
│   users │ tasks │ activity_logs │ notifications              │
│                                                              │
│   Google OAuth 2.0 via Supabase Auth                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python, Flask, flask-cors, PyJWT |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth 2.0 via Supabase Auth (ES256 JWKS) |
| Email | Resend API with HTML templates (Jinja2) |
| Drag & Drop | @hello-pangea/dnd |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Render |

---

## 🗄️ Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | User's Gmail address |
| name | text | Display name from Google |
| avatar_url | text | Profile photo URL |
| created_at | timestamp | Registration time |

### `tasks`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Task title |
| description | text | Task description (max 500 chars) |
| status | enum | todo / in_progress / completed |
| priority | enum | low / medium / high |
| due_date | date | Due date |
| creator_id | uuid | FK → users.id |
| assignee_id | uuid | FK → users.id |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### `activity_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK → tasks.id (CASCADE) |
| user_id | uuid | FK → users.id |
| action | text | What changed |
| old_value | text | Previous value |
| new_value | text | New value |
| created_at | timestamp | When it happened |

### `notifications`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id (CASCADE) |
| task_id | uuid | FK → tasks.id (CASCADE) |
| message | text | Notification text |
| is_read | boolean | Read status |
| created_at | timestamp | Creation time |

---

## 📁 Project Structure

```
assign/
├── frontend/                       # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/          # Dashboard page
│   │   │   ├── tasks/
│   │   │   │   ├── board/          # Kanban board
│   │   │   │   └── [id]/           # Task detail page
│   │   │   ├── auth/callback/      # OAuth callback handler
│   │   │   ├── page.tsx            # Login page
│   │   │   └── layout.tsx          # Root layout
│   │   ├── components/
│   │   │   ├── dashboard/          # SummaryCards, ActivityFeed
│   │   │   ├── layout/             # AppLayout, Sidebar, Navbar
│   │   │   ├── notifications/      # NotificationBell, Panel
│   │   │   ├── tasks/              # TaskCard, KanbanBoard, CreateTaskModal
│   │   │   └── ui/                 # Button, Avatar, Skeleton, Toast
│   │   ├── hooks/                  # useTasks, useUsers, useNotifications
│   │   ├── lib/                    # API client, Supabase client
│   │   └── providers/              # AuthProvider (context)
│   ├── tailwind.config.ts
│   ├── vercel.json
│   └── package.json
│
├── backend/                        # Python Flask REST API
│   ├── app/
│   │   ├── __init__.py             # App factory, CORS, error handlers
│   │   ├── config.py               # Environment variable config
│   │   ├── models.py               # Supabase CRUD operations
│   │   ├── routes/
│   │   │   ├── auth.py             # POST /api/auth/callback
│   │   │   ├── tasks.py            # CRUD /api/tasks
│   │   │   ├── users.py            # GET /api/users
│   │   │   └── notifications.py    # GET/PUT /api/notifications
│   │   ├── services/
│   │   │   ├── email_service.py    # Resend API integration
│   │   │   └── notification_service.py
│   │   └── middleware/
│   │       └── auth_middleware.py   # JWT verification (ES256 JWKS)
│   ├── run.py                      # Entry point
│   ├── render.yaml                 # Render deployment config
│   └── requirements.txt
│
├── migrations/
│   ├── 000_full_setup.sql          # Complete schema + RLS policies
│   ├── 001_create_users.sql
│   ├── 002_create_tasks.sql
│   ├── 003_create_activity_logs.sql
│   ├── 004_create_notifications.sql
│   └── 005_create_rls_policies.sql
│
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Supabase account
- A Google Cloud project with OAuth credentials
- A Resend account with API key

### 1. Clone the repository
```bash
git clone https://github.com/raunak-cybersec/Assign.git
cd Assign
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in your .env values (see below)
python run.py
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your .env.local values (see below)
npm run dev
```

### 4. Database setup
- Go to your Supabase project → SQL Editor
- Paste and run `migrations/000_full_setup.sql`

### 5. Open the app
Visit `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:3000
FLASK_SECRET_KEY=any_random_secret_string
FLASK_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📧 Email Notification Flow

```
User creates task → Flask receives POST /api/tasks
       │
       ▼
Task saved to Supabase
       │
       ▼
Resend API triggered → HTML email sent to assignee
("You have been assigned a new task: [title]")

User marks task complete → Flask receives PUT /api/tasks/:id
       │
       ▼
Status updated in Supabase + activity_logs entry created
       │
       ▼
Resend API triggered → HTML email sent to task creator
("[Assignee name] completed your task: [title]")
```

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/callback` | Bearer JWT | Upsert user after Google OAuth |
| GET | `/api/tasks` | Bearer JWT | Get all tasks for logged-in user |
| POST | `/api/tasks` | Bearer JWT | Create task + send assignment email |
| GET | `/api/tasks/:id` | Bearer JWT | Get task details with creator/assignee |
| PUT | `/api/tasks/:id` | Bearer JWT | Update task + send completion email |
| DELETE | `/api/tasks/:id` | Bearer JWT | Delete a task (creator only) |
| GET | `/api/users` | Bearer JWT | Get all registered users |
| GET | `/api/notifications` | Bearer JWT | Get notifications for user |
| PUT | `/api/notifications/:id/read` | Bearer JWT | Mark notification as read |
| GET | `/api/health` | None | Health check endpoint |

---

## 🚢 Deployment

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set Root Directory to `frontend`
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`)
4. Deploy

### Backend → Render
1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repo — Render auto-detects `render.yaml`
3. Add environment variables in Render dashboard
4. Deploy

---

## 👨‍💻 Author

**Raunak Rai**
- 2nd Year B.Tech CSE — SRM University AP
- MongoDB Associate Developer Certified
- Portfolio: [raunakrai.vercel.app](https://raunakrai.vercel.app)
- GitHub: [github.com/raunak-cybersec](https://github.com/raunak-cybersec)
- LinkedIn: [linkedin.com/in/raunak-rai-35968b316](https://linkedin.com/in/raunak-rai-35968b316)
