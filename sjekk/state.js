// reinState() — validering av lagrede data. Rent node, ingen nettleser.
var fs = require("fs");
var f = require("./felles.js");
var s = f.suite("state");

// Hent funksjonene rett ut av appen, så vi tester ekte kode.
var src = fs.readFileSync(f.APP_FIL, "utf8");
var a = src.indexOf("  function reinState(raw) {");
var b = src.indexOf("var state = reinState(null);");
if (a < 0 || b < 0) { console.log("  FEIL  fant ikke reinState() i " + f.APP_FIL); process.exit(1); }
var GOAL = Number((src.match(/var GOAL = (\d+)/) || [])[1] || 10);
eval("var GOAL = " + GOAL + ";\n" + src.slice(a, b));

var D = { stars: 0, log: [], prizesWon: 0, muted: false };
var ekte = { stars: 4, log: ["2026-09-18T19:12:00.000Z", "2026-09-19T19:30:00.000Z"],
             prizesWon: 2, muted: true };

// Det viktigste: ekte data på ekte telefoner skal overleve helt urørt.
s.t("gyldig state beholdes urørt", reinState(JSON.parse(JSON.stringify(ekte))), ekte);
s.t("fersk app gir tom tavle", reinState(null), D);

s.t("log som streng gir tom log", reinState({ stars: 3, log: "tull" }),
    { stars: 3, log: [], prizesWon: 0, muted: false });
s.t("stars over GOAL klemmes", reinState({ stars: GOAL + 15 }).stars, GOAL);
s.t("stars negativ blir 0", reinState({ stars: -5 }).stars, 0);
s.t("stars som tekst blir 0", reinState({ stars: "tre" }).stars, 0);
s.t("stars Infinity blir 0", reinState({ stars: Infinity }).stars, 0);
s.t("stars desimal rundes ned", reinState({ stars: 3.9 }).stars, 3);
s.t("prizesWon negativ blir 0", reinState({ prizesWon: -2 }).prizesWon, 0);
s.t("tom streng gir tom tavle", reinState(""), D);
s.t("array inn gir tom tavle", reinState([1, 2, 3]), D);
s.t("udefinert gir tom tavle", reinState(undefined), D);
s.t("ugyldige datoer siles bort",
    reinState({ log: ["2026-09-18T19:12:00.000Z", "bare tull", null, 42] }).log,
    ["2026-09-18T19:12:00.000Z"]);

// Det som faktisk krasjet appen før valideringen fantes.
var st = reinState({ stars: 3, log: "tull" });
var overlevde = true;
try { st.log.push(new Date().toISOString()); } catch (e) { overlevde = false; }
s.t("give() krasjer ikke på ødelagt log", [overlevde, st.log.length], [true, 1]);

s.slutt();
