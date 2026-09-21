// At treet får plass i scenen. Måler faktiske bokser, ikke CSS-verdier.
var f = require("./felles.js");
var s = f.suite("geometri");

(async function () {
  var b = await f.start();
  var mal = [];

  for (var n = 0; n <= 10; n++) {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await f.medStjerner(ctx, n);
    var p = await ctx.newPage();
    await p.goto(f.APP); await p.waitForTimeout(350);
    await p.evaluate(function () {
      var o = document.querySelector(".overlay"); if (o) o.classList.remove("show");
    });
    mal.push(await p.evaluate(function () {
      var sc = document.querySelector(".scene").getBoundingClientRect();
      var kr = document.querySelector(".crown");
      var st = document.querySelector(".treeStar");
      var pw = document.querySelector(".prizeWrap").getBoundingClientRect();
      var k = kr && kr.getBoundingClientRect(), t = st && st.getBoundingClientRect();
      return {
        harKrone: !!kr,
        klaringKrone: k ? k.top - sc.top : null,
        klaringStjerne: t ? t.top - sc.top : null,
        hoyde: k ? sc.bottom - k.top : 0,
        // overlapper kronen premieboksen?
        kollisjon: k ? !(k.right < pw.left || k.left > pw.right || k.bottom < pw.top || k.top > pw.bottom) : false
      };
    }));
    await ctx.close();
  }

  s.t("ingen krone uten stjerner", mal[0].harKrone, false);
  s.t("krone fra første stjerne", mal[1].harKrone, true);

  var manglerKlaring = [], kolliderer = [];
  for (var i = 1; i <= 10; i++) {
    if (mal[i].klaringStjerne < 6) manglerKlaring.push(i + ": " + mal[i].klaringStjerne.toFixed(1) + "px");
    if (mal[i].kollisjon) kolliderer.push(i);
  }
  s.t("stjernen på toppen har minst 6px klaring ved alle antall", manglerKlaring, []);
  s.t("kronen kolliderer ikke med premieboksen", kolliderer, []);

  var vokser = true;
  for (var j = 2; j <= 10; j++) if (mal[j].hoyde <= mal[j - 1].hoyde) vokser = false;
  s.t("treet vokser for hver stjerne", vokser, true);

  // Ved mål skal treet fylle scenen, ikke ligge som en dusk i bunnen.
  var sceneH = await (async function () {
    var ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } });
    var p2 = await ctx2.newPage(); await p2.goto(f.APP);
    var h = await p2.evaluate(function () {
      return document.querySelector(".scene").getBoundingClientRect().height;
    });
    await ctx2.close(); return h;
  })();
  var andel = mal[10].hoyde / sceneH;
  s.t("treet fyller minst 60% av scenen ved mål (" + Math.round(andel * 100) + "%)", andel >= 0.6, true);
  s.t("treet ved 3 stjerner er synlig, men ikke fullvokst",
      mal[3].hoyde > 40 && mal[3].hoyde < mal[10].hoyde, true);

  await b.close();
  s.slutt();
})();
