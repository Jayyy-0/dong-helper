/*
 * Dong Helper — site settings
 * ------------------------------------------------------------
 * ここだけ編集すれば収益化リンクと計測が有効になります。
 * Edit only this file to turn on affiliate links and analytics.
 *
 * affiliates.*.url : 各サービスのアフィリエイト管理画面で発行された
 *                    あなた専用のリンクに置き換えてください。
 *                    置き換えるまでは通常のリンク(報酬なし)として動きます。
 */
window.DH_CONFIG = {
  // 独自ドメインを取ったら書き換え(例: "https://donghelper.com")
  siteUrl: "",

  // 投げ銭リンク(Ko-fi / Buy Me a Coffee など)。空ならフッターに表示しない
  tipJar: "",

  // GoatCounter(無料・Cookie不要)のコード。例: "donghelper" → donghelper.goatcounter.com
  goatcounter: "jayyy-0",

  affiliates: {
    // eSIM(データ通信)— Airalo Partner Program
    airalo: { url: "https://www.airalo.com/vietnam-esim" },
    // 空港送迎・ツアー・SIM受取 — Klook Affiliate
    klook:  { url: "https://www.klook.com/country/13-vietnam-things-to-do/" },
    // ホテル — Agoda Partners
    agoda:  { url: "https://www.agoda.com/country/vietnam.html" },
    // 長距離バス・鉄道・フェリー — 12Go Affiliate
    twelvego: { url: "https://12go.asia/en/travel/vietnam" },
    // 多通貨デビットカード — Wise(紹介/アフィリエイト)
    wise:   { url: "https://wise.com/" }
  }
};
