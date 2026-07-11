# CapitalIQ — AI Investment Agent

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CapitalIQ.ai-white?style=for-the-badge&logo=vercel&logoColor=black)](https://capitaliq-1.onrender.com)

An AI-powered investment research agent. Enter any company name and get a live
financial snapshot, recent news, and an LLM-generated **Invest / Pass**
recommendation with a supporting score, summary, pros, cons, and risks.

---

## Overview

CapitalIQ takes a company name (e.g. "Apple", "Tesla", "Reliance") and:

1. Resolves it to a stock ticker and pulls live financial data (price, market
   cap, P/E, margins, growth, analyst rating, etc.) from Yahoo Finance.
2. Pulls the 5 most recent news articles about the company from GNews.
3. Sends both data sets to an LLM (Groq's `llama-3.1-8b-instant` via
   LangChain.js), which returns a structured investment verdict — a score out
   of 10, an "Invest" or "Pass" call, a written summary, and lists of pros,
   cons, and key risks.
4. Renders everything in a single-page React dashboard: a verdict card,
   pros/cons/risks columns, a live financials grid, and a market-sentiment
   news feed.

It's a full-stack demo (React + Express) meant to show an end-to-end
"fetch data → reason over it with an LLM → present it" agent pattern, not a
production trading tool.

---

## How to run it

### Prerequisites
- Node.js 18+
- A free [Groq](https://console.groq.com) API key (LLM calls)
- A free [GNews](https://gnews.io) API key (news, 100 requests/day on the
  free tier)

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
GROQ_API_KEY=your_groq_key_here
GNEWS_API_KEY=your_gnews_key_here
PORT=5000
```

Start the server:

```bash
npm start        # or: nodmon server.js
```

You should see:

```
🚀 CapitalIQ backend running at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite will start the app on `http://localhost:5173`. The frontend expects the
backend at `/api/analyze` — either run both on the same origin behind a
proxy, or add a Vite dev proxy / update the axios base URL to point at
`http://localhost:5000`.

### 3. Use it

Open the app, type a company name (e.g. `Apple`, `Tesla`, `Reliance
Industries`), click **Analyze**, and wait a few seconds for the financials,
news, and AI verdict to load.

---

## How it works

**Architecture:**

```
React (Vite) ── POST /api/analyze { company } ──▶ Express
                                                     │
                                    ┌────────────────┼────────────────┐
                                    ▼                ▼                ▼
                          financeService.js   newsService.js   aiService.js
                          (yahoo-finance2)     (GNews API)      (Groq via LangChain)
                                    │                │                │
                                    └───────► combined JSON ◄─────────┘
                                                     │
                                                     ▼
                                          ResultCard.jsx renders it
```

**Backend (`routes/analyze.js`)** — a single `POST /api/analyze` endpoint
orchestrates three independent service calls in sequence:

1. **`financeService.js`** — uses `yahoo-finance2` to search for the company
   name and take the first `EQUITY`-type result as the ticker. It then pulls
   `quote` (price, market cap, 52-week range) and `quoteSummary` modules
   (`financialData`, `defaultKeyStatistics`, `summaryProfile`/`assetProfile`)
   for P/E, forward P/E, revenue growth, profit margin, ROE, debt-to-equity,
   and the analyst recommendation key. Numbers are formatted for display
   (e.g. market cap → `$2.81T`, ratios → percentages).

2. **`newsService.js`** — calls the GNews `/search` endpoint with the company
   name, sorted by `publishedAt`, capped at 5 articles. Failures here are
   caught and swallowed (returns `[]`) so a news outage doesn't take down the
   whole analysis.

3. **`aiService.js`** — builds a system prompt that casts the model as an
   investment analyst and strictly requires a JSON-only response in a fixed
   schema (`recommendation`, `score`, `summary`, `pros`, `cons`, `risks`). The
   user prompt embeds the formatted financials and a numbered news list. The
   raw model response is stripped of any accidental Markdown code fences and
   `JSON.parse`d, with a check that `recommendation` and `score` are present
   before returning.

The route merges all three results into one response object and sends it
back. If financials or the AI call fail, the whole request fails with a
descriptive error (news failures degrade gracefully instead).

**Frontend** is a single-page app (`App.jsx`) with four states — idle,
loading, error, result — driving conditional rendering. `SearchBar.jsx` is a
controlled uncontrolled-input form that hands the raw company string up to
`App`. `ResultCard.jsx` is the main display: a header card with a
Clearbit-sourced logo (domain guessed from the company's website or name,
with a `Building2` icon fallback on load error), a score/verdict panel color-
coded by score band, three feed columns for pros/cons/risks, a financials
grid, and a scrollable news list linking out to original articles.

---

## Key decisions & trade-offs

- **Groq (`llama-3.1-8b-instant`) instead of GPT-4/Claude** — free tier and
  very low latency, which matters for a synchronous "click and wait" UX.
  Trade-off: a small, fast model reasons less deeply than a larger one, so
  the analysis is closer to "a well-organized first pass" than professional-
  grade equity research.
- **`yahoo-finance2` (unofficial) instead of a paid market-data API** — no
  API key needed and covers most listed tickers, but it's an unofficial
  wrapper around an undocumented endpoint that can change or rate-limit
  without notice. `quoteSummary` calls are wrapped in their own try/catch so
  a missing module for a given ticker degrades the financials instead of
  failing the whole request.
- **First-match ticker resolution** — the first `EQUITY` result from Yahoo's
  search is used directly, with no disambiguation step. This is simple but
  can pick the wrong company for ambiguous or generic names (e.g. common
  words, multiple share classes, or companies with similar names on
  different exchanges).
- **Strict JSON-only LLM output, no retries** — the prompt demands a fixed
  schema and the backend does a single parse-and-validate pass. It's simple
  and keeps the frontend contract predictable, but if the model wraps its
  answer in prose or returns malformed JSON even once, the whole request
  fails with no automatic retry or repair step.
- **News failures are silent, AI/finance failures are not** — news is
  treated as "nice to have" (empty array on failure); financials and the AI
  verdict are treated as required, since the whole product is built around
  them.
- **No persistence, auth, or caching** — every analysis is a fresh, stateless
  round trip. This keeps the demo simple but means repeated lookups of the
  same company re-spend LLM/API quota, and there's no history, watchlist, or
  multi-user support.
- **No automated tests** — left out to focus time on the end-to-end flow;
  see "What I would improve."

---

## Example runs


**Query: `Apple`**
```json
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "recommendation": "Invest",
  "score": 8,
  "summary": "Apple's strong revenue growth, high profit margin, and analyst recommendation make it an attractive investment opportunity. However, its high debt-to-equity ratio and reliance on a single product line pose some risks.",
  "pros": [
    "Strong revenue growth of 16.60%",
    "High profit margin of 27.15%",
    "Analyst recommendation is 'buy'",
    "Forward PE ratio of 32.614388 is relatively high, indicating potential for future growth"
  ],
  "cons": [
    "High debt-to-equity ratio of 79.548",
    "Reliance on a single product line (e.g. iPhones) poses a risk to revenue"
  ],
  "risks": [
    "Market volatility due to global events (e.g. Iran Deal falters)",
    "Competition from other smartwatch manufacturers (e.g. Amazon)"
  ],
  "website": "https://www.apple.com",
  "financials": {
    "currentPrice": 313.39,
    "currency": "USD",
    "marketCap": "$4.60T",
    "peRatio": "N/A",
    "forwardPE": 32.614388,
    "revenueGrowth": "16.60%",
    "profitMargin": "27.15%",
    "debtToEquity": 79.548,
    "returnOnEquity": "141.47%",
    "fiftyTwoWeekHigh": 317.4,
    "fiftyTwoWeekLow": 201.5,
    "analystRecommendation": "buy"
  },
  "news": [
    {
      "title": "Netflix vs. HBO Max vs. Apple TV+: Who Won the Emmy Nominations War?",
      "description": "The 2026 Emmy nominations have arrived, and the streaming giants are once again stepping into television’s biggest spotlight. With HBO Max, Netflix, and Apple TV+ battling for industry supremacy, the nominations offer a glimpse into the shifting power dynamics of modern entertainment.",
      "url": "https://www.yardbarker.com/entertainment/articles/netflix_vs_hbo_max_vs_apple_tv_who_won_the_emmy_nominations_war/s1_17785_44041563",
      "source": "Yardbarker",
      "publishedAt": "2026-07-08T20:55:59Z"
    },
    {
      "title": "'All Her Fault' Star Dakota Fanning Gives Update On 'The Nightingale'",
      "description": "Emmy-Nominated 'All Her Fault' Star Dakota Fanning Reveals 'The Nightingale' Progress With Sister Elle & Details Of New Untitled Apple TV Thriller",
      "url": "https://deadline.com/2026/07/dakota-fanning-elle-emmys-nightingale-all-her-fault-margo-1236977490/",
      "source": "Deadline",
      "publishedAt": "2026-07-08T20:53:52Z"
    },
    {
      "title": "Apple Watch Series 13 Rumored to Mark the End of an Era",
      "description": "While the Apple Watch Series 12 is still a few months away, a new rumor suggests that next year's Apple Watch Series 13 will mark the end of an era. According to a recent post from a known leaker on the Chinese social media platform Weibo, the Apple Watch will be receiving a major redesign next year, and this will apparently include a new way of attaching bands to the watch. As a result, the leaker implied that existing bands will not be compatible with the Apple Watch Series 13.",
      "url": "https://www.macrumors.com/2026/07/08/apple-watch-series-13-end-of-era/",
      "source": "MacRumors",
      "publishedAt": "2026-07-08T20:29:20Z"
    },
    {
      "title": "Users compare this $19 Amazon smartwatch to an Apple Watch",
      "description": "Shoppers say they have found a budget-friendly smartwatch that has many of the same features as the Apple Watch without the price tag. Shop this popular new smartwatch on Amazon for $19.",
      "url": "https://nypost.com/2026/07/08/shopping/users-compare-this-19-amazon-smartwatch-to-an-apple-watch/",
      "source": "New York Post",
      "publishedAt": "2026-07-08T20:26:38Z"
    },
    {
      "title": "Market Turmoil as Iran Deal Falters Amidst Trump's Remarks",
      "description": "The S&P 500 dipped following President Trump's announcement at a NATO summit, where he dismissed an interim deal with Iran. While Broadcom shares soared on a new agreement with Apple, overall market performance was hindered by rising oil prices and lingering geopolitical tensions, shaking investor confidence.",
      "url": "https://www.devdiscourse.com/article/business/3947476-market-turmoil-as-iran-deal-falters-amidst-trumps-remarks",
      "source": "Devdiscourse",
      "publishedAt": "2026-07-08T20:23:22Z"
    }
  ]
}
```

**Query: `Tesla`**
```json
{
  "company": "Tesla, Inc.",
  "ticker": "TSLA",
  "recommendation": "Invest",
  "score": 8,
  "summary": "Tesla's strong revenue growth and analyst recommendation support a positive investment outlook. However, concerns over regulatory risks and high forward PE ratio temper our enthusiasm.",
  "pros": [
    "Strong revenue growth",
    "Analyst recommendation: buy",
    "Potential for electric vehicle market expansion"
  ],
  "cons": [
    "High forward PE ratio",
    "Regulatory risks, such as potential blocking of Robotaxis in New Jersey"
  ],
  "risks": [
    "Regulatory risks",
    "High debt-to-equity ratio"
  ],
  "website": "https://www.tesla.com",
  "financials": {
    "currentPrice": 394.06,
    "currency": "USD",
    "marketCap": "$1.48T",
    "peRatio": "N/A",
    "forwardPE": 154.21523,
    "revenueGrowth": "15.80%",
    "profitMargin": "3.95%",
    "debtToEquity": 18.738,
    "returnOnEquity": "4.90%",
    "fiftyTwoWeekHigh": 498.83,
    "fiftyTwoWeekLow": 293.55,
    "analystRecommendation": "buy"
  },
  "news": [
    {
      "title": "Tesla Robotaxis Could Be Blocked From New Jersey - And Elon Musk's Own Strategy Is Why",
      "description": "Elon Musk is anti-lidar, a stance that could cost him the ability to operate robotaxis in several states.",
      "url": "https://www.benzinga.com/markets/large-cap/26/07/60345509/tesla-robotaxis-could-be-blocked-from-new-jersey-and-elon-musks-own-strategy-is-why",
      "source": "Benzinga",
      "publishedAt": "2026-07-08T19:55:11Z"
    },
    {
      "title": "Quote of the day by Nikola Tesla: 'One's salvation could only be...' Life lessons on true success, innovation, self-discipline, resilience, accountability and personal success",
      "description": "Quote of the day by Nikola Tesla: \"One's salvation could only be brought about through his own efforts\" reminds people that lasting success begins with personal responsibility and self-discipline. The quote comes from Tesla's autobiography My Inventions and reflects his own journey of overcoming challenges. It continues to inspire people to take accountability, build resilience, pursue innovation, and achieve personal success through consistent effort rather than depending on others.",
      "url": "https://economictimes.indiatimes.com/news/international/us/quote-of-the-day-by-nikola-tesla-ones-salvation-could-only-be-life-lessons-on-true-success-innovation-self-discipline-resilience-accountability-and-personal-success/articleshow/132267124.cms",
      "source": "The Economic Times",
      "publishedAt": "2026-07-08T19:05:00Z"
    },
    {
      "title": "JPMorgan calls the possibility of a SpaceX-Tesla merger 'strategically coherent'",
      "description": "A merger between SpaceX and Tesla would enable CEO Elon Musk to \"unify vision, mission, and engineering leadership across both platforms,\" per JPMorgan.",
      "url": "https://www.cnbc.com/2026/07/08/jpmorgan-calls-the-possibility-of-a-spacex-tesla-merger-strategically-coherent-.html",
      "source": "CNBC",
      "publishedAt": "2026-07-08T17:42:08Z"
    },
    {
      "title": "Meta’s Market Value Passes Tesla’s-But Both Stocks Are Still Tanking",
      "description": "Shares of both companies have fallen at least 8% since the start of the year.",
      "url": "https://www.forbes.com/sites/antoniopequenoiv/2026/07/08/meta-overtakes-tesla-in-market-value-heres-why-both-stocks-are-still-tanking/",
      "source": "Forbes",
      "publishedAt": "2026-07-08T17:26:46Z"
    },
    {
      "title": "Chilling update in charges of dad who 'tried to kill his whole family' in horror car crash after driving Tesla off cliff",
      "description": "A DAD accused of trying to kill his whole family by driving a Tesla off a 250-foot cliff has had all charges against him dismissed.\nDharmesh...",
      "url": "https://www.the-sun.com/news/16657387/dad-tesla-cliff-crash-family-murder-update/",
      "source": "The Sun U.S Edition",
      "publishedAt": "2026-07-08T16:56:44Z"
    }
  ]
}
```

---

## What I would improve with more time

- **Ticker disambiguation UI** — when a search returns multiple plausible
  equities, show a picker instead of silently taking the first match.
- **Retry/repair for LLM output** — if JSON parsing fails, re-prompt the
  model once with the malformed output and an instruction to fix it, instead
  of failing the whole request.
- **Caching** — cache financials/news/AI results per ticker for a short TTL
  (e.g. 15 minutes) to cut down on redundant API and LLM usage.
- **Historical price chart** — plot recent price history alongside the
  current snapshot for context.
- **Confidence / model transparency** — surface which data points most
  influenced the verdict, and let the user pick a stronger model for deeper
  analysis.
- **Testing** — unit tests for the service layer (mocking Yahoo Finance,
  GNews, and Groq) and integration tests for `/api/analyze`.
- **Rate limiting & input sanitization** on the API layer.
- **Portfolio/watchlist mode** — save past analyses and compare multiple
  companies side by side.
- **Deployment** — containerize with Docker and add a CI pipeline.

---

## Bonus: LLM build transcript

AI assistance was used for select parts of this project — scaffolding,
debugging, and prompt refinement — rather than the entire build. The main
areas where AI was used:

**Prompt engineering — `aiService.js`**
- Writing the LLM system/user prompts and iterating on the JSON response
  schema (`recommendation`, `score`, `summary`, `pros`, `cons`, `risks`)

**UI styling — `ResultCard.jsx`**
- Getting Tailwind CSS suggestions for the layout, the color-coded
  score/verdict panel, and the pros/cons/risks card design

**Data layer — `financeService.js`**
- Working out the Yahoo Finance ticker-resolution logic (search → filter for
  `EQUITY` type → use first match)
- Handling missing `quoteSummary` modules for tickers that don't return full
  data
- Writing the `formatNumber` / `formatPercent` helpers (e.g. market cap →
  `$2.8T`, decimals → percentages)
- Debugging why some companies returned mostly `N/A` financials — traced to
  `yahoo-finance2`'s all-or-nothing schema validation on `quoteSummary()`

Full transcripts weren't saved for every session; the above summarizes the
main areas where AI assistance was used.