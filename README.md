<<<<<<< HEAD
# CLOSR Backend - Core App & Health Check API

This repository contains the backend service for **CLOSR**, an AI-powered Customer Operations Agent, built with Python, Django, and Django REST Framework (DRF).

---

## 1. Quick Start Guide

### Prerequisites
* Python 3.14+ (or Python 3.11+)
* Windows PowerShell
* MySQL 8.0 (installed and running)

### Setup Virtual Environment
If not already active, activate the existing virtual environment:
```powershell
# From the backend directory
.\venv\Scripts\Activate.ps1
```

### Install Dependencies
Dependencies are already installed in `venv`. If reinstalling on a new machine:
```powershell
pip install -r requirements.txt # or install django, djangorestframework, django-cors-headers, python-dotenv, pymysql, cryptography, google-genai
```

### Apply Default Migrations
```powershell
python manage.py migrate
```

### Run Automated Tests
```powershell
python manage.py test
```

### Start Development Server
```powershell
python manage.py runserver
```
The server will start at `http://127.0.0.1:8000/`.

---

## 2. API Endpoints

### Health Check
* **Route**: `/api/health/`
* **Method**: `GET`
* **Authentication**: None
* **Expected Status**: `200 OK`
* **Response Body**:
```json
{
  "success": true,
  "message": "CLOSR backend is running",
  "service": "CLOSR API"
}
```

---

## 3. Postman Verification Guide

1. **Agent Selection**: If using Postman Web, switch to the **Postman Desktop Agent** (local servers on `127.0.0.1` cannot be reached directly by Postman Cloud Agent).
2. **Method**: Select `GET` from the dropdown.
3. **URL**: Enter `http://127.0.0.1:8000/api/health/` *(do not type "GET" in the URL bar)*.
4. **Headers**: Default headers (`Accept: */*`).
5. **Authorization**: `No Auth`.
6. **Body**: `none`.
7. Click **Send**.
8. Verify Status is `200 OK` and Response Body contains the expected JSON.
=======
# Closr
>>>>>>> ed259004feecb09495e14c98a7dc0e2d54b8b520
