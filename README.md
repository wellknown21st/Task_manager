# Team Task Manager

Full-stack collaborative task management app: JWT auth, SQLite (Prisma), Express REST API, and a React single-page UI (Vite). Project creators become **ADMIN** and can invite **MEMBER** users by email, manage tasks end-to-end, and view the dashboard; members see tasks relevant to them and may update only tasks assigned to them.

🚀 Live Demo
Frontend (App): https://task-manager-brown-psi.vercel.app
Backend (API): https://taskmanager-production-5715.up.railway.app

## Prerequisites

- Node.js 20+ recommended
- npm

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env    # then edit secrets as needed
npm install
npx prisma generate
npx prisma db push
npm run dev
```

API listens on `http://localhost:4000` by default (`/health`, `/api/...`). SQLite file: `server/prisma/dev.db` (path is relative to the Prisma schema folder).

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the backend during development.

Production build (`npm run build`) serves static assets; configure `client/.env` with `VITE_API_BASE=<your-public-api-url>` if the API is not served from the same origin.

## Roles

| Capability | ADMIN | MEMBER |
|------------|-------|--------|
| Create / delete tasks | Yes | No |
| Reassign tasks | Yes | No |
| Update task fields | Any task | Assigned tasks only |
| Invite / remove members | Yes | No |
| Dashboard & task list | Full project | Scoped (assigned + unassigned) |

## Database (production)

For PostgreSQL, change `server/prisma/schema.prisma` `datasource` to `provider = "postgresql"` and set `DATABASE_URL` to your connection string, then run `npx prisma db push` or `prisma migrate` as appropriate.

## Deployment sketch

- **API**: Node host (Railway, Render, Fly.io) with `JWT_SECRET`, `DATABASE_URL`, `PORT`, and `CLIENT_ORIGIN` (your SPA origin) set.
- **SPA**: Static host (Vercel, Netlify, S3+CloudFront) with `VITE_API_BASE` pointing at the API URL and CORS allowing the SPA origin on the server.

## API summary

- `POST /api/auth/register` — body: `{ name, email, password }`
- `POST /api/auth/login` — body: `{ email, password }`
- `GET /api/auth/me` — Bearer JWT
- `GET|POST /api/projects` — list / create
- `GET /api/projects/:id` — project + members
- `POST /api/projects/:id/members` — admin: `{ email }`
- `DELETE /api/projects/:id/members/:userId` — admin
- `GET|POST /api/projects/:id/tasks`
- `PATCH|DELETE /api/projects/:id/tasks/:taskId`
- `GET /api/projects/:id/dashboard`

Validations and structured errors are returned as JSON (`{ error, details? }`).
