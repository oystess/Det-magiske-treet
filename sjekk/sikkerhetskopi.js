// Eksport, import, og at søppel avvises uten å røre tavla.
var f = require("./felles.js");
var s = f.suite("sikkerhetskopi");

(async function () {
  var b = await f.start();
  var ctx = await b.newContext({ viewport: { width: 390, height: 844 },
                                 permissions: ["clipboard-read", "clipboard-write"] });
  var p = await ctx.newPage();
  var jsfeil = []; p.on("pageerror", function (e) { jsfeil.push(e.message); });

  // Én fast dialoghåndterer; "once" hoper seg opp når en import avvises
  // før dialogen rekker å åpne.
  var svar = true, dialoger = 0;
  p.on("dialog", function (d) { dialoger++; svar ? d.accept() : d.dismiss(); });

  await p.goto(f.APP);
  var melding = function () { return p.textContent("#backupMsg"); };
  var stjerner = function () {
    return p.evaluate(function () {
      var t = document.getElementById("count").textContent;
      return t.indexOf("Alle") === 0 ? 10 : parseInt(t, 10);
    });
  };

  await p.click("#grownupToggle");
  await p.click(".backup summary");
  for (var i = 0; i < 4; i++) { await p.click("#giveBtn"); await p.waitForTimeout(850); }
  s.t("fire stjerner gitt", await stjerner(), 4);

  var kode = await p.inputValue("#exportField");
  s.t("eksportfeltet har gyldig JSON", JSON.parse(kode).stars, 4);
  s.t("koden er kort nok for en melding", kode.length < 400, true);

  await p.click("#copyBtn"); await p.waitForTimeout(200);
  s.t("kopiering melder fra", (await melding()).indexOf("Kopiert") === 0, true);

  await p.click("#resetBtn"); await p.waitForTimeout(100);
  s.t("nullstilt", await stjerner(), 0);
  await p.fill("#importField", kode);
  svar = true;
  await p.click("#importBtn"); await p.waitForTimeout(250);
  s.t("rundtur gir identisk state", await p.inputValue("#exportField"), kode);
  s.t("skjermen viser fire igjen", await stjerner(), 4);

  var soppel = [["tom", "   "], ["ikke json", "{ikke"], ["array", "[1,2,3]"],
                ["fremmed objekt", '{"a":1}'], ["bare tall", "42"]];
  for (var k = 0; k < soppel.length; k++) {
    await p.fill("#importField", soppel[k][1]);
    svar = true; var d0 = dialoger;
    await p.click("#importBtn"); await p.waitForTimeout(150);
    var m = await melding();
    // Skal avvises uten at dialogen i det hele tatt åpnes.
    s.t("avviser " + soppel[k][0],
        [await stjerner(), m.indexOf("Hentet") >= 0, dialoger - d0], [4, false, 0]);
  }

  await p.fill("#importField", JSON.stringify({ stars: 9, log: [], prizesWon: 0, muted: false }));
  svar = false;
  await p.click("#importBtn"); await p.waitForTimeout(200);
  s.t("avbrutt import endrer ingenting", await stjerner(), 4);

  // Rare felter skal repareres av reinState(), ikke avvises som søppel.
  await p.fill("#importField", '{"stars":99,"log":"tull","prizesWon":-3}');
  svar = true;
  await p.click("#importBtn"); await p.waitForTimeout(250);
  s.t("rare felter repareres",
      [await stjerner(),
       await p.evaluate(function () { return JSON.parse(document.getElementById("exportField").value).prizesWon; })],
      [10, 0]);

  s.t("ingen JS-feil", jsfeil, []);
  await b.close();
  s.slutt();
})();
