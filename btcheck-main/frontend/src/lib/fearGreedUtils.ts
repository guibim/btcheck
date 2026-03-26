/**
 * Fear & Greed Index utilities
 * Color bands and classifications for crypto sentiment
 */

export type FngBand = "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";

export interface FngData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
}

export interface FngResponse {
  name: string;
  data: FngData[];
  metadata: {
    error?: string;
  };
}

/**
 * Get color for a given Fear & Greed Index value
 * @param value - Index value (0-100)
 * @returns Hex color string
 */
export function getFngColor(value: number): string {
  if (value >= 75) return "#16a34a"; // Extreme Greed
  if (value >= 55) return "#22c55e"; // Greed
  if (value >= 45) return "#6b7280"; // Neutral
  if (value >= 25) return "#f97316"; // Fear
  return "#dc2626"; // Extreme Fear
}

/**
 * Get classification band for a given Fear & Greed Index value
 * @param value - Index value (0-100)
 * @returns Classification string
 */
export function getFngBand(value: number): FngBand {
  if (value >= 75) return "Extreme Greed";
  if (value >= 55) return "Greed";
  if (value >= 45) return "Neutral";
  if (value >= 25) return "Fear";
  return "Extreme Fear";
}

/**
 * Format timestamp to readable date
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatFngDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Format timestamp to short date for chart
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string (dd/MM)
 */
export function formatFngDateShort(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

/**
 * Get all color bands with labels
 * @returns Array of band definitions
 */
export function getFngBands() {
  return [
    { min: 0, max: 24, label: "Extreme Fear", color: "#dc2626" },
    { min: 25, max: 44, label: "Fear", color: "#f97316" },
    { min: 45, max: 54, label: "Neutral", color: "#6b7280" },
    { min: 55, max: 74, label: "Greed", color: "#22c55e" },
    { min: 75, max: 100, label: "Extreme Greed", color: "#16a34a" },
  ];
}
