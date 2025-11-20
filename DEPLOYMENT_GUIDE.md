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
