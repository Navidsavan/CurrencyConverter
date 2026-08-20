# Currency Converter Web App & NestJS Backend
> **TA Solutions — React & NestJS Technical Assessment**

A full-stack currency converter web application built with **React / Next.js**, **NestJS**, and the **FreeCurrencyAPI**. It supports dynamic currency lists, real-time and historical conversions, conversion history logs that persist across page reloads, and a mobile-first responsive UI.

---

## 🔑 Key & API Information

- **API Provider:** [FreeCurrencyAPI](https://freecurrencyapi.com/)
- **API Documentation:** [https://freecurrencyapi.com/docs/](https://freecurrencyapi.com/docs/)
- **Base Endpoint:** `https://api.freecurrencyapi.com/v1`
- **Assessment API Key:** `4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2`

> **Note on Free Tier Quotas:** If the shared test key exhausts its monthly quota (300 requests/month on the free tier), you can generate a free key instantly at [freecurrencyapi.com](https://freecurrencyapi.com/) and provide it via the in-app settings gear icon or via the `.env` file (`FREECURRENCY_API_KEY=...`).

---

## 📁 Project Structure

```
├── app/                        # Frontend Application (Next.js 15 App Router & React)
│   ├── page.tsx                # Main Converter page with tabs (Converter & History)
│   └── layout.tsx              # Root HTML & Metadata layout
├── pages/api/[...path].ts      # Mounts the NestJS app at /api (single-deployment mode)
├── components/                 # React UI Components
│   ├── ConverterCard.tsx       # Main interactive conversion card (dropdowns, swap, presets)
│   ├── CurrencySelect.tsx      # Searchable currency dropdown with quick-picks & flags
│   ├── ConversionHistory.tsx   # Conversion history with search, filter, CSV/JSON export
│   ├── RatesTableModal.tsx     # Browse every rate for the current base currency
│   └── Header.tsx              # Title bar with live/fallback rate-source badge
├── hooks/                      # Custom React Hooks
│   ├── use-currency-converter.ts # Core currency conversion & rate state management
│   ├── use-conversion-history.ts # Persistent localStorage history (useSyncExternalStore)
│   └── use-mobile.ts           # Responsive screen breakpoint detector
├── lib/currency/               # Client-side domain layer
│   ├── api.client.ts           # Typed client for the NestJS backend
│   ├── currency.constants.ts   # Currency display metadata (flags, symbols, countries)
│   └── currency.types.ts       # TypeScript interfaces
├── backend-nestjs/             # Standalone NestJS Backend Service
│   ├── src/
│   │   ├── main.ts             # Standalone entrypoint (own port, CORS)
│   │   ├── app.setup.ts        # Prefix + ValidationPipe shared by both entrypoints
│   │   ├── app.module.ts       # Root AppModule
│   │   └── currency/           # NestJS Currency Module, Controller, Service & DTOs
│   ├── package.json            # NestJS dependencies (@nestjs/core, @nestjs/common, etc.)
│   ├── tsconfig.json           # NestJS TypeScript configuration
│   └── README.md               # Dedicated NestJS documentation
└── package.json                # Frontend project configuration
```

---

## ⚡ Quick Start Commands

The NestJS application is mounted inside the Next.js server, so **one command runs
everything**. The API is served from the same origin at `/api`.

```bash
npm install
cp .env.example .env
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The API is at
[http://localhost:3000/api](http://localhost:3000/api) — try
`curl http://localhost:3000/api/status`.

`npm run dev` compiles the NestJS sources first (`npm run build:api`) and then starts
Next.js.

### Running the NestJS backend standalone

The same `AppModule` also runs as its own service — useful for backend development,
since it gives you hot reload, and for demonstrating the API independently of the UI:

```bash
cd backend-nestjs
npm install
npm run start:dev            # → http://localhost:4000/api
```

To point the frontend at it instead of the embedded route, set
`NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api` in `.env` and restart the dev server.

#### Available NestJS scripts
```bash
npm run start         # Start standard NestJS server
npm run start:dev     # Start with file-watching & hot-reload
npm run build         # Build production bundle to /dist
npm run start:prod    # Start compiled production build
```

---

## 🚀 Deployment

Deploy the repository to Vercel as a **single project**. No second host is required —
the NestJS app ships inside the same deployment as a serverless function.

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (detected automatically) |
| Build command | `npm run build` (default — compiles NestJS, then Next.js) |
| Environment variable | `FREECURRENCY_API_KEY` |

That is the whole configuration. Do **not** set `NEXT_PUBLIC_API_BASE_URL`: the client
defaults to the same-origin `/api`, which is correct on every device. Setting it to a
`localhost` URL produces a build that works only on the machine running the backend and
fails on phones and other computers.

### How it works

`pages/api/[...path].ts` bootstraps the NestJS `AppModule` behind an Express adapter and
delegates every `/api/*` request to it — the same controller, service and DTO validation
the standalone server uses. The Nest instance is cached between invocations, so only a
cold start pays the bootstrap cost.

---

## 🛠️ Environment Configuration

Create a `.env` or `.env.local` file in the root directory (and/or in `backend-nestjs/`):

```env
# Required: FreeCurrencyAPI key. Backend only — never sent to the browser.
FREECURRENCY_API_KEY=4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2

# Optional: only when pointing the client at a separately hosted backend.
# Leave unset to use the same-origin /api route.
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

# Optional: port for the standalone NestJS server (default 4000)
PORT=4000

# Optional: CORS allowlist for the standalone server
# CORS_ORIGIN=https://your-app.vercel.app
```

---

## 📡 Backend API Endpoints

Both the Next.js API layer and the NestJS backend expose identical REST endpoints:

| Method | Endpoint | Query / Body Params | Description |
|---|---|---|---|
| `GET` | `/api/status` | `?apikey=...` (optional) | Checks FreeCurrencyAPI connection and quota limits |
| `GET` | `/api/currencies` | `?apikey=...` (optional) | Returns all dynamically supported currencies with symbols & flags |
| `GET` | `/api/rates/latest` | `?baseCurrency=USD&currencies=EUR,GBP` | Fetches latest live exchange rates |
| `GET` | `/api/rates/historical` | `?date=YYYY-MM-DD&baseCurrency=USD` | **(Bonus)** Fetches historical exchange rates for the specified date |
| `POST` | `/api/convert` | `{"fromCurrency":"USD","toCurrency":"EUR","amount":100,"date":"2024-01-15"}` | Converts amounts between currencies with rate metadata |

---

## 🌟 Feature Checklist (Requirements Coverage)

- [x] **Dynamic Currency Support:** Fetches all currencies supported by FreeCurrencyAPI dynamically.
- [x] **React Hooks & Functional Components:** Built strictly with functional components and custom React hooks (`useCurrencyConverter`, `useConversionHistory`, `useSyncExternalStore`).
- [x] **Persistent Conversion History:** Records date & time timestamped history, persisted in `localStorage` across reloads, with export (CSV/JSON) and re-apply actions.
- [x] **Historical Exchange Rates (Bonus):** Date selector allowing conversion using exchange rates from any past date.
- [x] **Dropdowns / Currency Selectors:** Searchable currency selector modal with flags, country names, symbols, and quick-picks.
- [x] **Loading Indicators:** Spinners on exchange calculations, currency sync, and historical rate queries.
- [x] **Mobile-First Design:** Responsive touch-friendly layout (>44px touch targets), clean tab navigation, quick-preset chips.
- [x] **Secure Backend:** API keys are secured on the server side and never leaked to the browser.
- [x] **NestJS Backend:** Complete NestJS module (`backend-nestjs/`) with DTO validation, controllers, and services.

---

## 🚀 Deployment

### Deploying to Vercel (Single Full-Stack App)
1. Push this repository to GitHub / GitLab.
2. Import the project in [Vercel](https://vercel.com).
3. Set the Environment Variable:
   - `FREECURRENCY_API_KEY` = `4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2`
4. Click **Deploy**. Both frontend and backend API functions will be deployed seamlessly.
