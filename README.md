# Stay Smart Local Run

## Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start PostgreSQL:
```bash
npm run db:start
```

3. Apply Prisma schema:
```bash
npm run prisma:push
```

4. Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`.

## Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start frontend:
```bash
npm run dev
```

Frontend runs on Vite default port, usually `http://localhost:5173`.

## Demo Accounts

All demo users use password `demo1234`.

- Guest: `guest@staysmart.app`
- Host: `host@staysmart.app`
- Manager: `manager@staysmart.app`

## Demo Flow

1. Login as `Host` from the top-right menu.
2. Open `Host` and create a new listing from `Add New`.
3. Login as `Manager` and open `Manager review`.
4. Approve the pending listing.
5. Login as `Guest`, open the listing, and create a reservation.
6. Open `Reservations` and cancel it if you want to show the full lifecycle.

## Tests

Run backend e2e tests after PostgreSQL is started and schema is pushed:
```bash
cd backend
npm run test:e2e
```

## Seed Demo Data

After PostgreSQL is started and schema is pushed, run:

```bash
cd backend
npm run prisma:seed
```

## Local env

`backend/.env` and `backend/.env.example` are configured for this local setup:

```env
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=stay_smart_db
DATABASE_URL="postgresql://postgres:1234@localhost:5432/stay_smart_db?schema=public"
PORT=3000
NODE_ENV=development
```
