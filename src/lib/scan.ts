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

export function isValidTargetUrl(input: string): boolean {
  const normalized = normalizeTargetUrl(input);
  if (!normalized) return false;

  try {
    const hostname = new URL(normalized).hostname.toLowerCase();
    const labels = hostname.split(".");
    return (
      labels.length >= 2 &&
      labels.every(
        (label) =>
          label.length > 0 &&
          label.length <= 63 &&
          !label.startsWith("-") &&
          !label.endsWith("-") &&
          /^[a-z0-9-]+$/i.test(label),
      ) &&
      labels[labels.length - 1]!.length >= 2
    );
  } catch {
    return false;
  }
}
