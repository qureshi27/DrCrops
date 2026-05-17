# Dr Crops · AI Crop Doctor for Pakistan

AI-powered crop disease detection web app with Sentinel-2 satellite NDVI, for
wheat, rice, cotton, sugarcane and mango farmers across Pakistan. Phase 1 web
app — mobile follows in Phase 2.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + design system in `design.md`
- **NVIDIA NIM** for vision + LLM (`meta/llama-3.2-90b-vision-instruct`, `meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`)
- **TomTom Maps SDK v6** for field mapping
- **Sentinel Hub Process / Statistics API** for NDVI imagery & time-series
- **Open-Meteo** (free, no key) for weather

## Setup

```bash
npm install
npm run dev
```

Keys live in `.env` at project root:

```
NVIDIA_API_KEY=...
NEXT_PUBLIC_TOMTOM_API_KEY=...
SENTINEL_HUB_CLIENT_ID=...
SENTINEL_HUB_CLIENT_SECRET=...
```

Only `NEXT_PUBLIC_TOMTOM_API_KEY` is exposed to the browser. NVIDIA + Sentinel
keys never leave the Next.js server-side routes.

## Routes

| Path | What it does |
| --- | --- |
| `/` | Landing — hero, how-it-works, crops grid, Pakistan map preview |
| `/diagnose` | Upload / camera → NIM vision → structured diagnosis |
| `/farm` | TomTom map, draw a field polygon → Sentinel-2 NDVI dashboard |
| `/weather` | 7-day forecast + spray window advisor |
| `/calculator/fertilizer` | NPK → 50 kg bag math in PKR |
| `/learn` | Disease library by crop |
| `/history` | Past scans (IndexedDB / `localStorage` only) |

## Languages

Six MVP languages: English, Urdu, Punjabi (Shahmukhi), Sindhi, Pashto, Saraiki.
Switch from the navbar globe icon. RTL flip is automatic.

## Phase 2 (roadmap)

- React Native mobile companion
- Voice-first Urdu assistant (browser Web Speech + NIM)
- Mandi (AMIS/PBS) price feed
- Community Q&A with embedding-based deduplication
- Pesticide safety label scanner
