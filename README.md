```markdown
# D3 — Full System Implementation & Use-Case Satisfaction

Express + MySQL implementation covering CRUD for the core ticketing entities defined in earlier deliverables. Each use case has a matching form/page for insert, update, delete, and view.

Contents
- `01_schema.sql` — updated schema.
- `02_seed.sql` — final seed data.
- Node.js app with CRUD for Users, Events, Reservations (holds) using prepared statements, validation, and connection pooling.

Requirements
- Node.js 16+
- MySQL 8+ (or MySQL 5.7 with limited CHECK support)

Setup
1. Create database `d2` (or modify `.env` accordingly).
2. Apply schema and seed:
   - `mysql -u root -p d2 < 01_schema.sql`
   - `mysql -u root -p d2 < 02_seed.sql`
3. Create a `.env` file with `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
4. Install dependencies: `npm install`
5. Start the app: `npm start`
6. Open the dashboard: `http://localhost:3000/`
   - Users: list `/users`, create `/users/new`, edit `/users/:id/edit`
   - Events: list `/events`, create `/events/new`, edit `/events/:id/edit`
   - Reservations: list `/reservations`, create `/reservations/new`, edit `/reservations/:id/edit`

Notes
- All DB operations use prepared statements via `mysql2` to avoid SQL injection.
- Validation is implemented using `express-validator` for every write route.
- Connection pooling is configured in `db.js`.
- User passwords are hashed with PBKDF2 + random salt before storing in the `hashed_password` column (swap with bcrypt/Argon2 in production).
```
