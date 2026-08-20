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
│   │   ├── main.ts             # NestJS entrypoint (CORS, global prefix `/api`, ValidationPipe)
│   │   ├── app.module.ts       # Root AppModule
│   │   └── currency/           # NestJS Currency Module, Controller, Service & DTOs
│   ├── package.json            # NestJS dependencies (@nestjs/core, @nestjs/common, etc.)
│   ├── tsconfig.json           # NestJS TypeScript configuration
│   └── README.md               # Dedicated NestJS documentation
└── package.json                # Frontend project configuration
```

---

## ⚡ Quick Start Commands

The NestJS service is the backend. The Next.js app is the client and holds no API
credentials of its own, so **both processes must be running**.

### 1. Start the NestJS backend

```bash
cd backend-nestjs
npm install
cp ../.env.example .env      # or supply your own FREECURRENCY_API_KEY
npm run start:dev            # file-watching; use `npm run start` for a plain run
```
The API listens on **`http://localhost:4000/api`**.

#### Available NestJS scripts
```bash
npm run start         # Start standard NestJS server
npm run start:dev     # Start with file-watching & hot-reload
npm run build         # Build production bundle to /dist
npm run start:prod    # Start compiled production build
```

### 2. Start the Next.js frontend

In a second terminal, from the project root:

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The browser calls the NestJS
service directly at the URL in `NEXT_PUBLIC_API_BASE_URL`; the FreeCurrencyAPI key
stays on the NestJS side and is never sent to the client.

---

## 🚀 Deployment

The frontend and the backend are **two separate deployments**. The frontend ships no
credentials, so it needs a public URL for the backend to call.

### 1. Deploy the NestJS backend

Any Node host works (Render, Railway, Fly.io, a VM). Point it at the `backend-nestjs/`
directory and configure:

| Setting | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Start command | `npm run start:prod` |
| `FREECURRENCY_API_KEY` | your FreeCurrencyAPI key |
| `CORS_ORIGIN` | your deployed frontend URL, e.g. `https://your-app.vercel.app` |

The host supplies `PORT` itself. Verify with `curl https://your-backend.example.com/api/status`.

### 2. Deploy the frontend to Vercel

Set **`NEXT_PUBLIC_API_BASE_URL`** to your backend's public URL including the `/api`
prefix — for example `https://your-backend.onrender.com/api` — then **redeploy**.

> **`NEXT_PUBLIC_*` variables are inlined at build time.** Setting the variable in the
> Vercel dashboard does nothing to an already-built deployment; you must trigger a new
> build for it to take effect.

The backend URL must be **https**. A page served over https cannot call a plain `http://`
address — browsers block it as mixed content — and `http://localhost` only ever resolves
to the visitor's own device, so a build that falls back to localhost works on the
developer's machine and fails on every other device.

---

## 🛠️ Environment Configuration

Create a `.env` or `.env.local` file in the root directory (and/or in `backend-nestjs/`):

```env
# FreeCurrencyAPI Access Key (backend only — never sent to the browser)
FREECURRENCY_API_KEY=4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2

# Where the browser reaches the NestJS backend (inlined at build time)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

# Comma-separated CORS allowlist; unset reflects any origin (dev only)
# CORS_ORIGIN=https://your-app.vercel.app

# Optional: NestJS port (default is 4000)
PORT=4000
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
