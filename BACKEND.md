# Backend Architecture

## Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Runtime      | Node.js                                 |
| Language     | TypeScript (strict mode)                |
| Framework    | Express 4                               |
| ORM          | Prisma 5                                |
| Database     | PostgreSQL 16                           |
| Validation   | Zod                                     |
| Auth         | JWT (jsonwebtoken) + bcryptjs           |
| Dev server   | tsx watch (no build needed in dev)      |

---

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Single source of truth for the DB schema
├── src/
│   ├── config/
│   │   ├── env.ts             # Reads .env into a typed object — used everywhere
│   │   └── prisma.ts          # Singleton Prisma client (safe for hot-reload in dev)
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── report.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Verifies JWT, attaches req.user
│   │   ├── error.middleware.ts  # Central Express error handler
│   │   └── validate.middleware.ts # Runs a Zod schema against body/query/params
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── report.routes.ts
│   │   └── index.ts           # Mounts both routers under /api
│   ├── schemas/
│   │   ├── auth.schema.ts     # Zod schemas for login + change-password
│   │   └── report.schema.ts   # Zod schemas for month entry, yearly summary, year query
│   ├── services/
│   │   ├── auth.service.ts    # Business logic: login, getMe, changePassword
│   │   └── report.service.ts  # Business logic: upsert month, upsert summary, fetch
│   ├── types/
│   │   └── express.d.ts       # Augments Express.Request with req.user
│   ├── utils/
│   │   ├── jwt.ts             # signToken / verifyToken wrappers
│   │   └── response.ts        # sendSuccess / sendError — uniform JSON shape
│   ├── seed.ts                # Creates the first admin user
│   └── index.ts               # Bootstraps Express, connects to DB, starts server
├── .env.example               # Template — copy to .env before running
├── package.json
└── tsconfig.json
```

---

## Database Tables (3 total)

### 1. `User`

Stores login credentials and role.

| Column      | Type      | Notes                              |
|-------------|-----------|------------------------------------|
| id          | UUID (PK) | Auto-generated                     |
| email       | String    | Unique — used to log in            |
| password    | String    | bcrypt hash (cost 12)              |
| name        | String    |                                    |
| role        | Enum      | `ADMIN` or `MANAGER`               |
| isActive    | Boolean   | Soft disable without deleting      |
| createdAt   | DateTime  |                                    |
| updatedAt   | DateTime  | Auto-updated by Prisma             |

The `Role` enum is defined in the Prisma schema. Currently only `ADMIN` is used — `MANAGER` is wired up in the schema and the middleware `authorize()` helper, ready to activate.

---

### 2. `SoleReport`

One row per month per financial year. All production columns are nullable so partial data can be saved without validation errors.

| Column          | Type      | Notes                                              |
|-----------------|-----------|----------------------------------------------------|
| id              | UUID (PK) |                                                    |
| year            | Int       | e.g. `2025`                                        |
| month           | Int       | 1–12                                               |
| monthName       | String    | Lowercase full name, e.g. `"may"`, `"october"`     |
| totalProduction | Int?      | Total soles produced                               |
| trimmer         | Int?      | Trimmer operation count                            |
| buffing         | Int?      | Buffing operation count                            |
| repair          | Int?      | Repair count                                       |
| packed          | String?   | Free-text field — stores values like `49/3`, `16b` |
| balance         | Float?    |                                                    |
| purchaseQty     | Float?    | Units purchased                                    |
| purchaseAmt     | Float?    | Rupee amount spent on purchase                     |
| createdAt       | DateTime  |                                                    |
| updatedAt       | DateTime  |                                                    |
| createdById     | String    | FK → User.id                                       |

**Constraints:**
- `@@unique([year, month])` — enforces one row per month per year. This is what makes upsert work — you can re-save a row and it updates in place rather than creating a duplicate.
- `@@index([year])` — speeds up the "fetch all rows for a year" query.

---

### 3. `YearlySummary`

One row per financial year. Stores the manually entered labor total and expense total. Grand total is auto-computed as `laborTotal + expenseTotal` at save time (not a DB column formula — computed in the service layer before the write).

| Column      | Type      | Notes                                |
|-------------|-----------|--------------------------------------|
| id          | UUID (PK) |                                      |
| year        | Int       | Unique — one summary per year        |
| laborTotal  | Float?    | Total labor cost for the year        |
| expenseTotal| Float?    | Total expense cost for the year      |
| grandTotal  | Float?    | Computed: laborTotal + expenseTotal  |
| createdAt   | DateTime  |                                      |
| updatedAt   | DateTime  |                                      |
| createdById | String    | FK → User.id                         |

---

## How Data Flows

```
HTTP Request
    │
    ├── validate.middleware (Zod parses body/query/params)
    │       If invalid → 400 with field-level errors, request stops here
    │
    ├── auth.middleware (for protected routes)
    │       Reads Authorization: Bearer <token>
    │       Verifies JWT → attaches decoded payload to req.user
    │       If invalid → 401, request stops here
    │
    ├── Controller
    │       Thin layer — extracts req.body/req.user, calls service
    │
    ├── Service
    │       All business logic lives here
    │       Calls Prisma (which talks to PostgreSQL)
    │
    └── Response
            sendSuccess(res, data) → { success: true, message, data }
            sendError(res, msg)   → { success: false, message }
```

---

## API Routes

All routes are under `/api`.

### Auth — `/api/auth`

| Method | Path              | Auth? | What it does                          |
|--------|-------------------|-------|---------------------------------------|
| POST   | `/login`          | No    | Returns JWT + user object             |
| GET    | `/me`             | Yes   | Returns current user's profile        |
| PUT    | `/change-password`| Yes   | Validates old password, saves new one |

### Reports — `/api/reports`

All report routes require a valid JWT.

| Method | Path                       | What it does                                         |
|--------|----------------------------|------------------------------------------------------|
| GET    | `/?year=2025`              | Returns all month rows + yearly summary for that year|
| POST   | `/month`                   | Upsert (create or update) a single month's row       |
| DELETE | `/month/:year/:month`      | Delete a single month's row                          |
| POST   | `/summary`                 | Upsert the yearly labor/expense summary              |
| GET    | `/years`                   | Returns list of years that have at least one row     |

---

## Authentication Model

- On login: password is compared with bcrypt, a JWT is signed with `id`, `email`, `role`, `name` as payload.
- Token expiry: 7 days (configurable via `JWT_EXPIRES_IN` in .env).
- Token is sent as `Authorization: Bearer <token>` on every request.
- No refresh token — if the token expires the user logs in again. This is fine for the current use case (internal tool, single admin).
- Passwords are hashed with bcrypt cost factor 12.

---

## Validation Strategy

Every route that accepts input has a Zod schema in `src/schemas/`. The `validate()` middleware runs the schema before the controller is called. If validation fails, a structured error is returned immediately — the controller never runs.

Example error shape:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "month", "message": "Number must be between 1 and 12" }
  ]
}
```

---

## Environment Variables

```
DATABASE_URL     PostgreSQL connection string
JWT_SECRET       Secret key for signing JWTs — must be long and random in production
JWT_EXPIRES_IN   Token lifetime — default "7d"
PORT             Server port — default 3001
NODE_ENV         "development" or "production"
CORS_ORIGIN      Frontend origin — default "http://localhost:5173"
```

---

## First-Time Setup Commands

```bash
cd backend
cp .env.example .env           # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:generate            # generates the Prisma client
npm run db:migrate             # creates all tables in PostgreSQL
npm run db:seed                # inserts admin user (admin@solereport.com / Admin@123)
npm run dev                    # starts dev server with hot reload
```

---

## Adding a Manager Role (when ready)

1. No schema changes needed — `Role` enum already has `MANAGER`.
2. Add a `POST /api/users` route (admin only) to create users with `role: MANAGER`.
3. Lock specific routes with `authorize('ADMIN')` or `authorize('ADMIN', 'MANAGER')`.
4. That's it.
