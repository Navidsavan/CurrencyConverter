# Currency Converter - NestJS Backend
> Standalone NestJS Service for FreeCurrencyAPI

This directory contains the standalone **NestJS** backend service implementing the server-side logic for the currency converter technical assessment.

---

## 🔑 Key & API Information

- **API Provider:** [FreeCurrencyAPI](https://freecurrencyapi.com/)
- **Documentation:** [https://freecurrencyapi.com/docs/](https://freecurrencyapi.com/docs/)
- **Base Endpoint:** `https://api.freecurrencyapi.com/v1`
- **Assessment API Key:** `4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2`

---

## 🚀 NestJS Architecture & Features

- **NestJS Architecture**: Structured with NestJS Modules, Controllers, Services/Providers, and DTOs.
- **Input Validation**: Uses `class-validator` and `class-transformer` with a global `ValidationPipe`.
- **Security**: The FreeCurrency API key is managed securely on the server (`FREECURRENCY_API_KEY` via `@nestjs/config`).
- **Dynamic Currencies**: Dynamically queries and parses all currencies supported by FreeCurrencyAPI.
- **Live & Historical Rates**: Endpoints for both latest rates and historical rates for any `YYYY-MM-DD`.
- **In-Memory Caching & Resiliency**: Automatic caching layer with intelligent fallbacks if the API quota is reached.
- **CORS Enabled**: Configured to accept requests from frontend clients.

---

## 🛠️ Necessary Commands

### 1. Install Dependencies
```bash
cd backend-nestjs
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
PORT=4000
FREECURRENCY_API_KEY=4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2
```

### 3. Run Development Server (with hot reload)
```bash
npm run start:dev
```
The NestJS API will start at **`http://localhost:4000/api`**.

### 4. Other Available Commands
```bash
# Start standard NestJS process
npm run start

# Compile TypeScript into dist/
npm run build

# Start the compiled production build
npm run start:prod

# Format code with Prettier
npm run format
```

---

## 📡 API Endpoints

| Method | Endpoint | Query / Body Params | Description |
|---|---|---|---|
| `GET` | `/api/status` | `?apikey=...` (optional) | Checks API connectivity & monthly quota usage |
| `GET` | `/api/currencies` | `?apikey=...` (optional) | Returns all supported currencies with names, symbols, and flags |
| `GET` | `/api/rates/latest` | `?baseCurrency=USD&currencies=EUR,GBP` | Fetches latest real-time exchange rates |
| `GET` | `/api/rates/historical` | `?date=YYYY-MM-DD&baseCurrency=USD` | **(Bonus)** Fetches historical rates for the requested date |
| `POST` | `/api/convert` | JSON body | Converts currency amount with timestamp metadata |

### Sample `POST /api/convert` Request:
```bash
curl -X POST http://localhost:4000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromCurrency": "USD",
    "toCurrency": "EUR",
    "amount": 150,
    "date": "2024-01-15"
  }'
```

### Sample Response:
```json
{
  "id": "conv_1700000000000_abc123",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "formattedDate": "Jan 15, 2024",
  "formattedTime": "12:00:00 PM",
  "fromCurrency": "USD",
  "fromAmount": 150,
  "toCurrency": "EUR",
  "toAmount": 137.55,
  "rate": 0.917,
  "inverseRate": 1.090513,
  "isHistorical": true,
  "dateUsed": "2024-01-15",
  "source": "api"
}
```
