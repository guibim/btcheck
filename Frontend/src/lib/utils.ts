import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateBR(iso: string, tz = "America/Sao_Paulo") {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  
  // Convert from dd/mm/yyyy, HH:mm to dd-mm-yyyy HH:mm
  return formatted.replace(/\//g, "-").replace(",", "");
}
