export const NEWS_URL  = "https://guibim.github.io/btcheck/news.json";
export const PRICE_URL = "https://guibim.github.io/btcheck/btc_price.json";

// API pública (subscribe / unsubscribe) — deploy no Render
// Em dev: VITE_API_URL=http://localhost:8000 no .env local
// Em prod: definido como GitHub Variable → VITE_API_URL
export const API_URL = import.meta.env.VITE_API_URL ?? "";
