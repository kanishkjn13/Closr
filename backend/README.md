# CLOSR Backend — OPERA AI Operations Engine

The backend service for **CLOSR**, an AI-powered Clinic Operations Platform, built with Python, Django 6.1.2, and Django REST Framework (DRF).

---

## 📁 Backend Architecture

* **`agent/`**: AI agent service layer interfacing with the Google Gen AI API (`gemini-2.5-flash`), intent classification, multilingual detection (English, Hindi, Hinglish), medical emergency safeguards, and multi-turn action state machine.
* **`appointments/`**: Appointment booking, availability calculation during clinic hours (09:00 - 18:00, Mon–Sat), row-locked transactional bookings (`select_for_update()`), rescheduling, and cancellations.
* **`authentication/`**: SimpleJWT authentication, token refresh rotation, user registration, and role management.
* **`closr/`**: Core project configuration, CORS settings, database routing, and URL root.
* **`conversations/`**: Multi-turn conversation persistence, message ordering, patient language preference, and action state tracking.
* **`core/`**: Object-level permissions (`IsStaffOrOwner`), audit logs, system health checks, and data seeding (`seed_clinic_data`).
* **`crm/`**: Lead ingestion and customer conversion.
* **`customers/`**: Patient profiles and customer records with strict ownership scoping.
* **`knowledge/`**: Grounded clinic knowledge base articles, operating hours, doctors, consultation fees, and policies.
* **`postman/`**: Comprehensive Postman collection and environment.
* **`tickets/`**: Human escalation, operations ticket management, and SLA prioritization.

---

## 🚀 Setup & Execution

### 1. Environment Setup
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 2. Database Migrations
```powershell
python manage.py migrate
```

### 3. Seed Clinic Data
```powershell
python manage.py seed_clinic_data
```

### 4. Run Automated Test Suite
```powershell
python manage.py test
```
* **Status**: 37 tests passing (100% pass rate).

### 5. Start Development Server
```powershell
python manage.py runserver
```

---

## 🧪 Postman Testing
Refer to [`POSTMAN_TESTING_GUIDE.md`](POSTMAN_TESTING_GUIDE.md) for complete instructions on testing all 11 API suites using the provided collection in `postman/`.
