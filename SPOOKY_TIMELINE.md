# Spooky timeline

La pagina `spooky-timeline.html` è un'easter egg della homepage.

## Come si apre

- La parola `capire`, nella sezione finale della homepage, è un pulsante visivamente identico al testo.
- Sette clic entro 2,2 secondi salvano in `sessionStorage` un lasciapassare temporaneo e aprono la timeline.
- La pagina consuma subito il lasciapassare: apertura diretta, ricarica e cronologia del browser riportano alla homepage.
- La timeline non compare nella navigazione e usa `noindex` per chiedere ai motori di ricerca di non indicizzarla.

## Limite importante

È un segreto narrativo, non un sistema di sicurezza. HTML, CSS e JavaScript vengono comunque inviati al browser e possono essere scoperti da una persona tecnica. Non inserire qui password, dati privati o informazioni sensibili.

## File

- `index.html`, `styles.css`, `app.js`: gesto di sblocco.
- `spooky-timeline.html`: contenuto e controllo iniziale dell'accesso.
- `spooky-timeline.css`: stile responsive.
- `spooky-timeline.js`: interazione della timeline.
- `scripts/prepare-public.mjs` e `scripts/finalize-dist.mjs`: inclusione nella build pubblicata.

## Verifica manuale

1. Apri direttamente `spooky-timeline.html`: devi tornare a `index.html#tesi`.
2. Clicca lentamente sette volte su `capire`: non deve succedere nulla.
3. Clicca velocemente sette volte: deve aprirsi la timeline.
4. Ricarica la timeline: devi tornare alla homepage.
5. Ripeti su mobile e controlla che la pagina non scorra lateralmente.
