# nexhivra

## Environment Variables (Vercel + Local)

Required (Vite reads variables prefixed with `VITE_`):

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### Vercel (Dashboard)
1. Go to your Vercel Project → Settings → Environment Variables.
2. Add both variables for Production, Preview, and Development.
3. Redeploy the latest build (Deployments → Redeploy).

### Local development
Create a `.env.local` file:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Or copy from `env.example` and rename to `.env.local`.

## Build

Install and build locally:

```
pm ci
npm run build
npm run preview
```

If you see "Missing Supabase environment variables", ensure the env vars are set.
