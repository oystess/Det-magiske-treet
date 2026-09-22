# Prompt: Tegn illustrasjonene på nytt

Fjerde fila i rekka. `PROMPT.md` myldrer, `PROMPT-topp-fem.md` bygger,
`PROMPT-kvalitetsagent.md` ettergår — denne handler om hvordan appen ser ut.

Kjør den i Claude Code i dette repoet, eller si:
«Følg PROMPT-illustrasjoner.md».

---

## Oppdraget

Tegn alle illustrasjonene i appen på nytt, som **ett sammenhengende sett i én
stil**. Figurene skal få personlighet, og bevegelsene skal være fjollete nok til
at et barn ler.

Les hele `index.html` før du rører noe. Appen er ~30 KB og 500 linjer.

## Hva som er galt i dag

Dette er utredet. Du skal ikke bruke tid på å finne det ut på nytt.

**Enhjørningen er et avkuttet hode.** `UNI_PATHS` (linje 261) er Twemoji-glyfen
for 🦄 — åtte SVG-former kopiert fra Twitters emojisett. Det er en byste: hode og
hals, ingen kropp, og halsen ender i et flatt rektangel rett i gresset.

Appens historie er at enhjørningen *tryller* treet høyere. Figuren kan ikke
trylle. Den kan ikke gestikulere, gå mot treet eller peke. `.magic` (linje 304)
flytter den 6px opp og roterer 3° — det er alt en byste kan gjøre.

**Den ser bort fra treet.** Enhjørningen vender mot venstre, treet står til
høyre. De to figurene i scenen har ingen relasjon.

**Skalaen sier noe feil.** Hodet er nesten like høyt som hele treet. Det antyder
et dyr som er mye større enn treet det får til å vokse.

**Fire visuelle språk samtidig:**

| Hva | Hvordan | Ser ut som |
| --- | --- | --- |
| Enhjørningen i scenen | Twemoji SVG-baner | Twitters emojistil |
| Treet | CSS-sirkler med gradient og innskygge | Mykt, halvveis 3D |
| Stjernene i rutenettet | Egen inline SVG | Flatt med slagskygge |
| 🌟 ✨ 🎉 ⭐ 🌸 🦄 🔊 🔇 ✕ ✓ | Systememoji | Apples stil på iPhone, Googles på Android |

Verst: **samme enhjørning finnes i to stiler samtidig** — Twemoji i scenen, og
systememojien 🦄 i foreldrepanelet og i konfettien. På en iPhone ligner de ikke
på hverandre. Til sammen 17 systememoji-forekomster som telefonen tegner, ikke
appen.

**Treet er fem sirkler og en stabel pannekaker.** Kronen er `.b1`–`.b5` (linje
52–56) med samme radialgradient. Stammen er `.ring`-rektangler med synlig
topplinje og avrundede hjørner, så den leser som en larve. Bladene (`.leaf`,
linje 47) er 12×8px halvovaler som forsvinner som grønne flekker.

**Ingenting er morsomt, og scenen står stille.** Av seks `@keyframes` løper bare
`twinkle` og `sparkleGlow` kontinuerlig, begge på bittesmå elementer.

## Stilretning

**Behold paletten. Hev håndverket.** Appen skal kjennes igjen — den skal bare
være ordentlig laget. Ingen ny fargeverden, ingen ny stemning.

Kjernefargene, som skal styre alt:

```
Lilla        #9B5DE5  #9B6FD0  #C79DEB     Mørk lilla   #4A2E5E  #5C3D6E
Lys lilla    #F3EAFB  #FBF4FF  #ECDDF7     Lavendel     #E3D3F5  #F4ECFB
Rosa         #FFB6E1  #FFC2E2  #FF9ECF     Gull         #FFD23F  #F5C84B
Grønn        #4FAE86  #8FE0B5  #6BC98F     Bakke        #8FCB72  #5FA049
```

Twemoji-fargene skal **ut**: det kalde grå `#C1CDD5`, `#758795`, og den oransje
hornfargen `#EE7C0E` / `#C43512` hører til Twitters palett, ikke til denne
appen. Enhjørningen skal være hvit-lavendel med lilla og rosa man, og et horn i
gull — samme gull som stjernene.

## Dette skal tegnes

Alt som inline SVG eller CSS. **Ingen bildefiler**, ingen base64-bilder.

1. **Enhjørningen** — hel kropp, i profil, vendt **mot treet**. Den skal kunne
   stå, bevege seg og gjøre noe med magien. Høyden skal være rimelig mot treet:
   ved 10 stjerner er treet ~216px høyt i scenen, så enhjørningen bør være godt
   under halvparten. Brukes i fire størrelser — 46, 50, 96 og 128px (linje
   213–216) — så den må fortsatt leses som en enhjørning på 46px.
2. **Treet** — stamme som ser ut som ved, ikke stablede skiver. Krone som henger
   sammen framfor fem løse baller. Blader som er store nok til å ses. Blomstene
   ved mål skal kjennes som blomster.
3. **Stjernene** — både de ti i rutenettet (`starSvg()`, linje 268) og den på
   toppen av treet. Tom og fylt tilstand skal være tydelig forskjellig på
   armlengdes avstand.
4. **Bakken** — `.ground` (linje 43) er en flat grønn stripe med gradient. Den
   trenger noe: gresstuster, en blomst, en stein.
5. **Konfettien** — `confetti()` (linje 397) slipper systememoji. Erstatt med
   egne former.
6. **Premieboksen** — `.prizeBox` (linje 65) viser den samme enhjørningen for
   tredje gang, i en stiplet boks som klipper den.
7. **Ikonene** — 🔊 🔇 i lydknappen, ✕ i lukkeknappen, ✓ i «lagres
   automatisk», 🦄 i «Premier vunnet», 🌟 i undertittelen og i knappeteksten.
   Alle skal bli egne former, så appen ser lik ut på iPhone og Android.

Når du er ferdig skal det **ikke finnes systememoji igjen i appen**.

## Personlighet

Figurene skal virke levende, ikke bare pene.

- **Enhjørningen skal ha et ansikt som kan uttrykke noe** — minst nøytral, glad
  og overrasket. Øyne som kan blunke. Den skal se på treet når noe skjer der, og
  på barnet når den venter.
- **Treet kan gjerne få øyne.** Vurder det. Et tre som ser tilbake er en stor
  forskjell for et lite barn — men det kan også bli for mye sammen med
  enhjørningen. Ta et valg og begrunn det.
- **Tomme stjerner er ikke bare grå.** De kan sove, og våkne når de fylles.

## Fjollete bevegelse

Dette er halve oppdraget. I dag skjer det nesten ingenting.

- **Når en stjerne gis** skal enhjørningen gjøre noe ordentlig — galoppere bort
  til treet, sprette, snurre, bli slått bakover av sin egen magi. **Minst fem
  varianter**, valgt tilfeldig, aldri samme to ganger på rad.
- **Treet skal reagere** når det vokser: riste, strekke seg, vippe.
- **Mellom stjernene skal scenen leve.** Enhjørningen puster, blunker, svinser
  med halen. Bladene rører seg. Det skal ikke se ut som et stillbilde.
- **Ved mål skal det være en forestilling.** I dag: konfetti og en overlay.

Hold det mykt og vennlig. Ingenting som skremmer et barn som skal sove.

## Rammer

Ikke til forhandling:

- **Alt i én `index.html`.** Ingen avhengigheter, intet byggesteg, ingen backend,
  ingen bildefiler.
- **Appen virker offline og ved å åpne fila direkte.**
- **All brukertekst på norsk bokmål.**
- **Størrelsesbudsjett: `index.html` skal holde seg under 70 KB.** Den er 30 KB i
  dag. SVG-baner blir fort store — tegn med få, presise baner framfor mange
  detaljerte. Blir du trang, gjenbruk former med `<use>` og `<symbol>`.
- **Appen skal ikke kunne straffe.** Ingenting truende, ingen sur enhjørning når
  det ikke er gitt stjerne.

### Mål som er bærende

Geometrien henger sammen med koden og med `sjekk/geometri.js`. Endrer du
kronens høyde eller stjernens overheng, **må konstantene følge med**:

```
linje 301:  SCENE_H = 244, TREE_BOTTOM = 30, CROWN_H = 66, STAR_OVER = 16, CLEARANCE = 8
linje 50:   .crown  { width: 104px; height: 66px; }
linje 60:   .treeStar { top: -16px; font-size: 22px; }
```

Kravet er at hele kronen og stjernen er synlige innenfor `.scene` ved `GOAL`
stjerner, også når `GOAL` er endret. Sjekken måler det — den skal være grønn.

### Redusert bevegelse

`@media (prefers-reduced-motion: reduce)` (linje 96) slår av **alt**. Med
fjollete bevegelse blir det viktigere: behold korte overganger i opacity og
farge, fjern det som flytter på seg og det som blinker i det uendelige. Appen
skal fortsatt gi tilbakemelding på et trykk.

### Tilgjengelighet

Stjernerutenettet og treet er merket `aria-hidden="true"`, og telleren bærer
informasjonen. Det skal fortsatt stemme. Nye dekorative figurer merkes
`aria-hidden`. Erstatter du ✓ og ✕ med former, må betydningen finnes i tekst.

## Arbeidsform

**Lag figurene før du setter dem inn.** Skriv en frittstående HTML-fil under
`/tmp` som viser hver figur i alle tilstander og størrelser ved siden av
hverandre, og se på den. Det er mye lettere å få et sett til å henge sammen når
du ser det samlet enn når det er spredt utover appen.

Ta det **i denne rekkefølgen**, med én commit per steg:

1. Enhjørningen — hel kropp, ansikt, vendt mot treet
2. Treet — stamme, krone, blader, blomster
3. Stjernene, bakken, konfettien, premieboksen
4. Ikonene, så de siste systememojiene forsvinner
5. Bevegelsene — varianter, idle-liv, forestillingen ved mål

Da kan hvert steg rulles tilbake alene hvis det ble dårligere.

## Verifisering

**Se på det.** Dette er det eneste i hele repoet der et skjermbilde er
fasit og en grønn test ikke er det. Ta bilder ved 0, 1, 3, 5, 9 og 10 stjerner,
og av foreldrepanelet og seiersoverlegget. Se på dem før du sier deg ferdig.

Kjør også:

- `BEHOLD=1 ./sjekk/kjor.sh` — 99 sjekker. **Alle skal være grønne.**
  Geometri- og UU-gruppene er de som vil brekke først.
- Kontrastsjekken sveiper all synlig tekst. Endrer du bakgrunner, kan tekst som
  var i orden falle under kravet.
- Størrelsen: `wc -c index.html` skal være under 70 KB.
- At ingen systememoji er igjen. Et enkelt søk holder.

Gå gjennom denne lista, og svar ærlig på hver:

- [ ] Enhjørningen har kropp og vender mot treet
- [ ] Den leses som en enhjørning også på 46px
- [ ] Skalaen mellom enhjørning og tre er troverdig
- [ ] Alt er tegnet i samme stil — ingen Twemoji-rester, ingen systememoji
- [ ] Paletten er den samme appen hadde
- [ ] Minst fem ulike reaksjoner når en stjerne gis
- [ ] Scenen lever også når ingenting skjer
- [ ] Redusert bevegelse gir fortsatt tilbakemelding på trykk
- [ ] Alle 99 sjekker er grønne
- [ ] `index.html` er under 70 KB
- [ ] Twemoji-attribusjonen (linje 17) er fjernet hvis ingenting derfra er igjen

## Hold deg innenfor

Utenfor omfanget: nye funksjoner, mørk modus, natthimmel, flere barn, endringer
i hvordan appen fungerer. Dette handler om hvordan den ser ut og beveger seg.

Ser du noe underveis, skriv det ned til slutt framfor å gjøre det.

## Til slutt

Dette er en app en forelder laget til ett barn, og det er barnet som skal like
den. Det pene er ikke poenget. Poenget er at hun gleder seg til å trykke.

Hvis du må velge mellom en figur som er elegant og en som er morsom — velg den
morsomme.
