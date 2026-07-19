# Spooky timeline

La pagina `spooky-timeline.html` è un dossier interattivo nascosto nella homepage. Confronta tre timeline speculative e dodici futuri alternativi senza presentarli come previsioni certe.

## Cosa contiene

- una legenda che separa fatto storico, stima, scenario, raccomandazione e futuro concettuale;
- tre timeline orizzontali per *AI 2027*, *Situational Awareness* e *AI 2040*;
- un albero decisionale che organizza i dodici futuri per arrivo dell'ASI, controllo e autonomia umana e conduce direttamente alle schede numerate;
- dodici futuri alternativi derivati dal capitolo 5 di *Life 3.0*, ciascuno con una sintesi e un racconto espandibile;
- un indice laterale che segue la lettura e permette di saltare direttamente a ogni futuro.

Le date dei documenti restano legate alle rispettive fonti. I dodici futuri del video non hanno date o probabilità: sono possibilità concettuali, non una quarta timeline.

## Come si apre

- La parola `capire`, nella sezione finale della homepage, è un pulsante visivamente identico al testo.
- Sette clic entro 2,2 secondi salvano in `sessionStorage` un lasciapassare temporaneo e aprono la timeline.
- La pagina consuma subito il lasciapassare: apertura diretta, ricarica e cronologia del browser riportano alla homepage.
- La timeline non compare nella navigazione e usa `noindex` per chiedere ai motori di ricerca di non indicizzarla.

## Limite importante

È un segreto narrativo, non un sistema di sicurezza. HTML, CSS e JavaScript vengono comunque inviati al browser e possono essere scoperti da una persona tecnica. Non inserire qui password, dati privati o informazioni sensibili.

## File

- `index.html`, `styles.css`, `app.js`: gesto di sblocco.
- `spooky-timeline.html`: contenuti, fonti e struttura semantica.
- `spooky-timeline.css`: struttura, stati interattivi e comportamento mobile.
- `spooky-landian.css`: skin visiva autonoma del dossier: terminale, griglia, palette e tipografia.
- `spooky-timeline.js`: tab, scorrimento delle timeline, indice attivo e progresso dei dodici futuri.
- `scripts/prepare-public.mjs` e `scripts/finalize-dist.mjs`: inclusione dei quattro file della pagina nella build pubblicabile.

Non serve un database: testo e riferimenti vivono nell'HTML; JavaScript modifica soltanto ciò che il lettore vede e seleziona.

La separazione tra i due fogli di stile è intenzionale: `spooky-timeline.css` mantiene la pagina leggibile e funzionante, mentre `spooky-landian.css` può cambiare direzione artistica senza toccare contenuti o interazioni.

## Verifica manuale

1. Avvia il sito con un server locale e apri la homepage.
2. Apri direttamente `spooky-timeline.html`: devi tornare a `index.html#tesi`.
3. Clicca lentamente sette volte su `capire`: non deve succedere nulla.
4. Clicca velocemente sette volte: deve aprirsi il dossier.
5. Cambia le tre timeline anche con le frecce della tastiera e scorri le carte in orizzontale.
6. Segui entrambi i rami dell'albero: ogni esito deve mostrare il collegamento e aprire la scheda con lo stesso numero; il raccordo “12 esiti → 12 racconti” deve portare all'inizio delle descrizioni.
7. In ognuno dei dodici futuri apri “Entra nello scenario”: deve comparire il racconto completo con il riferimento alle pagine del libro; richiudilo anche con la tastiera.
8. Ricarica la timeline: devi tornare alla homepage.
9. Ripeti su mobile e controlla che testo, controlli, tendine e carte restino leggibili senza scorrimento laterale della pagina.

Se i tab o l'indice non reagiscono, controlla per prima cosa che `spooky-timeline.js` sia stato copiato nella cartella pubblicata e che la console del browser non mostri errori.
