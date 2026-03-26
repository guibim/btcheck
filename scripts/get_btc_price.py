# scripts/get_btc_price.py
import requests, json
from datetime import datetime, timezone
from pathlib import Path

def get_btc_prices():
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "bitcoin", "vs_currencies": "usd,brl"}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()["bitcoin"]
    return {"BTC_USD": data["usd"], "BTC_BRL": data["brl"]}

def main():
    prices = get_btc_prices()
    Path("public").mkdir(exist_ok=True)

    payload = {
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "coingecko",
        "prices": prices,
    }

    with open("public/btc_price.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    print(f"✅ BTC Price atualizado: USD {prices['BTC_USD']} | BRL {prices['BTC_BRL']}")

if __name__ == "__main__":
    main()
