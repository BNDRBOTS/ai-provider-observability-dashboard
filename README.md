# AI Provider Observability Dashboard

**Zero fabrication · Cryptographic verification · Real-time monitoring**

A complete, deployable observability dashboard for AI service providers built with Next.js 16, React 19, Tailwind CSS v4, and Shadcn/ui. This system adheres to strict architectural principles: no LLM classification, no fabricated data, machine-readable sources only, and cryptographic verification of all external data.

## 🔑 Core Principles

- **Zero Fabrication**: No placeholder data, no simulated metrics, no invented statistics
- **Machine-Readable Sources Only**: Polygon.io, CourtListener, SEC EDGAR - all structured APIs
- **Cryptographic Verification**: SHA-256 hashing of all fetched JSON payloads
- **No LLM Classification**: Pure regex/JSON parsing - no GPT, Claude, or other LLM in pipeline
- **Null State Boundaries**: Every component explicitly states why data is missing
- **Client-Side Monitoring**: Fetch interceptor captures AI API calls automatically

## ✨ Features

### Dashboard Overview
- **Provider Health Cards**: Synthetic checks showing operational status (✅/⚠️/❌)
- **Cost Per Request**: Token usage estimation with configurable $/MTok rates
- **Model Router Gauge**: Real-time distribution of requests by provider
- **Stock Tile**: GOOGL market data from Polygon.io (or absence state)

### Usage Tracking
- Client-side fetch interceptor captures AI API calls
- Extracts token counts from response bodies (OpenAI, Anthropic, Google, DeepSeek, xAI)
- Stores in IndexedDB for offline persistence
- Detailed request history with timestamps, models, endpoints

### Financial & Legal Data
- **Stock Data**: GOOGL OHLCV from Polygon.io API
- **Litigation Tracking**: CourtListener docket searches for AI companies
- **SEC Filings**: Alphabet Inc. regulatory filings with mention extraction

### Verification System
- Hash manifest viewer showing SHA-256 of all fetched data
- Step-by-step verification instructions
- Architectural guarantees documentation

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **UI**: React 18 + Tailwind CSS v3 + Shadcn/ui
- **Charts**: Recharts
- **Storage**: IndexedDB (idb-keyval)
- **Deployment**: Netlify (static export + scheduled functions)
- **Hashing**: Node.js crypto module (SHA-256)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- (Optional) Polygon.io API key for stock data

### Installation

```bash
# Clone the repository
git clone https://github.com/BNDRBOTS/ai-provider-observability-dashboard.git
cd ai-provider-observability-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys (optional)
# Edit .env.local and add:
# NEXT_PUBLIC_POLYGON_API_KEY=your_key_here
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Test production build locally
npm start
```

## 🌐 Deployment to Netlify

### Option 1: Connect GitHub Repository (Recommended)

1. Push code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select this repository
5. Configure build settings:
   - **Build command**: `npm run build && npm run export`
   - **Publish directory**: `out`
   - **Functions directory**: `netlify/functions`
6. Add environment variables:
   - `POLYGON_API_KEY` (optional, for stock data)
7. Deploy

### Option 2: Manual Deploy

```bash
# Build static export
npm run build
npm run export

# Deploy via Netlify CLI
netlify deploy --prod --dir=out
```

### Scheduled Functions

The dashboard includes a Netlify scheduled function that runs twice daily (00:00 and 12:00 UTC) to:
- Fetch stock data from Polygon.io
- Query CourtListener for litigation data
- Parse SEC EDGAR filings
- Perform health checks on provider APIs
- Generate SHA-256 hashes for verification

Scheduled functions are automatically configured via `netlify.toml`.

## 📋 Data Sources

### 1. Polygon.io (Stock Data)
- **Purpose**: GOOGL stock OHLCV data
- **Requires**: API key (free tier available)
- **Frequency**: Daily close data
- **Fallback**: Displays "unavailable" state with explanation

### 2. CourtListener (Litigation Data)
- **Purpose**: Federal/state court docket searches
- **Requires**: No API key (public endpoints)
- **Frequency**: On-demand or scheduled
- **Search**: "OpenAI", "Anthropic", "DeepMind", "Grok", "DeepSeek"

### 3. SEC EDGAR (Regulatory Filings)
- **Purpose**: Alphabet Inc. (CIK: 0001652044) filings
- **Requires**: No API key (public RSS feed)
- **Frequency**: Daily fetch
- **Extraction**: Regex-based mention counting

### 4. Client-Side Monitoring (Usage Logs)
- **Purpose**: Capture AI API requests in browser
- **Method**: Fetch/XHR interceptor (lobehub RFC #7575 pattern)
- **Storage**: IndexedDB
- **Providers**: OpenAI, Anthropic, Google, DeepSeek, xAI

## 🔍 Verification Protocol

### Before Deployment Checklist

```bash
# 1. Check for placeholder data
grep -r 'mock\|sample\|placeholder\|dummy' .
# Expected: Zero matches (except in this README)

# 2. Verify build completes without errors
npm run build && npm run export
# Expected: Zero errors, static export in /out

# 3. Test with network throttling
# Open dashboard in browser, enable network throttling
# Expected: All tiles load null states gracefully
```

### Data Integrity Verification

1. **Navigate to Verification page** in dashboard
2. **Copy hash** from manifest for desired data file
3. **Download raw JSON** from `/public/data/` directory
4. **Calculate hash**:
   ```bash
   # Linux/Mac
   echo -n "$(cat stock-data.json)" | sha256sum
   
   # Windows PowerShell
   Get-FileHash -Algorithm SHA256 stock-data.json
   ```
5. **Compare output** to manifest hash
6. **Match = verified** · Mismatch = data altered

## 📊 Dashboard Pages

### `/` - Main Dashboard
- Provider health status
- Cost estimation
- Model routing distribution
- Stock tile
- System information

### `/usage` - Usage Logs
- Detailed request history
- Token consumption breakdown
- Provider breakdown
- Response time tracking
- Clear/export functionality

### `/financial` - Financial Data
- Stock price tracking (GOOGL)
- Litigation case counts
- SEC filing table
- Data source documentation

### `/verification` - Integrity Verification
- Zero fabrication protocol guarantees
- Hash manifest viewer
- Verification step-by-step guide
- Architectural documentation

## 🛡️ Security Considerations

- **No API keys in client code**: All sensitive keys in environment variables
- **No localStorage for secrets**: Only non-sensitive config (cost rates)
- **CORS-friendly**: All external APIs support cross-origin requests
- **CSP-ready**: No inline scripts except for interceptor bootstrap

## 🐛 Known Limitations

1. **Stock Data**: Requires Polygon.io API key (free tier has rate limits)
2. **Health Checks**: Manual execution or scheduled function only (no continuous monitoring)
3. **Client-Side Storage**: IndexedDB data cleared on browser reset
4. **Static Export**: No server-side API routes (all data fetching client-side or build-time)

## 🛠️ Troubleshooting

### "No data available" on all tiles
- **Cause**: Scheduled function hasn't run yet or API keys not configured
- **Solution**: Manually trigger function or wait for scheduled execution

### Stock tile shows "unavailable"
- **Cause**: Missing or invalid Polygon.io API key
- **Solution**: Add `NEXT_PUBLIC_POLYGON_API_KEY` to environment variables

### Usage logs empty
- **Cause**: Fetch interceptor not installed or no AI API calls made
- **Solution**: Verify interceptor script loaded, make test API call

### Build errors
- **Cause**: Missing dependencies or Node.js version mismatch
- **Solution**: Ensure Node.js 20+, delete `node_modules` and reinstall

## 📄 Project Structure

```
ai-provider-observability-dashboard/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Main dashboard
│   ├── usage/               # Usage logs page
│   ├── financial/           # Financial data page
│   └── verification/        # Verification page
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── provider-health-card.tsx
│   │   ├── cost-per-request-card.tsx
│   │   ├── model-router-gauge.tsx
│   │   ├── stock-tile.tsx
│   │   ├── sec-filing-table.tsx
│   │   ├── litigation-card.tsx
│   │   ├── hash-manifest-viewer.tsx
│   │   └── null-state-boundary.tsx
│   └── ui/                  # Shadcn/ui primitives
├── lib/
│   ├── utils.ts             # Utility functions
│   ├── indexeddb.ts         # Client-side storage
│   ├── data-fetchers.ts     # External API fetchers
│   └── fetch-interceptor.ts # AI API call interceptor
├── netlify/
│   └── functions/
│       └── scheduled-data-fetch.ts  # Scheduled function
├── public/
│   └── data/                # Generated data files (build-time)
├── package.json
├── next.config.js
├── netlify.toml
├── tailwind.config.ts
└── tsconfig.json
```

## 📦 Environment Variables

### Client-Side (NEXT_PUBLIC_*)

```bash
# Optional: Polygon.io API key for stock data
NEXT_PUBLIC_POLYGON_API_KEY=your_polygon_api_key

# Optional: Use Yahoo Finance instead (requires proxy)
NEXT_PUBLIC_USE_YAHOO_FINANCE=false

# Optional: CourtListener API key (public endpoints work without)
NEXT_PUBLIC_COURTLISTENER_API_KEY=
```

### Server-Side (Netlify Functions)

```bash
# Polygon.io API key (used by scheduled function)
POLYGON_API_KEY=your_polygon_api_key
```

## 🤝 Contributing

Contributions welcome! Please ensure:
1. No fabricated data or placeholder values
2. All external API calls documented
3. Null states implemented for every component
4. Tests pass and build succeeds

## 📜 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Repository**: https://github.com/BNDRBOTS/ai-provider-observability-dashboard
- **Polygon.io**: https://polygon.io/
- **CourtListener**: https://www.courtlistener.com/
- **SEC EDGAR**: https://www.sec.gov/edgar/
- **Shadcn/ui**: https://ui.shadcn.com/

## ℹ️ Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with precision · Deployed with confidence · Verified with cryptography**
