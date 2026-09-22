# Prompt: Gjennomfør topp fem

Oppfølgeren til `PROMPT.md`. Der ble det myldret; her skal det bygges. Prompten er
selvstendig — alle funn, linjenumre og måltall står i den, så den kan kjøres uten
samtalen den kom fra.

Kjør den i Claude Code i dette repoet, eller si: «Følg PROMPT-topp-fem.md».

---

## Oppdraget

Du skal implementere fem konkrete forbedringer i `index.html`. De er allerede
utredet og prioritert — du skal ikke myldre, ikke foreslå alternativer til hva som
skal gjøres, og ikke utvide omfanget. Du skal derimot tenke selv om *hvordan* hver
enkelt løses best.

Les hele `index.html` før du rører noe. Fila er 335 linjer; du skal ha lest alt.
Linjenumrene under er fra utgangspunktet og forskyver seg etter hvert som du
endrer — bruk dem til å finne fram, ikke som fasit senere i arbeidet.

## Absolutte rammer

Disse er ikke til forhandling. En løsning som bryter dem er ikke en løsning:

- **Alt skal fortsatt ligge i én `index.html`.** HTML, CSS og JS i samme fil.
- **Ingen avhengigheter.** Ingen npm, ingen byggesteg, ingen rammeverk, ingen
  bundler, ingen nye eksterne ressurser. Appen skal virke ved å åpne fila direkte.
- **Ingen backend.**
- **All brukertekst på norsk bokmål**, i samme varme tone som appen har i dag.
- **Eksisterende lagrede data skal overleve.** Nøkkelen `selma-magisk-tre-v1`
  (linje 156) ligger allerede på ekte telefoner med ekte stjerner i. Ingen endring
  får slette eller ugyldiggjøre gyldige data.
- **Ingen endring i appens karakter.** Dette er en snill app. Ingenting som kan
  straffe, ingen streaks, ingen tapte stjerner som konsekvens.

## Arbeidsform

Gjør oppgavene **i rekkefølgen under**, og lag **én commit per oppgave** med norsk
commit-melding. Da kan hver enkelt rulles tilbake alene hvis den viser seg dårlig.
Ikke slå dem sammen, ikke hopp framover.

Oppgave 2 og 3 henger sammen: valideringen du skriver i oppgave 2 skal gjenbrukes
av importen i oppgave 3. Ikke skriv den logikken to ganger.

---

## Oppgave 1 — Treet klippes ved mål

**Problemet, regnet ut fra CSS-en i dag:**

```
.ring      14px  (linje 46)      10 ringer      = 140px
.crown     66px  (linje 50)                     =  66px
.tree      bottom: 30px (linje 45)              =  30px
                                          sum   = 236px
.scene     height: 224px, overflow: hidden (44) → 12px klippes
.treeStar  top: -16px (linje 55)                → helt usynlig
```

Ved 9 stjerner begynner ✨ på toppen å bli kuttet. Ved 10 er den borte og kronen er
skåret av. Det skjer i nøyaktig det øyeblikket appen eksisterer for.

**Dette skal være sant når du er ferdig:** ved `GOAL` stjerner er hele kronen og
hele `.treeStar` synlig innenfor `.scene`, med minst 6px klaring til toppen. Treet
skal fortsatt se rimelig ut ved 1, 3 og 5 stjerner — ikke bitte lite nederst i en
tom scene.

**Vurder selv hvilken vei du går.** Høyere scene, lavere ringer, mindre
bunnavstand, eller en transform som skalerer `.tree` etter antall stjerner — alle
er legitime. Velg den som ser best ut, og begrunn valget kort i commit-meldingen.

**Pass på:** `.prizeWrap` ligger `top: 8px; right: 8px` (linje 62) og kronen er
104px bred og sentrert. Et høyere tre kan komme i visuell konflikt med premieboksen.
Sjekk det. `GOAL` kan i prinsippet endres av en forelder senere, så en løsning som
bare virker for tallet 10 er svakere enn en som skalerer.

---

## Oppgave 2 — Tre korrekthetsfeil

Alle tre er bekreftet. Fiks dem samlet, i én commit.

**a) Dobbelttrykk gir to stjerner.** `give()` (linje 297) har kun vakten
`state.stars >= GOAL`. Ingen tidssperre. Knappen er stor og innbydende, og
dobbelttrykk-zoom er slått av, så to raske trykk blir to fulle stjerner.

→ Innfør en sperre på ~800ms etter et registrert trykk. Sperren skal ikke gjøre
knappen visuelt «død» på en måte som forvirrer — vurder om `disabled` er riktig,
eller om en intern flaggvariabel er mindre påtrengende.

**b) `justEarned` nullstilles aldri.** Settes på linje 301, leses på 239, settes
tilbake til `-1` bare i angre og nullstill (312–321). Konsekvens: trykk lyd av/på
etter å ha gitt en stjerne, og `paint()` kjøres på nytt med samme `justEarned` —
stjernen spretter opp igjen uten grunn.

→ Sett `justEarned = -1` etter at `paint()` har brukt den. Sjekk at pop-animasjonen
fortsatt spiller ved en ny stjerne.

**c) Ødelagt lagret data krasjer appen.** Linje 164, `state.log = s.log || []`,
godtar hva som helst med sannhetsverdi. Bekreftet i node:

```
> log som streng   →  TypeError: state.log.push is not a function   (krasjer give())
> stars = 25       →  paint() tegner 10 stjerner, men 25 ringer i treet
```

→ Skriv én valideringsfunksjon som tar ukjent input og returnerer en garantert
gyldig state: `stars` som heltall klemt til `[0, GOAL]`, `log` som array der hvert
element er en parsbar dato, `prizesWon` som ikke-negativt heltall, `muted` som
boolsk. Ugyldige felter faller tilbake til standardverdien — ikke kast hele staten
hvis bare ett felt er rart.

**Viktig:** valideringen skal være streng nok til å fange søppel, men *aldri* så
streng at den forkaster data en ekte bruker har i dag. Test begge deler.

Denne funksjonen skal gjenbrukes i oppgave 3. Gi den et navn som tåler det.

---

## Oppgave 3 — Eksport og import av data

I dag finnes fremgangen ett sted: `localStorage` på én telefon. Ryker telefonen,
ryker stjernene. To foreldre kan ikke ha samme tavle.

**Bygg dette i foreldrepanelet** (`.grownupBox`, linje 130–140), under de
eksisterende knappene:

- Et felt som viser gjeldende state som tekst, og en knapp som kopierer den.
  Bruk `navigator.clipboard.writeText` med en fallback for eldre Safari — og hvis
  ingenting virker, la teksten i det minste være merkbar så den kan kopieres manuelt.
- Et felt å lime inn i, og en importknapp.
- **Import overskriver alt.** Den skal kjøre teksten gjennom valideringen fra
  oppgave 2, avvise søppel med en forståelig norsk feilmelding, og be om
  bekreftelse før den erstatter eksisterende data.

**Formatet skal være kort nok til å kunne limes inn i en melding.** `state.log`
vokser med én ISO-streng per stjerne; vurder om formatet bør komprimeres, men ikke
gjør det til noe uleselig hvis det ikke trengs.

**Dette hører hjemme i voksenpanelet og trenger ikke være pent.** Det skal være
trygt og forståelig. Ikke la det dominere panelet visuelt.

Oppdater `README.md` når dette er på plass — seksjonen «Lagring og personvern»
sier i dag at dataene ligger på én telefon, og at panelet har angre og nullstill.
Begge deler blir unøyaktig.

---

## Oppgave 4 — Stigende tone per stjerne

`starSound()` (linje 194) spiller de samme to tonene — 784 Hz og 1047 Hz — fra
stjerne 1 til stjerne 9. Opptrappingen er hørbart flat helt til `winSound()` (195)
smeller.

**La tonehøyden stige med antall stjerner**, så barnet hører at det nærmer seg
målet. En durskala oppover er det åpenbare valget; du avgjør tonevalg og om begge
tonene skal transponeres.

**Krav:** det skal fortsatt låte vennlig og ikke skingrende ved siste stjerne —
sjekk at toppfrekvensen holder seg innenfor noe som er behagelig på en
telefonhøyttaler. `winSound()` skal fortsatt skille seg tydelig fra stjerne nummer
ni. `state.muted` skal respekteres som før. Løsningen må virke for andre verdier av
`GOAL` enn 10.

Dette er den minste kodeendringen i hele lista og den største
opplevelsesforskjellen per linje. Bruk litt tid på å få den til å låte riktig.

---

## Oppgave 5 — Tilgjengelighet

Fire uavhengige fikser, én commit.

**a) Zoom er blokkert.** Linje 5: `maximum-scale=1, user-scalable=no`. Klart brudd
på WCAG 1.4.4. Fjern begge. Er dobbelttrykk-zoom på knappen et problem etterpå,
løs det med `touch-action` på knappen — ikke ved å slå av zoom for hele appen.

**b) Telleren annonseres ikke.** Linje 242 bytter `textContent` uten `aria-live`.
Den som ikke ser skjermen får ingen bekreftelse på at trykket virket.
→ `aria-live="polite"` på `#count`. Sjekk at teksten som leses opp gir mening
alene, både underveis og ved «Alle 10! 🎉».

**c) Stjernene er ti navnløse grafikkelementer.** `starSvg()` (linje 206) lager SVG
uten `aria-hidden`, uten `role`, uten tittel.
→ Siden telleren nå bærer informasjonen, er det ryddigst å merke stjernene som
dekorative. Sørg for at det faktisk *er* dekkende — informasjonen må finnes ett
sted.

**d) For lav kontrast fire steder.** Målt mot faktisk bakgrunn:

| Element | Linje | I dag | Krav |
|---|---|---|---|
| Undertittel `#6E4A8C` på `#C79DEB` | 37 | 3,13:1 | 4,5:1 |
| `.savedNote` `#9079A6` på `#F0E6FB` | 84 | 3,18:1 | 4,5:1 |
| `.grownupToggle` `#9079A6` på `#FBF4FF` | 81 | 3,56:1 | 4,5:1 |
| `.count` `#9B5DE5` på `#FBF4FF` | 41 | 3,83:1 | 3:1 ✓ (stor tekst) |

Telleren er 30px og bold og klarer kravet for stor tekst — la den være.
→ Mørkne de tre andre til minst 4,5:1. **Regn ut de nye verdiene og vis
utregningen** — ikke gjett. Behold det lilla, lune uttrykket; dette skal ikke bli
en gråblå app.

---

## Verifisering

Det finnes ikke noe testrammeverk her, og det skal det ikke innføres. Du skal
likevel ikke påstå at noe virker uten å ha sjekket det.

**Regn der det kan regnes.** Geometrien i oppgave 1 og kontrastene i oppgave 5 er
aritmetikk — vis tallene.

**Kjør koden der det kan kjøres.** Logikken i oppgave 2 og 3 kan testes ved å kjøre
valideringsfunksjonen mot en håndfull input i node: gyldig state, `log` som streng,
`stars` over `GOAL`, negative tall, `null`, tom streng, JSON som ikke parser.

**Se på appen.** Er det en nettleser tilgjengelig, åpne `index.html` og se på den
ved 0, 1, 5, 9 og 10 stjerner — ta skjermbilder av de to siste. Er det ikke det,
si klart fra at den visuelle delen ikke er bekreftet.

**Gå gjennom denne lista til slutt** og svar ærlig på hver:

- [ ] Kronen og 🌟 er helt synlige ved `GOAL` stjerner
- [ ] Treet ser fortsatt riktig ut ved 1, 3 og 5 stjerner
- [ ] To raske trykk gir én stjerne
- [ ] Lyd av/på etter en stjerne animerer ikke stjernen på nytt
- [ ] Ny stjerne animerer fortsatt som før
- [ ] Valideringen tåler søppel uten å krasje, og bevarer gyldige data urørt
- [ ] Eksportert tekst kan importeres tilbake og gir identisk state
- [ ] Import av søppel gir en forståelig feilmelding, ikke en hvit skjerm
- [ ] Tonen stiger hørbart fra stjerne 1 til 9, og `winSound()` skiller seg ut
- [ ] Lyd av gjør fortsatt appen helt stille
- [ ] Appen kan zoomes
- [ ] De tre tekstene er over 4,5:1
- [ ] Appen virker fortsatt ved å åpne fila direkte, uten nett
- [ ] `README.md` stemmer med det appen faktisk gjør

## Hold deg innenfor

Følgende er **utenfor omfanget**, selv om det frister mens du er inne i koden:

- Flere barn, redigerbart mål, redigerbar oppgavetekst, PIN på panelet
- Mørk modus, natthimmel, CSS-variabler, omskriving av fargesystemet
- Historikk på tvers av runder, deling via URL
- Service worker — den kan uansett ikke virke fra én fil (Blob-registrering får
  `blob:`-scope og kan ikke kontrollere siden)
- Refaktorering av `paint()` bort fra `innerHTML`
- Nye animasjoner eller enhjørning-varianter

Ser du noe underveis som burde vært med, **skriv det ned til slutt i stedet for å
gjøre det**. En kort liste med det du la merke til er mer verdt enn en stor diff.

## Til slutt

Denne appen er laget av en forelder til ett barn. Hver linje du legger til er noe
noen må forstå igjen om et halvt år. Den enkleste løsningen som faktisk fikser
problemet er den riktige — også når du ser en mer elegant en.
