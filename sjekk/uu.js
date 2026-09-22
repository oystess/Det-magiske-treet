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
  // Emojien er byttet ut med en tegnet stjerne, så teksten og figuren testes hver for seg.
  s.t("synlig tekst ved mål", (await synlig()).trim(), "Alle 10!");
  s.t("tegnet stjerne ved mål", await p.evaluate(function () {
    return !!document.querySelector("#count [aria-hidden] svg");
  }), true);

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

  // All tekst appen faktisk viser — ikke bare de fire som ble målt i facc5d2.
  // Den kontrollen så ikke på teksten som var lagt til i commit-en før.
  var lav = await p.evaluate(function () {
    document.getElementById("grownupBox").style.display = "block";
    document.querySelector(".backup").open = true;
    function L(c) {
      var v = c.match(/\d+/g).slice(0, 3).map(Number).map(function (x) { return x / 255; })
        .map(function (x) { return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    }
    function cr(a, b) { var x = [L(a), L(b)].sort(function (m, n) { return n - m; }); return (x[0] + 0.05) / (x[1] + 0.05); }
    function bak(el) {
      for (var n = el; n; n = n.parentElement) {
        var st = getComputedStyle(n);
        // Knappene har gradient og ingen background-color; ta siste fargestopp
        // som verste tilfelle.
        if (st.backgroundImage && st.backgroundImage !== "none") {
          var g = st.backgroundImage.match(/rgba?\([^)]+\)/g);
          if (g) return g[g.length - 1];
        }
        var c = st.backgroundColor;
        if (c && c.indexOf("rgba(0, 0, 0, 0)") < 0 && c !== "transparent") return c;
      }
      return "rgb(243, 234, 251)";
    }
    var m = document.getElementById("backupMsg");
    m.className = "backupMsg ok";
    var par = [[".backupMsg.ok", m]];
    var m2 = m.cloneNode(); m2.className = "backupMsg feil"; m2.textContent = "x";
    m.parentNode.appendChild(m2); par.push([".backupMsg.feil", m2]);
    // Sveip alt som faktisk har en tekstnode. En håndplukket liste er nettopp
    // det som gjorde at facc5d2 ikke så teksten commit-en før hadde lagt til.
    document.querySelector(".overlay").classList.add("show");
    Array.prototype.forEach.call(document.querySelectorAll("body *"), function (e) {
      var tekst = false;
      for (var i = 0; i < e.childNodes.length; i++)
        if (e.childNodes[i].nodeType === 3 && e.childNodes[i].textContent.trim()) tekst = true;
      if (!tekst || e.disabled || e.classList.contains("sr")) return;
      var st = getComputedStyle(e);
      if (st.display === "none" || st.visibility === "hidden") return;
      par.push([e.className || e.id || e.tagName, e]);
    });
    var ut = [];
    par.forEach(function (r) {
      var st = getComputedStyle(r[1]);
      var px = parseFloat(st.fontSize), fet = parseInt(st.fontWeight, 10) >= 700;
      var krav = (px >= 24 || (px >= 18.66 && fet)) ? 3 : 4.5;
      var v = cr(st.color, bak(r[1]));
      if (v < krav) ut.push(r[0] + " " + v.toFixed(2) + " < " + krav);
    });
    m2.parentNode.removeChild(m2);
    return ut;
  });
  s.t("all synlig tekst holder kontrastkravet", lav, []);

  // iOS Safari zoomer inn på skjemafelt med skrift under 16px. Det var
  // tidligere hindret av maximum-scale=1, som ble fjernet i facc5d2.
  s.t("skjemafelt zoomer ikke inn på iOS", await p.evaluate(function () {
    var ut = [];
    Array.prototype.forEach.call(document.querySelectorAll("input, textarea, select"), function (e) {
      var px = parseFloat(getComputedStyle(e).fontSize);
      if (px < 16) ut.push((e.id || e.tagName) + " " + px + "px");
    });
    return ut;
  }), []);

  // Lydknappens tilstand må kunne høres, ikke bare ses. Sjekken må tåle
  // hvilken som helst utgangstilstand — testen over har allerede klikket.
  s.t("lydknappen melder tilstanden sin", await p.evaluate(function () {
    var b = document.getElementById("soundBtn");
    var a = b.getAttribute("aria-label"), ai = b.innerHTML;
    b.click();
    var c = b.getAttribute("aria-label"), ci = b.innerHTML;
    b.click();
    var gyldig = ["Slå lyden av", "Slå lyden på"];
    // Tilstanden skal kodes ett sted. aria-pressed i tillegg til en etikett
    // som skifter gir "Slå lyden av, ikke trykket" — to svar på ett spørsmål.
    // Ikonet må også endre seg: etiketten alene hjelper ikke den som ser.
    return [gyldig.indexOf(a) >= 0, gyldig.indexOf(c) >= 0, a !== c,
            b.hasAttribute("aria-pressed"), ai !== ci, ai.indexOf("<svg") === 0];
  }), [true, true, true, false, true, true]);

  // maximum-scale=1 er borte (riktig), så alt som trykkes på må selv si fra
  // at dobbelttrykk ikke er zoom.
  s.t("alt som trykkes på tåler dobbelttrykk", await p.evaluate(function () {
    var ut = [];
    Array.prototype.forEach.call(document.querySelectorAll("button, summary"), function (e) {
      if (getComputedStyle(e).touchAction !== "manipulation")
        ut.push(e.id || e.className || e.tagName);
    });
    return ut;
  }), []);

  s.t("ingen JS-feil", jsfeil, []);
  await b.close();
  s.slutt();
})();
