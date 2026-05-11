const MAX_SLUG = 40;

export function sanitizeFilenamePart(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, MAX_SLUG) || 'prediction';
}

/** YYYYMMDD in local time */
export function dateStampLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Base filename without extension, e.g. world-cup-2026-prediction-hossein-20260511
 */
export function buildExportBasename(displayName) {
  const slug = sanitizeFilenamePart(displayName);
  const stamp = dateStampLocal();
  const needsStamp = !displayName?.trim() || slug === 'prediction';
  return needsStamp
    ? `world-cup-2026-prediction-${slug}-${stamp}`
    : `world-cup-2026-prediction-${slug}`;
}
