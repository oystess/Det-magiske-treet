// Repoets egne rammer: én fil, ingen avhengigheter, virker offline.
var fs = require("fs"), path = require("path");
var f = require("./felles.js");
var s = f.suite("regler");

var rot = path.resolve(__dirname, "..");
var src = fs.readFileSync(f.APP_FIL, "utf8");

// --- statisk ---
var iRot = fs.readdirSync(rot).filter(function (n) {
  return /\.(html|js|css|mjs|ts)$/.test(n);
});
s.t("index.html er den eneste appfila i roten", iRot, ["index.html"]);
s.t("ingen package.json i repoet", fs.existsSync(path.join(rot, "package.json")), false);

var eksterne = (src.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/gi) || [])
  .map(function (u) { return u.replace(/^.*?https?:\/\//, "").split("/")[0]; })
  .filter(function (v, i, a) { return a.indexOf(v) === i; })
  .filter(function (d) { return !/^fonts\.(googleapis|gstatic)\.com$/.test(d); });
s.t("ingen eksterne ressurser utover Google Fonts", eksterne, []);
s.t("ingen script-tagg med src", /<script[^>]+\bsrc=/i.test(src), false);
s.t("siden er merket norsk", /<html[^>]+lang="nb"/.test(src), true);
s.t("manifestet er lenket", /rel="manifest"/.test(src), true);

// README skal ikke beskrive filer som ikke finnes, og ikke mangle filer den
// beskriver. En forelder som følger oppskriften skal finne det som står der.
var readme = fs.readFileSync(path.join(rot, "README.md"), "utf8");
var sporet = require("child_process")
  .execSync("git -C " + JSON.stringify(rot) + " ls-files").toString().split("\n");
var nevnt = (readme.match(/`\.?[A-Za-z0-9_-]+\.(html|webmanifest|png|md|sh)`|`\.nojekyll`/g) || [])
  .map(function (x) { return x.replace(/`/g, ""); })
  .filter(function (v, i, a2) { return a2.indexOf(v) === i; });
var mangler = nevnt.filter(function (n) { return sporet.indexOf(n) < 0; });
s.t("README beskriver bare filer som finnes", mangler, []);
s.t(".DS_Store er ikke sporet", sporet.indexOf(".DS_Store"), -1);

// --- offline ---
(async function () {
  var b = await f.start();
  var ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  // Blokker alt som ikke er selve fila.
  await ctx.route("**", function (r) {
    return r.request().url().indexOf("file:") === 0 ? r.continue() : r.abort();
  });
  var p = await ctx.newPage();
  var jsfeil = []; p.on("pageerror", function (e) { jsfeil.push(e.message); });
  await p.goto(f.APP); await p.waitForTimeout(500);

  s.t("appen starter uten nett",
      await p.evaluate(function () { return !!document.querySelector("#giveBtn"); }), true);

  await p.click("#giveBtn"); await p.waitForTimeout(300);
  s.t("knappen virker uten nett", await p.evaluate(function () {
    return document.getElementById("count").textContent.indexOf("1 av") === 0;
  }), true);

  s.t("ingen vannrett scroll på 375px", await p.evaluate(function () {
    return document.documentElement.scrollWidth > window.innerWidth;
  }), false);

  s.t("ingen JS-feil uten nett", jsfeil, []);
  await b.close();
  s.slutt();
})();
