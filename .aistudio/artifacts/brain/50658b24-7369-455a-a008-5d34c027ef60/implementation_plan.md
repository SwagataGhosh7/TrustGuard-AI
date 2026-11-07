# TrustGuard AI — Web Threat Detection & Digital Trust Intelligence

An accessible, enterprise-grade digital trust intelligence platform that conducts real-time server-side TLS handshake audits, cryptographic validation (including eMudhra/weak key detection and Certificate Transparency log verification), web security header checks, live Gemini 3.8 Flash threat classification, and interactive community threat intelligence without mock data.

### User Review & Critical Decisions

> [!IMPORTANT]
> All primary architectural decisions have been aligned with your responses:
>
> 1. **Live Network & AI Pipeline**: Real server-side TLS sockets (`tls.connect`), DNS resolution (`dns.promises`), HTTP header analysis, and Gemini 3.8 Flash structured reasoning.
> 2. **Cryptographic Validation**: Deep certificate chain inspection, Certificate Transparency (crt.sh) queries, weak RSA/ECDSA key detection, and specific eMudhra CA key generation checks.
> 3. **Collaborative Intelligence**: Real interactive community report feed with upvoting, verification tags (Credential Theft, Brand Spoofing, Impersonation), and a direct report submission workflow.

---

### 1. Overview & Core Concept

TrustGuard AI provides actionable visibility into web security risks and digital certificate integrity. Rather than relying on static or mocked indicators, it executes authentic network probes to inspect:

- **Transport Security & Cryptographic Trust**: Validates certificate validity, issuer authority, cipher suites, key length, Subject Alternative Names (SANs), CT log entries, and specific flaws like eMudhra weak key generation or ROCA/untrusted CA fingerprints.
- **Application Security Posture**: Evaluates live HTTP security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy), redirect anomalies, and DNS records (MX, SPF, DMARC presence).
- **Gemini 3.8 Flash AI Threat Analysis**: Synthesizes domain lexical patterns (homoglyphs, brand spoofing, deceptive urgency) with live network telemetry to generate an evidence-based threat assessment.
- **Collaborative Threat Intelligence**: Enables security analysts and users to submit suspicious URLs, upvote/downvote reports, filter by verified attack vectors, and export forensic JSON reports.

---

### 2. User Experience & Visual Design

#### Layout Structure & Navigation

- **Top Bar Contract**: Adheres strictly to the 1-row, 3-zone contract:
  - _Zone 1 (Brand)_: Clean text wordmark `TrustGuard AI` in display typography (`DM Sans`).
  - _Zone 2 (Nav Links)_: 4 single-line links (`Dashboard`, `Threat Feed`, `Cert Inspector`, `Submit Threat`) with subtle active highlights.
  - _Zone 3 (Primary Action)_: Live scan trigger button (`Deep Scan`).
- **Workspace Layout**:
  - **Live Investigation Banner**: Domain input with automatic URL normalization, instant pre-flight checks, and real-time step progress indicator during live network probes.
  - **Pillar 1: Cryptographic & Certificate Trust**: Full peer certificate display (Common Name, Issuer, SAN count, Serial, Expiry countdown, Key size in bits, Cipher suite, CT log match, eMudhra key generation vulnerability audit badge).
  - **Pillar 2: Application Web Security**: Real HTTP response headers grid with pass/warn/fail status, redirect chain breakdown, and DNS/mail protection badges.
  - **Pillar 3: AI Forensic Assessment**: Gemini 3.8 Flash synthesis explaining phishing risk score (0-100), primary attack vector, matched threat signals, and mitigation guidance.
  - **Collaborative Community Feed**: Interactive list of reported threats with live upvoting, tag filtering, domain search, and modal form to submit fresh threats with immediate verification.

#### Design Tokens & Anti-Slop Discipline

- **Color Palette (60-30-10)**:
  - 60% Canvas: Dark slate background (`oklch(0.15 0.012 250)`).
  - 30% Structural: Subdued card surfaces (`oklch(0.19 0.014 250)`) with crisp 1px borders (`oklch(0.3 0.018 245)`).
  - 10% Accent: Vivid emerald/teal (`oklch(0.76 0.15 177)`), amber warnings, and crimson danger.
- **Zero-Pill Discipline**: Metadata rendered as clean unboxed text separated by `·` and `/` without candy capsule wrappers.
- **Tabular Rigor**: Monospace tabular numerals (`font-mono tabular-nums`) for timestamps, RSA key lengths, port latencies, and threat scores.

---

### 3. Key Product Decisions & Trade-Offs

- **Real Server-Side Network Handshake**:
  - _Chosen_: Server-side endpoints via Express/Nitro running native Node.js `tls.connect` and `fetch` with raw socket inspection.
  - _Why_: Browsers strictly prohibit direct raw socket TLS handshake extraction (CORS/WebCrypto limitations). Server-side inspection allows reading full certificate chains, DER/PEM buffers, and raw response headers.
- **Certificate Transparency Logs Integration**:
  - _Chosen_: Querying public Certificate Transparency logs (crt.sh API) asynchronously during scan to correlate domain history and detect rogue certificates.
  - _Why_: Critical for detecting rogue CA issuance and eMudhra duplicate/weak key anomalies.
- **Collaborative Feed with Persistent In-Memory & Local Sync**:
  - _Chosen_: Shared server-side community repository with client-side optimistic upvoting and real submission.
  - _Why_: Provides immediate, real interaction with community reports without requiring third-party login or external database setup.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TrustGuard AI Client                          │
│                                                                        │
│   ┌─────────────────────┐   ┌─────────────────┐   ┌────────────────┐   │
│   │ URL Scan Controller │   │ Threat Feed     │   │ Submit Modal   │   │
│   │ (Normalizer/State)  │   │ (Upvote/Filter) │   │ (New Threat)   │   │
│   └──────────┬──────────┘   └────────┬────────┘   └───────┬────────┘   │
└──────────────┼───────────────────────┼────────────────────┼────────────┘
               │                       │                    │
               ▼                       ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Server-Side API Routes                          │
│                                                                        │
│   ┌───────────────────────┐  ┌───────────────────────┐                 │
│   │ /api/scan             │  │ /api/threats          │                 │
│   │ - tls.connect socket  │  │ - GET all reports     │                 │
│   │ - fetch HTTP headers  │  │ - POST new report     │                 │
│   │ - crt.sh CT logs      │  │ - POST upvote/downvote│                 │
│   │ - Gemini 3.8 Flash AI │  └───────────────────────┘                 │
│   └──────────┬────────────┘                                            │
└──────────────┼─────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     External Network Targets & AI                      │
│   - Target Domain HTTPS Port 443 (Real TLS Handshake & Headers)        │
│   - crt.sh (Real Certificate Transparency Log Verification)            │
│   - Google GenAI SDK (gemini-3.8-flash for Real Threat Scoring)        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities

```typescript
interface ScanResult {
  domain: string;
  targetUrl: string;
  timestamp: string;
  scanDurationMs: number;
  certificate: {
    subject: { CN: string; O?: string; C?: string };
    issuer: { CN: string; O?: string; C?: string };
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    fingerprint256: string;
    serialNumber: string;
    bits: number;
    keyAlgorithm: string;
    cipherSuite: string;
    protocol: string;
    sans: string[];
    isExpired: boolean;
    emudhraVulnerabilityCheck: {
      isVulnerable: boolean;
      issues: string[];
      keyGenerationStatus: "SECURE" | "SUSPICIOUS" | "VULNERABLE";
    };
    certificateTransparency: {
      logged: boolean;
      count: number;
      sampleEntries: Array<{ id: number; issuer_name: string; entry_timestamp: string }>;
    };
  };
  securityHeaders: {
    hsts: { present: boolean; value?: string };
    csp: { present: boolean; value?: string };
    xFrameOptions: { present: boolean; value?: string };
    xContentTypeOptions: { present: boolean; value?: string };
    referrerPolicy: { present: boolean; value?: string };
    score: number;
  };
  aiAnalysis: {
    threatScore: number;
    riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
    primaryVector: string;
    summary: string;
    indicators: string[];
    recommendations: string[];
  };
}

interface ThreatReport {
  id: string;
  domain: string;
  vector: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  reportedAt: string;
  votes: number;
  reportedBy: string;
  notes: string;
  userVoted?: boolean;
}
```

---
