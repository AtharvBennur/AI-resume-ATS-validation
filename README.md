# AI Resume Maker

AI Resume Maker is a full-stack resume-building application with a React frontend and an Express API. It brings resume editing, ATS-oriented review screens, and account access together in one interface.

> **Project status:** Accounts, resumes, parsed PDF/DOCX imports, AI-assisted resume text rewriting, deterministic ATS reports, and job-keyword comparison use the Express API. MongoDB stores accounts, resumes, and report history. Profile editing remains a demo feature.

## Features

- Create and edit resumes with personal details, summaries, education, skills, experience, projects, certifications, and achievements.
- Export resumes as a clean PDF using the single ATS-friendly section order shown in the builder.
- Rewrite user-entered resume text into professional, factual wording through Groq.
- Import text-based PDF/DOCX resumes into a new resume or replace an existing saved resume.
- Check uploaded text-based PDF and DOCX resumes with deterministic backend ATS rules, with optional job-description keyword matching and saved report history.
- Compare a saved resume's actual terms with a pasted job description; the displayed percentage is keyword overlap, not a vendor ATS score.
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
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

For MongoDB Community Server running on this laptop with its default port, the `backend/.env` connection string is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/fsd_resume
```

`fsd_resume` is the database name; MongoDB creates it when the app first writes a record. The project `.env.example` already contains this local placeholder, and `.env` is ignored by Git. If you use a different host, port, or authentication, replace the URI in `backend/.env` with the connection string for that MongoDB server. In MongoDB Compass, you can connect with the same URI; Compass is a database client, so MongoDB Community Server must be installed and running separately. On Windows, start the MongoDB Server service from the Services app (or run `Start-Service MongoDB` in an elevated PowerShell window if it was installed as a service).

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

Registered accounts store resumes in MongoDB. The frontend also includes a local demo login: `demo@airesume.local` / `Demo@1234`; its sample resumes remain browser-only and are not database records.

## API

All implemented routes are prefixed with `/api`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API health |
| `POST` | `/auth/register` | Create an account and return a JWT |
| `POST` | `/auth/login` | Authenticate and return a JWT |
| `GET` | `/auth/me` | Return the current authenticated user |
| `GET`, `POST` | `/resumes` | List or create the authenticated user's resumes |
| `GET`, `PUT`, `DELETE` | `/resumes/:id` | Read, update, or delete an owned resume |
| `POST` | `/ai/rewrite` | Professionally rewrite user-entered resume text (authenticated; requires Groq configuration) |
| `POST` | `/ai/resume/import` | Parse a text-based PDF/DOCX into resume sections (authenticated; 5 MB file limit) |
| `POST` | `/ai/ats/validate` | Calculate and save a deterministic ATS report; optionally update a selected resume score (authenticated; optional job description; 5 MB file limit) |
| `GET` | `/ai/ats/reports/:id` | Read a saved ATS report owned by the authenticated user |
| `POST` | `/ai/job-match` | Compare saved resume keywords with a job description (authenticated) |

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