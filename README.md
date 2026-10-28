# Closr — AI-Powered Customer Operations Platform

An AI customer operations agent that turns patient conversations into completed actions (consultation bookings, rescheduling, cancellation, support tickets, CRM updates, and human handoff) with verified proof of every action.

---

## 📁 Repository Structure

```
Closr/
├── backend/                  # Django REST Framework backend service
│   ├── agent/                # OPERA AI Gemini agent service & multilingual processing
│   ├── appointments/         # Scheduling, availability, bookings, rescheduling & cancellation
│   ├── authentication/       # JWT auth, user registration, role-based profiles
│   ├── closr/                # Project settings & URL routing
│   ├── conversations/        # Multi-turn conversation persistence & action state
│   ├── core/                 # Health check, permissions, auditing, analytics
│   ├── crm/                  # Lead management & customer conversion
│   ├── customers/            # Patient/Customer profile management
│   ├── knowledge/            # Clinic knowledge base articles & retrieval
│   ├── postman/              # Automated Postman collection & environment
│   ├── tickets/              # Human escalation & support tickets
│   ├── POSTMAN_TESTING_GUIDE.md # Step-by-step Postman testing workflow
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # React + Vite customer & clinic operations frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Django + DRF)

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Seed clinic knowledge & doctor accounts
python manage.py seed_clinic_data

# Run backend automated tests (37 tests)
python manage.py test

# Start development server
python manage.py runserver
```
The backend API will be available at `http://127.0.0.1:8000/api/`.

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend UI will be available at `http://localhost:5173/`.

---

## 🧪 Postman & API Documentation

A complete, automated Postman collection is located in `backend/postman/`:
* **Collection**: `backend/postman/CLOSR_API.postman_collection.json`
* **Environment**: `backend/postman/CLOSR_Local.postman_environment.json`
* **Testing Guide**: [`backend/POSTMAN_TESTING_GUIDE.md`](backend/POSTMAN_TESTING_GUIDE.md)

---

## 🛡️ Key Features

* **Multi-Turn AI Chatbot**: Real-time intent classification, parameter extraction, and slot availability checks in **English**, **Hindi**, and **Hinglish**.
* **Medical Emergency Protocol**: Immediate safety detection for acute symptoms (chest pain, severe bleeding, difficulty breathing) routing patients to 112 / 102 emergency care.
* **Transactional Booking with Locking**: Row-level locking (`select_for_update()`) preventing double-booking and race conditions.
* **Rescheduling & Cancellation**: 2-step preview and transactional execution workflows.
* **Strict Patient Data Isolation**: Object-level permissions preventing cross-patient conversation or appointment access.
* **Audit Trail**: Every action, status change, and AI decision is logged in an immutable audit ledger.
