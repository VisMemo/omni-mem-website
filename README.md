# omni-mem-website

## Overview
Marketing website for the Omni Memory product. This app is deployed to Vercel and talks to the
Qbrain user-management backend hosted on Alibaba Cloud via a public API.

## Architecture
- Frontend: Vite + React + Tailwind + NextUI (this repo).
- Backend: Qbrain_Saas (Fastify API + Supabase + Redis + worker).
- Auth: Bearer token on the frontend, sent via `Authorization: Bearer <token>`.
- API base URL: configure `API_BASE_URL` to the public API endpoint.

## Deployment
- Vercel hosts the frontend.
- Alibaba Cloud hosts the backend (API + worker).
- Supabase/RDS are hosted separately; local dev uses Supabase CLI.

## Environment
Minimum frontend env vars:
- `VITE_API_BASE_URL` (public API endpoint)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Local setup:
```bash
cp .env.example .env.local
```

## Status
Completed:
- Omni Memory marketing UI and layout.

In progress:
- User login and profile integration with Qbrain_Saas APIs.

Planned:
- API client wrapper with auth header injection.
- Error handling and loading states for user data.
- CORS validation with Vercel origin allowlist.

## Notes
- Keep dependencies isolated between `omni-mem-website` and `Qbrain_Saas`.
- Align API routes and auth contracts before production cutover.
