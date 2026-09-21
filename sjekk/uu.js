// Zoom, live-område, dekorativ grafikk og kontrast målt på gjengitt farge.
var f = require("./felles.js");
var s = f.suite("uu");

(async function () {
  var b = await f.start();
  var ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  var p = await ctx.newPage();
  var jsfeil = []; p.on("pageerror", function (e) { jsfeil.push(e.message); });
  await p.goto(f.APP);

  s.t("zoom er tillatt", await p.evaluate(function () {
    var c = document.querySelector("meta[name=viewport]").content;
    return !/user-scalable\s*=\s*no|maximum-scale/.test(c);
  }), true);

  s.t("telleren er et live-område", await p.evaluate(function () {
    var e = document.getElementById("count");
    return [e.getAttribute("role"), e.getAttribute("aria-live")];
  }), ["status", "polite"]);

  s.t("stjernene er dekorative", await p.getAttribute("#starGrid", "aria-hidden"), "true");
  s.t("treet er dekorativt", await p.getAttribute("#tree", "aria-hidden"), "true");

  var lest = function () {
    return p.evaluate(function () { return document.querySelector("#count .sr").textContent; });
  };
  var synlig = function () {
    return p.evaluate(function () { return document.querySelector("#count [aria-hidden]").textContent; });
  };

  s.t("opplest tekst gir mening alene", await lest(), "0 av 10 stjerner");
  await p.click("#giveBtn"); await p.waitForTimeout(300);
  s.t("opplest tekst etter en stjerne", await lest(), "1 av 10 stjerner");
  s.t("synlig tekst er kort", await synlig(), "1 av 10");

  // Skrives telleren om unødig, leses den opp på nytt hver gang paint() kjører.
  await p.click("#soundBtn"); await p.waitForTimeout(150);
  s.t("lyd av/på leser ikke opp telleren på nytt",
      await p.getAttribute("#count", "data-lest"), "1 av 10 stjerner");

  await p.evaluate(function () {
    var l = []; for (var i = 0; i < 10; i++) l.push(new Date().toISOString());
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 10, log: l, prizesWon: 0, muted: true }));
  });
  await p.reload(); await p.waitForTimeout(300);
  s.t("opplest tekst ved mål", await lest(), "Alle 10 stjerner samlet! Treet blomstrer.");
  s.t("synlig tekst ved mål", await synlig(), "Alle 10! 🎉");

  var k = await p.evaluate(function () {
    function L(c) {
      var v = c.match(/\d+/g).map(Number).map(function (x) { return x / 255; })
        .map(function (x) { return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    }
    function cr(a, b) { var x = [L(a), L(b)].sort(function (m, n) { return n - m; }); return (x[0] + 0.05) / (x[1] + 0.05); }
    function g(sel) { return getComputedStyle(document.querySelector(sel)); }
    return {
      undertittel: cr(g(".subtitle").color, g(".header").backgroundColor),
      savedNote: cr(g(".savedNote").color, g(".grownupBox").backgroundColor),
      toggle: cr(g(".grownupToggle").color, g(".card").backgroundColor),
      teller: cr(g(".count").color, g(".card").backgroundColor)
    };
  });
  s.t("kontrast undertittel >= 4.5 (" + k.undertittel.toFixed(2) + ")", k.undertittel >= 4.5, true);
  s.t("kontrast savedNote >= 4.5 (" + k.savedNote.toFixed(2) + ")", k.savedNote >= 4.5, true);
  s.t("kontrast toggle >= 4.5 (" + k.toggle.toFixed(2) + ")", k.toggle >= 4.5, true);
  // Telleren er 30px og bold — stor tekst, krav 3:1.
  s.t("kontrast teller >= 3.0 (" + k.teller.toFixed(2) + ")", k.teller >= 3.0, true);

  s.t("ingen JS-feil", jsfeil, []);
  await b.close();
  s.slutt();
})();
