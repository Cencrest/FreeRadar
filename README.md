# FreeRadar MVP

A deployable MVP for a free-items discovery app.

## What is included

- Public homepage and searchable listings feed
- Listing detail pages
- Supabase email/password auth
- User dashboard
- Favorites
- User submissions
- Admin moderation page
- JSON APIs for listings, alerts, submissions, and admin ingestion
- Email alert job using Resend
- Vercel cron configuration
- SQL migration and seed data

## What is intentionally not included yet

- Scraping Craigslist, Facebook Marketplace, or Instagram directly
- Geocoding and true radius search
- Payment provider
- Native mobile app
- Push notifications
- Advanced moderation queue
- Full analytics stack

The app is built so those can be layered in later.

## Stack

- Next.js App Router
- Supabase (Postgres + Auth)
- Resend
- Vercel

## Local setup

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/0001_init.sql`.
3. Run the SQL in `supabase/seed.sql`.
4. Copy `.env.example` to `.env.local` and fill in the values.
5. Install dependencies:
   ```bash
   npm install
   ```
6. Start the app:
   ```bash
   npm run dev
   ```

## Recommended launch services

### Required

- **Vercel** for hosting the Next.js app
- **Supabase** for auth and database
- **Resend** for email alerts
- **A domain registrar** like Namecheap, Porkbun, or Cloudflare Registrar

### Optional later

- A billing provider such as Lemon Squeezy, Paddle, or PayPal
- Sentry for error tracking
- A separate scheduler if you want sub-daily jobs on a low-cost plan
- Object storage if you want direct image uploads instead of external URLs

## Important environment variables

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ALERTS_FROM_EMAIL=
CRON_SECRET=
ADMIN_INGEST_KEY=
```

## Make yourself admin

After creating a user in the UI, run this SQL in Supabase:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

## Admin ingestion endpoint

This app includes a secure server endpoint for trusted imports:

`POST /api/admin/ingest`

Auth header:
```txt
Authorization: Bearer YOUR_ADMIN_INGEST_KEY
```

Payload:
```json
{
  "listings": [
    {
      "title": "Free desk",
      "description": "Curb pickup tonight",
      "source_name": "manual",
      "source_url": "https://example.com/free-desk",
      "category": "furniture",
      "city": "Queens",
      "state": "NY",
      "zip": "11368"
    }
  ]
}
```

## Alert cron job

`vercel.json` is configured to hit:

`/api/cron/alerts`

That route checks:
- `Authorization: Bearer ${CRON_SECRET}`
- matching listings for each alert
- already-sent matches so users are not spammed with the same listing twice
- sends email through Resend

## Suggested next upgrades

1. Add geocoding and true distance filtering
2. Add a source adapter layer for approved feeds
3. Add premium plans behind a billing adapter
4. Add map view
5. Add moderation tools and analytics
