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
  s.t("for mange stjerner vises som GOAL", await stjerner(), 10);
  // Foreldrepanelet må vise samme tall som telleren, ikke det rå.
  s.t("panelet viser samme tall som telleren",
      [await p.evaluate(function () { return document.getElementById("roundCount").textContent; }),
       await p.evaluate(function () { return document.querySelectorAll("#logList .logItem").length; })],
      ["10 / 10", 0]);
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

  // Sperren må nullstilles overalt en runde begynner på nytt, ikke bare i
  // angre og nullstill.
  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 9, log: [], prizesWon: 0, muted: true }));
  });
  await p.reload(); await p.waitForTimeout(300);
  await p.click("#giveBtn"); await p.waitForTimeout(700);
  await p.click("#newRoundBtn");
  await p.click("#giveBtn"); await p.waitForTimeout(200);
  s.t("stjerne rett etter ny runde blir registrert", await stjerner(), 1);

  // Feiringen skal kunne forlates uten å slette tavla.
  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 10, log: [], prizesWon: 0, muted: true }));
  });
  await p.reload(); await p.waitForTimeout(400);
  s.t("feiringen vises ved mål",
      await p.evaluate(function () { return document.querySelector(".overlay").classList.contains("show"); }), true);
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  s.t("Escape lukker feiringen uten å slette",
      [await p.evaluate(function () { return document.querySelector(".overlay").classList.contains("show"); }),
       JSON.parse(await lagret()).stars], [false, 10]);
  await p.reload(); await p.waitForTimeout(400);
  await p.click("#lukkBtn"); await p.waitForTimeout(200);
  s.t("lukkeknappen lukker uten å slette",
      [await p.evaluate(function () { return document.querySelector(".overlay").classList.contains("show"); }),
       JSON.parse(await lagret()).stars], [false, 10]);
  await p.reload(); await p.waitForTimeout(400);
  await p.click(".overlay", { position: { x: 5, y: 5 } }); await p.waitForTimeout(200);
  s.t("klikk utenfor lukker uten å slette",
      [await p.evaluate(function () { return document.querySelector(".overlay").classList.contains("show"); }),
       JSON.parse(await lagret()).stars], [false, 10]);

  // README lover at stjerner ligger urørt om GOAL senkes og heves igjen.
  // Da må heller ikke et trykk på en annen knapp skrive den klemte verdien.
  var lavG = ptm.join(osm.tmpdir(), "goal5b-" + process.pid + ".html");
  fsm.writeFileSync(lavG,
    fsm.readFileSync(f.APP_FIL, "utf8").replace("var GOAL = 10;", "var GOAL = 5;"));
  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 8, log: [], prizesWon: 0, muted: false }));
  });
  await p.goto("file://" + lavG); await p.waitForTimeout(350);
  await p.keyboard.press("Escape"); await p.waitForTimeout(150);
  await p.click("#soundBtn"); await p.waitForTimeout(200);
  s.t("lydknappen sletter ikke stjerner ved lavere GOAL", JSON.parse(await lagret()).stars, 8);
  await p.goto(f.APP); await p.waitForTimeout(300);
  s.t("stjernene er tilbake når GOAL heves igjen", await stjerner(), 8);
  fsm.unlinkSync(lavG);

  // Fem reaksjoner skal faktisk brukes, og aldri to like på rad.
  await p.evaluate(function () {
    localStorage.setItem("selma-magisk-tre-v1",
      JSON.stringify({ stars: 0, log: [], prizesWon: 0, muted: true }));
  });
  await p.reload(); await p.waitForTimeout(300);
  var sett = [], rekke = [];
  for (var r = 0; r < 9; r++) {
    await p.click("#giveBtn");
    var kl = await p.evaluate(function () {
      var u = document.querySelector("#sceneUni .uni");
      return (u.className.baseVal || u.getAttribute("class") || "").match(/r[1-5]/);
    });
    var n = kl ? kl[0] : "ingen";
    rekke.push(n);
    if (sett.indexOf(n) < 0) sett.push(n);
    await p.waitForTimeout(900);
  }
  var toLike = false;
  for (var q = 1; q < rekke.length; q++) if (rekke[q] === rekke[q - 1]) toLike = true;
  s.t("aldri samme reaksjon to ganger på rad", toLike, false);
  s.t("flere reaksjoner er i bruk (så " + sett.length + " av 5)", sett.length >= 3, true);
  s.t("alltid en reaksjon", rekke.indexOf("ingen"), -1);

  // Klassenavnet sier ingenting om hva nettleseren faktisk kjører. En
  // id-selektor et annet sted i arket kan vinne spesifisitet over .uni.rN —
  // og gjorde det: alle fem ga "puste" i stedet for sin egen animasjon.
  // Uttrykket «overrasket» var tegnet, men aldri rendret. Ansiktet skal følge
  // reaksjonen, ikke stå fast.
  var uttrykk = function () {
    return p.evaluate(function () {
      var u = document.querySelector("#sceneUni .uni");
      var vis = [].slice.call(u.querySelectorAll(".f")).filter(function (g) {
        return getComputedStyle(g).display !== "none";
      }).map(function (g) { return g.getAttribute("class").replace("f f-", ""); });
      return vis.join(",") || "ingen";
    });
  };
  await p.waitForTimeout(900);
  var uHvile = await uttrykk();
  await p.click("#giveBtn"); await p.waitForTimeout(80);
  var uStraks = await uttrykk();
  await p.waitForTimeout(350);
  var uSenere = await uttrykk();
  await p.waitForTimeout(700);
  s.t("ansiktet følger reaksjonen", [uHvile, uStraks, uSenere, await uttrykk()],
      ["ro", "overrasket", "glad", "ro"]);

  s.t("reaksjonsklassen gir faktisk reaksjonens animasjon", await p.evaluate(function () {
    var u = document.querySelector("#sceneUni .uni");
    var opphav = u.getAttribute("class");
    var ventet = ["galopp", "sprett", "snurr", "slaattBakover", "vippe"], ut = [];
    for (var n = 1; n <= 5; n++) {
      u.setAttribute("class", "uni r" + n);
      var navn = getComputedStyle(u).animationName;
      if (navn.indexOf(ventet[n - 1]) < 0) ut.push("r" + n + " gir " + navn);
    }
    u.setAttribute("class", opphav);
    return ut;
  }), []);

  s.t("ingen JS-feil underveis", jsfeil, []);
  await b.close();
  s.slutt();
})();
