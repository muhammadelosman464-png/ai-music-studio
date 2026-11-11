# 🚀 Deployment Guide: Ultimate AI Music Production Studio

This manual provides the exact, production-tested steps to deploy the **AI Music Studio** to the cloud:
- **Backend:** FastAPI Python web service deployed on [Render.com](https://render.com) (handles long-running AI orchestration without serverless timeouts).
- **Frontend:** Next.js 14 App Router deployed on [Vercel.com](https://vercel.com) (edge-optimized, global CDN).
- **Database & Storage:** [Supabase](https://supabase.com).

---

## 1. Push Code to GitHub

Open a terminal on your computer and execute:

```bash
# 1. Navigate to the project root
cd C:\Users\lenovo\.gemini\antigravity\scratch\ai-music-studio

# 2. Rename branch to main (standard default)
git branch -M main

# 3. Create a new repository on GitHub:
# Go to https://github.com/new -> Name it (e.g. `ai-music-studio`) -> Public -> Do NOT initialize with README

# 4. Link your remote repository and push
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

*(Note: Sensitive `.env` and `.env.local` files are protected by `.gitignore` and will never be pushed to GitHub).*

---

## 2. Deploy Backend on Render.com

Render is ideal for the backend because it supports long-running Python processes without the 10-second timeout of serverless functions.

### Step-by-Step Setup:
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository (`ai-music-studio`).
4. Configure the service settings:
   - **Name:** `ai-music-studio-backend`
   - **Region:** `Oregon (US West)` or `Frankfurt (EU)` (closest to your users)
   - **Branch:** `main`
   - **Root Directory:** `backend` *(CRITICAL: do not leave blank)*
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free` (or `Starter` for higher concurrency)

5. Scroll down to **Environment Variables** and add the following keys:

| Key | Value Source | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Pins Python version |
| `SUPABASE_URL` | Check your local `backend/.env` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Check your local `backend/.env` | Supabase service key for storage & DB |
| `REPLICATE_API_TOKEN` | Check your local `backend/.env` | Replicate token for RVC & HTDemucs |
| `SUNO_API_KEY` | Check your local `backend/.env` | Suno melody generation API key |
| `SECONDARY_AI_KEY` | Check your local `backend/.env` | Secondary AI Key |
| `FRONTEND_URL` | `*` (or your final Vercel URL once created) | Allowed CORS origin |


6. Click **Create Web Service**.
7. Wait 2–3 minutes for deployment to finish. Once live, copy your backend URL:
   - Example: `https://ai-music-studio-backend.onrender.com`
   - Test it in your browser: `https://ai-music-studio-backend.onrender.com/health` should return `{"status":"ok","service":"AI Music Studio API"}`.

---

## 3. Deploy Frontend on Vercel.com

### Step-by-Step Setup:
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`ai-music-studio`).
4. In the configuration screen:
   - **Project Name:** `ai-music-studio`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and select `frontend` *(CRITICAL)*
5. Expand the **Environment Variables** section and add:

| Key | Value Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Check your local `frontend/.env.local` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Check your local `frontend/.env.local` | Supabase Anon Key |
| `NEXT_PUBLIC_BACKEND_URL` | `https://ai-music-studio-backend.onrender.com` | **PASTE YOUR RENDER URL HERE** (no trailing slash) |
| `NEXT_PUBLIC_API_URL` | `https://ai-music-studio-backend.onrender.com` | Backup alias |


6. Click **Deploy**.
7. In ~60 seconds, your production music studio will be live at `https://ai-music-studio.vercel.app`!

---

## 4. Post-Deployment Verification Checklist

1. **Test Frontend:** Open the Vercel URL. Confirm the luxury black-and-gold studio loads with the ambient glowing visuals.
2. **Microphone Test:** Click **Start Recording**, sing or hum for 5–10 seconds. Check that the golden canvas waveform visualizes your voice.
3. **Style Prompt:** Pick a style pill (e.g. *Cinematic Orchestra* or *Arabic Pop*) and hit **Produce Track**.
4. **Pipeline Execution:** Observe the 4-step stepper (`Uploading -> Generating Melody -> Transforming Voice -> Separating Stems`).
5. **Listen & Download:** Verify the 3 master players load:
   - 🏆 Full Mastered Track
   - 🎤 Isolated AI Vocals
   - 🎸 Instrumental Only
   - Click the **Download** button to save the stems locally.

---

## 5. Maintenance & Useful Commands

### Update Code in the Future:
Whenever you make changes locally:
```bash
git add .
git commit -m "Update studio features"
git push origin main
```
Render and Vercel will automatically detect the push and trigger seamless CI/CD zero-downtime redeployments!
