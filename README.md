# FindBack PH

Lost-and-found platform for the Philippines, built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Start locally

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `AUTH_SECRET`.
3. Run `npm install`, `npx prisma generate`, `npx prisma migrate dev --name init`, `npx prisma db seed`, then `npm run dev`.

Open `http://localhost:3000`. Development seed account: `demo@findback.local` / `DemoPass123!` (never use in production).

## External services

PostgreSQL is required. Supabase Storage values are reserved for production image storage, Mapbox is optional (use an OpenStreetMap integration when enabled), and Resend is optional for transactional email. None is hardcoded. Uploaded-media storage and provider adapters should be configured before a public production deployment.

## Security and functionality

Credentials use bcrypt password hashes and signed HTTP-only cookies. Server actions validate input with Zod; Prisma parameterization protects queries. Public item pages omit serial numbers, proof, and distinguishing verification details. Admin checks run server-side.
