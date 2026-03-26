/* ── Constants ─────────────────────────────────────────────────── */
const PRICE_URL  = "https://guibim.github.io/btcheck/btc_price.json";
const FG_URL     = "https://api.alternative.me/fng/?limit=1";
const CACHE_KEY  = "btcheck_price";
const LANG_KEY   = "btcheck_lang";

/* ── i18n ──────────────────────────────────────────────────────── */
const I18N = {
  "pt-BR": {
    subtitle:    "Cotação Bitcoin",
    converter:   "Conversor",
    updated:     "Atualizado",
    updating:    "Atualizando…",
    error:       "Erro ao carregar",
    tab_brl_btc: "BRL → BTC",
    tab_usd_btc: "USD → BTC",
    tab_btc_all: "BTC → Fiat",
    prefix_brl:  "R$",
    prefix_usd:  "US$",
    prefix_btc:  "₿",
    fg_label:    "Fear & Greed",
  },
  "en": {
    subtitle:    "Bitcoin Price",
    converter:   "Converter",
    updated:     "Updated",
    updating:    "Updating…",
    error:       "Failed to load",
    tab_brl_btc: "BRL → BTC",
    tab_usd_btc: "USD → BTC",
    tab_btc_all: "BTC → Fiat",
    prefix_brl:  "R$",
    prefix_usd:  "US$",
    prefix_btc:  "₿",
    fg_label:    "Fear & Greed",
  },
};

/* ── Fear & Greed helpers ──────────────────────────────────────── */
const FG_COLORS = {
  "Extreme Fear":  "#ef4444",
  "Fear":          "#f97316",
  "Neutral":       "#eab308",
  "Greed":         "#84cc16",
  "Extreme Greed": "#22c55e",
};

function fgColor(classification) {
  return FG_COLORS[classification] || "#94a3b8";
}

/* ── State ─────────────────────────────────────────────────────── */
let state = {
  lang:    "pt-BR",
  btcUsd:  null,
  btcBrl:  null,
  fgValue: null,
  fgClass: null,
  mode:    "BRL_TO_BTC",
};

/* ── DOM refs ──────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── Language ──────────────────────────────────────────────────── */
function applyLang() {
  const tr = I18N[state.lang];
  $("subtitle").textContent        = tr.subtitle;
  $("converter-title").textContent = tr.converter;
  $("fg-label").textContent        = tr.fg_label;

  // Mode tab labels
  document.querySelectorAll(".mode-tab").forEach(btn => {
    const mode = btn.dataset.mode;
    if (mode === "BRL_TO_BTC") btn.textContent = tr.tab_brl_btc;
    if (mode === "USD_TO_BTC") btn.textContent = tr.tab_usd_btc;
    if (mode === "BTC_TO_ALL") btn.textContent = tr.tab_btc_all;
  });

  updatePrefix();
}

function updatePrefix() {
  const tr = I18N[state.lang];
  const prefixes = { BRL_TO_BTC: tr.prefix_brl, USD_TO_BTC: tr.prefix_usd, BTC_TO_ALL: tr.prefix_btc };
  $("input-prefix").textContent = prefixes[state.mode];
}

/* ── Price display ─────────────────────────────────────────────── */
function renderPrices() {
  $("price-usd").textContent = state.btcUsd
    ? "$" + state.btcUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : "—";
  $("price-brl").textContent = state.btcBrl
    ? "R$" + state.btcBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : "—";
}

function renderFG() {
  if (state.fgValue === null) return;
  $("fg-value").textContent  = state.fgValue + " — " + (state.fgClass || "");
  $("fg-dot").style.background = fgColor(state.fgClass);
}

/* ── Converter ─────────────────────────────────────────────────── */
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  updatePrefix();
  $("converter-input").value = "";
  hideAllResults();
}

function hideAllResults() {
  ["result-btc", "result-usd", "result-brl-conv"].forEach(id => {
    $(id).style.display = "none";
  });
}

function showResult(id, value) {
  $(id).style.display = "flex";
  document.querySelector("#" + id + " .result-value").textContent = value;
}

function convert(rawInput) {
  hideAllResults();
  if (!rawInput) return;

  const val = parseFloat(rawInput.replace(",", "."));
  if (isNaN(val) || val <= 0) return;

  const usd = state.btcUsd;
  const brl = state.btcBrl;

  if (!usd) return;

  if (state.mode === "BRL_TO_BTC") {
    if (!brl) return;
    const btc = val / brl;
    showResult("result-btc", btc.toFixed(8) + " BTC");
    showResult("result-usd", "$" + (btc * usd).toLocaleString("en-US", { maximumFractionDigits: 2 }));
  } else if (state.mode === "USD_TO_BTC") {
    const btc = val / usd;
    showResult("result-btc", btc.toFixed(8) + " BTC");
    if (brl) showResult("result-brl-conv", "R$" + (btc * brl).toLocaleString("pt-BR", { maximumFractionDigits: 2 }));
  } else if (state.mode === "BTC_TO_ALL") {
    showResult("result-usd", "$" + (val * usd).toLocaleString("en-US", { maximumFractionDigits: 2 }));
    if (brl) showResult("result-brl-conv", "R$" + (val * brl).toLocaleString("pt-BR", { maximumFractionDigits: 2 }));
  }
}

/* ── Data fetching ─────────────────────────────────────────────── */
async function fetchPrice() {
  const btn = $("btn-refresh");
  btn.classList.add("spin");
  const tr = I18N[state.lang];
  $("updated-at").textContent = tr.updating;

  try {
    const res  = await fetch(PRICE_URL + "?t=" + Date.now());
    const data = await res.json();

    state.btcUsd = data.usd ?? null;
    state.btcBrl = data.brl ?? null;

    // Persist to storage
    chrome.storage.local.set({
      [CACHE_KEY]: { usd: state.btcUsd, brl: state.btcBrl, ts: Date.now() }
    });

    renderPrices();
    updateTimestamp(data.updated_at || new Date().toISOString());

    // Re-run active conversion
    convert($("converter-input").value);
  } catch (e) {
    $("updated-at").textContent = tr.error;
  } finally {
    btn.classList.remove("spin");
  }
}

async function fetchFearGreed() {
  try {
    const res  = await fetch(FG_URL);
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return;
    state.fgValue = item.value;
    state.fgClass = item.value_classification;
    chrome.storage.local.set({ btcheck_fg: { value: item.value, classification: item.value_classification, ts: Date.now() } });
    renderFG();
  } catch (_) {}
}

function updateTimestamp(iso) {
  const tr   = I18N[state.lang];
  const date = new Date(iso);
  const time = date.toLocaleTimeString(state.lang, { hour: "2-digit", minute: "2-digit" });
  $("updated-at").textContent = tr.updated + " " + time;
}

/* ── Load from cache then refresh ─────────────────────────────── */
function loadFromCache() {
  chrome.storage.local.get([CACHE_KEY, "btcheck_fg", LANG_KEY], result => {
    // Language
    if (result[LANG_KEY]) {
      state.lang = result[LANG_KEY];
    }
    applyLang();

    // Price cache
    const cached = result[CACHE_KEY];
    if (cached) {
      state.btcUsd = cached.usd;
      state.btcBrl = cached.brl;
      renderPrices();
      updateTimestamp(new Date(cached.ts).toISOString());
    }

    // FG cache
    const fg = result["btcheck_fg"];
    if (fg) {
      state.fgValue = fg.value;
      state.fgClass = fg.classification;
      renderFG();
    }

    // Always refresh
    fetchPrice();
    fetchFearGreed();
  });
}

/* ── Init ──────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Mode tabs
  document.querySelectorAll(".mode-tab").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  // Converter input
  $("converter-input").addEventListener("input", e => convert(e.target.value));

  // Refresh button
  $("btn-refresh").addEventListener("click", () => {
    fetchPrice();
    fetchFearGreed();
  });

  // Language toggle
  $("btn-lang").addEventListener("click", () => {
    state.lang = state.lang === "pt-BR" ? "en" : "pt-BR";
    chrome.storage.local.set({ [LANG_KEY]: state.lang });
    applyLang();
    renderPrices();
    renderFG();
    convert($("converter-input").value);
  });

  // Footer link
  $("link-site").addEventListener("click", e => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://guibim.github.io/btcheck" });
  });

  loadFromCache();
});
