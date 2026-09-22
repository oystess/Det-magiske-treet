# 🦄 Selmas magiske tre

En liten stjernetavle-app for barn: lagt seg i tide = 1 stjerne. Når Selma har samlet 10 stjerner, har enhjørningen fått det magiske treet til å blomstre, og hun har vunnet premien. En enhjørning «tryller» treet høyere for hver stjerne.

Appen er én frittstående HTML-fil uten avhengigheter. Den lagrer fremgangen lokalt i nettleseren, fungerer offline, og kan legges til på hjemskjermen som en vanlig app.

---

## 🚀 Ta den i bruk (GitHub Pages)

### Alternativ A – uten terminal (dra og slipp)
1. Lag et nytt, tomt repo på GitHub (f.eks. `magisk-tre`). Hold det **Public**.
2. På repo-siden: **Add file → Upload files**, og dra inn alle filene i denne mappen (`index.html`, `manifest.webmanifest`, de tre `icon-*.png`, og `.nojekyll`). Husk å vise skjulte filer så `.nojekyll` blir med.
3. **Commit changes**.

### Alternativ B – med GitHub Desktop
1. Klon det nye repoet i GitHub Desktop.
2. Kopier alle filene i denne mappen inn i repo-mappen (i **roten**, ikke i en undermappe).
3. Commit → **Push origin**.

### Skru på Pages
1. Gå til **Settings → Pages**.
2. Under **Build and deployment → Source**: velg **Deploy from a branch**.
3. Branch: **main**, mappe: **/ (root)**. Trykk **Save**.
4. Vent ~1 minutt. Lenken vises øverst på Pages-siden, typisk:
   `https://<brukernavn>.github.io/magisk-tre/`

---

## 📱 Legg til på hjemskjerm

**iPhone (Safari):** Åpne lenken → trykk Del-knappen → **Legg til på Hjem-skjerm**.

**Android (Chrome):** Åpne lenken → meny (⋮) → **Installer app** / **Legg til på startskjerm**.

> 💡 Åpne lenken **én gang mens du har nett** før du legger den til, så ikonet og skrifttypen lastes inn. Etterpå fungerer den også uten nett.

---

## 💾 Lagring og personvern
- All fremgang lagres lokalt på telefonen via nettleserens `localStorage` — ingenting sendes til noen server.
- Dataene ligger på **den telefonen appen brukes på**, men kan kopieres til en
  annen telefon med sikkerhetskopien under.
- «For mamma og pappa»-panelet har **Angre siste**, **Nullstill runde** og
  **Sikkerhetskopi og flytting**.

### Sikkerhetskopi og flytting
Under **For mamma og pappa → Sikkerhetskopi og flytting** ligger en kode som
inneholder hele fremdriften. Den kan brukes til å:

- **ta vare på stjernene** i tilfelle telefonen ryker eller byttes,
- **flytte tavla** til en ny telefon,
- **gi den andre forelderen samme tavle** — send koden i en melding.

Kopier koden fra det øverste feltet, og lim den inn i det nederste på den andre
telefonen. Import **erstatter** det som ligger der fra før, og spør først.

> 💡 Det skjer ingen automatisk sammenslåing. Gir begge foreldrene stjerner hver
> for seg, er det koden som limes inn sist som gjelder.

---

## ✅ Sjekker

Repoet har en sjekkesuite som kjører appen i en ekte nettleser:

```bash
./sjekk/kjor.sh            # alle grupper
./sjekk/kjor.sh lyd uu     # bare noen
BEHOLD=1 ./sjekk/kjor.sh   # la Playwright ligge mellom kjøringer
```

Playwright installeres midlertidig og fjernes etterpå — **appen og repoet
forblir avhengighetsfrie**. Sjekkene dekker validering av lagrede data,
dobbelttrykk, eksport/import, lydens tonegang, universell utforming med målt
kontrast, treets geometri, og at rammene over holder.

Claude Code har også en `kvalitetssikrer`-agent (`.claude/agents/`) som kjører
suiten, leser diffen mot det commit-meldingene påstår, og rapporterer funn.
Den rapporterer — den endrer ingenting.

## 🛠️ Tilpasning
Alt ligger i `index.html`:
- **Antall stjerner til premie:** endre `var GOAL = 10;` i `<script>`. Treet og
  lydens tonegang tilpasser seg tallet av seg selv. Stjerner som allerede er
  samlet blir liggende urørt, også om du senker tallet og hever det igjen.
- **Tekst (navn, premie, overskrifter):** søk i HTML-en, f.eks. «Selmas magiske tre» eller «vunnet en enhjørning».
- **Farger:** scenen, kortet og knappene styres fra `<style>` (lavendel
  `#C79DEB`, lilla `#9B5DE5`, løvverk `#4FAE86`). Figurene — enhjørning,
  stjerner, blomster, ikoner og konfetti — tegnes som SVG i `<script>`, så
  fargene deres ligger i `unicorn()`, `starSvg()`, `blomstSvg()`, `ikon()` og
  `konfettiBit()`. Enhjørningens kontur er `UNI_L`.
- **Figurene:** alt er tegnet av appen, ingen emoji og ingen bildefiler. Derfor
  ser den lik ut på iPhone og Android.
- **Lyd:** av/på-knappen øverst til høyre; innstillingen huskes.

---

## 📂 Filer
| Fil | Hva det er |
| --- | --- |
| `index.html` | Hele appen (HTML + CSS + JS) |
| `manifest.webmanifest` | Gjør appen installerbar (navn, ikoner, fullskjerm) |
| `icon-512.png` / `icon-192.png` | App-ikoner (Android / manifest) |
| `icon-180.png` | App-ikon for iPhone (apple-touch-icon) |
| `.nojekyll` | Hindrer at GitHub Pages omformer filene |
