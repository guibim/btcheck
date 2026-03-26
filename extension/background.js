/* ── btcheck · background service worker (MV3) ─────────────────── */
const PRICE_URL  = "https://guibim.github.io/btcheck/btc_price.json";
const FG_URL     = "https://api.alternative.me/fng/?limit=1";
const ALARM_NAME = "btcheck-refresh";
const INTERVAL   = 10; // minutes

/* ── Alarm setup ────────────────────────────────────────────────── */
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: INTERVAL });
  fetchAndStore();
});

chrome.runtime.onStartup.addListener(() => {
  fetchAndStore();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) fetchAndStore();
});

/* ── Fetch & cache ─────────────────────────────────────────────── */
async function fetchAndStore() {
  await Promise.allSettled([fetchPrice(), fetchFearGreed()]);
}

async function fetchPrice() {
  try {
    const res  = await fetch(PRICE_URL + "?t=" + Date.now());
    const data = await res.json();
    await chrome.storage.local.set({
      btcheck_price: {
        usd: data.usd ?? null,
        brl: data.brl ?? null,
        ts:  Date.now(),
      },
    });
  } catch (_) {}
}

async function fetchFearGreed() {
  try {
    const res  = await fetch(FG_URL);
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return;
    await chrome.storage.local.set({
      btcheck_fg: {
        value:          item.value,
        classification: item.value_classification,
        ts:             Date.now(),
      },
    });
  } catch (_) {}
}
