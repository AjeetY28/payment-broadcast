# Vercel Deployment Guide (Client + Serverless APIs)

This guide automates and documents deployment of this repo to Vercel (both the React client and serverless API endpoints).

Important: Do NOT commit your service-account JSON to the repository. The scripts below use Vercel secrets.

Prerequisites
- Node.js + npm
- Vercel CLI: `npm i -g vercel`
- A service-account JSON file from Google Cloud (downloaded for your project)

Recommended approach (secure)
1. Place your service account JSON at `server/credentials/google-credentials.json` locally.
2. Run the appropriate setup script below (bash or PowerShell) from the repo root:

  Bash (Linux/macOS/Git Bash/WSL):

  ```bash
  bash scripts/vercel-setup.sh
  ```

  PowerShell (Windows):

  ```powershell
  .\scripts\vercel-setup.ps1
  ```


What the script does
- Encodes `server/credentials/google-credentials.json` to base64
- Adds a Vercel secret named `google-creds`
- Attempts to add an environment variable `GOOGLE_CREDS_JSON` referencing the secret
- Runs `vercel --prod` to deploy the project

Important: Vercel Project Settings vs `vercel.json`
- If `vercel.json` contains a `builds` array, Vercel will ignore the Build & Development Settings in the Project Settings UI and use the `builds` configuration from the file. If you prefer to manage build settings in the Vercel dashboard (Build Command, Output Directory, Root Directory), remove the `builds` array from `vercel.json`.
- This repository's `vercel.json` has been updated to remove `builds` so you can use the Project Settings UI to configure builds.

How to configure Project Settings (recommended when `vercel.json` has no `builds`):
1. Open Vercel Dashboard → your Project → Settings → General.
2. Under "Root Directory" set: `client` (so Vercel will run builds inside the `client` folder).
3. Under "Build & Output Settings" set:
  - Build Command: `npm run build`
  - Output Directory: `build`
4. Save changes and trigger a new deployment (via CLI `vercel --prod` or Dashboard "Redeploy").

Notes
- With `builds` removed, Vercel will auto-detect serverless functions placed under the top-level `api/` directory and build them automatically.
- If you prefer to keep `vercel.json` with `builds`, you can — but Vercel will then ignore the UI project build settings. Choose one approach and keep it consistent.
 
New environment variables
- `REACT_APP_API_BASE` (client): set this in `client/.env` or as an env var at build time. Example values:
  - Development: `http://localhost:3001`
  - Production (serverless via Vercel): `/api`

- `SERVER_BASE_URL` (server): optional. If set, the server will report this value as its `baseUrl` in `/health`. Useful when your server is behind a proxy or has a public domain. Example: `https://your-deploy.vercel.app`

Examples (local)
- `client/.env`:
  ```text
  REACT_APP_API_BASE=http://localhost:3001
  ```
- `server/.env`:
  ```text
  PORT=3001
  SERVER_BASE_URL=http://localhost:3001
  ENABLE_SHEET_MONITORING=false
  ```


Manual alternative (UI)
1. Go to your Vercel Project → Settings → Git → Environment Variables.
2. Add `SHEET_ID`, `ENABLE_SHEET_MONITORING` (set to `false` for serverless), and any other secrets.
3. Go to Project → Settings → Secrets and add a new secret named `google-creds` containing the base64-encoded JSON.
4. Add an environment variable `GOOGLE_CREDS_JSON` with value `@google-creds`.
5. Deploy from the Vercel dashboard or run `vercel --prod` locally.

Verification
- Open the deployment URL (provided after `vercel --prod`).
- Health check endpoint (serverless function): `https://<deployment>/api/health` or `https://<deployment>/health`.
- Check function logs in Vercel Dashboard for any errors related to parsing `GOOGLE_CREDS_JSON`.

Troubleshooting
- If you see "Unexpected end of JSON input", the env var was truncated or incorrectly formatted — recreate the secret using base64 encoding and re-deploy.
- If sheet monitoring is disabled on Vercel (recommended), set `ENABLE_SHEET_MONITORING=false`.

If you'd like, I can run the script locally and perform the deployment — but you must be logged into Vercel on your machine and allow me to run commands locally (I cannot access your Vercel account from here). If you want me to generate a CI workflow instead (GitHub Actions) to deploy automatically on push, tell me and I will add it.
