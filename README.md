<![CDATA[<div align="center">

# ✓ Assign

### Delegate. Track. Done.

Assign helps teams delegate tasks, track progress, and get things done — without the chaos.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-green?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](https://assign-app.vercel.app) · [Report Bug](https://github.com/yourusername/assign/issues) · [Request Feature](https://github.com/yourusername/assign/issues)

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js 14 Frontend                   │  │
│  │        TypeScript + Tailwind + Framer Motion       │  │
│  │              Hosted on Vercel                      │  │
│  └──────────┬────────────────────────┬───────────────┘  │
│             │                        │                   │
│         Auth Flow              REST API Calls            │
│             │                        │                   │
│  ┌──────────▼──────────┐  ┌─────────▼────────────────┐  │
│  │   Supabase Auth     │  │   Flask REST API          │  │
│  │   (Google OAuth)    │  │   Hosted on Render        │  │
│  │                     │  │                           │  │
│  │  ┌───────────────┐  │  │  ┌─────────────────────┐ │  │
│  │  │ JWT Tokens    │──│──│──│ Auth Middleware      │ │  │
│  │  └───────────────┘  │  │  └─────────────────────┘ │  │
│  └──────────┬──────────┘  │                           │  │
│             │             │  ┌─────────────────────┐  │  │
│             │             │  │ Email Service        │  │  │
│             │             │  │ (Gmail SMTP)         │  │  │
│             │             │  └─────────────────────┘  │  │
│             │             └──────────┬────────────────┘  │
│             │                        │                   │
│  ┌──────────▼────────────────────────▼───────────────┐  │
│  │              Supabase (PostgreSQL)                 │  │
│  │                                                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │  │
│  │  │  users   │ │  tasks   │ │  activity_logs    │  │  │
│  │  └──────────┘ └──────────┘ └───────────────────┘  │  │
│  │  ┌───────────────┐                                │  │
│  │  │ notifications │                                │  │
│  │  └───────────────┘                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## ✨ Features

- **Google OAuth Login** — Sign in with Gmail, profile photo and name pulled automatically
- **Task Management** — Create, update, delete tasks with title, description, due date, priority, and status
- **Kanban Board** — Drag-and-drop tasks between Todo, In Progress, and Completed columns
- **Task List View** — Sortable table with filtering by assignee, priority, and status
- **Email Notifications** — Beautiful HTML emails on task assignment and completion via Gmail SMTP
- **In-App Notifications** — Bell icon with unread count and notification dropdown
- **Dashboard** — Summary cards with task counts and recent activity feed
- **Overdue Detection** — Tasks past due date automatically show red "Overdue" badge
- **User Management** — Automatic registration on first Google sign-in
- **Responsive Design** — Full mobile support with hamburger menu and stacked layouts
- **Loading Skeletons** — Polished loading states instead of spinners
- **Toast Notifications** — Feedback for every action

## 🛠️ Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Frontend    | Next.js 14, TypeScript, Tailwind CSS 3        |
| Animations  | Framer Motion                                 |
| Drag & Drop | @hello-pangea/dnd                             |
| Backend     | Python Flask REST API                         |
| Database    | Supabase (PostgreSQL)                         |
| Auth        | Google OAuth 2.0 via Supabase Auth            |
| Email       | Gmail SMTP via Python smtplib                 |
| Deployment  | Vercel (Frontend), Render (Backend), Supabase |

## 📦 Project Structure

```
Assign/
├── frontend/               # Next.js 14 application
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Supabase client, API client, utilities
│   │   ├── providers/      # Auth context provider
│   │   └── types/          # TypeScript interfaces
│   ├── public/             # Static assets
│   └── package.json
├── backend/                # Flask REST API
│   ├── app/
│   │   ├── routes/         # API route blueprints
│   │   ├── services/       # Email & notification services
│   │   ├── middleware/     # JWT auth middleware
│   │   └── templates/     # HTML email templates
│   ├── requirements.txt
│   └── run.py
├── migrations/             # SQL migration files
├── render.yaml             # Render deployment config
├── vercel.json             # Vercel deployment config
└── README.md
```

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Supabase** account ([supabase.com](https://supabase.com))
- **Google Cloud** project with OAuth 2.0 credentials
- **Gmail** account with App Password enabled

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/assign.git
cd assign
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migration files in order in the Supabase SQL Editor:
   - `migrations/001_create_users.sql`
   - `migrations/002_create_tasks.sql`
   - `migrations/003_create_activity_logs.sql`
   - `migrations/004_create_notifications.sql`
   - `migrations/005_create_rls_policies.sql`
3. Go to **Authentication > Providers** and enable Google OAuth
4. Note your project URL, anon key, service role key, and JWT secret from **Settings > API**

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **Google+ API**
4. Go to **Credentials** > Create **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret into Supabase Auth Google provider settings

### 4. Set Up Gmail SMTP

1. Enable **2-Factor Authentication** on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Save the 16-character password

### 5. Configure Environment Variables

```bash
# Root level
cp .env.example .env

# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/.env.example backend/.env
```

Fill in all values in each `.env` file.

### 6. Start the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

The Flask API will start at `http://localhost:5000`.

### 7. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The Next.js app will start at `http://localhost:3000`.

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the **Root Directory** to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)
5. Deploy

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** in [Render](https://render.com)
3. Connect your repository
4. Use the `render.yaml` for one-click setup, or configure manually:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn "app:create_app()" --config gunicorn.conf.py`
5. Add all environment variables from `backend/.env.example`
6. Deploy

### Database → Supabase

Already hosted on Supabase. No additional deployment needed.

## 📸 Screenshots

_Coming soon — add screenshots of the dashboard, kanban board, task list, and email templates._

## 📄 Environment Variables

| Variable                       | Where    | Description                                |
| ------------------------------ | -------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`     | Frontend | Supabase project URL                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Frontend | Supabase anonymous key                     |
| `NEXT_PUBLIC_API_URL`          | Frontend | Flask backend URL                          |
| `SUPABASE_URL`                 | Backend  | Supabase project URL                       |
| `SUPABASE_SERVICE_ROLE_KEY`    | Backend  | Supabase service role key (admin access)   |
| `SUPABASE_JWT_SECRET`          | Backend  | Supabase JWT secret for token verification |
| `GMAIL_ADDRESS`                | Backend  | Gmail address for sending emails           |
| `GMAIL_APP_PASSWORD`           | Backend  | Gmail App Password (not regular password)  |
| `FRONTEND_URL`                 | Backend  | Frontend URL for email template links      |
| `FLASK_SECRET_KEY`             | Backend  | Flask secret key for session security      |
| `FLASK_ENV`                    | Backend  | `development` or `production`              |

## 📝 API Endpoints

| Method | Endpoint                        | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| POST   | `/api/auth/callback`            | Register/update user after OAuth     |
| GET    | `/api/tasks`                    | Get all tasks for current user       |
| POST   | `/api/tasks`                    | Create a new task                    |
| GET    | `/api/tasks/:id`                | Get task details with activity log   |
| PUT    | `/api/tasks/:id`                | Update task (status, priority, etc.) |
| DELETE | `/api/tasks/:id`                | Delete a task (creator only)         |
| GET    | `/api/users`                    | Get all registered users             |
| GET    | `/api/notifications`            | Get current user's notifications     |
| PUT    | `/api/notifications/:id/read`   | Mark notification as read            |
| GET    | `/api/health`                   | Health check endpoint                |

## 📜 License

This project is for educational and portfolio purposes.

---

<div align="center">

**Built with ❤️ using Next.js, Flask, and Supabase**

✓ Assign — Delegate. Track. Done.

</div>
]]>
