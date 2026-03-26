import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats dates to dd/mm/yyyy.
 * Supports:
 * - "YYYY-MM-DD" (date-only)  -> no Date parsing (avoids timezone shifting like 21:00)
 * - ISO datetime strings      -> formats to dd/mm/yyyy (no time)
 */
export function formatDateBR(value: string, tz = "America/Sao_Paulo") {
  if (!value) return "";

  // Date-only: YYYY-MM-DD -> dd/mm/yyyy (avoid Date() to prevent timezone quirks)
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  }

  // ISO datetime -> dd/mm/yyyy (timezone-aware)
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dt);
}