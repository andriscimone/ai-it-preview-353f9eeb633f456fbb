# Spooky timeline

La pagina `spooky-timeline.html` è un dossier interattivo nascosto nella homepage. Parte dai segnali pubblici raccolti in *Accelerando*, poi confronta tre timeline speculative e dodici futuri alternativi senza presentarli come previsioni certe.

## Cosa contiene

- un'apertura centrata, `MACHINIC AUTOPOIESIS`, con il sottotitolo `RSI: recursive self improvement` e un racconto a scorrimento: Einstein aziona l'apparato che proietta `E=MC²` come ombra, Pepe lascia la caverna e scopre Nick Land al posto del sole;
- un prologo personale sul cambio di metodo avvenuto intorno al 2024: dalla reazione a hype e contro-hype a una griglia esplicita di otto condizioni per confrontare i modelli futuri;
- un elenco compatto di otto pannelli nativi e accessibili, apribili al clic o da tastiera, con spiegazione, prova concreta e una micro-visualizzazione CSS per ogni criterio;
- una reinterpretazione a due scale delle *Accelerating Timelines* di Ray Kurzweil: una camera dal tempo profondo alla società industriale e una dal 1780 al presente, con un ulteriore ingrandimento sul 2020-2026, fonti primarie e un confine esplicito tra dati storici e tesi accelerazionista;
- un'introduzione accelerazionista che spiega il circuito compute → modelli → lavoro AI → ricerca più rapida;
- tre grafici interni — due di Anthropic e uno di OpenAI — con fonti primarie e limiti metodologici visibili;
- una sezione `00.2 / CAPITALE` con una scala completa 1900—2026: ogni gradino vale ×2 e la distanza orizzontale mostra il tempo fra le soglie. Dodici punti segnano gli attraversamenti e un tredicesimo punto distinto mostra il massimo intraday Forbes di Musk a $1.450 miliardi; tutti rivelano nome completo, data e patrimonio al passaggio, al focus o al tocco. Seguono volatilità, concentrazione generale e mappa della filiera Musk;
- un grande ingresso editoriale richiudibile, “Quando l'AI accelera se stessa”, che introduce e amplia il registro di 43 eventi del 2025-2026;
- una legenda che separa fatto storico, stima, scenario, raccomandazione e futuro concettuale;
- tre timeline orizzontali per *AI 2027*, *Situational Awareness* e *AI 2040*;
- un albero decisionale che organizza i dodici futuri per arrivo dell'ASI, controllo e autonomia umana e conduce direttamente alle schede numerate;
- dodici futuri alternativi derivati dal capitolo 5 di *Life 3.0*, ciascuno con una sintesi e un racconto espandibile;
- un indice laterale che segue la lettura e permette di saltare direttamente a ogni futuro.

Le due scale ispirate a Kurzweil usano una selezione editoriale di svolte e intervalli approssimativi: cambiare gli eventi cambia la forma, quindi non vengono presentate come prova di una legge universale o della data 2045. Il registro *Accelerando* mescola eventi, dichiarazioni e interpretazioni dell'autore della raccolta: non viene presentato come prova della Singolarità. I grafici descrivono dati aziendali di Anthropic e OpenAI, non misurazioni indipendenti. La sezione sul capitale usa una scala nominale prefissata in cui ogni soglia vale ×2: il grafico principale dichiara di ricostruire la cronologia interna del video, mentre la lente recente usa attraversamenti Forbes documentati. Prima del 1987 non esiste una classifica mondiale annuale comparabile; il tratteggio e i nodi vuoti impediscono di confondere la ricostruzione con una serie certificata. Il record cambia titolare e non equivale a liquidità né a un raddoppio del potere d'acquisto. Le date degli altri documenti restano legate alle rispettive fonti. I dodici futuri del video non hanno date o probabilità: sono possibilità concettuali, non una quarta timeline.

## Come si apre

### Revisione del 5 settembre 2026

- L'indice dei capitoli resta raggiungibile durante la lettura e apre la cronaca quando si sceglie “43 segnali”.
- Il confronto principale accosta ricerca, controllo, politica ed esiti. I passaggi e i riferimenti alle pagine provengono dalle cronologie già presenti, conservate sotto “Leggi le tre cronologie complete”. Le note esplicitano i punti senza una corrispondenza diretta fra fonti.
- La lente dei tre raddoppi recenti precede il grafico storico, ora richiudibile. Il grafico completo mantiene uno scorrimento interno con etichette di almeno 12px.
- I collegamenti nei criteri aprono un filtro sulla cronaca. `data-signal-criteria` associa ogni evento a zero o più criteri: 16 segnali pertinenti, 27 di contesto. Omnimodalità, contesto, memoria e affidabilità non hanno prove direttamente documentate nella raccolta e mostrano uno stato vuoto esplicito. Aggiungere una nuova associazione solo quando il testo dell'evento riguarda una parte precisa della prova; non usare il conteggio come punteggio.
- L'albero guidato conserva una sequenza di scelte e legge sintesi, fatti e racconto dalla scheda originale corrispondente. “Indietro” e “Ricomincia” cambiano percorso; la mappa completa resta apribile e parte aperta sugli schermi grandi.
- `sessionStorage` conserva accesso, posizione e selezioni nella scheda corrente; “Esci” cancella questi dati. La pagina non registra dati su un server. La data visibile distingue la cronaca fino al 9 luglio dal contesto di luglio: questa revisione non certifica una nuova consultazione delle fonti.

Verifica mirata: provare tutte e quattro le domande, gli otto criteri e lo stato senza risultati; raggiungere i dodici esiti e tornare indietro; aprire un racconto e ricaricare; provare le cronologie originali con frecce della tastiera e scorrimento; uscire e tentare di riaprire la pagina. A 390px devono restare interi il titolo dei futuri e le tre barre recenti, senza scorrimento laterale dell'intera pagina. Se compare ancora la vecchia interfaccia, rigenerare `public/` con `node scripts/prepare-public.mjs` e ricaricare.

### Gesto di ingresso

- La parola `capire`, nella sezione finale della homepage, è un pulsante visivamente identico al testo.
- Sette clic entro 2,2 secondi salvano in `sessionStorage` un lasciapassare temporaneo e aprono la timeline.
- La pagina consuma il lasciapassare iniziale e conserva lo sblocco nella stessa scheda fino a “Esci”. L'apertura diretta senza sblocco riporta alla homepage; ricarica e ritorno mantengono la lettura.
- La timeline non compare nella navigazione e usa `noindex` per chiedere ai motori di ricerca di non indicizzarla.

## Limite importante

È un segreto narrativo, non un sistema di sicurezza. HTML, CSS e JavaScript vengono comunque inviati al browser e possono essere scoperti da una persona tecnica. Non inserire qui password, dati privati o informazioni sensibili.

## File

- `index.html`, `styles.css`, `app.js`: gesto di sblocco.
- `spooky-timeline.html`: contenuti, fonti e struttura semantica.
- `spooky-timeline.css`: struttura, stati interattivi e comportamento mobile.
- `spooky-landian.css`: skin visiva autonoma del dossier: terminale, griglia, palette e tipografia.
- `spooky-accelerando.css`: direzione più estrema dell'introduzione, prologo personale, pannelli dei criteri, micro-visualizzazioni, circuito, grafici, sezione sul capitale e registro dei 43 segnali.
- `spooky-timeline.js`: progressione del meme legata allo scorrimento, cambio del sole Nick Land al tocco, tab, tooltip del capitale, scorrimento delle timeline, indice attivo e progresso dei dodici futuri. Il grafico del capitale e le due scale di Kurzweil restano leggibili senza JavaScript.
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
6. Usa “Segui il capitale”: il salto deve fermarsi all'inizio della sezione `00.2 / CAPITALE`, sotto l'header fisso.
7. Nel prologo personale, apri tutti gli otto criteri con mouse, tocco e tastiera: ogni riga deve mostrare spiegazione, prova concreta e micro-visualizzazione; l'apertura di un criterio deve richiudere il precedente nei browser che supportano i gruppi di `<details>`.
8. Nella sezione *Accelerating Timelines*, verifica che la prima camera mostri dal tempo profondo alla società industriale e la seconda dal 1780 al 2026, con un ingrandimento separato del 2020-2026. Tutti gli eventi e gli intervalli devono essere leggibili direttamente; su mobile devono trasformarsi in due sequenze verticali con fonti cliccabili.
9. Controlla che tutti e tre i grafici aziendali siano leggibili, caricati e apribili a piena risoluzione; i collegamenti alle fonti devono aprire Anthropic o OpenAI in una nuova scheda.
10. Nella sezione capitale, verifica che il grafico a gradini parta dal 1900, mostri tutte le tredici soglie da `$195,3125 mln` a `$800 mld` e mantenga uguale l'altezza di ogni ×2. La fascia fino a `$1.600 mld` serve solo a collocare onestamente il picco di Musk e non va contata come soglia raggiunta. La distanza orizzontale deve rendere visibili i tratti di circa 28 e 32 anni e comprimere la coda 2017—2026 quasi sulla stessa verticale.
11. Nella lente Forbes, verifica le tre barre sulla stessa scala: `≈21 anni 4 mesi`, `1.568 giorni`, `419 giorni`. L'ultima deve occupare il `5,4%` della prima e il testo deve riportare `18,7 volte più rapido`.
12. Passa su ciascuno dei tredici punti e ripeti con Tab e tocco: il tooltip deve mostrare nome completo, data e patrimonio, senza creare una barra orizzontale; `Esc` e un tocco esterno devono chiuderlo. I livelli trasparenti del grafico non devono intercettare il cursore al posto dei pulsanti.
13. Controlla il tredicesimo punto e il riquadro `$1.450 miliardi`: devono indicare Elon Musk, 16 giugno 2026 e “massimo intraday”, senza presentarlo come un altro raddoppio; il riferimento superiore deve dichiarare che il prossimo ×2 è `$1.600 miliardi`.
14. Verifica che filiera Musk, nota sul dollaro e indicatore di volatilità distinguano chiaramente fatti operativi, progetti, dipendenze e limiti causali.
15. L'ingresso “Quando l'AI accelera se stessa” deve avere ampiezza e respiro da sezione editoriale; “Amplia la cronaca” deve mostrare 43 eventi, i collegamenti 2025 e 2026 e tutte le fonti cliccabili, poi richiudersi anche con la tastiera.
16. Cambia le tre timeline anche con le frecce della tastiera e scorri le carte in orizzontale.
17. Segui entrambi i rami dell'albero: ogni esito deve mostrare il collegamento e aprire la scheda con lo stesso numero; il raccordo “12 esiti → 12 racconti” deve portare all'inizio delle descrizioni.
18. In ognuno dei dodici futuri apri “Entra nello scenario”: deve comparire il racconto completo con il riferimento alle pagine del libro; richiudilo anche con la tastiera.
19. Ricarica la timeline: devono restare accesso, posizione verticale, confronto selezionato, criterio filtrato, percorso dell'albero, racconti aperti e posizione della cronologia orizzontale attiva. “Esci” deve cancellare lo sblocco; il ritorno dalla cronologia del browser deve allora portare alla Home.
20. Ripeti su mobile e controlla che prologo, criteri, manifesto, circuito, meme, grafici, capitale, registro, tendine e carte restino leggibili senza scorrimento laterale della pagina.

Se i tab o l'indice non reagiscono, controlla per prima cosa che `spooky-timeline.js` sia stato copiato nella cartella pubblicata e che la console del browser non mostri errori.
