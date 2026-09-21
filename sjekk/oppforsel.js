// Dobbelttrykk, pop-animasjonen og oppstart med ødelagte data.
var f = require("./felles.js");
var s = f.suite("oppforsel");

(async function () {
  var b = await f.start();
  var ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  var p = await ctx.newPage();
  var jsfeil = []; p.on("pageerror", function (e) { jsfeil.push(e.message); });
  await p.goto(f.APP);

  // Les appens egen tilstand fra skjermen, ikke fra lagringen.
  var stjerner = function () {
    return p.evaluate(function () {
      var t = document.getElementById("count").textContent;
      return t.indexOf("Alle") === 0 ? 10 : parseInt(t, 10);
    });
  };
  var lagret = function () {
    return p.evaluate(function () { return localStorage.getItem("selma-magisk-tre-v1"); });
  };
  var poppere = function () {
    return p.evaluate(function () { return document.querySelectorAll("#starGrid .star.pop").length; });
  };

  await p.click("#giveBtn"); await p.click("#giveBtn");
  s.t("to raske trykk gir én stjerne", await stjerner(), 1);
  await p.waitForTimeout(900);
  await p.click("#giveBtn");
  s.t("trykk etter sperren gir stjerne", await stjerner(), 2);

  s.t("ny stjerne animerer", await poppere(), 1);
  await p.click("#soundBtn");
  s.t("lyd av/på animerer ikke på nytt", await poppere(), 0);
  await p.click("#soundBtn");

  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1", '{"stars":25,"log":"tull"}');
  });
  await p.reload(); await p.waitForTimeout(300);
  s.t("ødelagt data klemmes til GOAL", await stjerner(), 10);
  // Klemmingen gjelder visningen, ikke disken. Skrev appen tilbake her, ville
  // et besøk med lavere GOAL slettet stjerner for godt.
  s.t("lagringen røres ikke bare av å åpne appen", JSON.parse(await lagret()).stars, 25);

  await p.evaluate(function () { localStorage.setItem("selma-magisk-tre-v1", "{ikke json"); });
  await p.reload(); await p.waitForTimeout(300);
  s.t("uparsbar JSON starter på null", await stjerner(), 0);
  // Data som ikke kan leses kan fortsatt være mulig å redde for hånd.
  s.t("uparsbar JSON overskrives ikke", await lagret(), "{ikke json");
  await p.click("#giveBtn"); await p.waitForTimeout(200);
  s.t("appen virker etter ødelagt data", await stjerner(), 1);

  // Angre skal ikke la dobbelttrykk-sperren svelge neste ekte trykk.
  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 3, log: ["2026-09-18T19:00:00.000Z"], prizesWon: 0, muted: true }));
  });
  await p.reload(); await p.waitForTimeout(300);
  await p.click("#grownupToggle");
  await p.click("#giveBtn"); await p.waitForTimeout(50);
  await p.click("#undoBtn"); await p.waitForTimeout(50);
  await p.click("#giveBtn"); await p.waitForTimeout(200);
  s.t("stjerne rett etter angre blir registrert", await stjerner(), 4);

  // Lagrede stjerner skal overleve at en forelder endrer GOAL — README
  // inviterer til det, og et enkelt besøk skal ikke slette noe.
  var fsm = require("fs"), osm = require("os"), ptm = require("path");
  var lavGoal = ptm.join(osm.tmpdir(), "goal5-" + process.pid + ".html");
  fsm.writeFileSync(lavGoal,
    fsm.readFileSync(f.APP_FIL, "utf8").replace("var GOAL = 10;", "var GOAL = 5;"));
  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 8, log: [], prizesWon: 1, muted: true }));
  });
  await p.goto("file://" + lavGoal); await p.waitForTimeout(300);
  await p.goto(f.APP); await p.waitForTimeout(300);
  s.t("stjerner overlever et besøk med lavere GOAL", JSON.parse(await lagret()).stars, 8);
  fsm.unlinkSync(lavGoal);

  s.t("ingen JS-feil underveis", jsfeil, []);
  await b.close();
  s.slutt();
})();
