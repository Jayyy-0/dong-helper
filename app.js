(function () {
  "use strict";

  // Fallback if rates.json can't be loaded (VND per 1 unit)
  var rates = { USD: 25960, AUD: 18290, JPY: 164, INR: 271 };
  var ratesUpdated = null;

  var CUR = {
    INR: { sym: "₹", dec: 0, loc: "en-IN" },
    AUD: { sym: "A$", dec: 2, loc: "en-AU" },
    JPY: { sym: "¥", dec: 0, loc: "ja-JP" },
    USD: { sym: "$", dec: 2, loc: "en-US" }
  };

  // Polymer notes 10k–500k, paper notes below. Colours approximate the real notes.
  var NOTES = [
    { v: 500000, c: "#2f8fb8" },
    { v: 200000, c: "#c9573c" },
    { v: 100000, c: "#4f8a4b" },
    { v: 50000,  c: "#b24f86" },
    { v: 20000,  c: "#3a64b5" },
    { v: 10000,  c: "#a8822f" },
    { v: 5000,   c: "#5a5f9e" },
    { v: 2000,   c: "#8a7560" },
    { v: 1000,   c: "#7d8a55" }
  ];

  // Typical local prices in VND: [low, high, overpriced-above]
  var ITEMS = [
    { id: "pho",     en: "Phở (noodle soup)",            ja: "フォー",                     p: [40000, 70000, 110000] },
    { id: "banhmi",  en: "Bánh mì",                      ja: "バインミー",                 p: [20000, 40000, 70000] },
    { id: "comchay", en: "Vegetarian rice plate (cơm chay)", ja: "精進料理のご飯セット(コムチャイ)", p: [30000, 55000, 90000] },
    { id: "coffee",  en: "Iced milk coffee (cà phê sữa đá)", ja: "ベトナムコーヒー(練乳・氷)", p: [20000, 40000, 75000] },
    { id: "coconut", en: "Fresh coconut",                ja: "ココナッツジュース",         p: [20000, 40000, 70000] },
    { id: "beer",    en: "Local beer (can / bottle)",    ja: "地ビール(缶・瓶)",          p: [15000, 35000, 70000] },
    { id: "water",   en: "Water 500 ml (shop)",          ja: "水 500ml(商店)",           p: [5000, 10000, 25000] },
    { id: "grabbike",en: "Grab bike, ~3 km",             ja: "Grabバイク 約3km",          p: [15000, 30000, 60000] },
    { id: "grabcar", en: "Grab car, ~5 km",              ja: "Grabカー 約5km",            p: [55000, 100000, 180000] },
    { id: "airport", en: "Taxi airport → centre (HCMC/Hanoi)", ja: "空港→市内 タクシー(ホーチミン/ハノイ)", p: [150000, 350000, 600000] },
    { id: "massage", en: "Foot massage, 60 min",         ja: "足マッサージ 60分",          p: [150000, 300000, 550000] },
    { id: "laundry", en: "Laundry, per kg",              ja: "ランドリー 1kgあたり",       p: [25000, 40000, 80000] },
    { id: "sim",     en: "Tourist SIM, 30 days data",    ja: "旅行者SIM 30日データ",       p: [150000, 300000, 500000] }
  ];

  var T = {
    en: {
      h1: "Is this price fair in Vietnam?",
      sub: "Check local prices, pick the right banknotes and convert dong at today's rate.",
      tabConvert: "Convert", tabPrice: "Fair price?", tabSplit: "Split bill",
      notesTitle: "Banknotes to hand over",
      notesHint: "Don't mix up 20,000 and 500,000 — both are blue. Check the zeros.",
      confuse: "blue, like 20k!", confuse2: "blue, like 500k!",
      rounded: "rounded to the nearest 1,000 ₫",
      priceItem: "What are you buying?", priceTypical: "Typical price",
      priceQuoted: "Price you were quoted (₫)",
      priceNote: "Rough 2026 guide for local shops in Hanoi, Da Nang and Ho Chi Minh City. Tourist streets, hotels and airports cost more.",
      vOk: "✓ Normal price. Go for it.",
      vWarn: "△ A bit high — normal for tourist areas, but you could compare nearby.",
      vBad: "✕ Much higher than usual. Ask again, check the zeros, or walk away politely.",
      vLow: "✓ Cheaper than usual — nice find!",
      splitTotal: "Bill total (₫)", splitPeople: "People", splitTip: "Tip", splitEach: "Each person pays",
      splitNote: "Tipping isn't expected in Vietnam, but it's appreciated at spas and on tours. Check the bill for a service charge (phí phục vụ) first.",
      share: "Share this tool", install: "Add to home screen", copied: "Link copied!",
      essTitle: "Trip essentials", prLabel: "Ad",
      guidesTitle: "Guides",
      disclosure: "Some links are affiliate links: if you book through them we may earn a small commission at no extra cost to you. It keeps this tool free.",
      privacy: "Privacy",
      rateDate: "Rates updated", stale: "(may be outdated — check before large payments)", offlineRates: "Using built-in rates",
      tipK: function (cs, f) { return "Think in thousands: drop the last 3 zeros, then " + f + ". e.g. 150k ₫ → " + cs; },
      tip1: function (a, b) { return a + " ≈ " + b; },
      ess: {
        airalo: ["Vietnam eSIM", "Data from the moment you land — no SIM shop queue"],
        klook: ["Airport pickup & tours", "Fixed price, no taxi haggling on arrival"],
        agoda: ["Hotels", "Compare stays in Hanoi, Da Nang, HCMC"],
        twelvego: ["Buses, trains & ferries", "Sleeper bus to Sapa, train to Hue, Ha Long boats"],
        wise: ["Multi-currency card", "Pay in dong at the real exchange rate"]
      }
    },
    ja: {
      h1: "ベトナムのぼったくり判定・お札早見",
      sub: "地元の相場チェック、出すお札の確認、今日のレートでのドン換算がこれ1つでできます。",
      tabConvert: "換算", tabPrice: "適正価格?", tabSplit: "割り勘",
      notesTitle: "出すお札",
      notesHint: "2万ドン札と50万ドン札はどちらも青色で取り違えやすいので、ゼロの数を確認しましょう。",
      confuse: "青色・2万と注意", confuse2: "青色・50万と注意",
      rounded: "1,000ドン単位に丸めています",
      priceItem: "何を買いますか?", priceTypical: "一般的な価格",
      priceQuoted: "言われた金額(ドン)",
      priceNote: "ハノイ・ダナン・ホーチミンの地元店の2026年時点の目安です。観光地、ホテル、空港では高くなります。",
      vOk: "✓ 普通の値段です。",
      vWarn: "△ 少し高め。観光地なら普通ですが、近くの店と比べても良いかも。",
      vBad: "✕ 相場よりかなり高いです。金額を聞き直す、ゼロの数を確認する、丁寧に断るなどを検討しましょう。",
      vLow: "✓ 相場より安いです!",
      splitTotal: "合計金額(ドン)", splitPeople: "人数", splitTip: "チップ", splitEach: "1人あたり",
      splitNote: "ベトナムではチップは必須ではありませんが、スパやツアーでは喜ばれます。先に伝票にサービス料(phí phục vụ)が含まれていないか確認しましょう。",
      share: "このツールを共有", install: "ホーム画面に追加", copied: "リンクをコピーしました",
      essTitle: "旅の必需品", prLabel: "PR",
      guidesTitle: "ガイド",
      disclosure: "このページにはアフィリエイトリンクを含みます。リンク経由で予約されると運営者に紹介料が入ることがありますが、お客様の支払額は変わりません。ツールの無料運営に役立てています。",
      privacy: "プライバシー",
      rateDate: "レート更新日", stale: "(古い可能性があります。大きな支払いの前に確認を)", offlineRates: "内蔵レートを使用中",
      tipK: function (cs, f) { return "暗算のコツ:ゼロを3つ取って " + f + "。例:15万ドン → " + cs; },
      tip1: function (a, b) { return a + " ≈ " + b; },
      ess: {
        airalo: ["ベトナム eSIM", "着いた瞬間からネットが使え、SIM売り場に並ばなくて済みます"],
        klook: ["空港送迎・ツアー", "料金が事前に確定するので、到着時にタクシーと値段交渉しなくて済みます"],
        agoda: ["ホテル", "ハノイ・ダナン・ホーチミンの宿を比較"],
        twelvego: ["バス・鉄道・フェリー", "サパ行き寝台バス、フエ行き列車、ハロン湾クルーズ"],
        wise: ["多通貨デビットカード", "実際の為替レートでドン払い"]
      }
    }
  };

  var GUIDES = {
    en: [
      ["guides/vegetarian-vietnam.html", "Vegetarian food in Vietnam: phrases, what to order, where to eat"],
      ["guides/vietnam-money-tips.html", "Vietnam money tips: banknotes, ATMs, cards and common tricks"]
    ],
    ja: [
      ["ja/vietnam-okane.html", "ベトナムのお金ガイド:お札の見分け方・両替・ATM・注意点"],
      ["guides/vietnam-money-tips.html", "Vietnam money tips (English)"]
    ]
  };

  var ESS_ORDER = { INR: ["airalo", "klook", "agoda", "twelvego", "wise"],
                    AUD: ["airalo", "twelvego", "klook", "agoda", "wise"],
                    JPY: ["airalo", "klook", "agoda", "wise", "twelvego"],
                    USD: ["airalo", "klook", "agoda", "twelvego", "wise"] };
  var ESS_ICON = { airalo: "📶", klook: "🚐", agoda: "🏨", twelvego: "🚆", wise: "💳" };

  // ---------- state ----------
  var state = { lang: "en", cur: "USD", reverse: false, tab: "convert" };

  function store(k, v) { try { localStorage.setItem("dh." + k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem("dh." + k); } catch (e) { return null; } }

  function detect() {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    nav = nav.toLowerCase();
    if (nav.indexOf("ja") === 0) return { lang: "ja", cur: "JPY" };
    if (nav === "en-in" || nav.indexOf("hi") === 0 || /-in$/.test(nav)) return { lang: "en", cur: "INR" };
    if (nav === "en-au" || nav === "en-nz") return { lang: "en", cur: "AUD" };
    return { lang: "en", cur: "USD" };
  }

  var q = new URLSearchParams(location.search);
  // Pages below the site root (e.g. /ja/) set data-root="../" and their own default language.
  var html = document.documentElement;
  var ROOT = html.getAttribute("data-root") || "";
  var d = detect();
  state.lang = q.get("lang") || html.getAttribute("data-default-lang") || load("lang") || d.lang;
  state.cur = q.get("c") || load("cur") || html.getAttribute("data-default-cur") || d.cur;
  if (!T[state.lang]) state.lang = "en";
  if (!CUR[state.cur]) state.cur = "USD";

  // ---------- helpers ----------
  var $ = function (id) { return document.getElementById(id); };
  function t(k) { return T[state.lang][k]; }
  function parseNum(s) { var n = parseFloat(String(s).replace(/[^\d.]/g, "")); return isFinite(n) ? n : 0; }
  function fmtVnd(n) { return Math.round(n).toLocaleString("en-US") + " ₫"; }
  function fmtCur(n, code) {
    var c = CUR[code];
    var dec = c.dec;
    if (dec && Math.abs(n) >= 100) dec = 0;
    return c.sym + n.toLocaleString(c.loc, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function toCur(vnd, code) { return vnd / rates[code]; }
  function fmtShortVnd(v) {
    if (v >= 1000 && v % 1000 === 0) return (v / 1000).toLocaleString("en-US") + "k";
    return v.toLocaleString("en-US");
  }
  function formatInput(el, allowDec) {
    var raw = el.value;
    if (allowDec) {
      var clean = raw.replace(/[^\d.]/g, "");
      var parts = clean.split(".");
      var intPart = parts[0] ? Number(parts[0]).toLocaleString("en-US") : "";
      el.value = parts.length > 1 ? intPart + "." + parts[1].slice(0, 2) : intPart;
    } else {
      var digits = raw.replace(/\D/g, "").slice(0, 12);
      el.value = digits ? Number(digits).toLocaleString("en-US") : "";
    }
  }

  // ---------- render ----------
  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === state.lang));
    });
    $("cur").value = state.cur;
    $("notesHint").textContent = t("notesHint");

    // item list
    var sel = $("item"), prev = sel.value;
    sel.innerHTML = "";
    ITEMS.forEach(function (it) {
      var o = document.createElement("option");
      o.value = it.id; o.textContent = it[state.lang];
      sel.appendChild(o);
    });
    if (prev) sel.value = prev;

    renderEss();
    renderGuides();
    renderRateInfo();
  }

  function renderChips() {
    var box = $("chips");
    box.innerHTML = "";
    var list = state.reverse
      ? [["+10", 10], ["+50", 50], ["+100", 100], ["+1,000", 1000]]
      : [["+10k", 10000], ["+50k", 50000], ["+100k", 100000], ["+500k", 500000], ["×1,000", "k"]];
    list.push(["C", "clear"]);
    list.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = c[0];
      b.addEventListener("click", function () {
        var el = $("amount"), n = parseNum(el.value);
        if (c[1] === "clear") n = 0;
        else if (c[1] === "k") n = n * 1000;
        else n += c[1];
        el.value = n ? n.toLocaleString("en-US") : "";
        update();
        el.focus();
      });
      box.appendChild(b);
    });
  }

  function update() {
    var input = parseNum($("amount").value);
    var vnd = state.reverse ? input * rates[state.cur] : input;
    $("unit").textContent = state.reverse ? CUR[state.cur].sym : "₫";
    $("amount").placeholder = state.reverse ? (state.cur === "JPY" ? "1,000" : state.cur === "INR" ? "500" : "20") : "150,000";

    if (!input) {
      $("big").textContent = "—";
      $("others").innerHTML = "";
      $("notes").innerHTML = "";
    } else {
      $("big").textContent = state.reverse ? fmtVnd(vnd) : fmtCur(toCur(vnd, state.cur), state.cur);
      var others = Object.keys(CUR).filter(function (c) { return c !== state.cur; })
        .map(function (c) { return "<span>" + fmtCur(toCur(vnd, c), c) + "</span>"; });
      if (state.reverse) others.unshift("<span>" + fmtCur(input, state.cur) + "</span>");
      $("others").innerHTML = others.join("");
      renderNotes(vnd);
    }
    renderTip();
    syncUrl(input);
  }

  function renderNotes(vnd) {
    var rounded = Math.round(vnd / 1000) * 1000;
    var rest = rounded, html = "";
    var used = {};
    NOTES.forEach(function (n) {
      var k = Math.floor(rest / n.v);
      if (k > 0) { used[n.v] = k; rest -= k * n.v; }
    });
    NOTES.forEach(function (n) {
      var k = used[n.v];
      if (!k) return;
      var warn = "";
      if (n.v === 500000 && used[20000]) warn = t("confuse");
      if (n.v === 20000 && used[500000]) warn = t("confuse2");
      html += '<div class="note"><div class="bill" style="background:' + n.c + '">' +
        fmtShortVnd(n.v) + '</div><span class="x">× ' + k + "</span>" +
        (warn ? '<span class="warn">⚠ ' + warn + "</span>" : "") + "</div>";
    });
    if (Math.abs(rounded - vnd) >= 1) html += '<p class="small">' + t("rounded") + "</p>";
    $("notes").innerHTML = html || '<p class="small">—</p>';
  }

  function renderTip() {
    var r = rates[state.cur];
    var per1000 = 1000 / r;
    var f, ex;
    var ex150 = fmtCur(150000 / r, state.cur);
    if (per1000 >= 1) {
      f = "× " + per1000.toFixed(1);
    } else {
      f = "÷ " + (r / 1000).toFixed(1);
    }
    ex = T[state.lang].tipK(ex150, f);
    var line2 = T[state.lang].tip1("1 " + state.cur, fmtVnd(r)) + " · " +
      T[state.lang].tip1("100,000 ₫", fmtCur(100000 / r, state.cur));
    $("tip").innerHTML = ex + "<br><span class='small'>" + line2 + "</span>";
  }

  function renderPrice() {
    var it = ITEMS.filter(function (x) { return x.id === $("item").value; })[0] || ITEMS[0];
    var p = it.p;
    $("range").textContent = fmtShortVnd(p[0]) + " – " + fmtShortVnd(p[1]) + " ₫";
    $("rangeConv").textContent = "≈ " + fmtCur(toCur(p[0], state.cur), state.cur) + " – " + fmtCur(toCur(p[1], state.cur), state.cur);
    var qv = parseNum($("quoted").value);
    var v = $("verdict");
    if (!qv) { v.className = "verdict hidden"; return; }
    // Support "80" meaning 80k when obviously too small
    if (qv < 1000) qv *= 1000;
    var cls, msg;
    if (qv < p[0]) { cls = "ok"; msg = t("vLow"); }
    else if (qv <= p[1]) { cls = "ok"; msg = t("vOk"); }
    else if (qv <= p[2]) { cls = "warn"; msg = t("vWarn"); }
    else { cls = "bad"; msg = t("vBad"); }
    v.className = "verdict " + cls;
    v.textContent = msg + "  (" + fmtVnd(qv) + " ≈ " + fmtCur(toCur(qv, state.cur), state.cur) + ")";
  }

  function renderSplit() {
    var total = parseNum($("bill").value);
    var n = Number($("people").value) || 1;
    var tip = Number($("tipPct").value) || 0;
    if (!total) { $("each").textContent = "—"; $("eachConv").textContent = ""; return; }
    var each = total * (1 + tip / 100) / n;
    var eachRounded = Math.ceil(each / 1000) * 1000;
    $("each").textContent = fmtVnd(eachRounded);
    $("eachConv").innerHTML = "<span>≈ " + fmtCur(toCur(eachRounded, state.cur), state.cur) + "</span>";
  }

  function renderEss() {
    var box = $("ess");
    box.innerHTML = "";
    (ESS_ORDER[state.cur] || ESS_ORDER.USD).forEach(function (k) {
      var txt = t("ess")[k];
      var a = document.createElement("a");
      a.setAttribute("data-aff", k);
      a.href = "#";
      a.innerHTML = '<span class="ico">' + ESS_ICON[k] + '</span><span><b></b><span></span></span><span class="go">›</span>';
      a.querySelector("b").textContent = txt[0];
      a.querySelector("span > span").textContent = txt[1];
      box.appendChild(a);
    });
    if (window.DH) window.DH.wireAffiliates(box);
  }

  function renderGuides() {
    var box = $("guides");
    box.querySelectorAll("a").forEach(function (a) { a.remove(); });
    GUIDES[state.lang].forEach(function (g) {
      var a = document.createElement("a");
      a.href = ROOT + g[0]; a.textContent = g[1];
      box.appendChild(a);
    });
  }

  function renderRateInfo() {
    var el = $("rateInfo");
    if (!ratesUpdated) { el.textContent = t("offlineRates"); return; }
    var dt = new Date(ratesUpdated);
    var days = (Date.now() - dt.getTime()) / 86400000;
    el.textContent = t("rateDate") + ": " + dt.toLocaleDateString(state.lang === "ja" ? "ja-JP" : "en-GB") +
      (days > 3 ? " " + t("stale") : "");
  }

  function syncUrl(amount) {
    var p = new URLSearchParams();
    if (amount) p.set("a", String(amount));
    if (state.reverse) p.set("r", "1");
    p.set("c", state.cur);
    p.set("lang", state.lang);
    try { history.replaceState(null, "", "?" + p.toString()); } catch (e) {}
  }

  function setTab(name) {
    state.tab = name;
    document.querySelectorAll("[data-tab]").forEach(function (b) {
      b.setAttribute("aria-selected", String(b.getAttribute("data-tab") === name));
    });
    document.querySelectorAll("[data-panel]").forEach(function (p) {
      p.classList.toggle("hidden", p.getAttribute("data-panel") !== name);
    });
    if (window.DH) window.DH.track("tab-" + name);
  }

  function renderAll() { applyI18n(); update(); renderPrice(); renderSplit(); }

  // ---------- events ----------
  $("amount").addEventListener("input", function () { formatInput(this, state.reverse); update(); });
  $("quoted").addEventListener("input", function () { formatInput(this); renderPrice(); });
  $("bill").addEventListener("input", function () { formatInput(this); renderSplit(); });
  $("item").addEventListener("change", renderPrice);
  $("people").addEventListener("change", renderSplit);
  $("tipPct").addEventListener("change", renderSplit);
  $("swap").addEventListener("click", function () {
    var input = parseNum($("amount").value);
    var next = state.reverse ? input * rates[state.cur] : input / rates[state.cur];
    state.reverse = !state.reverse;
    var dec = state.reverse ? CUR[state.cur].dec : 0;
    var shown = next ? next.toLocaleString("en-US", { maximumFractionDigits: dec }) : "";
    $("amount").value = shown === "0" ? "" : shown;
    renderChips(); update();
  });
  $("cur").addEventListener("change", function () {
    state.cur = this.value; store("cur", state.cur); renderAll();
  });
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.lang = b.getAttribute("data-lang"); store("lang", state.lang);
      // Each language has its own URL (for search engines); jump there if we're on the other one.
      var pageLang = html.getAttribute("data-default-lang") || "en";
      if (state.lang !== pageLang) {
        var target = state.lang === "ja" ? ROOT + "ja/" : (ROOT || "./");
        location.href = target + "?c=" + state.cur + "&lang=" + state.lang;
        return;
      }
      renderAll();
    });
  });
  document.querySelectorAll("[data-tab]").forEach(function (b) {
    b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
  });

  $("share").addEventListener("click", function () {
    var url = location.origin + location.pathname + "?lang=" + state.lang + "&c=" + state.cur;
    var data = { title: "Dong Helper", text: state.lang === "ja" ? "ベトナムドンの換算・お札・適正価格チェック" : "Vietnam dong converter, banknote picker & fair-price checker", url: url };
    if (navigator.share) {
      navigator.share(data).then(function () { window.DH && window.DH.track("share"); }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        var b = $("share"), old = b.textContent;
        b.textContent = t("copied");
        setTimeout(function () { b.textContent = old; }, 1600);
      });
    }
  });

  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferredPrompt = e; $("install").classList.remove("hidden");
  });
  $("install").addEventListener("click", function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (r) { if (r.outcome === "accepted") window.DH && window.DH.track("install"); });
    deferredPrompt = null; $("install").classList.add("hidden");
  });

  // ---------- init ----------
  for (var i = 1; i <= 12; i++) {
    var o = document.createElement("option"); o.value = i; o.textContent = i;
    if (i === 2) o.selected = true;
    $("people").appendChild(o);
  }
  if (q.get("a")) {
    state.reverse = q.get("r") === "1";
    $("amount").value = parseNum(q.get("a")).toLocaleString("en-US");
  }
  renderChips();
  renderAll();

  fetch(ROOT + "rates.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (j) {
      var ok = j && j.rates && Object.keys(CUR).every(function (c) { return j.rates[c] > 0; });
      if (!ok) return;
      rates = j.rates; ratesUpdated = j.updated;
      renderAll();
    })
    .catch(function () { renderRateInfo(); });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register(ROOT + "sw.js").catch(function () {});
  }
})();
