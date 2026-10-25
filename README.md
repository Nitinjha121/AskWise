# AskWise

A small AI query assistant. You type a question in the browser, the backend checks your JWT and sends the question to Google Gemini, and the answer is shown back in the UI.

Frontend: React + TypeScript (Vite, Tailwind CSS)
Backend: Node.js + Express + TypeScript
LLM: Google Gemini

## Running it locally

You'll need Node.js 22 or newer and a Gemini API key. You can get a free key from https://aistudio.google.com/apikey.

Start the backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Before running it, open `.env` and fill in `JWT_SECRET` (any random string of at least 32 characters, e.g. from `openssl rand -base64 48`) and `GEMINI_API_KEY`. The server won't start if either is missing. It runs on http://localhost:3000.

Then start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and ask something.

To run the backend in Docker instead:

```bash
cd backend
docker build -t askwise-api .
docker run -p 3000:3000 --env-file .env askwise-api
```

## API

`POST /api/query` is the main endpoint. It needs an `Authorization: Bearer <token>` header and a body like `{ "query": "What is JWT?" }`, and it returns `{ "answer": "..." }`.

`POST /api/auth/token` returns a test token that's valid for one hour. It only exists outside production (see "Assumptions" below).

`GET /api/health` returns `{ "status": "ok" }`.

When something goes wrong, the response always looks like `{ "error": { "code": "...", "message": "..." } }`. The main cases:

- 400 `VALIDATION_ERROR` / `INVALID_JSON`: missing or empty question, more than 2000 characters, or a body that isn't valid JSON or is over 10 kB
- 401 `UNAUTHORIZED`: missing, invalid or expired token
- 429 `RATE_LIMITED`: more than 20 questions a minute from the same client
- 429 `LLM_RATE_LIMITED`: Gemini's quota is used up
- 422 `LLM_BLOCKED`: Gemini refused to answer for safety reasons
- 502 `LLM_UNAVAILABLE`: Gemini is down, unreachable, or sent back an empty answer
- 504 `LLM_TIMEOUT`: Gemini didn't answer within 30 seconds

Quick test from the terminal:

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/token | jq -r .token)
curl -s localhost:3000/api/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is JWT?"}'
```

## How the code is organised

On the backend, a request goes through `app.ts` (middleware and routes) to `routes/query.ts`, which validates the input and calls `LLMService`. The service adds the system prompt and the timeout, then calls an adaptor that talks to the actual provider. `services/adaptors/geminiAdaptor.ts` is the only file that knows anything about Gemini. Errors are thrown as `AppError` and turned into JSON in `middleware/errorHandler.ts`.

On the frontend, `api.ts` does the fetch calls and token handling, `App.tsx` holds the chat state, and the components are split out under `components/`.

## Decisions

I put the LLM behind an adaptor interface (`LLMAdaptor`). `LLMService` doesn't know it's talking to Gemini, so moving to OpenAI or Azure OpenAI is a matter of writing one more adaptor and changing one line in `server.ts`.

I called Gemini's REST API with `fetch` rather than using Google's SDK. It's one less dependency, and it let me pass an `AbortSignal` for the timeout and decide myself how each Gemini error maps to our error codes.

Every Gemini call has a 30 second timeout. Without it, a slow provider would leave the request hanging. A timeout comes back as a 504, so the frontend can tell the user what happened and offer a retry.

All errors share one JSON shape with a fixed `code`. Gemini's own error messages are logged on the server but never sent to the browser, because they can include account details.

The API key and JWT secret only live in `.env`, which is git-ignored. `config.ts` checks for them when the server starts, so a missing secret stops the server instead of causing failures later. The Gemini key goes in a request header rather than the URL, so it doesn't end up in logs.

For the JWT check I rely on `jsonwebtoken`'s defaults. Tokens are signed with HS256, and when verifying with a secret, the library only accepts HMAC algorithms and rejects unsigned (`alg: none`) tokens. The middleware also requires a `sub` claim.

Other protections on the API: `helmet` for standard security headers, a 10 kB body limit, a 2000 character question limit (checked on both the frontend and the backend), and a per-IP rate limit on `/api/query` so nobody can burn through the Gemini quota.

The answer is rendered as Markdown with `react-markdown`, which ignores raw HTML, so whatever the model returns can't inject scripts into the page.

The frontend calls `/api/...` on its own origin and Vite's dev server proxies it to the backend, so I didn't need to set up CORS. In production I'd route `/api` the same way at the load balancer or CDN (see DEPLOYMENT.md).

## Assumptions and trade-offs

The brief says a hardcoded test token is fine. Instead of committing a token, I added a small dev-only endpoint that issues one with a one-hour expiry. It's turned off when `NODE_ENV=production`. In a real deployment users would log in through an OAuth 2.0 / OpenID Connect provider, either self-hosted like Keycloak or managed like Auth0, Cognito or Entra ID, and the API would only verify the tokens it issues.

Each question is answered on its own. The UI shows the session as a chat, but earlier messages aren't sent to the model as context. That keeps the backend stateless.

There's no streaming. The answer comes back as one JSON response, which is simpler and easier to handle errors for.

The rate limit lives in the app because there's nothing in front of it locally. In production I'd move it to the edge, with an API gateway or a WAF rule in front of the load balancer, so abusive traffic is dropped before it reaches the app and the limit is shared across all instances. The in-app limiter only counts per instance, in memory, and behind a load balancer it would also need Express's `trust proxy` setting to see the real client IP.
