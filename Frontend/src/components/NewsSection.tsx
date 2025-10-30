import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, Calendar, Building2 } from "lucide-react";
import { NEWS_URL } from "@/lib/constants";
import { useApp } from "@/contexts/AppContext";
import { formatDateBR } from "@/lib/utils";

interface NewsItem {
  title: string;
  summary?: string;
  url: string;
  published_at: string;
  source: string;
  image_url?: string;
}

const NewsSection = () => {
  const { t } = useApp();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch(NEWS_URL, { 
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
        setNews((data.items || []).slice(0, 10));
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <section className="container py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{t("news_title")}</h2>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6">
                <div className="h-4 w-32 bg-muted rounded mb-3"></div>
                <div className="h-6 w-full bg-muted rounded mb-4"></div>
                <div className="h-32 w-full bg-muted rounded mb-4"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {news.map((item, index) => (
              <article
                key={index}
                className="animate-fadeIn rounded-xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(247,147,26,0.15)] hover:border-primary/30"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateBR(item.published_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {item.source}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-semibold leading-tight">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-primary transition-colors hover:text-primary/80"
                  >
                    <span className="flex-1">{item.title}</span>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1" />
                  </a>
                </h3>

                {item.summary && (
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {item.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
