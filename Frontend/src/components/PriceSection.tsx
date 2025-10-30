import { useEffect, useState } from "react";
import { PRICE_URL } from "@/lib/constants";
import { useApp } from "@/contexts/AppContext";

type NewFeed = { updated_at: string; source: string; prices: { BTC_USD: number; BTC_BRL?: number } };
type OldFeed = { generated_at: string; btc_usd: number };

const fmtUSD = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

function normalize(feed: any): { updatedAt?: string; source?: string; USD?: number; BRL?: number } {
  // Novo schema
  if (feed && feed.prices && typeof feed.prices.BTC_USD === "number") {
    return {
      updatedAt: typeof feed.updated_at === "string" ? feed.updated_at : undefined,
      source: typeof feed.source === "string" ? feed.source : undefined,
      USD: feed.prices.BTC_USD,
      BRL: typeof feed.prices.BTC_BRL === "number" ? feed.prices.BRL : undefined,
    };
  }
  // Antigo schema (só USD)
  if (feed && typeof feed.btc_usd === "number") {
    return {
      updatedAt: typeof feed.generated_at === "string" ? feed.generated_at : undefined,
      source: "legacy",
      USD: feed.btc_usd,
    };
  }
  return {};
}

const PriceSection = () => {
  const { t } = useApp();
  const [priceUSD, setPriceUSD] = useState<number | null>(null);
  const [priceBRL, setPriceBRL] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadBTC() {
    setLoading(true);
    setError(null);
    try {
      const q = PRICE_URL.includes("?") ? "&" : "?";
      const res = await fetch(`${PRICE_URL}${q}t=${Date.now()}`, { 
        method: 'GET',
        mode: 'cors',
        cache: "no-store",
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const normalized = normalize(data);
      
      if (typeof normalized.USD !== "number") {
        throw new Error("Formato de feed inválido");
      }
      
      setPriceUSD(normalized.USD);
      setPriceBRL(typeof normalized.BRL === "number" ? normalized.BRL : null);
      setUpdatedAt(normalized.updatedAt ? new Date(normalized.updatedAt).toLocaleString("pt-BR") : null);
      setSource(normalized.source || null);
    } catch (error: any) {
      console.error("Erro ao carregar cotação:", error);
      setError(error?.message || "Falha ao carregar cotação");
      setPriceUSD(null);
      setPriceBRL(null);
      setUpdatedAt(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBTC();
  }, []);

  return (
    <section className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div 
          id="btc-price"
          className="rounded-lg border border-border bg-card p-6"
          style={{ 
            boxShadow: '0 0 8px rgba(247, 147, 26, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">
              💵 {t("quote_title")}
            </h2>
            <button 
              onClick={loadBTC} 
              disabled={loading}
              className="px-3 py-1.5 text-sm rounded-lg border border-primary/30 hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
            >
              {loading ? t("quote_updating") : t("quote_update")}
            </button>
          </div>

          {error && (
            <div className="mb-3 text-sm text-destructive">
              {t("quote_error")} {error}
            </div>
          )}

          {!error && (updatedAt || source) && (
            <div className="mb-3 text-xs text-muted-foreground text-center">
              {updatedAt && <span>{t("quote_updated")} {updatedAt}</span>}
              {source && <span> ({source})</span>}
            </div>
          )}

          <div className="text-center space-y-2">
            {priceUSD !== null ? (
              <>
                <p className="text-lg text-foreground">
                  1 BTC = <strong className="text-primary">{fmtUSD(priceUSD)}</strong> ({t("quote_usd")})
                </p>
                {priceBRL !== null && (
                  <p className="text-lg text-foreground">
                    1 BTC = <strong className="text-primary">{fmtBRL(priceBRL)}</strong> ({t("quote_brl")})
                  </p>
                )}
              </>
            ) : (
              <div className="animate-pulse flex justify-center">
                <div className="h-8 w-64 bg-muted rounded"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceSection;
