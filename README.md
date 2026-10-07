# AI Resume Maker

AI Resume Maker is a full-stack resume-building application with a React frontend and an Express API. It brings resume editing, ATS-oriented review screens, and account access together in one interface.

> **Project status:** Account registration and login use the backend API and MongoDB. Resume, profile, job-matching, and ATS report workflows currently use mock data in the frontend; they are not yet backed by persistent API endpoints or an AI service.

## Features

- Create and edit resumes with personal details, summaries, education, skills, experience, projects, certifications, and achievements.
- Browse resume, dashboard, profile, and settings screens.
- Explore an ATS review flow for PDF and DOCX files, plus job-focused resume enhancement screens.
- Register and log in with a MongoDB-backed account, password hashing, and JWT authentication.
- Access authenticated application routes after signing in.

## Technology

- **Frontend:** React, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** bcryptjs and JSON Web Tokens
- **Checks:** Oxlint, Vite production build, Node.js test runner, and a Python smoke-test runner

## Requirements

- Node.js and npm
- MongoDB for registration, login, and other database-backed authentication requests
- Python 3 for the project-wide smoke-test runner

## Run Locally

### 1. Configure the backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set `MONGODB_URI` to a reachable MongoDB database and `JWT_SECRET` to a long, private random value. The example file also documents the default API port, token lifetime, and allowed frontend origin. Do not commit `.env` or put production secrets in source control.

Start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:5000` by default. Its health endpoint is `http://localhost:5000/api/health`.

### 2. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). The frontend uses `http://localhost:5000/api` by default. To change this, create `frontend/.env.local` and set `VITE_API_URL`, for example:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

The frontend also includes a local demo login: `demo@airesume.local` / `Demo@1234`. Demo account and resume data are mock data, not database records.

## API

All implemented routes are prefixed with `/api`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API health |
| `POST` | `/auth/register` | Create an account and return a JWT |
| `POST` | `/auth/login` | Authenticate and return a JWT |
| `GET` | `/auth/me` | Return the current authenticated user |

Registration expects a name, valid email, and password of at least eight characters. The `/auth/me` endpoint requires an authentication token.

## Application Routes

Public routes: `/`, `/login`, and `/register`.

Authenticated routes include `/dashboard`, `/resume/create`, `/resume/:id/edit`, `/resume/:id/preview`, `/resume/update`, `/resume/enhance`, `/ats`, `/ats/:id`, `/resumes`, `/profile`, and `/settings`.

## Tests and Quality Checks

Run the backend tests:

```powershell
cd backend
npm test
```

Run frontend lint and build checks:

```powershell
cd frontend
npm run lint
npm run build
```

Run the project-wide smoke suite from the repository root:

```powershell
python testing/run_tests.py
```

The smoke suite checks the project structure and frontend routes, runs frontend lint/build and backend tests, then verifies the Vite routes over HTTP.

## Repository Layout

```text
backend/    Express API, MongoDB connection, authentication, and backend tests
frontend/   React application, pages, components, and API/mock-data services
testing/    Project-wide smoke-test runner
```

## GitHub

Repository: [AtharvBennur/AI-resume-ATS-validation](https://github.com/AtharvBennur/AI-resume-ATS-validation)