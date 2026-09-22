# Prompt: Lag en kvalitetssikrer-agent

Tredje fila i rekka. `PROMPT.md` myldrer, `PROMPT-topp-fem.md` bygger — denne
lager den som ser etter begge deler i ettertid.

Kjør den i Claude Code i dette repoet, eller si: «Følg PROMPT-kvalitetsagent.md».

---

## Oppdraget

Du skal lage en agent som kvalitetssikrer både **appen** og **arbeidet som er
gjort på den**, og en sjekkesuite den kan bruke. Du skal ikke endre appen selv.

Les først `index.html`, `README.md`, `PROMPT.md` og `PROMPT-topp-fem.md`, og gå
gjennom `git log` fra `d431b87` og framover. Du må forstå både hva appen er og
hvilke regler den er bygget etter før du kan lage noe som håndhever dem.

## Bakgrunn du trenger

Appen er én `index.html` uten avhengigheter — en stjernetavle for et barn. Fem
forbedringer er nettopp gjennomført, og under det arbeidet ble det skrevet 60
automatiske sjekker som alle ble kastet da opprydningen kom. Det er hele grunnen
til at denne agenten skal finnes: sjekkene skal samles ett sted og vokse, i
stedet for å bli funnet opp på nytt hver gang.

## Dette skal lages

1. **`.claude/agents/kvalitetssikrer.md`** — agentdefinisjonen.
2. **`sjekk/`** — kjørbare sjekker, gruppert i filer.
3. **`sjekk/kjor.sh`** — én kommando som kjører alt og oppsummerer.
4. **`.gitignore`** — `node_modules/` og `package-lock.json` skal aldri committes.
5. Et kort avsnitt i `README.md` om hvordan sjekkene kjøres.

---

## Agentens mandat

Agenten har to jobber, og begge skal stå i definisjonen.

**A. Appen.** Virker den? Holder den reglene den er bygget etter? Er det noe som
vil knekke for en forelder klokka åtte om kvelden?

**B. Arbeidet.** Stemmer diffen med det commit-meldingene påstår? Ble det lovet
noe i en commit som ikke er der? Er det gjort endringer utover det som ble bedt
om? Stemmer `README.md` med hva appen faktisk gjør? Er tall som påstås —
kontrastverdier, piksler, frekvenser — faktisk regnet ut, eller gjettet?

Del B er den som er lett å hoppe over og den som er mest verdt. En agent som bare
kjører tester er en testkjører, ikke en kvalitetssikrer.

## Myndighet: den rapporterer, den fikser ikke

Dette skal stå tydelig i agentdefinisjonen, ikke bare underforstås:

- Agenten **endrer aldri** `index.html`, `README.md`, prompt-filene eller noe
  annet i repoet. Den som bygger skal ikke være den som godkjenner.
- Den skriver bare i sitt eget midlertidige område, for å teste hypoteser.
- Gi den derfor **Bash, Read, Grep og Glob — ikke Edit og ikke Write.** Da lager
  den midlertidige filer via heredoc i Bash, og kan ikke redigere appen selv om
  den skulle finne på å prøve.
- Finner den noe suiten ikke dekker, skal den **ikke legge til sjekken selv** —
  den skal skrive sjekken ferdig inn i rapporten, klar til å limes inn.

## Sjekkesuiten

**Port de 60 sjekkene som finnes fra før.** De er kjørt og bekreftet, og skal
ikke finnes opp på nytt. Grupper dem slik:

| Fil | Antall | Dekker |
| --- | --- | --- |
| `sjekk/state.js` | 14 | `reinState()` mot gyldige data, søppel, feil typer, tall utenfor grensene |
| `sjekk/oppforsel.js` | 10 | Dobbelttrykk, pop-animasjonen, ødelagt lagret data, at appen starter |
| `sjekk/sikkerhetskopi.js` | 15 | Eksport/import-rundtur, fem typer søppel som avvises, avbrutt import |
| `sjekk/lyd.js` | 8 | Stigende toner 1–9, `winSound()` skiller seg ut, demping gir stillhet |
| `sjekk/uu.js` | 13 | Zoom, live-område, `aria-hidden`, kontrast målt på gjengitt farge |

Legg til to grupper som mangler:

- **`sjekk/geometri.js`** — at hele kronen og 🌟 er synlige innenfor `.scene` ved
  `GOAL` stjerner, med klaring, og at treet ser rimelig ut ved 1, 3 og 5. Mål
  faktiske `getBoundingClientRect()`-verdier, ikke CSS-en.
- **`sjekk/regler.js`** — at repoets egne regler holder: at `index.html` er den
  eneste appfila, at den ikke laster noe eksternt utover Google Fonts, at appen
  starter og virker med alt nettverk blokkert, at den ikke har vannrett scroll på
  375px, og at ingen JS-feil oppstår.

**Krav til suiten:**

- Rene node-skript. Playwright installeres **midlertidig** ved kjøring og fjernes
  etterpå — appen og repoet skal fortsatt være avhengighetsfrie.
- Finn Chromium dynamisk under `PLAYWRIGHT_BROWSERS_PATH` (eller `/opt/pw-browsers`).
  Ikke hardkod et versjonsnummer; det endrer seg.
- Hver sjekk skriver én linje: `ok` eller `FEIL` med hva som ble forventet og hva
  som kom. Exit-kode ulik null når noe feiler.
- `kjor.sh` kjører alle gruppene, oppsummerer, og returnerer feilkode.
- Sjekkene skal kunne kjøres av et menneske uten at en agent er involvert.

## Hva agenten skal gjøre når den kjører

Skriv dette som en arbeidsrekkefølge i definisjonen:

1. Kjør `sjekk/kjor.sh`. Rødt her er alltid et funn.
2. Les diffen mot `main` — eller mot en oppgitt commit — og les commit-meldingene.
   Sammenlign hva som påstås med hva som faktisk står i koden.
3. Les appen som om den var ny. Se etter det suiten ikke fanger: rar tilstand,
   rekkefølger ingen har tenkt på, tekst som lover noe koden ikke holder.
4. **Skill regresjon fra gammel feil.** Finner den noe, skal den sjekke om det
   også gjaldt før endringen — kjør samme måling mot `git show <basis>:index.html`.
   En feil som lå der fra før er et funn, men et helt annet funn enn et som nettopp
   ble innført, og rapporten skal si hvilket.
5. **Reproduser før du rapporterer.** Ingenting går i rapporten som ikke er sett.
   Er noe bare en mistanke, skal det stå at det er en mistanke.

## Rapporten

Funn rangert etter alvorlighet, verst først. Hvert funn får:

- **Hva** — én setning om feilen.
- **Hvordan den vises** — konkrete steg eller input som utløser den.
- **Hvor** — fil og linje.
- **Ny eller gammel** — innført av denne endringen, eller lå der fra før.
- **Hvor sikker** — reprodusert, eller mistanke.

Deretter to ting til slutt:

- **Hva som ikke er sjekket.** Alltid. En rapport uten denne delen gir falsk
  trygghet. Lyd kan ikke høres av en maskin, og et skjermbilde er ikke en
  skjermleser.
- **Hull i dekningen**, med sjekken ferdig skrevet, klar til å limes inn.

Ingen funn er et gyldig svar. Da sier den det kort, og hva den så etter.

## Ting agenten skal være særlig våken for

Dette er reglene appen er bygget etter. Brudd på dem er alltid funn:

- Alt i én `index.html`. Ingen avhengigheter, intet byggesteg, ingen backend.
- Appen virker offline og ved å åpne fila direkte.
- All brukertekst på norsk bokmål, i appens egen varme tone.
- Eksisterende lagrede data på ekte telefoner skal overleve enhver endring.
- Appen skal ikke kunne straffe. Ingen streaks, ingen tapte stjerner som
  konsekvens, ingenting som gjør en sykedag til et nederlag.
- Kompleksitet koster. En ny innstilling er noe en sliten forelder må forstå.

## Hva agenten ikke skal gjøre

- Fikse noe.
- Foreslå nye funksjoner — det er `PROMPT.md` sin jobb, ikke denne.
- Mene noe om design den ikke kan måle. «Jeg liker ikke fargen» er ikke et funn;
  «kontrasten er 3,1:1» er det.
- Godkjenne, merge eller pushe.
- Rapportere det samme to ganger i ulik innpakning.

## Agentdefinisjonen

`.claude/agents/kvalitetssikrer.md` med frontmatter: `name`, en `description` som
gjør det tydelig **når** agenten skal brukes (etter en endring, før push, ved
tvil om noe virker), og `tools` satt til Bash, Read, Grep og Glob. La `model`
være uspesifisert med mindre du har en grunn — da arver den fra den som kaller.

Skriv innholdet som instruksjoner til agenten selv, på norsk, i samme tone som de
andre promptene her. Den skal være selvstendig: en som leser bare den fila skal
skjønne hva appen er, hvilke regler som gjelder, og hva jobben går ut på.

---

## Verifisering

**Det holder ikke at suiten er grønn.** En agent som alltid sier «alt ser bra ut»
er verre enn ingen agent, fordi den gir trygghet den ikke har dekning for.

Gjør derfor begge disse, og vis resultatet:

1. **Kjør suiten mot `HEAD`.** Den skal være grønn. Er den ikke det, har du enten
   funnet en ekte feil eller skrevet en sjekk feil — finn ut hvilket.

2. **Plant feil og se at de fanges.** Lag en midlertidig kopi av `index.html`,
   ødelegg én ting om gangen, og bekreft at riktig sjekk blir rød. Minst disse:

   - fjern sperren mot dobbelttrykk i `give()`
   - sett `.scene` tilbake til `height: 224px`
   - sett `.subtitle` tilbake til `#6E4A8C`
   - gjør `starSound()` konstant igjen
   - fjern `aria-live` fra `#count`
   - la `reinState()` slippe gjennom `stars` over `GOAL`

   Feiler noen av disse *ikke*, har suiten et hull. Tett det før du er ferdig.

3. **Kjør agenten én gang for ekte**, mot siste commit, og lim inn rapporten. Den
   skal enten finne noe eller si tydelig hva den så etter og ikke fant.

Rydd bort alt midlertidig til slutt, og bekreft at `git status` er rent.

## Til slutt

Denne agenten skal være ubehagelig å ha i nærheten når noe er slurvete, og stille
når alt er i orden. Den skal ikke være hyggelig. Den skal ha rett.
