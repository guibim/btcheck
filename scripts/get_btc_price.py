# scripts/get_btc_price.py
import requests, json
from datetime import datetime, timezone
from pathlib import Path

def get_btc_usd_price():
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "bitcoin", "vs_currencies": "usd"}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()["bitcoin"]["usd"]

def main():
    price = get_btc_usd_price()
    Path("public").mkdir(exist_ok=True)
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "btc_usd": price
    }
    with open("public/btc_price.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"BTC/USD atualizado: ${price}")

if __name__ == "__main__":
    main()
