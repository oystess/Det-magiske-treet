// Felles rigg for sjekkene. Ingen avhengigheter utover Playwright, som
// installeres midlertidig av kjor.sh og fjernes etterpå.
var fs = require("fs"), path = require("path");

// Appfila kan overstyres med APP_FIL, slik at en plantet feil kan testes
// uten å røre den ekte fila.
var APP_FIL = process.env.APP_FIL || path.resolve(__dirname, "..", "index.html");
var APP = "file://" + APP_FIL;

// Finn Chromium uten å hardkode versjonsnummer — det endrer seg.
function finnChromium() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM;
  var rot = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  var funn = null;
  try {
    fs.readdirSync(rot).sort().forEach(function (d) {
      if (!/^chromium-\d/.test(d)) return;
      var p = path.join(rot, d, "chrome-linux", "chrome");
      if (fs.existsSync(p)) funn = p;
    });
  } catch (e) {}
  return funn;
}

function start(args) {
  var chromium = require("playwright").chromium;
  var exe = finnChromium();
  var opt = { args: args || [] };
  if (exe) opt.executablePath = exe;
  return chromium.launch(opt);
}

// Setter opp en tavle med n stjerner før appen laster.
function medStjerner(ctx, n, ekstra) {
  return ctx.addInitScript(function (arg) {
    var l = [];
    for (var i = 0; i < arg.n; i++) l.push(new Date(Date.now() - i * 864e5).toISOString());
    var s = { stars: arg.n, log: l, prizesWon: arg.p || 0, muted: true };
    try { localStorage.setItem("selma-magisk-tre-v1", JSON.stringify(s)); } catch (e) {}
  }, { n: n, p: (ekstra && ekstra.prizesWon) || 0 });
}

function suite(navn) {
  var feil = 0, antall = 0;
  return {
    t: function (n, fikk, ville) {
      antall++;
      var ok = JSON.stringify(fikk) === JSON.stringify(ville);
      if (!ok) feil++;
      console.log((ok ? "  ok    " : "  FEIL  ") + n +
        (ok ? "" : "\n          fikk:  " + JSON.stringify(fikk) +
                   "\n          ville: " + JSON.stringify(ville)));
    },
    slutt: function () {
      console.log("  -> " + navn + ": " + (antall - feil) + "/" + antall +
                  (feil ? "  (" + feil + " FEIL)" : ""));
      process.exit(feil ? 1 : 0);
    }
  };
}

module.exports = { APP: APP, APP_FIL: APP_FIL, start: start, suite: suite,
                   medStjerner: medStjerner, finnChromium: finnChromium };
