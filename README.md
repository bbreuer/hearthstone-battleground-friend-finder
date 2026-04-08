# Bob's Buddy Board

A Hearthstone Battlegrounds friend-finder website with:

- Battle.net OAuth login
- Player profiles with Battlegrounds rank / MMR
- Screenshot uploads for recent games
- A public community feed for finding friends and sharing boards
- Vercel-ready storage using Postgres + Vercel Blob

## Local setup

1. Install dependencies:

```powershell
npm install
```

2. Make sure `.env.local` contains your dev credentials and storage values.

Important:

- `BATTLE_NET_REDIRECT_URI` must exactly match the callback URL configured in the Blizzard developer portal.
- For local development, Blizzard may reject plain `http://localhost` callbacks. If that happens, use HTTPS localhost or a secure tunnel URL and register that exact URL in Blizzard.
- `POSTGRES_URL` must point at a real Postgres database.
- `BLOB_READ_WRITE_TOKEN` must come from a connected Vercel Blob store.

3. Start the app:

```powershell
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Vercel deployment

1. Push this repo to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. In the Vercel project, create a public Blob store. Vercel adds `BLOB_READ_WRITE_TOKEN` when the store is connected to the project.
4. Add a Postgres integration from the Vercel Marketplace, such as Neon or Supabase, and copy the injected `POSTGRES_URL`.
5. Add these environment variables in Vercel:

```text
APP_URL=https://your-project.vercel.app
SESSION_SECRET=your-long-random-secret
BATTLE_NET_CLIENT_ID=your-blizzard-client-id
BATTLE_NET_CLIENT_SECRET=your-blizzard-client-secret
BATTLE_NET_REGION=us
BATTLE_NET_REDIRECT_URI=https://your-project.vercel.app/api/auth/bnet/callback
POSTGRES_URL=your-postgres-connection-string
BLOB_READ_WRITE_TOKEN=your-blob-token
```

6. In the Blizzard developer portal, set the callback URL to the same deployed callback:

```text
https://your-project.vercel.app/api/auth/bnet/callback
```

7. Redeploy.

## Battle.net notes

- The app uses Blizzard OAuth to sign users in and pull their BattleTag from `/oauth/userinfo`.
- The app is configured against Blizzard's `https://oauth.battle.net` OAuth endpoints.
- Battle.net login gives us account identity cleanly.
- Blizzard does not appear to expose a documented private Battlegrounds MMR endpoint for any authenticated user, so this MVP stores the Battlegrounds rank on the user profile after sign-in.

## Important for production

- Replace `SESSION_SECRET` with a strong random value.
- Because `.env.local` is ignored, your client secret stays out of git by default.
