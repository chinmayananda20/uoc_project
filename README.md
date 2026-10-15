# Smart Path — AI-Powered Micro-Course Platform

**MSc Advanced Computer Science Project | University of Chester**

Smart Path is an AI-powered micro-course learning platform designed to support bite-sized learning, track learner progress, and provide adaptive feedback. It combines a React-based learning interface, a Node.js/Express API, MongoDB persistence, a Python machine-learning prediction service, and an AI-assisted conversational tutor.

## Live deployment

| Component | URL | Hosting |
| --- | --- | --- |
| Web application | [Smart Path](https://uoc-project-frontend.vercel.app) | Vercel |
| Backend health check | [API health](https://uoc-backend.onrender.com/api/health) | Render |
| ML service health check | [ML health](https://uoc-project.onrender.com/health) | Render |

> **Deployment note:** The Render free-tier services can take extra time to respond after periods of inactivity. Production integration and feature-level testing are ongoing.

### 🎓 Academic Evaluator Access

The platform provides role-based access for learners and administrators.

Supervisors, examiners, and academic evaluators who wish to explore the administrative features, course management functionality, and learner performance analytics can request a dedicated evaluation account.

**Request Access:** mandulachinmayananda@gmail.com

**Live Application:** https://uoc-project-frontend.vercel.app

Access credentials will be shared privately for academic evaluation purposes.

## Key features

### Learner experience
- User registration, login, and password recovery workflows
- Browse available courses and enroll
- Access course lessons and track learning progress
- Complete lesson quizzes and review performance
- Receive performance-based recommendations and practice opportunities
- Use an AI-powered tutor for learning assistance

### Administration
- Administrative dashboard for course and lesson management
- Quiz and question management
- Learner and course administration workflows

### Adaptive learning
- A separate Python prediction service processes quiz performance features
- The application uses predicted performance to inform learning support
- The intended learning flow distinguishes **weak**, **moderate**, and **good** performance to guide explanations, practice, or optional challenges

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, JavaScript, Create React App, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Token-based authentication (JWT) |
| Machine learning | Python, Flask, scikit-learn, pandas, NumPy, joblib |
| ML production server | Gunicorn |
| Deployment | Vercel (frontend), Render (API and ML service) |

## System architecture

```text
                   Browser / Learner / Admin
                              |
                              v
                    React app (Vercel)
                              |
                         HTTPS / Axios
                              |
                              v
                   Express API (Render)
                       /      |       \
                      v       v        v
                MongoDB    Python ML   AI tutor
                 Atlas      (Render)    provider
```

The frontend communicates with the Express API. The backend manages application data and invokes the Python ML service when performance predictions are needed. The AI tutor is integrated through a backend route, so provider credentials remain server-side.

## Repository structure

```text
uoc_project/
├── backend/             # Express API, routes, models, services
├── ml-service/          # Flask prediction API and trained model
├── public/              # React static assets
├── src/                 # React application and API client
├── package.json         # Frontend dependencies and scripts
└── README.md
```

## Run locally

### Prerequisites
- Node.js and npm
- Python 3 and pip
- Access to a MongoDB database
- Valid credentials for any enabled email or AI integrations

### 1. Clone the repository

```bash
git clone https://github.com/chinmayananda20/uoc_project.git
cd uoc_project
```

### 2. Start the backend

```bash
cd backend
npm install
npm start
```

Create `backend/.env` with the values required for your environment:

```dotenv
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8001/predict-performance

# Set only the integrations you use:
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
AI_PROVIDER=your_selected_provider
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

The backend uses `PORT` if provided by the hosting environment. For local development, confirm its active port in the terminal and use that port in the frontend configuration.

### 3. Start the ML service

In a second terminal:

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The ML service normally listens on `http://localhost:8001`. Its `/health` endpoint reports whether the trained model is loaded.

### 4. Start the frontend

In a third terminal, from the repository root:

```bash
npm install
```

Create a `.env` file in the repository root:

```dotenv
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

Change `8000` if your backend is listening on a different port. Then run:

```bash
npm start
```

Open `http://localhost:3000`.

> **Important:** The API base URL includes `/api`. Frontend requests such as `/auth/login` are relative to this base URL.

## Deployment configuration

### Vercel — frontend

```dotenv
REACT_APP_API_BASE_URL=https://uoc-backend.onrender.com/api
```

For Create React App, `REACT_APP_*` variables are embedded into the browser build. Redeploy after changing them. Never place private credentials in these variables.

### Render — Express backend

Configure the required backend secrets and:

```dotenv
FRONTEND_URL=https://uoc-project-frontend.vercel.app
ML_SERVICE_URL=https://uoc-project.onrender.com/predict-performance
```

The backend must allow the frontend origin through CORS. Render provides the production `PORT` automatically.

### Render — Python ML service

- Root directory: `ml-service`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Health check path: `/health`

The saved model must be available at the path expected by `ml-service/app.py`. The project uses `scikit-learn==1.6.1` to match the trained model's version.

## API overview

The Express server mounts routes for authentication, courses, lessons, quizzes, questions, enrollments, practice, attempts, admin management, and AI tutoring. Selected route prefixes include:

| Purpose | Route prefix |
| --- | --- |
| Health | `/api/health` |
| Login | `/api/auth/login` |
| Signup | `/api/auth/signup` |
| Password recovery | `/api/auth/forgot-password` |
| Courses | `/api/courses` |
| Administration | `/api/admin` |
| AI tutor | `/api/ai` |
| Practice | `/api/practice` |

Additional endpoints are defined in the respective backend route files.

## Security and responsible use

- Keep `.env` files and credentials out of version control.
- Store MongoDB, email, JWT, and AI-provider secrets only on the server.
- Use appropriately scoped database credentials and restrict network access where practical.
- Do not use the prototype's ML predictions as high-stakes assessments of a learner's ability.
- Verify privacy, consent, and research ethics requirements before collecting participant data for formal evaluation.

## Project status

The frontend, Express API, and ML service are deployed. Authentication connectivity has been verified in the live application. End-to-end testing of enrollment, quiz submission, adaptive predictions, and AI tutoring remains to be completed.

## Academic context

Developed as an MSc Advanced Computer Science project at the **University of Chester**.

**Project title:** *AI-Powered Micro Course Platform with Machine Learning Driven Performance Analytics and NLP-Based Conversational Tutoring*

**Developer:** Chinmayananda Mandula

---

*This repository is an academic project and an evolving prototype.*
