# Advanced Library Management System (ALMS)

## Project Overview
ALMS is a 3-tier architecture system designed to automate library transactions, fine calculations, and catalog management for BBMKU.

## Setup Instructions

### Phase 1: Environment & Directory Setup

These commands initialize your project structure and isolate your Python dependencies.

* **Create root structure:**
```bash
mkdir -p ALMS_Project/backend ALMS_Project/frontend
cd ALMS_Project

```

* **Setup Virtual Environment (Backend):**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Use 'source venv/bin/activate' on Linux/macOS

```

### Phase 2: Backend Configuration

These commands set up your Django project and link it to your PostgreSQL database.

* **Install Dependencies:**
```bash
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv

```

* **Initialize Django Project:**
```bash
python -m django startproject alms_core .

```

* **Create Application Folder:**
```bash
python manage.py startapp library_app

```

### Phase 3: Frontend Setup

These commands initialize your React application for the user interface.

* **Initialize React (Inside `frontend/`):**
```bash
cd ../frontend
npx create-react-app .
npm install axios react-router-dom

```

### Phase 4: Database & Migration

These commands translate your Python models into the PostgreSQL schema.

* **Prepare Migrations (Inside `backend/`):**
```bash
cd ../backend
python manage.py makemigrations library_app
python manage.py migrate

```

### Phase 5: GitHub Initialization

These commands prepare your project for version control and uploading to GitHub.

* **Git Setup (From root `ALMS_Project/`):**
```bash
cd ..
git init
# Create .gitignore with: venv/, __pycache__/, .env, db.sqlite3, node_modules/
git add .
git commit -m "Initial commit: ALMS project structure"
git remote add origin <your-repository-url>
git push -u origin main

