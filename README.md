# Agency Client Intake

Internal dashboard + client-facing intake form for the agency's project onboarding.

## Local development

1. Copy `.env.local.example` to `.env.local` and fill in real values.
2. Apply the SQL migrations under `supabase/migrations/` to your Supabase project (SQL editor or `npx supabase db push`).
3. Install deps: `npm install`
4. Run dev server: `npm run dev` (http://localhost:3000)
5. Invite yourself as a team member in the Supabase dashboard (Auth → Users → Invite user).

## Testing

- Unit: `npm test`
- E2E: `npm run test:e2e` (requires `.env.local`)
- Typecheck: `npm run typecheck`

## Deployment

1. Push to `github.com/itdev-gr/info-website`.
2. Import the repo into Vercel.
3. Set env vars in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (the production URL Vercel gives you)
4. Deploy.
5. Set the `NEXT_PUBLIC_APP_URL` to the final production URL after the first deploy and redeploy.

## Adding a team member

Supabase Dashboard → Authentication → Users → "Invite user". They receive an email; after they set a password they can sign in at `/login`.

## Generating new intake links

Dashboard → pick a client → "Intake link" box → "Generate" (first time) or "Regenerate" (subsequent). Copy the URL and send to the client.

Links expire after 7 days and stop working after the client submits.
