# Worikambo Presbyterian Connect

A responsive Next.js starter for the Presbyterian Church of Ghana, Worikambo District.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add project credentials only when backend integration is configured.
4. Run `npm run dev` and open http://localhost:3000.

## Current phase

This commit contains the responsive public landing-page scaffold and PWA manifest. The public cards are currently informational. Authentication, member-only gallery access, admin management, database-backed content, forms, SMS, and audit logging are not yet implemented and must not be treated as live features. The Supabase schema should be reviewed against the existing project before any migration is applied.

## Deploy

Use the existing Vercel project and configure its Git repository to this repository. Set environment variables only when backend integration is ready.