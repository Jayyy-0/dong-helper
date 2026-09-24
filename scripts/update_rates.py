#!/usr/bin/env python3
"""Fetch today's rates and write rates.json (VND per 1 unit of each currency).

Primary:  open.er-api.com (ExchangeRate-API free tier, attribution required)
Fallback: fawazahmed0/currency-api via jsDelivr
If both fail or the numbers look wrong, keep yesterday's file and exit 0.
Standard library only, so the GitHub Action needs no pip install.
"""
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

CURRENCIES = ["USD", "AUD", "JPY", "INR"]
OUT = Path(__file__).resolve().parent.parent / "rates.json"
# Largest day-to-day move we accept before assuming the source is broken.
MAX_CHANGE = 0.15


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "dong-helper-rates/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def from_er_api():
    j = get_json("https://open.er-api.com/v6/latest/USD")
    if j.get("result") != "success":
        raise ValueError("er-api result: %s" % j.get("result"))
    r = j["rates"]
    vnd_per_usd = float(r["VND"])
    return {c: vnd_per_usd / float(r[c]) for c in CURRENCIES}, "open.er-api.com"


def from_fawaz():
    j = get_json("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/vnd.json")
    r = j["vnd"]  # units of X per 1 VND
    return {c: 1.0 / float(r[c.lower()]) for c in CURRENCIES}, "fawazahmed0/currency-api"


def looks_sane(new, old):
    # Rough absolute bounds (VND per unit) to catch garbage.
    bounds = {"USD": (15000, 40000), "AUD": (10000, 30000), "JPY": (80, 400), "INR": (150, 500)}
    for c, (lo, hi) in bounds.items():
        if not lo <= new[c] <= hi:
            return "%s=%.2f outside %s-%s" % (c, new[c], lo, hi)
    if old:
        for c in CURRENCIES:
            prev = old.get(c)
            if prev and abs(new[c] / prev - 1) > MAX_CHANGE:
                return "%s moved %.1f%% in a day" % (c, (new[c] / prev - 1) * 100)
    return None


def main():
    old = {}
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text(encoding="utf-8"))
            updated = datetime.strptime(prev["updated"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - updated).days
            # Only compare against a recent real fetch. After a seed file or a
            # multi-day outage, a big jump is expected and must not block updates.
            if prev.get("source") != "seed" and age_days <= 3:
                old = prev.get("rates", {})
        except (ValueError, KeyError):
            old = {}

    for fetch in (from_er_api, from_fawaz):
        try:
            rates, source = fetch()
        except Exception as e:  # network error, schema change, missing key
            print("source failed (%s): %s" % (fetch.__name__, e))
            continue
        problem = looks_sane(rates, old)
        if problem:
            print("rejected %s: %s" % (source, problem))
            continue
        data = {
            "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source": source,
            "base": "VND",
            "note": "VND per 1 unit of each currency. Overwritten daily by GitHub Actions.",
            "rates": {c: round(rates[c], 4 if rates[c] < 1000 else 1) for c in CURRENCIES},
        }
        OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        print("updated from %s: %s" % (source, data["rates"]))
        return 0

    print("all sources failed; keeping previous rates.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
