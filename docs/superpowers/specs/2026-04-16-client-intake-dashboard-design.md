# Client Intake Dashboard — Design

**Date:** 2026-04-16
**Repo:** https://github.com/itdev-gr/info-website
**Status:** Design approved, pending user review before implementation plan.

## Summary

A web application for a web-development agency to collect client project information. The agency creates a client record and generates a unique intake link; the client opens the link and fills in their logo, description, a recommended site, file uploads (images and zips), and domain preferences. Once submitted, the agency team sees everything in a shared dashboard.

Two surfaces, one codebase:
- **Admin dashboard** — authenticated, used by the agency team.
- **Client intake form** — public, accessed only via a signed, time-limited link.

## Goals

- Eliminate back-and-forth email threads when onboarding new clients.
- Capture all assets (logo, images, zipped folders) in one place.
- Give the agency team a single pane of glass for every client's onboarding status.
- Keep the client-facing form frictionless — no account creation, no login.

## Non-goals

- Automated domain purchasing (capture preferences only — purchase is manual).
- Project management / invoicing / CRM features beyond intake.
- Public self-signup for new agency team members (invites are manual via Supabase dashboard).
- Real-time collaboration on the intake form (one client, one form, one submission).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Language | TypeScript |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email + password) |
| File storage | Supabase Storage |
| Email | Resend |
| Hosting | Vercel |
| File uploads | `tus-js-client` + Supabase Storage resumable uploads |
| Forms | `react-hook-form` + `zod` for validation |

**Supabase project URL:** `https://dakvgxcvwnbedykwpzmm.supabase.co`
(Credentials live only in `.env.local` and Vercel env vars — never committed.)

## Architecture

### Surface A — Admin dashboard (authenticated)

| Route | Purpose |
|---|---|
| `/login` | Email + password login |
| `/dashboard` | Table of all clients with status, last updated, actions |
| `/dashboard/clients/new` | Modal: enter client name → create record → show intake link |
| `/dashboard/clients/[id]` | Client detail — submitted info, gallery, files, regenerate link |

Middleware on every `/dashboard/*` route validates the Supabase session; unauthenticated visitors redirect to `/login`.

### Surface B — Client intake form (public)

| Route | Purpose |
|---|---|
| `/intake/[token]` | Server-validates token, renders form |
| `/intake/[token]/success` | Thank-you page after submission |

Invalid/expired/used tokens render a friendly "link expired, contact your agency" page.

### Backend

| Concern | Implementation |
|---|---|
| Token-validated upload URLs | `/api/intake/[token]/upload` — returns signed upload URL |
| File metadata write | `/api/intake/[token]/files` |
| Final submission | `/api/intake/[token]/submit` — atomic DB transaction |
| Link generation (admin) | `/api/clients/[id]/link` — authed |
| Link revocation (admin) | `/api/clients/[id]/link/revoke` — authed |
| Team notification | Resend email fired on successful submission |

## Database schema

### `clients`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `name` | text NOT NULL | Client / company name |
| `status` | enum | `invited`, `submitted`, `archived` |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | trigger updates on change |
| `created_by` | uuid → `auth.users` | Which team member created it |
| `submitted_at` | timestamptz NULL | Set on successful submission |

### `client_submissions`

One row per client (1:1 with `clients`).

| Column | Type | Notes |
|---|---|---|
| `client_id` | uuid PK → `clients` | |
| `logo_url` | text NULL | Path in `client-logos` bucket |
| `description` | text | General description from client |
| `recommended_site` | text | URL of a reference site |
| `has_existing_domain` | boolean NOT NULL | |
| `existing_domain` | text NULL | Populated if `has_existing_domain = true` |
| `domain_suggestions` | text[] | Max 3 entries; check constraint enforces `array_length <= 3` |
| `submitted_at` | timestamptz | Copy of `clients.submitted_at` for convenience |

### `client_files`

Many rows per client.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid → `clients` | |
| `file_name` | text | Original filename |
| `file_size` | bigint | Bytes |
| `mime_type` | text | |
| `storage_path` | text | Path in `client-files` bucket |
| `uploaded_at` | timestamptz | default now() |

### `intake_links`

One row per generated link.

| Column | Type | Notes |
|---|---|---|
| `token` | uuid PK | URL-safe random id |
| `client_id` | uuid → `clients` | |
| `created_at` | timestamptz | default now() |
| `expires_at` | timestamptz | default now() + interval `'7 days'` |
| `used_at` | timestamptz NULL | Set on submission — invalidates link |
| `revoked` | boolean | default false — manual kill switch |

### Row-level security

- All dashboard tables: readable/writable only by authenticated users (Supabase JWT present). No per-row ownership filter — the whole team sees everything.
- Anonymous writes to `client_submissions`, `client_files`, and `client-files` storage bucket are permitted **only** via server-side API routes that have already verified a valid intake token using the service-role key. Anonymous RLS policies on these tables reject direct writes.
- `intake_links`: readable only server-side with service role; clients never touch it directly.

## File uploads

### Buckets

- `client-logos` (private, one object per client, keyed by `client_id`)
- `client-files` (private, prefixed by `client_id/<uuid>-<filename>`)

### Flow

1. Client selects files in the intake form's dropzone (supports drag-drop, click, `webkitdirectory` for folders, any mime type).
2. Browser requests a signed upload URL from `/api/intake/[token]/upload`. Server validates token and total-size quota before issuing.
3. Browser uploads directly to Supabase Storage using `tus-js-client` (resumable, survives network hiccups, progress bars per file).
4. On upload success, browser POSTs metadata (filename, size, mime, storage path) to `/api/intake/[token]/files`.
5. Client can remove files from the dropzone before final submit — removal deletes the metadata row and the storage object.
6. Final "Submit" click → `/api/intake/[token]/submit` runs the atomic DB transaction.

### Limits

- Per-file: **500 MB**
- Per-client total: **5 GB** (checked server-side on every signed-URL request)
- Exceeding returns a clear error surfaced in the dropzone UI.

### Zip handling

- Zips stored as-is. No server-side extraction (avoids Vercel compute limits and security risk).
- Admin dashboard renders zips as cards with a "Download" button that requests a fresh signed URL (1-hour expiry).
- Image files also render as thumbnails in a gallery grid.

## Intake link flow

### Generating a link (admin)

1. Admin opens a client's detail page → clicks "Generate intake link."
2. Server inserts `intake_links` row: new uuid token, `expires_at = now() + 7 days`, `used_at = null`, `revoked = false`.
3. Dashboard shows `https://<app>.vercel.app/intake/{token}` with "Copy" button and optional "Send via email" (fires Resend email to a provided address).

### Client opens the link

1. `/intake/[token]` page is server-rendered.
2. Server validates: token exists AND `revoked = false` AND `used_at IS NULL` AND `expires_at > now()`.
3. Invalid → static "link expired" page with contact instructions.
4. Valid → render intake form, pre-filled with `clients.name`.

### Client submits

1. Final POST hits `/api/intake/[token]/submit` with form data + uploaded file metadata.
2. Server re-validates token (guards against simultaneous submission race).
3. Single transaction:
   - `INSERT INTO client_submissions` (or `UPDATE` if a draft existed).
   - `UPDATE intake_links SET used_at = now()` — link now dead.
   - `UPDATE clients SET status = 'submitted', submitted_at = now()`.
4. Client redirected to `/intake/[token]/success` (thank-you page).
5. Resend fires an email to every team member's address: "Client {name} submitted their intake form. View: `/dashboard/clients/{id}`."

### Regenerating a link

- Admin clicks "Resend link" → server sets old row's `revoked = true` and inserts new row with fresh token. Old URL stops working immediately; new URL shown.

### Security properties

- 128-bit uuid tokens — unguessable.
- 7-day expiry.
- One-time use (`used_at`).
- Manual revoke (`revoked`).
- All anonymous writes require a server-verified valid token.
- Rate limit `/api/intake/*` endpoints (e.g., 30 req/min per IP using Upstash or in-memory).

## Auth

- Supabase Auth, email + password (magic-link also available).
- No `/signup` route — team members invited from Supabase dashboard.
- `@supabase/ssr` manages session cookies across Next.js server components, client components, and route handlers.
- Middleware (`middleware.ts`) enforces session on all `/dashboard/*` routes.

## Notifications

Resend (free tier, 3k emails/month) handles two email types:

1. **Intake invite (optional):** admin-triggered from the generate-link modal. Sends the URL to a provided client email.
2. **Submission alert:** fires automatically on successful submission. Recipients = every row in `auth.users` with a valid email. Uses a simple HTML template with client name and dashboard link.

## UI overview

- **shadcn/ui** components: `Button`, `Input`, `Textarea`, `Table`, `Dialog`, `Toast`, `Checkbox`, `Badge`, `Card`, `Avatar`, `Tooltip`.
- **Custom components:**
  - `ClientTable` — sortable/filterable client list.
  - `ClientStatusBadge` — colored pill for `invited`/`submitted`/`archived`.
  - `FileDropzone` — react-dropzone + tus progress + remove buttons.
  - `FileGallery` — grid of image thumbs + zip cards on client detail.
  - `DomainSection` — checkbox + conditional text input(s), max 3 suggestions.
- Tailwind config: default theme, dark mode ready (class strategy), agency-neutral palette.

## Deployment

- **Source:** GitHub `itdev-gr/info-website`.
- **CI/CD:** Vercel auto-deploys `main` on push. Preview deploys on PRs.
- **Supabase migrations:** `supabase/migrations/*.sql`, applied via Supabase CLI in a GitHub Action or manually before deploy.
- **Env vars** (set in Vercel + `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `NEXT_PUBLIC_APP_URL`

## Testing strategy

- **Unit:** Vitest for pure functions (validators, token checks, quota math).
- **Integration:** Playwright for the two critical flows — admin creates client + copies link, client opens link + uploads files + submits.
- **DB:** Supabase local emulator for RLS policy tests before each deploy.

## Open decisions (for the plan phase)

- Exact table layout for the client list (columns, filters, sort defaults).
- Intake form section order and copy.
- Email template styling (plain-text vs HTML).
- Onboarding for the very first agency team member (manual Supabase invite for initial rollout).

These are design-level details the implementation plan will settle.

## Out of scope for this spec

- Automated domain purchasing.
- Multi-tenant (multiple agencies on the same instance).
- Client-editable submissions after initial submit.
- File versioning / history.
- Analytics / reporting pages beyond the client list.
