# PEACE (SUMALISM) CONGREGATION

The official web presence for **PEACE (SUMALISM) CONGREGATION**, a congregation of the Presbyterian Church of Ghana. The site provides congregation information, ministry groups, worship programmes, a photo slideshow and member administration.

## Current release

- Responsive congregation homepage with a hero slideshow.
- Published slideshow photos are managed from the administrator dashboard and can exceed six scenes.
- Member register with membership groups and death/deceased records.
- Presbyterian Church of Ghana crest branding and installable web-app manifest.
- Public information pages for ministries, news, events, hymns/resources, gallery and contact.

## Administrator access

Open /admin to sign in with an approved Supabase account. The current dashboard focuses on **Hero slideshow & gallery** and links to **Member registration & death records** at /admin/members. Creating an account alone does not grant administrator access.

## Technology

- Next.js App Router and React
- Supabase Auth, Postgres, and Storage
- Vercel deployment
- Responsive layout and PWA manifest

## Run locally

1. Install Node.js 20 or newer.
2. Run npm install.
3. Copy .env.example to .env.local and fill in the required Supabase URL and publishable/anon key.
4. Run npm run dev and open http://localhost:3000.
5. Run npm run build before submitting changes.

Never put a Supabase service-role key in browser-exposed environment variables or client-side code.

## Future expansion

This release is configured for PEACE (SUMALISM) CONGREGATION. Any future multi-congregation rollout must be designed and reviewed separately, including congregation-scoped database records and row-level security. Do not imply that other congregations are currently supported by the live administrator workflow.

## Deploy

Use the existing Vercel project connected to this repository. Verify the production deployment and test the homepage, slideshow, member register and /admin after each release.
