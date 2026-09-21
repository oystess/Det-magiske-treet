# Prompt: Hvordan kan Selmas magiske tre bli bedre?

Denne fila er en gjenbrukbar prompt for idémyldring. Kjør den i Claude Code når du
vil ha friske ideer til appen. Alt under streken er selve prompten — kopier den,
eller si til Claude: «Følg PROMPT.md». Skal noe faktisk bygges, se
`PROMPT-topp-fem.md`. Skal noe kvalitetssikres, se `PROMPT-kvalitetsagent.md`.

---

## Oppdraget

Du skal idémyldre. Ikke skriv kode, ikke endre filer, ikke lag en plan for
implementasjon ennå. Målet er et bredt og konkret mulighetsrom som jeg kan plukke
fra etterpå.

Start med å lese hele `index.html`, `manifest.webmanifest` og `README.md`. Alle
forslag skal være forankret i hva som faktisk står der — referer til linjenumre,
funksjonsnavn (`give()`, `paint()`, `state`, `GOAL`, `KEY`) og CSS-klasser når du
peker på noe. Generiske råd som kunne handlet om hvilken som helst app er ikke
brukbare.

## Hva appen er

Én frittstående HTML-fil. En stjernetavle for et barn: la seg i tide = én stjerne.
Ti stjerner får enhjørningen til å trylle det magiske treet i blomst, og barnet har
vunnet premien. Stammen vokser én ring per stjerne, kronen spretter opp, og ved mål
kommer konfetti og en HURRA-overlay. Fremdriften ligger i `localStorage`. Foreldre
har et sammenleggbart panel med teller, logg, «Angre siste» og «Nullstill runde».
Lyden er små toner generert med WebAudio. Appen installeres fra hjemskjermen og
distribueres via GitHub Pages.

## Absolutte rammer

Disse er ikke til forhandling. Et forslag som bryter dem er verdiløst, uansett hvor
godt det ellers er:

- **Alt skal fortsatt ligge i én `index.html`.** HTML, CSS og JS i samme fil.
- **Ingen avhengigheter.** Ingen npm, ingen byggesteg, ingen rammeverk, ingen
  bundler. Appen skal fungere ved å åpne fila direkte.
- **Ingen backend.** Ingen server, ingen database, ingen innlogging, ingen sky-sync
  som krever en tjeneste vi drifter.
- **Ingen nye eksterne ressurser som må lastes ned.** Google Fonts er allerede der
  og kan bli, men ikke legg til CDN-er, bildefiler eller biblioteker.
- **Appen skal virke offline** etter første besøk, og fortsatt kunne installeres på
  hjemskjermen.
- **All tekst i brukergrensesnittet er på norsk bokmål.**

Innenfor disse rammene er du derimot fri. Inline SVG, Canvas, CSS-animasjoner,
WebAudio, Vibration API, `localStorage`, `IndexedDB`, deling via URL eller QR-kode,
service worker skrevet inline med en Blob — alt som kan bo i én fil er lov.

## Fire retninger

Myldre bredt i alle fire. Sikt på 6–10 ideer i hver, og la dem spenne fra små
justeringer til ting som endrer hva appen er.

**1. Barneopplevelsen.** Motivasjon og magi. Hva får et lite barn til å glede seg
til å trykke, også i uke seks? Tenk på variasjon over tid, på hva som skjer mellom
stjernene, på at treet skal føles levende og ikke bare være en måler. Tenk også på
øyeblikket når premien er vunnet — og dagen etter.

**2. Foreldrebruk.** Hva gjør appen faktisk brukbar i en travel leggerutine? Flere
barn? Andre oppgaver enn leggetid? Hva skjer når telefonen byttes og
`localStorage` er tomt? Hvordan får to foreldre samme tavle uten en server? Hva med
historikk over flere runder enn den inneværende?

**3. Teknisk kvalitet.** Se etter det som vil knekke: hva skjer ved dobbelttrykk på
«Gi en stjerne», ved korrupt eller fremmed JSON i `localStorage`, i privat
nettlesermodus der `localStorage` kaster, når `prizesWon` bare øker ved «Start ny
runde» men ikke ved «Nullstill», når klokka på telefonen er feil. Vurder også
offline-robusthet (appen har ingen service worker i dag), struktur i en fil som
vokser, og hvordan man i det hele tatt tester noe sånt uten byggesteg.

**4. Design og universell utforming.** Visuelt uttrykk og lesbarhet på små og store
skjermer. Kontrast, fokusmarkering, skjermleser: stjernene er i dag dekorative
SVG-er uten tekstalternativ, og telleren oppdateres uten at noe annonseres.
`maximum-scale=1, user-scalable=no` blokkerer zoom. `prefers-reduced-motion`
skrur av alt — er det riktig? Mørk modus finnes ikke.

## Hvordan svaret skal se ut

Grupper ideene under de fire retningene. Hver idé får:

- **En tittel** på noen få ord.
- **Hva** — to–fire setninger om hva det konkret er, i denne appen, med referanse
  til koden der det er relevant.
- **Hvorfor** — hva det løser eller gir. Vær ærlig hvis effekten er usikker.
- **Innsats** — liten / middels / stor, og hvorfor.
- **Risiko** — hva det kan ødelegge, gjøre mer komplisert, eller som er i spenn med
  rammene over.

Vær spesifikk nok til at jeg kan si ja eller nei uten oppfølgingsspørsmål. «Bedre
animasjoner» er ikke en idé. «Treet får blader som svaier langsomt i CSS, raskere i
et par sekunder rett etter en stjerne» er en idé.

Ta gjerne med ideer du selv er skeptisk til, og si at du er det. Bland trygge
forbedringer med minst tre forslag som endrer premisset for appen.

Avslutt med to korte lister:

- **Topp fem** — de ideene du ville gjort først, rangert, med én setning om hvorfor
  akkurat de.
- **Ikke gjør dette** — ting som virker fristende, men som du mener vil gjøre appen
  dårligere eller bryte med rammene. Begrunn kort.

## Én ting til

Dette er en app for ett konkret barn, laget av en forelder. Kompleksitet har en
reell kostnad her: hver innstilling er noe noen må forstå klokka åtte om kvelden med
et slitent barn ved siden av seg. Ta det med i vurderingen — noen ganger er det
beste forslaget å fjerne noe.
