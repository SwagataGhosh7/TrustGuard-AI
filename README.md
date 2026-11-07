# TrustGuard AI — Digital Trust & Cryptographic Threat Intelligence

TrustGuard AI is an intelligent, full-stack cybersecurity platform built to detect phishing portals, fraudulent websites, and underlying cryptographic trust infrastructure vulnerabilities.

By fusing **real-time server-side TLS socket handshakes (Port 443)**, **X.509 certificate parsing**, **eMudhra Certificate Authority weak key generation diagnostics**, **Certificate Transparency (CT) log audits**, **HTTP security header assessments**, and **Gemini 3.8 Flash AI threat synthesis**, TrustGuard AI provides forensic intelligence on web destinations with a strict **Zero Mock Guarantee**.

---

## Key Features

### 1. Live Cryptographic & TLS Socket Auditing

- **Direct Handshake Inspection**: Establishes a raw Node.js `tls.connect` socket to port 443 with SNI (`servername`) and reads peer certificates without artificial timeouts or proxy mocks.
- **X.509 Parameter Extraction**: Analyzes Common Name (CN), Subject Alternative Names (SANs), serial numbers, issuer chains, valid dates, cipher suites (`TLS_AES_256_GCM_SHA384`, `ECDHE-RSA`, etc.), and key algorithms (RSA 2048/4096-bit, ECDSA P-256/P-384).
- **Public CT Log Ingestion**: Queries public Certificate Transparency logs (via `crt.sh` / RFC 6962 log monitors) to detect anomalous certificates, re-issues, and recent issuance bursts.

### 2. eMudhra CA Key Generation Vulnerability Detection

- Dedicated forensic detection routines targeting the documented eMudhra Certificate Authority weak key generation incident:
  - Detects predictable pseudo-random number generator (PRNG) patterns in CA-generated RSA/ECC keys.
  - Inspects ASN.1 modulus lengths, non-random trailing byte distributions, and issuer lineage (`eMudhra Sub-CA`, `eMudhra Limited`).
  - Reports status as `SECURE`, `SUSPICIOUS`, or `VULNERABLE` with immediate remediation steps.

### 3. Gemini 3.8 Flash Threat Forensics

- Ingests cryptographic indicators, DNS parameters, and HTTP header postures into Gemini 3.8 Flash using structured JSON schemas.
- Generates a holistic **Threat Score (0–100)**, **Risk Rating** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `SAFE`), attack vector classification (e.g. _Brand Impersonation & Weak CA Cryptography_), verifiable evidence bullet points, and actionable mitigation guidance.
- Includes a resilient cryptographic fallback engine when external model calls are offline.

### 4. Bulk URL Concurrent Probing Matrix

- Paste up to 12 domains or URLs simultaneously.
- Employs non-blocking `Promise.allSettled` to probe all targets concurrently on the backend.
- Provides a side-by-side **Comparison Matrix Table** with sorting (by threat score, domain, audit status) and risk level filtering (`All`, `Critical`, `High`, `Medium`, `Low`, `Safe`, `Failed`).
- Built-in one-click presets (`Banking Targets`, `Critical Infra`, `Mixed Risk`) and one-click "Inspect" deep-link back into the single-target audit view.
- Data export to **CSV** and SOC-ready clipboard text summaries.

### 5. Multi-Format Report Export (PDF & PNG)

- **Official Vector PDF Audit**: Generated via `jspdf` featuring dark theme styling, executive threat scores, 5-pillar security breakdowns, cryptographic parameters, header tables, and remediation checklists.
- **High-Resolution PNG Infographic**: 1200x760 pixel forensic cards rendered client-side on HTML5 Canvas for sharing directly in Slack, Jira, ServiceNow, or SOC incident feeds.
- **Web Share API**: One-click sharing with clipboard copy fallback.

### 6. Certificate Trust Score Surveillance (Recharts)

- Time-series surveillance line chart displaying domain trust score fluctuations over time.
- Automated anomaly detection identifying **Security Maintenance Lapses** (e.g., sudden cryptographic downgrades, expired certificates, or weak CA issuance).

### 7. Community Threat Intelligence Feed

- Collaborative threat reporting repository (`/api/threats`) with real-time upvoting (`/api/threats/vote`), keyword search, and tag filtering (`phishing`, `malware`, `impersonation`, `weak-ca`, `scam`).
- Allows security analysts to submit new threat sightings with domain, attack vector, severity, and forensic notes.

---

## Architecture & Tech Stack

| Layer                    | Technology                                                                                    | Purpose                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Framework**            | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) | Full-stack React SSR / client routing engine                  |
| **Runtime & Dev Server** | [Vite 8](https://vitejs.dev/) + Node.js (Port 3000)                                           | Fast compilation, HMR, and server middleware                  |
| **Styling**              | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables                                   | Anti-AI slop design, dense tabular layouts, dark/light theme  |
| **Typography**           | `DM Sans` + `IBM Plex Mono`                                                                   | High legibility for cryptographic hashes and forensic metrics |
| **AI Threat Synthesis**  | [@google/genai](https://www.npmjs.com/package/@google/genai)                                  | Gemini 3.8 Flash structured threat analysis                   |
| **Cryptographic Engine** | Node.js `tls`, `crypto`, `dns`                                                                | Raw socket handshakes, X.509 cert decoding, ASN.1 inspection  |
| **Data Visualization**   | [Recharts 2](https://recharts.org/)                                                           | Trust score fluctuation surveillance charts                   |
| **Report Generation**    | [jsPDF](https://github.com/parallax/jsPDF) + HTML5 Canvas                                     | Vector PDF document generation & 1200x760 PNG card export     |
| **UI Primitives**        | Radix UI (`@radix-ui/*`) + Lucide Icons                                                       | Accessible headless components and consistent icons           |
| **Testing**              | [Vitest](https://vitest.dev/) + Testing Library                                               | Automated unit and integration testing suite                  |

---

## Directory Structure

```text
├── src/
│   ├── components/
│   │   ├── BulkUrlScanner.tsx         # Multi-domain concurrent scanner & comparison matrix
│   │   ├── CommunityThreatFeed.tsx    # Live threat feed with upvoting & tag filtering
│   │   ├── ShareReportModal.tsx       # PDF, PNG, and link sharing dialog
│   │   ├── TrustScoreTrendChart.tsx   # Recharts trust score surveillance & lapse detection
│   │   └── ui/                        # Shadcn / Radix headless primitives (Button, Input, etc.)
│   ├── lib/
│   │   ├── report-generator.ts        # jsPDF & Canvas 2D report generation routines
│   │   ├── scan.ts                    # Client-side URL normalization & step helpers
│   │   └── utils.ts                   # Tailwind merge & styling utilities
│   ├── routes/
│   │   ├── __root.tsx                 # Root layout with HTML headers and SEO tags
│   │   └── index.tsx                  # Primary TrustGuard dashboard & audit interface
│   ├── server/
│   │   ├── scanner.ts                 # Real TLS/crypto/dns socket engine & Gemini AI synthesis
│   │   └── threat-store.ts            # Community threat intelligence in-memory database
│   ├── server.ts                      # Nitro/TanStack server handler (/api/scan, /api/bulk-scan, /api/threats)
│   ├── styles.css                     # Tailwind CSS v4 design tokens and theme variables
│   └── test/                          # Comprehensive Vitest test suite (28 passing tests)
├── metadata.json                      # AI Studio build configuration
├── package.json                       # Dependencies & scripts
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd trustguard-ai
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional):
   Create a `.env` file in the project root based on `.env.example`:

   ```bash
   # Optional: Enables live Gemini 3.8 Flash model generation
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   _Note: If no Gemini API key is provided, TrustGuard AI automatically engages its deterministic cryptographic heuristic engine without failing or displaying errors._

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev`: Starts the Vite development server on `http://0.0.0.0:3000`.
- `npm run build`: Compiles the TypeScript application for production.
- `npm test`: Runs the Vitest test suite once.
- `npm run test:watch`: Runs tests in interactive watch mode.
- `npm run lint`: Validates source code with ESLint.
- `npm run format`: Formats code with Prettier.

---

## Security & Ethics Notice

TrustGuard AI is intended for defensive security operations, threat hunting, infrastructure verification, and digital trust research. Probing actions are limited to public TLS/HTTPS handshakes (port 443) and standard DNS resolution without intrusive exploits.
