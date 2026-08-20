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
│   ├── layout.tsx              # Root HTML & Metadata layout
│   └── api/                    # Built-in Server API Routes (Next.js serverless proxy)
│       ├── convert/route.ts    # POST /api/convert
│       ├── currencies/route.ts # GET /api/currencies
│       ├── rates/              # GET /api/rates/latest & /api/rates/historical
│       └── status/route.ts     # GET /api/status
├── components/                 # React UI Components
│   ├── ConverterCard.tsx       # Main interactive conversion card (dropdowns, swap, presets)
│   ├── CurrencySelectModal.tsx # Searchable currency modal with quick-picks & flags
│   ├── HistoryList.tsx         # Conversion history table/cards with search, filter, CSV/JSON export
│   └── ApiKeyModal.tsx         # API key manager & status viewer
├── hooks/                      # Custom React Hooks
│   ├── use-currency-converter.ts # Core currency conversion & rate state management
│   ├── use-conversion-history.ts # Persistent localStorage history (useSyncExternalStore)
│   └── use-mobile.ts           # Responsive screen breakpoint detector
├── lib/currency/               # Currency domain models, types, constants & services
│   ├── currency.service.ts     # Currency fetch & calculation logic
│   ├── currency.constants.ts   # Supported currencies, fallback rate matrix
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

### Option A: Run the React / Next.js Full-Stack App (Zero-Config)

The frontend project includes built-in API proxy routes, allowing instant execution without requiring separate processes:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Run the Standalone NestJS Backend

To run the dedicated NestJS microservice backend:

```bash
# 1. Navigate to the NestJS backend directory
cd backend-nestjs

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start NestJS in development mode (with hot-reload)
npm run start:dev
```
The NestJS API server will run at: **`http://localhost:4000/api`**

#### Available NestJS Scripts:
```bash
npm run start         # Start standard NestJS server
npm run start:dev     # Start with file-watching & hot-reload
npm run build         # Build production bundle to /dist
npm run start:prod    # Start compiled production build
```

---

## 🛠️ Environment Configuration

Create a `.env` or `.env.local` file in the root directory (and/or in `backend-nestjs/`):

```env
# FreeCurrencyAPI Access Key
FREECURRENCY_API_KEY=4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2

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
