```markdown
# D2 — Logical Design & Data Insertion Prototype

This is a minimal Express.js application demonstrating validated insertion of data into the MySQL schema for the D2 deliverable.

Contents
- 01_schema.sql — schema creation
- 02_seed.sql — expanded seed data (>=10 rows per table where applicable)
- Node.js app demonstrating insertion for Users, Events, Reservations, Transactions/Payments

Requirements
- Node.js 16+
- MySQL 8+ (or MySQL 5.7 with limited CHECK support)

Setup
1. Create database `d2` (or modify .env accordingly).
2. Run the schema and seed:
   - mysql -u root -p d2 < 01_schema.sql
   - mysql -u root -p d2 < 02_seed.sql
3. Copy `.env.example` to `.env` and fill credentials.
4. Install dependencies:
   - npm install
5. Start app:
   - npm start
6. Open forms:
   - http://localhost:3000/users/new
   - http://localhost:3000/events/new
   - http://localhost:3000/reservations/new

Notes
- All DB operations use prepared statements via `mysql2` to avoid SQL injection.
- Validation is implemented using `express-validator`.
- The app is intentionally minimal: it focuses on Create (insertion) flows only as required by D2.

Screenshots
- Include MySQL Workbench screenshots showing populated tables (not included in repo).
```