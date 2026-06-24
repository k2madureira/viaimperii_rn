
# Via Imperii — Gamified Roman Empire API

REST API for a gamification platform inspired by the Roman Empire hierarchy. Users progress through 36 military ranks by completing real-world and digital missions, earning mastery points, unlocking medals, and finishing campaigns.

---

## Features

- **36 ranks** from Recruit I to Emperor, each requiring 500 XP
- **5 specialties**: Engineering, Strategy, Commerce, Diplomacy, Exploration
- **10 seeded missions** split between real-world and digital types
- **Mastery system** — accumulate 100 mastery points in a specialty to earn a medal
- **Campaigns** — multi-mission chains with XP and medal rewards
- **Imperial Ranking** — top 10 leaderboard by XP
- **Admin users** — dedicated endpoint with email, password (bcrypt) and `is_admin` flag
- **Dual persistence** — switch between in-memory (dev) and PostgreSQL (prod) via `.env`

---

## Architecture

Clean Architecture with Dependency Injection across 4 layers:

```
src/
├── domain/                          # Pure entities and business rules
│   ├── enums.py                     # Specialty, MissionType
│   └── entities/
│       ├── user.py                  # User entity with rank/mastery/admin logic
│       ├── mission.py               # Immutable Mission entity
│       └── campaign.py              # Immutable Campaign entity
│
├── application/                     # Use cases + port interfaces
│   ├── ports/
│   │   ├── user_repository.py       # UserRepository ABC
│   │   ├── mission_repository.py    # MissionRepository ABC
│   │   └── campaign_repository.py   # CampaignRepository ABC
│   └── modules/
│       ├── user/
│       │   ├── create/
│       │   │   ├── create_user.py
│       │   │   ├── create_admin_user.py
│       │   │   └── dto/
│       │   │       └── user_dto.py
│       │   ├── get/
│       │   │   ├── get_user.py
│       │   │   └── dto/
│       │   │       └── user_dto.py
│       │   └── ranking/
│       │       ├── ranking.py
│       │       └── dto/
│       │           └── ranking_dto.py
│       ├── mission/
│       │   └── complete/
│       │       ├── complete_mission.py
│       │       └── dto/
│       │           └── mission_dto.py
│       └── campaign/
│           └── complete/
│               ├── complete_campaign.py
│               └── dto/
│                   └── campaign_dto.py
│
├── infrastructure/                  # Concrete implementations
│   ├── database/
│   │   ├── connection.py            # SQLAlchemy engine + SessionFactory
│   │   ├── migrations/              # Alembic migrations
│   │   │   └── versions/
│   │   │       ├── 0001_initial_schema.py
│   │   │       └── 0002_add_is_admin_to_users.py
│   │   └── models/                  # ORM models (mapped from docs/schema.sql)
│   │       ├── user.py
│   │       ├── mission.py
│   │       ├── campaign.py
│   │       ├── legion.py
│   │       ├── rank.py
│   │       ├── specialty.py
│   │       ├── achievement.py
│   │       ├── oauth.py
│   │       └── user_activity.py
│   ├── repositories/
│   │   ├── in_memory_user_repository.py
│   │   ├── in_memory_mission_repository.py
│   │   ├── in_memory_campaign_repository.py
│   │   ├── postgres_user_repository.py
│   │   ├── postgres_mission_repository.py
│   │   └── postgres_campaign_repository.py
│   └── security/
│       └── password.py              # bcrypt hash + verify
│
└── presentation/                    # FastAPI routers + DI container
    ├── container.py                 # Singleton repos, factory functions
    └── routers/
        ├── auth.py
        ├── users.py
        ├── missions.py
        ├── campaigns.py
        ├── ranking.py
        └── ranks.py
```

Dependencies always point inward: `presentation → application → domain`. Infrastructure implements the ports defined in `application`.

---

## Endpoints

All endpoints are versioned under `/api/v1`.

> **Sorting**: every list endpoint accepts `sortField` and `sortOrder` (`asc`/`desc`).
> Allowed `sortField` values depend on the resource (e.g. ranks: `name`/`level`;
> countries/provinces: `name`/`id`/`abbreviation`; missions: `difficulty`/`xp_reward`/`name`/`completed_at`).
> Invalid/omitted `sortField` falls back to each resource's natural order.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/signup` | Register with email + password, returns JWT tokens (starts at Recruit I) |
| `POST` | `/api/v1/auth/sign-in` | Authenticate and receive JWT + full user profile |
| `POST` | `/api/v1/auth/refresh` | Exchange a refresh token for a new access + refresh token |
| `PATCH` | `/api/v1/auth/password` | Update password for the logged-in user (requires `Authorization: Bearer <token>`) |
| `GET` | `/api/v1/auth/google` | Redirect to Google OAuth2 authorization |
| `GET` | `/api/v1/auth/google/callback` | Google OAuth2 callback — returns JWT tokens |
| `GET` | `/api/v1/auth/github` | Redirect to GitHub OAuth2 authorization |
| `GET` | `/api/v1/auth/github/callback` | GitHub OAuth2 callback — returns JWT tokens |
| `POST` | `/api/v1/users` | Register a new user — only `name` + `email` required; `password`, `specialty_id`, `province_id`, `invite_code` optional |
| `POST` | `/api/v1/users/admin` | Create an admin user — starts at Tribune I (requires email + password) |
| `PATCH` | `/api/v1/users/{user_id}/specialty` | Update the user's specialty after completing the quiz |
| `GET` | `/api/v1/users/{user_id}` | Get user profile and XP progress |
| `GET` | `/api/v1/users/{user_id}/stats` | Quantitative stats (XP, missions, campaigns, achievements, …) with `period` (weekly/monthly/annual) or `startDate`/`endDate` filters |
| `GET` | `/api/v1/missions` | List missions for the logged-in user — paginated, filter by `status`, `difficulty`, `type`, `trackId`, `specialtyId`. Response includes `availableMissions: { date, daily, weekly, daily_reset_at, weekly_reset_at, rewarded_video_available }` — windows and reset timestamps use the **America/Sao_Paulo** timezone |
| `GET` | `/api/v1/missions/available` | List only missions not yet started/completed — **capped to the remaining daily/weekly allowance** (10 daily, 2 weekly per user). Also returns `availableMissions` summary |
| `POST` | `/api/v1/missions/rewarded-video` | Register a rewarded video watch (dev/testing, no signature). Grants 2 extra daily mission slots (max 3 videos/day). Returns 409 if the daily limit was already reached |
| `GET` | `/api/v1/missions/rewarded-video/callback` | Google AdMob SSV callback called after the user finishes a rewarded ad. Verifies the **ECDSA-SHA256** signature against AdMob's public keys (`gstatic.com/admob/reward/verifier-keys.json`); `custom_data` must carry the user UUID (set via `ServerSideVerificationOptions`). Idempotent — duplicate `transaction_id` is silently ignored. Returns 200 with `"SSV endpoint verified."` for AdMob's URL verification test (no `custom_data`) |
| `GET` | `/api/v1/missions/{mission_slug}` | Live status of a single mission for the logged-in user (poll this after `/complete`); finalizes on read if the review window elapsed |
| `POST` | `/api/v1/missions/{mission_slug}/start` | Start a mission — creates IN_PROGRESS record in user_missions (requires `Authorization`) |
| `POST` | `/api/v1/missions/{mission_slug}/complete` | **Request** completion of an in-progress mission — opens a review window (`PENDING_REVIEW`); does not award XP yet. Returns `completable_at` + `remaining_seconds`. Window per difficulty (easy 30min / medium 4h / hard 6h); finalized by the background job once the window elapses or by 2 peer approvals (medium/hard) |
| `POST` | `/api/v1/missions/{mission_slug}/approve` | Approve a peer's pending medium/hard completion (`{ executor_id }`; approver must be in the **same legion** as the executor and 1–2 ranks above). 1 approval halves the window; 2 finalize it immediately |
| `POST` | `/api/v1/missions/{mission_slug}/reject` | Reject a peer's pending medium/hard completion (`{ executor_id, reason? }`; same legion + 1–2 ranks above) — mission returns to IN_PROGRESS for resubmission |
| `POST` | `/api/v1/uploads/presign` | Presigned S3 PUT URL for an evidence image (`{ content_type }`) — returns `{ upload_url, key, public_url }` |
| `GET` | `/api/v1/missions/to-review` | Pull queue of pending medium/hard completions the logged-in user may validate (same legion, rank 1–2 above, window open, not yet approved). Paginated, soonest-to-expire first. Each item's `executor` carries `{ id, name, image, rank: { id, name, image }, legion_id }` plus `remaining_seconds` |
| `POST` | `/api/v1/users/{user_id}/missions` | Complete a mission (XP + mastery gain) |
| `GET` | `/api/v1/campaigns` | List all available campaigns (id, name, required missions, rewards) |
| `POST` | `/api/v1/users/{user_id}/campaigns/{campaign_id}` | Complete a campaign (validates prerequisites) |
| `GET` | `/api/v1/ranking` | Imperial ranking — top 10 by XP |
| `POST` | `/api/v1/ranks` | Create a new rank |
| `GET` | `/api/v1/ranks` | List ranks ordered by level — each item includes `track_id`; filter by `?trackId=<id>` to get only a specific track's ranks |
| `GET` | `/api/v1/ranks/{rank_id}` | Get rank by ID |
| `PATCH` | `/api/v1/ranks/{rank_id}` | Partially update a rank |
| `DELETE` | `/api/v1/ranks/{rank_id}` | Delete a rank (204) |
| `POST` | `/api/v1/legions` | Create a legion |
| `GET` | `/api/v1/legions` | List all legions (paginated) |
| `GET` | `/api/v1/legions/{legion_id}` | Get legion detail — includes `total_users` (active members) and `countries[]` → `provinces[]` with `quantityUsers` (global active users per province) |
| `PATCH` | `/api/v1/legions/{legion_id}` | Partially update a legion |
| `DELETE` | `/api/v1/legions/{legion_id}` | Delete a legion (204) |
| `POST` | `/api/v1/countries` | Create a country |
| `GET` | `/api/v1/countries` | List all countries (paginated) |
| `GET` | `/api/v1/countries/{country_id}` | Get country by ID |
| `PATCH` | `/api/v1/countries/{country_id}` | Partially update a country |
| `DELETE` | `/api/v1/countries/{country_id}` | Delete a country (204) |
| `GET` | `/api/v1/provinces` | List provinces (paginated) — filter by `countryId`; `name` does an accent/case-insensitive smart search with fuzzy fallback |
| `GET` | `/api/v1/provinces/{province_id}` | Province detail — includes `country`, `total_users` and `legions[]` with `quantityUsers` (legion members in this province) |
| `POST` | `/api/v1/specialties` | Create a specialty |
| `GET` | `/api/v1/specialties` | List all specialties (paginated) |
| `GET` | `/api/v1/specialties/{specialty_id}` | Get specialty by ID |
| `PATCH` | `/api/v1/specialties/{specialty_id}` | Partially update a specialty |
| `DELETE` | `/api/v1/specialties/{specialty_id}` | Delete a specialty (204) |
| `POST` | `/api/v1/specialty-quiz/verify` | Validate test code against user e-mail — returns user UUID |
| `GET` | `/api/v1/tracks` | List career tracks (Legionários, Patrícios) |
| `POST` | `/api/v1/users/{user_id}/track` | Choose (free, at Recruit IV) or change (25% XP penalty) the user's track |
| `POST` | `/api/v1/users/{user_id}/legion` | Join a legion (open/mixed) — returns the legion's specialty balance status |
| `GET` | `/api/v1/specialty-quiz` | Get the 7 specialty quiz questions (requires `X-Test-Code` header) |
| `POST` | `/api/v1/specialty-quiz/submit` | Submit answers and receive specialty recommendation (requires `X-Test-Code` header) |
 
Interactive docs available at `http://localhost:8000/docs` after starting the server.

---

## Requirements

- Python 3.12+
- PostgreSQL 14+ *(optional — in-memory mode requires no database)*

---

## How to Run

### Docker (recommended)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET at minimum

# 2. Build and start (API + Postgres)
docker compose up --build

# API available at  http://localhost:8000
# Docs at           http://localhost:8000/docs
# pgAdmin at        http://localhost:5050
```

The container runs migrations and all seeds automatically on every start (seeds are idempotent).

To run in the background:

```bash
docker compose up -d --build
docker compose logs -f api   # tail logs
docker compose down          # stop and remove containers
```

---

### 1. Clone and set up the environment

```bash
git clone <repository-url>
cd viaimperii

python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

`.env` options:

```env
# PostgreSQL connection (only needed when USE_DATABASE=true)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viaimperii
DB_USER=postgres
DB_PASSWORD=postgres

# Set to true to switch from in-memory to PostgreSQL
USE_DATABASE=false

# App
APP_ENV=development
APP_DEBUG=true
```

### 3. Run in in-memory mode (no database needed)

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 4. Run with PostgreSQL

Create the database, run migrations, and start the server:

```bash
psql -U postgres -c "CREATE DATABASE viaimperii;"
alembic upgrade head
```

Enable the database in `.env`:

```env
USE_DATABASE=true
```

Then start the server:

```bash
uvicorn main:app --reload
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Migrations

Migrations are managed with [Alembic](https://alembic.sqlalchemy.org/). `env.py` reads connection settings from `.env` automatically — no need to edit `alembic.ini`.

Migration files live in `src/infrastructure/database/migrations/versions/`.

| Revision | Description |
|----------|-------------|
| `0001` | Initial schema — all tables, indexes and FK constraints |
| `0002` | Add `is_admin` column to `users` |
| `0003` | Create `strategies` table, seed 5 specialties, migrate `users.main_specialty_id` FK |
| `0004` | Drop `main_specialty` string column from `users` |
| `0005` | Seed 36 ranks, set `current_rank_id` on existing users based on `is_admin` |
| `0006` | Add `created_at`, `updated_at`, `deleted_at` to all tables — enables soft delete |
| `0007` | Add `countries` table; add `country_id` + `abbreviation` to `provinces`; make `legion_id` nullable |
| `0008` | Add `symbol` to `legions`; set `legion_id = Legio X Equestris` on all existing admin users |
| `0009` | Add `latin_name` and `icon` columns to `specialties` |
| `0010` | Remove `legion_id` column from `provinces` |
| `0011` | Create `user_codes` table (invite codes, password reset code, specialty test code) |
| `0012` | Add `is_temporary_password` column to `user_codes` |
| `0013` | Remove unique constraint from `users.username` |
| `0014` | Move `is_temporary_password` from `user_codes` to `users` |
| `0015` | Replace `missions.specialty` string with `specialty_id` FK to `strategies` |
| `0016` | Add `specialty_id` FK to `achievements` |
| `0017` | Add `image_url` to `ranks` (patente artwork) |
| `0018` | Create `tracks` table; add `track_id` FK to `ranks` and `users`; drop unique on `ranks.level` |
| `0019` | Add `track_id` FK to `missions` (track-specific missions; NULL = shared) |
| `0020` | Add `image_url` to `legions` (legion artwork) |
| `0021` | Add `specialty_id` (founding theme) to `legions` — membership is open/mixed |
| `0022` | Create `province_legions` N:N table — materialises legion presence per province with `member_count` and `is_dominant` flag; refreshed every 30 min by background job |
| `0023` | Add `icon_url` to `countries` — public S3 flag/icon URL, populated by `scripts.set_country_icons` |
| `0024` | Drop the old standalone `specialties` table and rename `strategies` → `specialties` (the single specialties table; FKs follow the rename) |
| `0025` | Create `user_rewarded_videos` table — tracks rewarded-ad watches per user; grants `bonus_missions` (default 2) extra daily slots |
| `0026` | Add `transaction_id` (unique) to `user_rewarded_videos` — SSV replay protection |
| `0027` | Set all admin users' `legion_id` to Legio X Equestris and `main_specialty_id` to Engineering |
| `0028` | Add `completion_requested_at`/`completable_at` to `user_missions` + `user_mission_approvals` table (completion review window & peer approvals) |
| `0029` | Add `assets` table + `user_assets` N:N (owned cosmetic assets) and `users.profile_image_url` (user-uploaded image) |
| `0030` | Add `is_active` flag to `user_assets` (active/equipped avatar per user) |
| `0031` | Add `rarity` column to `assets` (legacy \| epic \| mythical \| legendary; existing rows default legacy) |
| `0032` | Add `missions.proof_type`/`acceptance_criteria` + `mission_submissions` table (mission evidence) |
| `0033` | Add `image_hash` to `mission_submissions` (SHA-256 dedup) |

### Apply all pending migrations

```bash
alembic upgrade head
```

### Apply the next migration only

```bash
alembic upgrade +1
```

### Undo the last migration

```bash
alembic downgrade -1
```

### Undo all migrations (reset schema)

```bash
alembic downgrade base
```

### Show migration history

```bash
alembic history
```

### Show current revision applied to the database

```bash
alembic current
```

### Create a new migration (auto-generated from model changes)

```bash
alembic revision --autogenerate -m "describe what changed"
```

Always review the generated file before applying — autogenerate does not detect every change (e.g. stored procedures, check constraints).

---

## Seeds

Seeds populate reference data that the application depends on. They are **idempotent** — safe to run multiple times, existing rows are skipped.

Seed files live in `src/infrastructure/database/seeds/`.

| Seed | Table | Records |
|------|-------|---------|
| `specialties.py` | `specialties` | 5 specialties (Engineering, Strategy, Commerce, Diplomacy, Exploration) |
| `ranks.py` | `ranks` | 36 ranks from Recruit I to Emperor |
| `legions.py` | `legions` | 5 thematic legions + Legio X Equestris (admin-only) |
| `countries.py` | `countries` | 195 countries (ISO 3166-1 alpha-2 + alpha-3) |
| `provinces.py` | `provinces` | 27 Brazilian states + 51 US states/DC |
| `missions.py` | `missions` | 55 missions — 10 daily + 1 monthly per specialty |
| `missions_extra.py` | `missions` | 165 extra missions — 30 daily + 3 monthly per specialty (3× volume) |
| `achievements.py` | `achievements` | 500 achievements (100 per specialty) + templated SVG icons in `assets/achievements/` |
| `tracks.py` | `tracks` / `ranks` | 2 tracks (Legionários, Patrícios); tags legionário ranks + inserts 29 Patrician ranks (Discipulus..Censor) |
| `oauth_providers.py` | `oauth_providers` | Google + GitHub OAuth2 provider config |
| `admin_user.py` | `users` | First-time admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` env vars (Tribune I); skipped if email exists |
| `assets.py` | `assets` | 105 avatar assets from the `uhunter` S3 bucket (fire/florest/sky/water); first 3 of each category free, rest priced. All `rarity=legacy` |
| `assets_avatars_premium.py` | `assets` | 42 avatars from `viaimperii/assets/avatars/<rarity>` — legacy (3, free), epic (30, 300), mythical (9, 800) |

### Run order

Always apply migrations before seeding:

```bash
alembic upgrade head
python -m src.infrastructure.database.seeds.specialties
python -m src.infrastructure.database.seeds.ranks
python -m src.infrastructure.database.seeds.legions
python -m src.infrastructure.database.seeds.countries
python -m src.infrastructure.database.seeds.provinces
python -m src.infrastructure.database.seeds.missions
python -m src.infrastructure.database.seeds.missions_extra
python -m src.infrastructure.database.seeds.achievements
python -m src.infrastructure.database.seeds.tracks
python -m scripts.set_mission_tracks   # assign each mission to a track (after tracks seed)
```

> `scripts.set_mission_tracks` analyses each mission **name** and assigns it to a
> career track: Engineering/Exploration → Legionários; Strategy/Commerce/Diplomacy →
> Patrícios (Strategy resolved by name analysis as civil/business statecraft). Run it
> after both the missions and tracks seeds.

> The `achievements` seed also renders 500 SVG icons into `assets/achievements/`.
> Upload them to S3 with:
>
> ```bash
> aws s3 cp assets/achievements/ s3://viaimperii/achievements/ \
>     --recursive --content-type image/svg+xml --region us-east-1
> ```
>
> The `icon_url` column points to `https://viaimperii.s3.us-east-1.amazonaws.com/achievements/<slug>.svg`.
> Make the `achievements/` prefix publicly readable (bucket policy or CloudFront) for clients to load the icons.

> Add new seeds to this list as the project grows. Each seed module can also be run individually.

---

## Usage Examples

### Create an admin user

```bash
curl -X POST http://localhost:8000/api/v1/users/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marcus Aurelius",
    "email": "marcus@empire.com",
    "password": "Imp3rium!",
    "main_specialty": "Strategy"
  }'
```

Response:

```json
{
  "message": "Ave, Marcus Aurelius! Admin account created.",
  "user": {
    "id": "3fa85f64-...",
    "name": "Marcus Aurelius",
    "email": "marcus@empire.com",
    "is_admin": true,
    "rank": "Recruit I",
    "total_xp": 0,
    "main_specialty": "Strategy",
    "mastery": { "Engineering": 0, "Strategy": 0, "Commerce": 0, "Diplomacy": 0, "Exploration": 0 },
    "completed_missions": [],
    "medals": [],
    "completed_campaigns": [],
    "created_at": "2026-06-13T00:00:00"
  }
}
```

> Password rules: minimum 8 characters. The password is never returned — only the bcrypt hash is stored.

### Register a regular user

```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Julius Caesar", "main_specialty": "Strategy"}'
```

### Complete a mission

```bash
curl -X POST http://localhost:8000/api/v1/users/{user_id}/missions \
  -H "Content-Type: application/json" \
  -d '{"mission_id": "academy"}'
```

Available mission IDs: `academy`, `race`, `reading`, `course`, `study`, `programming`, `github_commit`, `ai_project`, `linkedin_post`, `content_creation`

### Complete a campaign

```bash
curl -X POST http://localhost:8000/api/v1/users/{user_id}/campaigns/conquest_of_gaul
```

Available campaign IDs: `conquest_of_gaul`, `construction_of_colosseum`

### Get the imperial ranking

```bash
curl http://localhost:8000/api/v1/ranking
```

---

## Postman Collection

A ready-to-import collection is available at [`docs/postman_collection.json`](docs/postman_collection.json).

It includes all endpoints pre-configured with the `{{base_url}}` variable set to `http://localhost:8000/api/v1`.

---

## User Types

| Field | Regular User | Admin User |
|-------|-------------|------------|
| `name` | required | required |
| `email` | — | required |
| `password` | — | required (min 8 chars) |
| `main_specialty` | required | required |
| `is_admin` | `false` | `true` |

---

## Rank Progression

The rank is **derived from `total_xp`** (never stored as truth) via a **progressive,
cumulative XP curve** — cheap early (fast onboarding up to Legionary III), then the cost
accelerates each promotion. The Immune → Centurion mid-game band is a deliberate grind wall.
Each rank exposes its cumulative `xp_required` in the `GET /ranks` response.

Tier starts (cumulative XP needed to reach the rank — same curve for both tracks, names differ):

| Cumulative XP | Rank (Legionário / Patrício) |
|---|---|
| 0 XP | Recruit I (lvl 1) |
| 900 XP | Legionary I / Discipulus I (lvl 5) |
| 3,500 XP | Immune I / Scriba I (lvl 9) |
| 13,700 XP | Decanus I / Quaestor I (lvl 13) |
| 36,000 XP | Optio I / Aedilis I (lvl 17) |
| 71,900 XP | Centurion I / Praetor I (lvl 21) |
| 114,000 XP | Primus Pilus I / Consul I (lvl 25) |
| 171,300 XP | Tribune I / Proconsul I (lvl 29) |
| 261,600 XP | Legate / Censor (lvl 33) |
| 292,600 XP | Governor (lvl 34) |
| 328,600 XP | Senator (lvl 35) |
| 370,600 XP | Emperor (lvl 36) |

Reaching 100 mastery points in a specialty unlocks a medal. Since the rank comes from XP,
recalibrating the curve re-derives every user's rank automatically (no data migration).

---

## Medals

| Specialty | Medal |
|-----------|-------|
| Engineering | Imperial Architect |
| Strategy | Master Strategist |
| Commerce | Imperial Merchant |
| Diplomacy | Diplomat of Rome |
| Exploration | Conqueror of Gaul |
