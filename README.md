========================================================================
             M&G EQUIPMENT SCHEDULING SYSTEM - DOCUMENTATION
========================================================================

1. PROJECT OVERVIEW
-------------------
The M&G Equipment Scheduling System is a full-stack, decoupled 
application designed to manage heavy machinery, AV equipment, and power 
tool rentals. It features a React-based management dashboard, a 
Spring Boot REST API, and a cloud-distributed MySQL database.

2. SYSTEM ARCHITECTURE & HOSTING
--------------------------------
The application is hosted across a distributed cloud environment to 
ensure high availability and security.

A. FRONTEND (User Interface)
   - Host: Vercel
   - URL:  https://m-g-equipment-client.vercel.app/
   - Tech: React (Vite), Lucide-React, Axios
   - Role: Handles user interactions, dashboard visualization, and 
           JWT storage (localStorage).

B. BACKEND (Logic & Security)
   - Host: Render
   - URL:  https://m-g-equipment-server-springboot.onrender.com
   - Tech: Java, Spring Boot, Spring Security, JWT, Hibernate
   - Role: Orchestrates business logic, manages authentication via 
           custom filters, and enforces CORS policies.

C. DATABASE (Storage)
   - Host: TiDB Cloud
   - Tech: MySQL-Compatible Distributed SQL
   - Schema: equipment_scheduler
   - Role: Persistent storage for assets, users, and bookings.

3. SECURITY & AUTHENTICATION
----------------------------
- Authentication: Stateless JWT (JSON Web Token) tokens.
- Security Protocol: Custom Spring Security Filter Chain.
- Access Control: 
    * Public: /api/auth/** (Login, Registration)
    * Restricted: /api/dashboard/** (Requires ADMIN or STAFF role)
- CORS: Explicitly configured to allow requests from the Vercel 
        production domain and local development (localhost:5173).

4. ENVIRONMENT CONFIGURATION
----------------------------
For developers running the system locally:

[FRONTEND]
Variable: VITE_API_URL
Value:    http://localhost:8080 (Local) or Render URL (Production)

[BACKEND]
Spring Profile: Production
DDL-Auto:       update
Driver:         com.mysql.cj.jdbc.Driver

5. KEY FEATURES
---------------
- Real-time inventory tracking (Assets).
- Customer management with Quick-Add functionality.
- Automated invoice generation and PDF reporting.
- Role-based dashboard analytics.

========================================================================
Generated on: 2026-04-09
========================================================================
