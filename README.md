# SYRIX Waitlist

Waitlist site for **SYRIX CHAT** (all-in-one messenger) and **WhaRise** (reactions for WhatsApp channel posts), by Syrix Vision Company.
English by default, French with the EN/FR switch or `?lang=fr`.

*Site de liste d'attente pour SYRIX CHAT et WhaRise. Anglais par défaut, français via le bouton EN/FR ou `?lang=fr`. Résumé en français plus bas.*

## Features

- Motion-design landing page (React 19, Vite, Motion): kinetic headline, live chat and channel-reaction illustrations, the SYRIX CHAT promo video, an auto-playing WhaRise walkthrough, scroll reveals, marquee, FAQ. Respects `prefers-reduced-motion`.
- Real signups: `POST /api/waitlist` stores each e-mail once per product and returns the real position in line. No invented counters.
- Anti-abuse: e-mail validation, honeypot field, per-IP rate limit (8 requests / 10 min), 8 KB body limit.
- Admin: `GET /api/admin/stats` (counts per product) and `GET /api/admin/export.csv`, with `Authorization: Bearer <ADMIN_TOKEN>` or `?token=`.
- Optional confirmation e-mail in the visitor's language when `SMTP_HOST` is set.
- Storage: SQLite file by default; PostgreSQL when `DATABASE_URL` is set (required on Vercel).

## Run locally

```bash
npm install
cp .env.example .env        # set ADMIN_TOKEN
npm run build && npm start  # http://localhost:8080
npm test                    # API tests
```

Development with hot reload: `npm run dev` (Vite on :5173, API on :8080).

## Deploy on a VPS (Docker)

```bash
cp .env.example .env   # set ADMIN_TOKEN, TRUST_PROXY=1
docker compose up -d --build
```

The site listens on `127.0.0.1:8080`. Put it behind Nginx with HTTPS for `syrixz.com`:

```nginx
server {
  server_name syrixz.com www.syrixz.com;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then `certbot --nginx -d syrixz.com -d www.syrixz.com`. Signups are kept in the `waitlist-data` volume.

## Deploy on Vercel

Import the repository, set `DATABASE_URL` (Neon, Supabase or any PostgreSQL) and `ADMIN_TOKEN` in the project settings, deploy. `api/index.mjs` serves the API; `vercel.json` routes everything else to the site.

## Export the list

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://syrixz.com/api/admin/export.csv -o waitlist.csv
```

## Résumé (FR)

- `npm install && npm run build && npm start` pour lancer en local, `docker compose up -d --build` sur un serveur.
- Les inscriptions sont réelles : chaque e-mail est enregistré une fois par appli, avec sa vraie position.
- Export : `/api/admin/export.csv` avec le jeton `ADMIN_TOKEN`.
- Sur Vercel, une base PostgreSQL (`DATABASE_URL`) est obligatoire : les fichiers SQLite n'y sont pas conservés.
- WhaRise envoie des réactions automatiquement ; la FAQ du site le dit clairement, car une activité automatisée peut aller contre les conditions de WhatsApp.
