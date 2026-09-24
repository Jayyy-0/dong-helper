#!/usr/bin/env python3
"""Generate the conversion-table pages from rates.json.

Runs every morning in GitHub Actions right after update_rates.py, so the
numbers in the static HTML (what search engines read) always match today's rate.

    python scripts/build_tables.py
"""
import json
from datetime import datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://jayyy-0.github.io/dong-helper/"
RATES = json.loads((ROOT / "rates.json").read_text(encoding="utf-8"))
R = RATES["rates"]
DAY = datetime.strptime(RATES["updated"], "%Y-%m-%dT%H:%M:%SZ")

VND_AMOUNTS = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000,
               1_000_000, 2_000_000, 5_000_000, 10_000_000]
NOTES = [500_000, 200_000, 100_000, 50_000, 20_000, 10_000, 5_000, 2_000, 1_000]
PHO = 55_000  # middle of the typical 40k–70k range used by the price checker

CUR = {
    "INR": {"sym": "₹", "name": "Indian Rupees", "short": "rupees", "file": "guides/vnd-to-inr.html",
            "reverse": [100, 500, 1000, 2000, 5000, 10000, 50000]},
    "AUD": {"sym": "A$", "name": "Australian Dollars", "short": "Australian dollars", "file": "guides/vnd-to-aud.html",
            "reverse": [10, 20, 50, 100, 200, 500, 1000]},
    "USD": {"sym": "US$", "name": "US Dollars", "short": "US dollars", "file": "guides/vnd-to-usd.html",
            "reverse": [1, 5, 10, 20, 50, 100, 500]},
    "JPY": {"sym": "¥", "file": "ja/vnd-yen-hayamihyo.html",
            "reverse": [1000, 5000, 10000, 30000, 50000, 100000]},
}


# ---------- formatting ----------
def money(v, code):
    sym = CUR[code]["sym"]
    if code in ("INR", "JPY") or v >= 100:
        return f"{sym}{v:,.0f}"
    return f"{sym}{v:,.2f}"


def vnd(v):
    return f"{round(v, -2):,.0f} ₫"


def short_vnd(v):
    if v >= 1_000_000 and v % 1_000_000 == 0:
        return f"{v // 1_000_000}M"
    return f"{v // 1000}k"


def man(v):
    """Japanese reading: 10000 -> 1万, 1500000 -> 150万."""
    m = v / 10_000
    return (f"{m:,.0f}" if m == int(m) else f"{m:,.1f}") + "万"


def notes_for(v):
    out, rest = [], v
    for n in NOTES:
        k, rest = divmod(rest, n)
        if k:
            out.append((n, k))
    return out


def notes_en(v):
    return " + ".join(f"{short_vnd(n)}×{k}" for n, k in notes_for(v))


def notes_ja(v):
    return " + ".join(f"{man(n)}×{k}" for n, k in notes_for(v))


def pho_range(v):
    """How many bowls at the typical 40k-70k price, e.g. (1, 2) for 100k."""
    return v // 70_000, v // 40_000


def buys_en(v):
    if v <= 10_000:
        return "a bottle of water"
    if v <= 20_000:
        return "a bánh mì or an iced coffee"
    if v <= 50_000:
        return "a bowl of phở"
    if v <= 500_000:
        lo, hi = pho_range(v)
        extra = " or a 60-min foot massage" if v == 200_000 else ""
        return f"{lo}–{hi} bowls of phở{extra}"
    return "—"


def buys_ja(v):
    if v <= 10_000:
        return "水1本"
    if v <= 20_000:
        return "バインミー1個・コーヒー1杯"
    if v <= 50_000:
        return "フォー1杯"
    if v <= 500_000:
        lo, hi = pho_range(v)
        extra = "・足マッサージ60分" if v == 200_000 else ""
        return f"フォー{lo}〜{hi}杯{extra}"
    return "—"


def rule(code):
    per1000 = 1000 / R[code]
    return f"× {per1000:.1f}" if per1000 >= 1 else f"÷ {R[code] / 1000:.1f}"


# ---------- page shell ----------
def page(lang, path, title, desc, h1, body):
    home = "./" if lang == "ja" else "../"
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<link rel="canonical" href="{SITE}{path}">
<link rel="icon" href="../icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../style.css">
<script src="../config.js"></script>
<script src="../shared.js"></script>
</head>
<body>
<div class="wrap">
  <header class="top"><a class="brand" href="{home}">
    <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#c8102e"/><path fill="#f2b705" d="M32 12l5.6 17.2H55L40.7 39.8l5.5 17.2L32 46.4 17.8 57l5.5-17.2L9 29.2h17.4z"/></svg>
    <span>Dong Helper</span></a></header>
  <article class="article">
    <h1>{escape(h1)}</h1>
{body}
  </article>
  <footer><p><a href="{home}">Dong Helper</a> · <a href="../privacy.html">{"プライバシー" if lang == "ja" else "Privacy"}</a> ·
  <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates By Exchange Rate API</a></p></footer>
</div>
</body>
</html>
"""


def fmt_date(lang):
    if lang == "ja":
        return f"{DAY.year}年{DAY.month}月{DAY.day}日"
    return f"{DAY.day} {DAY.strftime('%B')} {DAY.year}"


# ---------- English pages (INR / AUD / USD) ----------
def build_en(code):
    c = CUR[code]
    rate = R[code]
    others = " · ".join(f'<a href="{CUR[o]["file"].split("/")[-1]}">VND to {o}</a>' for o in ("INR", "AUD", "USD") if o != code)
    rows = "\n".join(
        f"      <tr><td><b>{v:,} ₫</b></td><td><b>{money(v / rate, code)}</b></td>"
        f"<td>{notes_en(v)}</td><td>{buys_en(v)}</td></tr>" for v in VND_AMOUNTS)
    rev = "\n".join(
        f"      <tr><td>{money(a, code)}</td><td><b>{vnd(a * rate)}</b></td></tr>" for a in c["reverse"])
    ex100 = money(100_000 / rate, code)
    ex500 = money(500_000 / rate, code)
    body = f"""    <p class="meta">Updated {fmt_date("en")} · 1 {code} = {rate:,.2f} ₫ · updated automatically every day</p>
    <p><b>100,000 dong = {ex100}</b> and <b>500,000 dong = {ex500}</b> at today's rate.
    Quick mental rule: drop the last three zeros, then <b>{rule(code)}</b>.</p>

    <h2>Vietnamese dong to {c["name"]}</h2>
    <table>
      <tr><th>Dong</th><th>{code}</th><th>Notes to pay</th><th>What it buys</th></tr>
{rows}
    </table>

    <a class="cta" href="../?c={code}&lang=en">Convert any amount + check if a price is fair</a>

    <h2>{c["name"]} to Vietnamese dong</h2>
    <table>
      <tr><th>{code}</th><th>Dong</th></tr>
{rev}
    </table>

    <h2>Tips</h2>
    <ul>
      <li>Prices in Vietnam are often written as <b>50k</b> (50,000 ₫) or <b>50.000</b> (a dot separates thousands).</li>
      <li>The 20,000 and 500,000 notes are both blue. Check the zeros before you hand one over.</li>
      <li>When a card machine or ATM offers to charge you in {code}, choose <b>VND</b>; the conversion rate is usually better.</li>
      <li>Not sure if you're paying too much? See <a href="../#price">typical 2026 prices</a>.</li>
    </ul>

    <h2>Useful for your trip<span class="pr">Ad</span></h2>
    <div class="ess">
      <a data-aff="wise" href="#"><span class="ico">💳</span><span><b>Multi-currency card</b><span>Pay in dong at the real exchange rate</span></span><span class="go">›</span></a>
      <a data-aff="airalo" href="#"><span class="ico">📶</span><span><b>Vietnam eSIM</b><span>Data from the moment you land</span></span><span class="go">›</span></a>
    </div>
    <p class="meta">Some links are affiliate links: we may earn a small commission at no extra cost to you.
    Rates are mid-market reference rates; banks and exchange counters add their own margin.</p>
    <p class="meta">Other currencies: {others} · <a href="../ja/vnd-yen-hayamihyo.html">ドン→円(日本語)</a></p>"""
    title = f"VND to {code} Table: Vietnamese Dong in {c['short'].title()} (Updated {fmt_date('en')})"
    desc = (f"100,000 dong = {ex100}, 500,000 dong = {ex500}. Conversion table from 10,000 to 10 million "
            f"Vietnamese dong in {c['short']}, with the banknotes to pay and what each amount buys. Updated daily.")
    h1 = f"Vietnamese dong to {c['short']}: conversion table"
    return page("en", c["file"], title, desc, h1, body)


# ---------- Japanese page (JPY) ----------
def build_ja():
    rate = R["JPY"]
    rows = "\n".join(
        f"      <tr><td><b>{man(v)}ドン</b><br><span class=\"meta\">{v:,}</span></td><td><b>{money(v / rate, 'JPY')}</b></td>"
        f"<td>{notes_ja(v)}</td><td>{buys_ja(v)}</td></tr>" for v in VND_AMOUNTS)
    rev = "\n".join(
        f"      <tr><td>{a:,}円</td><td><b>{vnd(a * rate)}</b><br><span class=\"meta\">約{man(round(a * rate, -3))}ドン</span></td></tr>"
        for a in CUR["JPY"]["reverse"])
    y10 = money(100_000 / rate, "JPY")
    y50 = money(500_000 / rate, "JPY")
    y100 = money(1_000_000 / rate, "JPY")
    body = f"""    <p class="meta">{fmt_date("ja")}更新 · 1円 = {rate:,.1f}ドン · 毎日自動で更新しています</p>
    <p>今日のレートでは <b>10万ドン = {y10}</b>、<b>50万ドン = {y50}</b>、<b>100万ドン = {y100}</b> です。
    暗算するなら「<b>ゼロを3つ取って {rule("JPY")}</b>」で円になります。</p>

    <h2>ベトナムドン → 日本円 早見表</h2>
    <table>
      <tr><th>ドン</th><th>日本円</th><th>出すお札</th><th>買えるもの</th></tr>
{rows}
    </table>

    <a class="cta" href="./">好きな金額を換算・ぼったくり判定する</a>

    <h2>日本円 → ベトナムドン 早見表</h2>
    <table>
      <tr><th>日本円</th><th>ドン</th></tr>
{rev}
    </table>

    <h2>換算のときの注意</h2>
    <ul>
      <li>メニューの「<b>50k</b>」は5万ドン、「<b>50.000</b>」も5万ドンです(ピリオドは桁区切り)。</li>
      <li>2万ドン札と50万ドン札はどちらも青色です。出す前にゼロの数を確認しましょう。</li>
      <li>カード払いやATMで「日本円で決済しますか?」と聞かれたら、<b>VND(ドン)</b>を選ぶほうが多くの場合お得です。</li>
      <li>この表は市場の参考レートです。両替所や銀行ではこれより少し不利なレートになります。</li>
      <li>値段が高すぎないか気になったら、<a href="./#price">2026年の相場一覧</a>を確認してください。</li>
    </ul>

    <h2>出発前に準備しておくと便利なもの<span class="pr">PR</span></h2>
    <div class="ess">
      <a data-aff="wise" href="#"><span class="ico">💳</span><span><b>多通貨デビットカード</b><span>実際の為替レートでドン払い</span></span><span class="go">›</span></a>
      <a data-aff="airalo" href="#"><span class="ico">📶</span><span><b>ベトナム eSIM</b><span>着いてすぐGrabや地図が使えます</span></span><span class="go">›</span></a>
    </div>
    <p class="meta">このページにはアフィリエイトリンク(広告)を含みます。</p>
    <p class="meta">関連:<a href="vietnam-okane.html">ベトナムのお金ガイド</a> · <a href="../guides/vnd-to-usd.html">VND to USD (English)</a></p>"""
    title = f"ベトナムドン→円 早見表【{DAY.month}月{DAY.day}日のレート】10万ドン={y10}|1万〜1000万ドン"
    desc = (f"10万ドンは{y10}、50万ドンは{y50}、100万ドンは{y100}(今日のレート)。1万〜1000万ドンの日本円換算と、"
            "出すお札・買えるものの目安を一覧に。円→ドンの早見表付き。毎日自動更新。")
    h1 = "ベトナムドン → 日本円 早見表(毎日更新)"
    return page("ja", CUR["JPY"]["file"], title, desc, h1, body)


def main():
    for code in ("INR", "AUD", "USD"):
        (ROOT / CUR[code]["file"]).write_text(build_en(code), encoding="utf-8", newline="\n")
    (ROOT / CUR["JPY"]["file"]).write_text(build_ja(), encoding="utf-8", newline="\n")
    print("built tables for", DAY.date(), {k: R[k] for k in CUR})


if __name__ == "__main__":
    main()
