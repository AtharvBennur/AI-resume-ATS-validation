# AI Resume Maker

AI Resume Maker is a full-stack resume-building application with a React frontend and an Express API. It brings resume editing, ATS-oriented review screens, and account access together in one interface.

> **Project status:** Accounts, profile names, resumes, parsed PDF/DOCX imports, AI-assisted resume text rewriting, deterministic ATS reports, and job-keyword comparison use the Express API. MongoDB stores accounts, resumes, and report history. Notification preferences are stored in the browser; email delivery is not configured.

## Features

- Create and edit resumes with personal details, summaries, education, skills, experience, projects, certifications, and achievements.
- Export resumes as a clean PDF using the single ATS-friendly section order shown in the builder.
- Rewrite user-entered resume text into professional, factual wording through Groq.
- Import text-based PDF/DOCX resumes into a new resume or replace an existing saved resume.
- Check uploaded text-based PDF and DOCX resumes against a public HTTPS job-posting URL with deterministic ATS rules and saved report history.
- Compare a saved resume's actual terms with a pasted job description; the displayed percentage is keyword overlap, not a vendor ATS score.
- Browse resume, dashboard, and profile screens.
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
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

For MongoDB Community Server running on this laptop with its default port, the `backend/.env` connection string is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/ai_resume_workspace
```

`ai_resume_workspace` is the database name. Startup initializes the `users`, `resumes`, and `atsreports` collections so the database is visible in Compass before the first account is registered. The project `.env.example` contains this local placeholder, and `.env` is ignored by Git. In Compass, select **Add new connection**, use `mongodb://127.0.0.1:27017`, connect, then refresh the database list and expand `ai_resume_workspace`. If you use a different host, port, or authentication, use that MongoDB server's connection string in both Compass and `backend/.env`. On Windows, start the MongoDB Server service from the Services app (or run `Start-Service MongoDB` in an elevated PowerShell window if it was installed as a service).

Keep `JWT_SECRET` set to a long, private random value. To enable AI rewriting, create a Groq API key at [console.groq.com/keys](https://console.groq.com/keys), then set `GROQ_API_KEY` in `backend/.env`. Set `GROQ_MODEL` to an available model ID shown in your Groq Console; `GROQ_API_URL` is already set to Groq's OpenAI-compatible endpoint. Groq's free usage has account and rate limits. Keep the key in the backend only, do not commit `.env`, and review Groq's data terms before sending real resume text to its hosted service.

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

Use **Register** to create a MongoDB-backed account; successful registration signs you in and opens the dashboard. The login and registration pages show whether the backend and MongoDB are connected. To verify persistence, log out and sign in again with the account you created.

## API

All implemented routes are prefixed with `/api`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API health and MongoDB connection status |
| `POST` | `/auth/register` | Create an account and return a JWT |
| `POST` | `/auth/login` | Authenticate and return a JWT |
| `GET` | `/auth/me` | Return the current authenticated user |
| `PATCH` | `/auth/me` | Update the authenticated user's name |
| `GET`, `POST` | `/resumes` | List or create the authenticated user's resumes |
| `GET`, `PUT`, `DELETE` | `/resumes/:id` | Read, update, or delete an owned resume |
| `POST` | `/ai/rewrite` | Professionally rewrite user-entered resume text (authenticated; requires Groq configuration) |
| `POST` | `/ai/resume/import` | Parse a text-based PDF/DOCX into resume sections (authenticated; 5 MB file limit) |
| `POST` | `/ai/ats/validate` | Fetch and score a public HTTPS job posting against an uploaded resume; optionally update a selected resume score (authenticated; 5 MB file limit) |
| `GET` | `/ai/ats/reports/:id` | Read a saved ATS report owned by the authenticated user |
| `POST` | `/ai/job-match` | Compare saved resume keywords with a job description (authenticated) |

Registration expects a name, valid email, and password of at least eight characters. The `/auth/me` endpoint requires an authentication token.

ATS validation accepts a public HTTPS job listing URL and an uploaded PDF/DOCX. Private network addresses, non-HTTPS URLs, redirects to non-public hosts, and pages that cannot be read are rejected.

## Application Routes

Public routes: `/`, `/login`, and `/register`.

Authenticated routes include `/dashboard`, `/resume/create`, `/resume/:id/edit`, `/resume/:id/preview`, `/resume/enhance`, `/ats`, `/ats/:id`, `/resumes`, and `/profile`.

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
npm test
npm run build
```

Run the project-wide smoke suite from the repository root:

```powershell
python testing/run_tests.py
```

The smoke suite checks the project structure and frontend routes, runs frontend lint, PDF tests and build, runs backend tests, then verifies the Vite routes over HTTP.

## Repository Layout

```text
backend/    Express API, MongoDB connection, authentication, and backend tests
frontend/   React application, pages, components, and API/mock-data services
testing/    Project-wide smoke-test runner
```

## GitHub

Repository: [AtharvBennur/AI-resume-ATS-validation](https://github.com/AtharvBennur/AI-resume-ATS-validation)