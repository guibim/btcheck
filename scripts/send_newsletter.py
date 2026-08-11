# scripts/send_newsletter.py
# Envia o digest semanal Bitcoin para todos os subscribers confirmados.
# Roda toda sexta-feira via GitHub Actions.
# Fontes de dados: Neon (artigos) + Supabase (subscribers — ainda escritos pelas
# Edge Functions subscribe/unsubscribe; migrar quando esse backend for para o Neon).

import os
import textwrap
from datetime import datetime, timezone
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import psycopg
from psycopg.rows import dict_row
import resend

# ===== Config =====
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SITE_URL       = "https://guibim.github.io/btcheck"
FROM_EMAIL     = "btcheck <onboarding@resend.dev>"   # TODO: trocar para newsletter@newsletter-btcheck.com após verificar domínio no Resend
NEWS_LIMIT     = int(os.environ.get("NEWS_LIMIT", "10"))

for var, val in [
    ("RESEND_API_KEY",           RESEND_API_KEY),
    ("DATABASE_URL_READONLY",    os.environ.get("DATABASE_URL_READONLY", "")),
    ("SUBSCRIBERS_DATABASE_URL", os.environ.get("SUBSCRIBERS_DATABASE_URL", "")),
]:
    if not val:
        raise SystemExit(f"Variável de ambiente '{var}' não definida.")

resend.api_key = RESEND_API_KEY


def _clean(raw: str) -> str:
    parts = urlsplit(raw.strip())
    qs = dict(parse_qsl(parts.query, keep_blank_values=True))
    qs.pop("channel_binding", None)
    qs["sslmode"] = "require"
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(qs), parts.fragment))


# Artigos: Neon. Subscribers: Supabase (enquanto subscribe/unsubscribe não migra).
ARTICLES_DATABASE_URL    = _clean(os.environ.get("DATABASE_URL_READONLY", ""))
SUBSCRIBERS_DATABASE_URL = _clean(os.environ.get("SUBSCRIBERS_DATABASE_URL", ""))

ARTICLES_QUERY = """
    SELECT
        title, url, source, summary,
        to_char(published_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS published_date
    FROM articles
    WHERE lang = %s
      AND published_at >= NOW() - INTERVAL '7 days'
    ORDER BY relevance_score DESC, published_at DESC
    LIMIT %s
"""

SUBSCRIBERS_QUERY = """
    SELECT email, token
    FROM subscribers
    WHERE lang = %s AND confirmed = true
"""


def fetch_top_articles(lang: str) -> list[dict]:
    with psycopg.connect(ARTICLES_DATABASE_URL, row_factory=dict_row) as conn:
        return conn.execute(ARTICLES_QUERY, (lang, NEWS_LIMIT)).fetchall()


def fetch_subscribers(lang: str) -> list[dict]:
    with psycopg.connect(SUBSCRIBERS_DATABASE_URL, row_factory=dict_row) as conn:
        return conn.execute(SUBSCRIBERS_QUERY, (lang,)).fetchall()


# ── Templates de e-mail ────────────────────────────────────────────────────────
LABELS = {
    "pt-BR": {
        "subject":     "₿ btcheck · Top notícias Bitcoin da semana",
        "header_sub":  "Resumo semanal · Bitcoin",
        "intro":       "As notícias mais relevantes sobre Bitcoin dos últimos 7 dias, selecionadas automaticamente pelo btcheck.",
        "read_more":   "Leia mais →",
        "footer_unsub":"Cancelar inscrição",
        "footer_copy": "dados automatizados · Desenvolvido por guibim",
        "no_news":     "Não há notícias suficientes esta semana. Até a próxima sexta!",
    },
    "en": {
        "subject":     "₿ btcheck · Top Bitcoin news of the week",
        "header_sub":  "Weekly digest · Bitcoin",
        "intro":       "The most relevant Bitcoin news from the last 7 days, automatically curated by btcheck.",
        "read_more":   "Read more →",
        "footer_unsub":"Unsubscribe",
        "footer_copy": "automated data · Developed by guibim",
        "no_news":     "Not enough news this week. See you next Friday!",
    },
}


def article_block(article: dict, read_more_label: str) -> str:
    summary_short = textwrap.shorten(article.get("summary") or "", width=200, placeholder="…")
    return f"""
    <div style="padding:20px 0;border-bottom:1px solid #1f2937;">
      <p style="color:#6b7280;font-size:12px;margin:0 0 6px;">
        {article['source']} &middot; {article['published_date']}
      </p>
      <h2 style="font-size:17px;font-weight:600;margin:0 0 8px;line-height:1.4;">
        <a href="{article['url']}" style="color:#f7931a;text-decoration:none;">
          {article['title']}
        </a>
      </h2>
      {"" if not summary_short else f'<p style="color:#9ca3af;font-size:14px;margin:0 0 8px;line-height:1.5;">{summary_short}</p>'}
      <a href="{article['url']}" style="color:#f7931a;font-size:13px;text-decoration:none;">
        {read_more_label}
      </a>
    </div>"""


def build_html(articles: list[dict], lang: str, token: str) -> str:
    lbl = LABELS[lang]
    unsub_url = f"{SITE_URL}/unsubscribe?token={token}"
    articles_html = (
        "".join(article_block(a, lbl["read_more"]) for a in articles)
        if articles
        else f'<p style="color:#9ca3af;padding:20px 0;">{lbl["no_news"]}</p>'
    )
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{lbl['subject']}</title>
</head>
<body style="background:#0f172a;color:#e5e7eb;font-family:Inter,ui-sans-serif,system-ui,sans-serif;margin:0;padding:24px 16px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="text-align:center;padding:32px 0 24px;border-bottom:2px solid #f7931a;">
      <h1 style="color:#f7931a;font-size:32px;margin:0;font-weight:800;">₿ btcheck</h1>
      <p style="color:#9ca3af;margin:8px 0 0;font-size:14px;">{lbl['header_sub']}</p>
    </div>
    <p style="color:#d1d5db;font-size:15px;line-height:1.6;padding:24px 0 8px;">{lbl['intro']}</p>
    {articles_html}
    <div style="padding:32px 0 16px;text-align:center;">
      <a href="{SITE_URL}" style="color:#f7931a;text-decoration:none;font-weight:600;">
        guibim.github.io/btcheck
      </a>
      <p style="color:#4b5563;font-size:12px;margin:16px 0 4px;">{lbl['footer_copy']}</p>
      <a href="{unsub_url}" style="color:#6b7280;font-size:11px;text-decoration:underline;">
        {lbl['footer_unsub']}
      </a>
    </div>
  </div>
</body>
</html>"""


# ── Envio ─────────────────────────────────────────────────────────────────────
def send_digest(lang: str) -> None:
    subscribers = fetch_subscribers(lang)
    if not subscribers:
        print(f"[{lang}] Nenhum subscriber ativo. Pulando.")
        return

    articles = fetch_top_articles(lang)
    lbl = LABELS[lang]
    sent = errors = 0

    for sub in subscribers:
        html = build_html(articles, lang, sub["token"])
        try:
            resend.Emails.send({
                "from":    FROM_EMAIL,
                "to":      [sub["email"]],
                "subject": lbl["subject"],
                "html":    html,
            })
            sent += 1
        except Exception as e:
            print(f"  ✗ {sub['email']}: {e}")
            errors += 1

    print(f"[{lang}] Enviados: {sent} | Erros: {errors} | Artigos: {len(articles)}")


def main():
    print(f"Newsletter — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    send_digest("pt-BR")
    send_digest("en")


if __name__ == "__main__":
    main()
