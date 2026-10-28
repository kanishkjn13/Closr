# OPERA AI & CLOSR API - Postman Testing Guide

This guide provides end-to-end instructions for testing the OPERA AI / CLOSR clinic operations backend using the provided Postman collection.

---

## 1. Files in Repository

* **Collection File**: `postman/CLOSR_API.postman_collection.json`
* **Environment File**: `postman/CLOSR_Local.postman_environment.json`

---

## 2. Import Instructions

1. Open **Postman** (Desktop application recommended for testing local `127.0.0.1` endpoints).
2. Click **Import** in the upper-left corner of Postman.
3. Select and import both files:
   * `postman/CLOSR_API.postman_collection.json`
   * `postman/CLOSR_Local.postman_environment.json`
4. In the upper-right environment dropdown, select **CLOSR Local Environment**.
5. Verify the `base_url` variable is set to: `http://127.0.0.1:8000/api`.

> [!NOTE]
> If you are using the Postman Web app, select the **Postman Desktop Agent** in the bottom status bar, because the Cloud Agent cannot reach local IP addresses.

---

## 3. Recommended Sequential Testing Flow

The collection includes automated pre-request scripts and test scripts that automatically capture variables (e.g. `access_token`, `customer_id`, `conversation_id`, `appointment_id`, `ticket_id`, `lead_id`) into your environment.

Execute the requests in this order:

### Step 1: System Health
1. **`1. System Health > Health Check`**
   * Verifies the core Django REST API is live (`HTTP 200 OK`).
2. **`1. System Health > Database Health Check`**
   * Executes a live SQL query to verify database connectivity.

### Step 2: Authentication
3. **`2. Authentication > Register User`**
   * Registers a new account (`test_agent_user`).
   * Automatically extracts and saves `access_token` and `refresh_token` to your Postman environment.
4. **`2. Authentication > Login`**
   * Authenticates and updates tokens.
5. **`2. Authentication > Get Profile`**
   * Verifies Bearer JWT authorization and role settings.
6. **`2. Authentication > Refresh Token`**
   * Validates refresh token rotation.

### Step 3: Customer / Patient Management
7. **`3. Customers > Create Customer`**
   * Creates a customer/patient profile and saves `customer_id`.
8. **`3. Customers > List Customers`**
   * Lists active, paginated customers.

### Step 4: Knowledge Base Grounding
9. **`5. Knowledge Base > Create Knowledge Article`**
   * Creates a clinic knowledge article.
10. **`5. Knowledge Base > Search Knowledge Base`**
    * Searches for keywords and verifies grounded snippets.

### Step 5: Appointments, Availability, Rescheduling & Cancellation
11. **`6. Appointments > Check Availability`**
    * Checks open consultation slots for a given date during clinic hours (09:00 - 18:00, Mon-Sat).
12. **`6. Appointments > Book Appointment`**
    * Schedules a consultation with transactional locking and saves `appointment_id`.
13. **`6. Appointments > Reschedule Appointment (Preview)`**
    * Requests a new slot with `confirm: false` to receive a confirmation preview and policy notice.
14. **`6. Appointments > Reschedule Appointment (Confirm)`**
    * Confirms the reschedule (`confirm: true`), atomically updates time slot, and logs an audit trail.
15. **`6. Appointments > Cancel Appointment (Preview)`**
    * Requests cancellation with `confirm: false` to preview cancellation terms.
16. **`6. Appointments > Cancel Appointment (Confirm)`**
    * Confirms cancellation (`confirm: true`), updates status to `cancelled`, and logs an audit trail.

### Step 6: Conversations & Messaging
17. **`4. Conversations > Create Conversation`**
    * Starts a conversation thread associated with `customer_id`.
18. **`4. Conversations > Post Message to Conversation`**
    * Appends a customer message to the conversation.
19. **`4. Conversations > Get Conversation Messages`**
    * Retrieves chronological chat history.

### Step 7: AI Operations Agent & Multilingual Chat
20. **`9. AI Operations Agent > Discover Agent Tools`**
    * Inspects the registered tool catalog (knowledge search, scheduling, booking, cancellation, human escalation).
21. **`9. AI Operations Agent > Submit Message to AI Agent (English)`**
    * Submits inquiry grounded in clinic knowledge base.
22. **`9. AI Operations Agent > Submit Message in Hindi`**
    * Submits: `"मुझे डॉक्टर से अपॉइंटमेंट बुक करना है।"`
    * Verifies that the agent understands Hindi and responds in Hindi.
23. **`9. AI Operations Agent > Submit Message in Hinglish`**
    * Submits: `"Mujhe kal doctor se appointment book karna hai."`
    * Verifies that the agent understands Hinglish and responds in Hinglish.
24. **`9. AI Operations Agent > Medical Emergency Safety Check`**
    * Submits acute symptom message ("severe chest pain and cannot breathe").
    * Verifies emergency alert returned immediately with 112 / 102 guidance.
25. **`9. AI Operations Agent > Confirm Multi-turn Booking via Chat`**
    * Confirms pending proposal with `"Yes, please confirm this booking"`.

### Step 8: Support Tickets & Escalation
26. **`7. Support Tickets > Create Support Ticket`**
    * Generates a ticket (`TIK-XXXXXXXX`).
27. **`7. Support Tickets > Escalate Ticket`**
    * Executes human escalation with priority elevation to `urgent`.

### Step 9: CRM & Lead Conversion
28. **`8. CRM Leads > Create CRM Lead`**
    * Creates a lead record.
29. **`8. CRM Leads > Convert Lead to Customer`**
    * Atomically converts the lead into an active Customer record.

### Step 10: Analytics & Audit Trail
30. **`10. Analytics & Audit > Get Analytics Dashboard`**
    * Inspects aggregated metrics (customers, tickets, conversion rates).
31. **`10. Analytics & Audit > List Audit Logs`**
    * Verifies that all operations were logged in the audit trail.

### Step 11: Security & Cross-Patient Authorization
32. **`11. Security & Authorization Checks > Protected Endpoint Without Token`**
    * Verifies `401 Unauthorized` when JWT is omitted.
33. **`11. Security & Authorization Checks > Invalid Login Credentials`**
    * Verifies `401 Unauthorized` on incorrect password.
34. **`11. Security & Authorization Checks > Cross-Patient Conversation Access`**
    * Verifies `403 Forbidden` or `404 Not Found` when trying to access another patient's data.
