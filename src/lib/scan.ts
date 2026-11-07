export const SCAN_DURATION_MS = 3000;

export const SCAN_STEPS = [
  "Extracting TLS certificates...",
  "Analyzing DOM heuristics...",
  "Checking Certificate Transparency logs...",
  "Validating eMudhra CA signatures...",
] as const;

export function normalizeTargetUrl(input: string): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
