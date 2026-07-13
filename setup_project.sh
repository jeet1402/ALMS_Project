#!/bin/bash

# Create Directories
mkdir -p backend/alms_core backend/library_app frontend/public frontend/src

# Create Placeholder Files if they don't exist
[ -f backend/requirements.txt ] || touch backend/requirements.txt
[ -f backend/.env ] || touch backend/.env
[ -f README.md ] || touch README.md

echo "Project structure verification complete."
