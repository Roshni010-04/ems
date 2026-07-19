# Employee Management System (EMS)

A full-stack Employee Management System with JWT authentication, role-based
access control, organizational hierarchy, dashboards, and more.

## Tech Stack

- **Frontend:** React + TypeScript (Vite), Tailwind CSS, React Router, Recharts
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt (httpOnly cookie + Bearer token support)

## Project Structure

```
ems/
├── backend/          # Express API
├── frontend/          # React + Vite SPA
└── docker-compose.yml # One-command local orchestration
```

## Quick Start (Docker — recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

After the containers are up, seed a Super Admin account:

```bash
docker compose exec backend npm run seed
```

Default credentials created by the seed script:
```
email: admin@ems.com
password: Admin@123
```

## Manual Setup (without Docker)

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI etc. if needed
npm install
npm run seed               # creates the first Super Admin account
npm run dev                 # starts on http://localhost:5000
```

Requires a running MongoDB instance (local or Atlas) reachable at `MONGO_URI`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Running Backend Tests

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server` to spin up an in-memory MongoDB instance,
so no external database is required to run them — the test runner just
needs network access to download the `mongod` binary once (or a cached copy).

## Roles & Permissions

| Action                                  | Super Admin | HR Manager | Employee |
|------------------------------------------|:-----------:|:----------:|:--------:|
| View all employees                       | ✅          | ✅         | ✅ (own only) |
| Create employee                          | ✅          | ✅         | ❌ |
| Edit any employee                        | ✅          | ✅ (not Super Admins) | ❌ |
| Edit own profile (limited fields)        | ✅          | ✅         | ✅ |
| Delete employee (soft delete)            | ✅          | ❌         | ❌ |
| Assign role                              | ✅ (any)    | ✅ (not Super Admin) | ❌ |
| Assign reporting manager                 | ✅          | ✅         | ❌ |
| View dashboard & org chart               | ✅          | ✅         | ✅ |
| CSV import                               | ✅          | ✅         | ❌ |

Employees editing their own profile may only change: **phone number,
profile image, and password**. All other fields are ignored by the backend
even if submitted, so this is enforced server-side, not just in the UI.

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| POST | `/api/auth/login` | Public | Login, returns JWT + sets cookie |
| POST | `/api/auth/logout` | Authenticated | Clears auth cookie |
| GET | `/api/auth/me` | Authenticated | Get current user |
| GET | `/api/employees` | Authenticated | List employees (search/filter/sort/paginate) |
| POST | `/api/employees` | Super Admin, HR | Create employee |
| GET | `/api/employees/:id` | Authenticated | Get employee by id |
| PUT | `/api/employees/:id` | Authenticated (RBAC enforced) | Update employee |
| DELETE | `/api/employees/:id` | Super Admin | Soft-delete employee |
| POST | `/api/employees/import` | Super Admin, HR | Bulk-create employees from CSV |
| GET | `/api/employees/:id/reportees` | Authenticated | List direct reports |
| PATCH | `/api/employees/:id/manager` | Super Admin, HR | Assign/change reporting manager |
| GET | `/api/organization/tree` | Authenticated | Full org tree, or subtree via `?rootId=` |
| GET | `/api/dashboard/stats` | Authenticated | Dashboard summary stats & chart data |

### Query params for `GET /api/employees`

`page`, `limit`, `q` (search name/email), `department`, `role`, `status`,
`sortBy` (`name` \| `joiningDate` \| `salary` \| `createdAt`), `order` (`asc` \| `desc`).

## Key Design Decisions

- **Employee = User.** A single `Employee` collection stores both HR data and
  login credentials (hashed password, role). This matches the assignment's
  field list, which includes `Role` as an employee attribute.
- **Soft delete.** Deleting an employee sets `isDeleted: true` and
  `status: Inactive` instead of removing the document. All list/find queries
  automatically exclude soft-deleted records via a Mongoose pre-hook.
- **Circular reporting prevention.** Before assigning a manager, the backend
  walks up the new manager's chain of command; if it ever reaches the
  employee being updated, the assignment is rejected.
- **Field-level RBAC.** When an `Employee` edits their own profile, the
  backend strips the request body down to an allow-list
  (`phone`, `profileImage`, `password`) before applying updates — regardless
  of what the client sends.

## Bonus Features Implemented

- ✅ Pagination (`page`/`limit` on employee list)
- ✅ Soft delete
- ✅ CSV import (`POST /api/employees/import`, multipart upload)
- ✅ Dashboard charts (bar chart by department, pie chart by role — Recharts)
- ✅ Dark mode (Tailwind `class` strategy, toggle in navbar, persisted to `localStorage`)
- ✅ Docker (`docker-compose.yml` for Mongo + backend + frontend)
- ✅ Unit tests (Jest + Supertest + mongodb-memory-server, covering auth and RBAC/CRUD/cycle-prevention)

## Deployment Notes

- **Backend:** Deployable to any Node host (Render, Railway, Fly.io, EC2, etc.)
  behind a MongoDB Atlas cluster. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`
  as environment variables.
- **Frontend:** `npm run build` produces a static `dist/` bundle deployable to
  Vercel, Netlify, or the included Nginx Docker image.
- **CORS/cookies:** if frontend and backend are on different domains in
  production, set `sameSite: "none"` and `secure: true` on the auth cookie
  (see `backend/src/utils/generateToken.js`) and ensure HTTPS is used.
