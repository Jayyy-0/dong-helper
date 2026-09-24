#!/usr/bin/env python3
"""Build ja/index.html from index.html.

The Japanese page needs its own URL and Japanese text in the HTML itself so
search engines index it as a Japanese page. Run this after editing index.html:

    python scripts/build_ja.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://jayyy-0.github.io/dong-helper/"

src = (ROOT / "index.html").read_text(encoding="utf-8")
out = src

# --- head ---
out = out.replace('<html lang="en">',
                  '<html lang="ja" data-root="../" data-default-lang="ja" data-default-cur="JPY">')
out = re.sub(r"<title>.*?</title>",
             "<title>ベトナムのぼったくり判定・お札早見・ドン円換算【2026年の相場】| Dong Helper</title>", out)
out = re.sub(r'<meta name="description" content=".*?">',
             '<meta name="description" content="ベトナム旅行で「この値段は高すぎ?」をすぐ判定。フォー・Grab・空港タクシー・マッサージの2026年の相場、'
             '出すお札(2万と50万の見分け方)、今日のレートでのドン→円換算。無料・オフラインでも使えます。">', out)
out = out.replace(f'<link rel="canonical" href="{SITE}">', f'<link rel="canonical" href="{SITE}ja/">')
out = out.replace(f'<meta property="og:url" content="{SITE}">', f'<meta property="og:url" content="{SITE}ja/">')
out = re.sub(r'<meta property="og:title" content=".*?">',
             '<meta property="og:title" content="ベトナムのぼったくり判定・お札早見">', out)
out = re.sub(r'<meta property="og:description" content=".*?">',
             '<meta property="og:description" content="2026年の相場チェック、出すお札、ドン円換算。ベトナム旅行者向けの無料ツール。">', out)

# --- relative asset paths (page lives one folder down) ---
for attr in ("href", "src"):
    out = re.sub(rf'{attr}="(?!https?:|#|\.\./|mailto:)([^"]+)"', rf'{attr}="../\1"', out)
out = out.replace('href=".././"', 'href="./"')

# --- visible static text (JS re-renders most of it, but crawlers read this) ---
static = {
    ">Is this price fair in Vietnam?<": ">ベトナムのぼったくり判定・お札早見<",
    ">Check local prices, pick the right banknotes and convert dong at today's rate.<":
        ">地元の相場チェック、出すお札の確認、今日のレートでのドン換算がこれ1つでできます。<",
    ">Convert<": ">換算<", ">Fair price?<": ">適正価格?<", ">Split bill<": ">割り勘<",
    ">Banknotes to hand over<": ">出すお札<",
    ">What are you buying?<": ">何を買いますか?<", ">Typical price<": ">一般的な価格<",
    ">Price you were quoted (₫)<": ">言われた金額(ドン)<",
    ">Bill total (₫)<": ">合計金額(ドン)<", ">People<": ">人数<", ">Tip<": ">チップ<",
    ">Each person pays<": ">1人あたり<",
    ">Share this tool<": ">このツールを共有<", ">Add to home screen<": ">ホーム画面に追加<",
    ">Trip essentials<": ">旅の必需品<", '>Ad</span>': '>PR</span>', ">Guides<": ">ガイド<",
    ">Privacy<": ">プライバシー<",
}
for a, b in static.items():
    out = out.replace(a, b)

# --- crawlable content section in Japanese ---
seo_ja = """<section class="card seo" id="price">
    <h2>ベトナムの物価・相場一覧(2026年)</h2>
    <p>ハノイ・ダナン・ホーチミンの地元の店で普通に払う金額の目安です。観光地、ホテル、空港では高くなります。右の列を超える金額を言われたら、聞き直すか近くの店と比べましょう。</p>
    <table>
      <tr><th>品目</th><th>相場</th><th>これ以上は高すぎ</th></tr>
      <tr><td>フォー</td><td>4万〜7万ドン(約240〜430円)</td><td>11万ドン</td></tr>
      <tr><td>バインミー</td><td>2万〜4万ドン(約120〜240円)</td><td>7万ドン</td></tr>
      <tr><td>精進料理のご飯セット(コムチャイ)</td><td>3万〜5.5万ドン</td><td>9万ドン</td></tr>
      <tr><td>ベトナムコーヒー(練乳・氷)</td><td>2万〜4万ドン</td><td>7.5万ドン</td></tr>
      <tr><td>ココナッツジュース</td><td>2万〜4万ドン</td><td>7万ドン</td></tr>
      <tr><td>地ビール</td><td>1.5万〜3.5万ドン</td><td>7万ドン</td></tr>
      <tr><td>水 500ml</td><td>5千〜1万ドン</td><td>2.5万ドン</td></tr>
      <tr><td>Grabバイク 約3km</td><td>1.5万〜3万ドン</td><td>6万ドン</td></tr>
      <tr><td>Grabカー 約5km</td><td>5.5万〜10万ドン</td><td>18万ドン</td></tr>
      <tr><td>空港→市内 タクシー</td><td>15万〜35万ドン(約900〜2,100円)</td><td>60万ドン</td></tr>
      <tr><td>足マッサージ 60分</td><td>15万〜30万ドン</td><td>55万ドン</td></tr>
      <tr><td>ランドリー 1kg</td><td>2.5万〜4万ドン</td><td>8万ドン</td></tr>
      <tr><td>旅行者SIM 30日</td><td>15万〜30万ドン</td><td>50万ドン</td></tr>
    </table>
    <p class="small">円は1円 ≈ 164ドンで計算した目安です。上のツールは毎日更新のレートで計算します。</p>

    <h2>取り違えやすいベトナムのお札</h2>
    <ul>
      <li><b>2万ドン札と50万ドン札</b>はどちらも青色です。一番多い間違いで、「お札のすり替え」トラブルの原因にもなります。</li>
      <li><b>1万ドン札と20万ドン札</b>は、暗い所では色が似て見えます(茶・黄とオレンジ・赤)。</li>
      <li>高額札で払うときは金額を声に出し、お釣りはその場で数えましょう。</li>
    </ul>

    <h2>よくある質問</h2>
    <h3>メニューの「50k」とは?</h3>
    <p>5万ドンのことです。ベトナムでは「50.000」のように、ピリオドを桁の区切りに使うこともあります。</p>
    <h3>10万ドンは日本円でいくら?</h3>
    <p>約610円です(1円 ≈ 164ドンの場合)。暗算なら「ゼロを3つ取って約6倍」で円になります。1万〜1000万ドンの一覧は<a href="vnd-yen-hayamihyo.html">ベトナムドン→円 早見表</a>(毎日更新)をどうぞ。</p>
    <h3>ベトナムでチップは必要?</h3>
    <p>地元の食堂では不要です。スパやツアーでは2万〜5万ドン程度渡すと喜ばれます。先に伝票のサービス料を確認しましょう。</p>
    <h3>ぼったくられたと思ったら?</h3>
    <p>まず金額を紙やスマホに書いてもらい、ゼロの数を確認しましょう。Grabなら事前に料金が確定するので、タクシーやバイクタクシーの料金トラブルを避けられます。</p>
  </section>"""
out = re.sub(r'<section class="card seo"[^>]*>.*?</section>', lambda m: seo_ja, out, flags=re.S)

(ROOT / "ja" / "index.html").write_text(out, encoding="utf-8", newline="\n")
print("wrote ja/index.html")
