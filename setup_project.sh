#!/bin/bash

echo "Starting ALMS_Project environment setup..."

# 1. Setup Backend
echo "Setting up Backend..."
cd backend || exit
# Ensure virtual environment exists, or create one
if [ ! -d "venv" ]; then
    python -m venv venv
fi
# Activate venv (this works for Git Bash)
source venv/Scripts/activate

# Install requirements
pip install -r requirements.txt
pip install psycopg2-binary django-cors-headers djangorestframework django-environ
echo "Backend dependencies installed."

# Apply migrations
python manage.py makemigrations
python manage.py migrate
cd ..

# 2. Setup Frontend
echo "Setting up Frontend..."
cd frontend || exit
# Ensure react-scripts and core dependencies are installed
npm install
npm install react-scripts --save
npm install axios jwt-decode
echo "Frontend dependencies installed."
cd ..

echo "Setup complete! Backend: cd backend && source venv/Scripts/activate && python manage.py runserver"
echo "Frontend: cd frontend && npm start"
