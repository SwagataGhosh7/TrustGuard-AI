export const SCAN_DURATION_MS = 3000;

export const SCAN_STEPS = [
  "Extracting TLS certificates...",
  "Analyzing DOM heuristics...",
  "Checking Certificate Transparency logs...",
  "Validating eMudhra CA signatures...",
] as const;