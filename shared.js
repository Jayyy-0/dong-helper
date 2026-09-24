/* Shared by the tool and the guide pages: affiliate links + analytics. */
(function () {
  var cfg = window.DH_CONFIG || {};

  function track(name) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: name, title: name, event: true });
      }
    } catch (e) {}
  }

  function wireAffiliates(root) {
    var links = (root || document).querySelectorAll("a[data-aff]");
    links.forEach(function (a) {
      var key = a.getAttribute("data-aff");
      var aff = cfg.affiliates && cfg.affiliates[key];
      if (aff && aff.url) a.href = aff.url;
      a.target = "_blank";
      a.rel = "sponsored nofollow noopener";
      if (!a.dataset.wired) {
        a.dataset.wired = "1";
        a.addEventListener("click", function () { track("aff-" + key); });
      }
    });
  }

  if (cfg.goatcounter) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + cfg.goatcounter + ".goatcounter.com/count");
    document.head.appendChild(s);
  }

  window.DH = { track: track, wireAffiliates: wireAffiliates };
  document.addEventListener("DOMContentLoaded", function () {
    wireAffiliates();
    var tj = document.getElementById("tipjar");
    if (tj && cfg.tipJar) {
      tj.querySelector("a").href = cfg.tipJar;
      tj.classList.remove("hidden");
    }
  });
})();
