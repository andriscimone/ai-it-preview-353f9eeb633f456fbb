# Spooky timeline

La pagina `spooky-timeline.html` è un dossier interattivo nascosto nella homepage. Parte dai segnali pubblici raccolti in *Accelerando*, poi confronta tre timeline speculative e dodici futuri alternativi senza presentarli come previsioni certe.

## Cosa contiene

- un'apertura centrata, `MACHINIC AUTOPOIESIS`, con il sottotitolo `RSI: recursive self improvement` e un racconto a scorrimento: Einstein aziona l'apparato che proietta `E=MC²` come ombra, Pepe lascia la caverna e scopre Nick Land al posto del sole;
- un'introduzione accelerazionista che spiega il circuito compute → modelli → lavoro AI → ricerca più rapida;
- tre grafici interni — due di Anthropic e uno di OpenAI — con fonti primarie e limiti metodologici visibili;
- un registro richiudibile con 43 eventi del 2025-2026 e collegamenti esterni protetti;
- una legenda che separa fatto storico, stima, scenario, raccomandazione e futuro concettuale;
- tre timeline orizzontali per *AI 2027*, *Situational Awareness* e *AI 2040*;
- un albero decisionale che organizza i dodici futuri per arrivo dell'ASI, controllo e autonomia umana e conduce direttamente alle schede numerate;
- dodici futuri alternativi derivati dal capitolo 5 di *Life 3.0*, ciascuno con una sintesi e un racconto espandibile;
- un indice laterale che segue la lettura e permette di saltare direttamente a ogni futuro.

Il registro *Accelerando* mescola eventi, dichiarazioni e interpretazioni dell'autore della raccolta: non viene presentato come prova della Singolarità. I grafici descrivono dati aziendali di Anthropic e OpenAI, non misurazioni indipendenti. Le date degli altri documenti restano legate alle rispettive fonti. I dodici futuri del video non hanno date o probabilità: sono possibilità concettuali, non una quarta timeline.

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
- `spooky-accelerando.css`: direzione più estrema dell'introduzione, circuito, grafici e registro dei 43 segnali.
- `spooky-timeline.js`: progressione del meme legata allo scorrimento, cambio del sole Nick Land al tocco, tab, scorrimento delle timeline, indice attivo e progresso dei dodici futuri.
- `assets/spooky-plato-cave-v1.webp`, `assets/spooky-einstein-projector-v1.webp`, `assets/spooky-pepe-prisoner-v1.webp`, `assets/spooky-pepe-exit-v1.webp`, `assets/spooky-nick-land-sun.webp` e `assets/spooky-nick-land-sun-alt.webp`: tavola e livelli fotografici del meme nell'hero.
- `assets/code-contributed-per-person-quarter-2026.png`, `assets/claude-code-session-success-rate-2026.png` e `assets/openai-output-tokens-by-department-2026.png`: copie pubblicabili dei tre grafici.
- `content-drafts/accelerando-it.md`: traduzione estesa conservata come materiale editoriale; non viene caricata dal sito.
- `scripts/prepare-public.mjs` e `scripts/finalize-dist.mjs`: inclusione dei file della pagina nella build pubblicabile.

Non serve un database: testo e riferimenti vivono nell'HTML; JavaScript modifica soltanto ciò che il lettore vede e seleziona.

La separazione tra i tre fogli di stile è intenzionale: `spooky-timeline.css` mantiene la pagina leggibile e funzionante, `spooky-landian.css` definisce la direzione generale e `spooky-accelerando.css` aumenta la tensione visiva soltanto nella soglia iniziale.

## Verifica manuale

1. Avvia il sito con un server locale e apri la homepage.
2. Apri direttamente `spooky-timeline.html`: devi tornare a `index.html#tesi`.
3. Clicca lentamente sette volte su `capire`: non deve succedere nulla.
4. Clicca velocemente sette volte: deve aprirsi il dossier.
5. Scorri lentamente la scena: Einstein deve azionare il proiettore, `E=MC²` deve apparire come ombra sulla parete, Pepe deve abbandonarla e raggiungere l'esterno; Nick Land deve comparire soltanto verso la fine. Poi passa sul sole, selezionalo con la tastiera oppure toccalo su mobile: la foto deve cambiare e un secondo tocco deve ripristinarla.
6. Usa “Entra nell'accelerazione”: il salto deve fermarsi all'inizio della nuova sezione, sotto l'header fisso.
7. Controlla che tutti e tre i grafici siano leggibili, caricati e apribili a piena risoluzione; i collegamenti alle fonti devono aprire Anthropic o OpenAI in una nuova scheda.
8. Apri il registro: deve mostrare 43 eventi, i collegamenti 2025 e 2026 e tutte le fonti cliccabili; richiudilo anche con la tastiera.
9. Cambia le tre timeline anche con le frecce della tastiera e scorri le carte in orizzontale.
10. Segui entrambi i rami dell'albero: ogni esito deve mostrare il collegamento e aprire la scheda con lo stesso numero; il raccordo “12 esiti → 12 racconti” deve portare all'inizio delle descrizioni.
11. In ognuno dei dodici futuri apri “Entra nello scenario”: deve comparire il racconto completo con il riferimento alle pagine del libro; richiudilo anche con la tastiera.
12. Ricarica la timeline: devi tornare alla homepage.
13. Ripeti su mobile e controlla che manifesto, circuito, meme, grafici, registro, tendine e carte restino leggibili senza scorrimento laterale della pagina.

Se i tab o l'indice non reagiscono, controlla per prima cosa che `spooky-timeline.js` sia stato copiato nella cartella pubblicata e che la console del browser non mostri errori.
