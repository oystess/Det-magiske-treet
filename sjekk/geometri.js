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

  // Treet skal få plass også om en forelder endrer GOAL — README inviterer
  // til det, og commit 959e8e6 lovet at det holder.
  var fsg = require("fs"), osg = require("os"), ptg = require("path");
  var kilde = fsg.readFileSync(f.APP_FIL, "utf8");
  var klippet = [];
  // GOAL=21 er det trangeste tilfellet — det må være med.
  var varianter = [1, 2, 3, 5, 10, 11, 15, 20, 21, 22, 25, 30];
  for (var vi = 0; vi < varianter.length; vi++) {
    var G = varianter[vi];
    var tmp = ptg.join(osg.tmpdir(), "goal-" + G + "-" + process.pid + ".html");
    fsg.writeFileSync(tmp, kilde.replace("var GOAL = 10;", "var GOAL = " + G + ";"));
    var cg = await b.newContext({ viewport: { width: 390, height: 844 } });
    await f.medStjerner(cg, G);
    var pg = await cg.newPage();
    await pg.goto("file://" + tmp); await pg.waitForTimeout(300);
    await pg.evaluate(function () {
      var o = document.querySelector(".overlay"); if (o) o.classList.remove("show");
    });
    // Trekk fra kantlinja, så tallet er klaringen barnet faktisk ser.
    var klar = await pg.evaluate(function () {
      var el = document.querySelector(".scene");
      var sc = el.getBoundingClientRect();
      var kant = parseFloat(getComputedStyle(el).borderTopWidth);
      var st = document.querySelector(".treeStar").getBoundingClientRect();
      return +(st.top - sc.top - kant).toFixed(1);
    });
    if (klar < 3) klippet.push("GOAL=" + G + ": " + klar + "px");
    await cg.close(); fsg.unlinkSync(tmp);
  }
  s.t("treet får plass også ved endret GOAL", klippet, []);

  await b.close();
  s.slutt();
})();
