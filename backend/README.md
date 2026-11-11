# 🎵 Ultimate AI Music Production Studio — Backend

A **FastAPI** server that orchestrates a multi-step AI music production pipeline:

| Step | Service | Description |
|------|---------|-------------|
| 1 | Supabase Storage | Store the user's raw uploaded audio |
| 2a | Suno API (mocked) | Generate a full melody conditioned on the audio + prompt |
| 2b | Replicate · RVC | Voice-convert the raw vocals |
| 3 | Replicate · HTDemucs | Separate the generated song into stems |
| 4 | Supabase Storage | Store the final processed vocal track |
| 5 | Supabase DB | Persist track metadata |

---

## Prerequisites

- **Python 3.11+**
- A [Supabase](https://supabase.com) project (free tier works)
- A [Replicate](https://replicate.com) account + API token
- A Suno API key _(see [Suno API Mock](#suno-api-mock) note below)_

---

## Setup

### 1. Clone / navigate to the backend directory

```bash
cd ai-music-studio/backend
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

The `.env` file is already present in this directory. Fill in every value:

```dotenv
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
REPLICATE_API_TOKEN=<your-replicate-token>
SUNO_API_KEY=<your-suno-key>          # see Suno mock note below
SECONDARY_AI_KEY=<optional-key>
FRONTEND_URL=http://localhost:3000
```

---

## Supabase Setup

### 1. Run the initialization SQL

Open the **SQL Editor** in your Supabase project dashboard and paste the
contents of [`supabase_init.sql`](supabase_init.sql), then click **Run**.

This creates:
- The `produced_tracks` table with RLS policies.
- The `uuid-ossp` extension.

### 2. Create Storage buckets

In the Supabase Dashboard → **Storage** → **New bucket**:

| Bucket name | Public |
|-------------|--------|
| `studio-raw-audio` | ✅ Yes |
| `studio-master-tracks` | ✅ Yes |

> [!IMPORTANT]
> Both buckets **must be public** so that Replicate and Suno can download the
> audio URLs returned by the upload step.

---

## Running the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server starts at `http://localhost:8000`.

Interactive API docs are available at:
- Swagger UI → `http://localhost:8000/docs`
- ReDoc      → `http://localhost:8000/redoc`

---

## API Endpoints

### `GET /health`

Liveness probe.

**Response `200 OK`**
```json
{ "status": "ok", "service": "AI Music Studio API" }
```

---

### `POST /api/v1/studio/produce`

Run the full production pipeline on an uploaded audio file.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio` | file | ✅ | Raw audio file (mp3, wav, ogg, …) |
| `prompt` | string | ✅ | Style/mood description, e.g. `"upbeat lo-fi hip-hop with jazzy chords"` |

**cURL example**
```bash
curl -X POST http://localhost:8000/api/v1/studio/produce \
  -F "audio=@/path/to/my-vocals.mp3" \
  -F "prompt=dreamy synthwave with 80s reverb"
```

**Response `200 OK`** — `ProduceResponse`
```json
{
  "track_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "full_track_url": "https://...",
  "vocals_url": "https://...",
  "instrumental_url": "https://...",
  "prompt": "dreamy synthwave with 80s reverb",
  "created_at": "2024-01-01T12:00:00+00:00"
}
```

**Error responses**

| Code | Meaning |
|------|---------|
| `500` | Pipeline failed at a specific step (detail includes which step) |
| `502` | Upstream AI service (Suno/Replicate) returned an error |

---

## Suno API Mock

> [!NOTE]
> Suno does **not** currently publish an official public REST API.
> [`app/services/suno_service.py`](app/services/suno_service.py) contains a
> clean mock that targets the community proxy at
> `https://api.sunoapi.org/api/v1/generate`.
>
> **If the call fails** (expected during development), the service automatically
> returns a static sample MP3 (`soundhelix.com`) so the rest of the pipeline
> (stem separation, storage upload, database save) can be exercised end-to-end.
>
> When an official Suno API becomes available, update `SUNO_API_ENDPOINT` and
> the response-parsing logic in `suno_service.py` and remove the fallback block.

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── studio.py          # POST /produce endpoint + pipeline logic
│   ├── core/
│   │   ├── config.py              # Pydantic settings (loads .env)
│   │   └── supabase_client.py     # Supabase client singleton
│   ├── models/
│   │   └── schemas.py             # Pydantic request / response models
│   ├── services/
│   │   ├── database_service.py    # Insert track metadata into Supabase DB
│   │   ├── replicate_service.py   # RVC voice conversion + HTDemucs stems
│   │   ├── storage_service.py     # Upload audio to Supabase Storage
│   │   └── suno_service.py        # Suno melody generation (mocked)
│   └── main.py                    # FastAPI app + CORS + router registration
├── supabase_init.sql              # DB schema + RLS policies
├── requirements.txt
└── README.md
```

---

## License

MIT
