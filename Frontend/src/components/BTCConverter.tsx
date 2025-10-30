import React, { useEffect, useMemo, useRef, useState } from "react";
import { PRICE_URL } from "@/lib/constants";
import { useApp } from "@/contexts/AppContext";

type PriceFeed = {
  updated_at: string;
  source: string;
  prices: { BTC_USD: number; BTC_BRL: number };
};
type Mode = "BRL→BTC" | "USD→BTC" | "BTC→BRL" | "BTC→USD";

const fmtUSD = (n: number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n||0);
const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const fmtBTC = (n: number) => `${(n||0).toFixed(8)} BTC`;

function isValidFeed(json: any): json is PriceFeed {
  return !!(
    json && json.prices &&
    typeof json.prices.BTC_BRL === "number" && Number.isFinite(json.prices.BTC_BRL) &&
    typeof json.prices.BTC_USD === "number" && Number.isFinite(json.prices.BTC_USD) &&
    typeof json.updated_at === "string" &&
    typeof json.source === "string"
  );
}

async function loadPriceFeed(): Promise<PriceFeed> {
  // cache-buster p/ evitar versões antigas do Pages/CDN
  const qs = `t=${Date.now()}`;
  const url = PRICE_URL.includes("?") ? `${PRICE_URL}&${qs}` : `${PRICE_URL}?${qs}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  
  // Adapt the real JSON format to expected format
  if (j?.btc_usd) {
    const usdToBrlRate = 5.75;
    const BTC_USD = j.btc_usd;
    const BTC_BRL = BTC_USD * usdToBrlRate;
    
    const adapted = {
      updated_at: j.generated_at || new Date().toISOString(),
      source: "GitHub Pages",
      prices: { BTC_USD, BTC_BRL }
    };
    
    if (!isValidFeed(adapted)) throw new Error("Malformed price feed");
    return adapted;
  }
  
  if (!isValidFeed(j)) throw new Error("Malformed price feed");
  return j;
}

function convert(v: number, mode: Mode, usd: number, brl: number) {
  let btc = 0, usdOut = 0, brlOut = 0;
  switch (mode) {
    case "BRL→BTC": btc = v / brl; brlOut = v; usdOut = brlOut * (usd / brl); break;
    case "USD→BTC": btc = v / usd; usdOut = v; brlOut = usdOut * (brl / usd); break;
    case "BTC→BRL": btc = v; brlOut = btc * brl; usdOut = btc * usd; break;
    case "BTC→USD": btc = v; usdOut = btc * usd; brlOut = btc * brl; break;
  }
  return { btc, usdOut, brlOut };
}

export default function BtcConverterSection() {
  const { t } = useApp();
  const [feed, setFeed] = useState<PriceFeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("BRL→BTC");
  const [rawInput, setRawInput] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const lastGood = useRef<PriceFeed | null>(null);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const f = await loadPriceFeed();
      setFeed(f);
      lastGood.current = f;
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar");
      if (lastGood.current) setFeed(lastGood.current);
      else setFeed(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const handleInputChange = (value: string) => {
    // Aceitar apenas 0-9, vírgula e ponto
    const filtered = value.replace(/[^0-9.,]/g, "");
    
    // Permitir apenas um separador decimal
    const parts = filtered.split(/[.,]/);
    if (parts.length > 2) return;
    
    let final = parts[0];
    if (parts.length === 2) {
      // Limitar casas decimais
      const isBTC = mode.startsWith("BTC");
      const maxDecimals = isBTC ? 2 : 8;
      const decimals = parts[1].slice(0, maxDecimals);
      final = `${parts[0]}.${decimals}`;
    }
    
    setRawInput(final);
    setWarning("");
  };

  const numericInput = useMemo(() => {
    const normalized = rawInput.replace(/,/g, ".");
    let val = Number(normalized);
    if (!Number.isFinite(val)) return 0;
    
    // Aplicar limites
    const isBTC = mode.startsWith("BTC");
    const max = isBTC ? 21_000_000 : 999_000_000_000;
    
    if (val > max) {
      setWarning(t("converter_warning_limit"));
      return max;
    }
    
    return val;
  }, [rawInput, mode, t]);

  const calc = useMemo(() => {
    if (!feed) return { btc: 0, usdOut: 0, brlOut: 0 };
    const { BTC_USD: P_USD, BTC_BRL: P_BRL } = feed.prices;
    return convert(numericInput, mode, P_USD, P_BRL);
  }, [feed, numericInput, mode]);

  const updated = feed?.updated_at ? new Date(feed.updated_at).toLocaleString("pt-BR") : null;
  const offline = !!error && !!lastGood.current;

  return (
    <section id="conversor-btc" className="w-full mx-auto p-4 scroll-mt-24">
      <div className="bg-card border border-border rounded-2xl p-5" style={{ boxShadow: '0 0 8px rgba(247,147,26,0.2)' }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-primary">{t("converter_title")}</h2>
          <div className="flex items-center gap-2">
            {offline && <span className="text-xs px-2 py-1 rounded bg-yellow-900/30 text-yellow-500">{t("converter_offline")}</span>}
            <button onClick={refresh} className="px-3 py-1.5 text-sm rounded-xl border border-border hover:bg-secondary text-foreground" aria-label={t("converter_update")}>
              {loading ? t("converter_updating") : t("converter_update")}
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          {loading && <span className="animate-pulse">{t("converter_loading")}</span>}
          {error && <span className="text-destructive">{t("converter_error")} {error}</span>}
          {updated && !loading && <span>{t("converter_updated")} {updated} ({feed?.source})</span>}
          {warning && <span className="text-yellow-500">{warning}</span>}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">{t("converter_value")}</label>
            <input
              inputMode="decimal"
              placeholder={mode.startsWith("BTC") ? "Ex.: 0.01" : "Ex.: 1000"}
              value={rawInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={!feed}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("converter_direction")}</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground"
              disabled={!feed}
            >
              <option>BRL→BTC</option>
              <option>USD→BTC</option>
              <option>BTC→BRL</option>
              <option>BTC→USD</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <ResultCard label="BTC" value={fmtBTC(calc.btc)} hint={t("converter_hint_btc")} />
          <ResultCard label="BRL" value={fmtBRL(calc.brlOut)} hint={t("converter_hint_brl")} />
          <ResultCard label="USD" value={fmtUSD(calc.usdOut)} hint={t("converter_hint_usd")} />
        </div>

        {feed && (
          <div className="mt-6 text-sm text-muted-foreground space-y-1">
            <div>1 BTC = <span className="text-primary">{fmtUSD(feed.prices.BTC_USD)}</span> (USD)</div>
            <div>1 BTC = <span className="text-primary">{fmtBRL(feed.prices.BTC_BRL)}</span> (BRL)</div>
          </div>
        )}
      </div>
    </section>
  );
}

function ResultCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border p-4 bg-background">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold break-words text-primary">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
