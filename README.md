# Worikambo Presbyterian Connect

A responsive Next.js website for **Worikambo Presbyterian Church**, built to support the church's public information and an administrator-managed content workspace.

## Phase 1 — one congregation

The first release is focused on one congregation. The website includes the public home page, church information, ministries, news and announcements, events, Sunday service programme, gallery, hymns/resources, devotional information, contact page, and an admin dashboard for managing supported content.

The admin dashboard is available at `/admin`. Access depends on Supabase authentication and the user's record in `church_admins`; creating an account alone does not grant administrator access.

## Technology

- Next.js App Router and React
- Supabase Auth, Postgres, and Storage
- Vercel deployment
- Responsive layout and PWA manifest

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the required Supabase URL and publishable/anon key.
4. Run `npm run dev` and open http://localhost:3000.
5. Run `npm run build` before submitting changes.

Never put a Supabase service-role key in browser-exposed environment variables or client-side code.

## Future multi-congregation path

Do not duplicate the app for each church. Before opening the platform to more congregations, introduce a `congregation_id` foreign key on congregation-owned content (posts, gallery, ministries, page content, programmes and resources), seed a stable record for Worikambo Presbyterian Church, and update admin forms and queries to use the selected congregation. Add and test row-level security policies that enforce congregation boundaries before any other congregation is onboarded. Keep district-wide roles separate from congregation-level administrator/editor roles.

This future schema change should be delivered as a reviewed Supabase migration and tested against existing data; it is intentionally not applied as part of the Phase 1 homepage simplification.

## Deploy

Use the existing Vercel project connected to this repository. Verify the production deployment and test the homepage, public content pages, and `/admin` after each release.
