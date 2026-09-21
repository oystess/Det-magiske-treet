// Stigende tone per stjerne, at winSound skiller seg ut, og at demping virker.
var f = require("./felles.js");
var s = f.suite("lyd");

(async function () {
  var b = await f.start(["--autoplay-policy=no-user-gesture-required"]);
  var ctx = await b.newContext({ viewport: { width: 390, height: 844 } });

  // Fang hver oscillator som faktisk startes.
  await ctx.addInitScript(function () {
    window.__toner = [];
    var AC = window.AudioContext || window.webkitAudioContext;
    var orig = AC.prototype.createOscillator;
    AC.prototype.createOscillator = function () {
      var o = orig.call(this), start = o.start.bind(o);
      o.start = function (t) { window.__toner.push(Math.round(o.frequency.value)); return start(t); };
      return o;
    };
  });

  var p = await ctx.newPage();
  var jsfeil = []; p.on("pageerror", function (e) { jsfeil.push(e.message); });
  await p.goto(f.APP);
  var toner = function () {
    return p.evaluate(function () { var x = window.__toner; window.__toner = []; return x; });
  };

  var forste = [];
  for (var i = 0; i < 9; i++) {
    await p.click("#giveBtn"); await p.waitForTimeout(850);
    forste.push((await toner())[0]);
  }
  s.t("tonen stiger for stjerne 1-9", forste, [392, 440, 494, 523, 587, 659, 740, 784, 880]);
  s.t("stiger strengt monotont",
      forste.every(function (v, j) { return j === 0 || v > forste[j - 1]; }), true);
  s.t("topptonen er ikke skingrende (< 2000 Hz)", forste[8] < 2000, true);

  await p.click("#giveBtn"); await p.waitForTimeout(400);
  var vinn = await toner();
  s.t("winSound har fire toner", vinn.length, 4);
  s.t("winSound er uendret", vinn, [659, 784, 988, 1319]);
  s.t("winSound topper over siste stjerne", vinn[3] > forste[8], true);

  await p.click("#newRoundBtn"); await p.waitForTimeout(200);
  await p.click("#soundBtn"); await toner();
  await p.click("#giveBtn"); await p.waitForTimeout(850);
  s.t("lyd av gir full stillhet", await toner(), []);
  await p.click("#soundBtn");
  await p.click("#giveBtn"); await p.waitForTimeout(850);
  s.t("lyd på igjen gir lyd", (await toner()).length > 0, true);

  s.t("ingen JS-feil", jsfeil, []);
  await b.close();
  s.slutt();
})();
