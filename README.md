# AI.it — capire la corsa all'intelligenza artificiale

Il sito introduce le scaling laws e la corsa tra energia, chip e algoritmi. La homepage funziona come indice e conduce a quattro pagine tematiche indipendenti:

- scala fisica dell'AI, con distinzione fra cluster interconnesso, sito in H100-equivalent e potenza;
- confronto Ampere, Hopper, Blackwell e Rubin su memoria HBM, banda e NVLink;
- stime cumulative delle unità prodotte, prezzo, TDP e deployment pubblico per visualizzare la crescita industriale delle quattro generazioni;
- simulatore del progresso algoritmico e casi concreti di intelligenza per compute;
- frontiera dell'inferenza per velocità percepita e token prodotti per megawatt.

I quattro capitoli principali sono `energia.html`, `chip.html`, `algoritmi.html` e `inferenza.html`. Tutti condividono navigazione, tema, stile editoriale e script, ma caricano soltanto il contenuto del capitolo scelto.

L'area `altro.html` raccoglie dossier che cambiano più rapidamente: `novita.html`, `benchmark.html`, `politica.html` e `guerra.html`. `altro.css` contiene il loro sistema visuale condiviso; `dossier.js` gestisce le animazioni progressive, la timeline interattiva dei dati METR e il confronto fra le leaderboard ARC-AGI-2 e ARC-AGI-3. I dati ARC sono incorporati nel file per mantenere la pagina statica: quando la leaderboard ufficiale cambia, vanno aggiornati insieme alla data di verifica visibile in `benchmark.html`. La pagina Politica ricostruisce il cambio di strategia americana da Biden a Trump: `politica.css` contiene il layout editoriale e mobile, mentre `politica.js` aggiorna la timeline durante lo scorrimento e applica i filtri per atti, notizie e contesto globale. La pagina Guerra parte da una premessa sulla velocità decisionale, presenta Palantir prima di Anduril e usa `guerra.js` per rendere esplorabile la catena sensore → dati → comprensione → decisione → azione; la fotografia in `assets/anduril-field-test-editorial-v1.png` apre il secondo capitolo. La pagina Novità è intenzionalmente segnata come “Da aggiornare”.

Il capitolo Energia aggiunge una visualizzazione nativa e accessibile della relazione tra PIL ed energia. `energy.css` contiene soltanto lo stile di questa pagina; `energy-visuals.js` legge `assets/energy-gdp-2024.json` e disegna il grafico nel browser, senza backend o librerie esterne.

Il capitolo Algoritmi apre con una premessa storica dal perceptron al Transformer, corregge la confusione fra architettura di von Neumann e determinismo e accompagna la lettura con una dimostrazione laterale controllata dallo scorrimento. La sequenza parte dalla retta deterministica, mostra perché le regole esplicite non bastano, visualizza la riduzione dell'errore durante l'addestramento e arriva alla distribuzione probabilistica e alla self-attention. Prosegue separando tre leve — compute grezzo, efficienza algoritmica e sblocco delle capacità — e cita il saggio *Situational Awareness: The Decade Ahead*. `algorithms.css` contiene il design specifico della pagina; `algorithm-visuals.js` gestisce lo scrollytelling continuo, gli esploratori interattivi e il confronto che rende visibile la riduzione dalla stima non ufficiale di 1.700B per GPT-4 fino a modelli da 2B capaci di raggiungere la sua baseline su GPQA Diamond, mentre il simulatore del tasso storico rimane nel file condiviso `app.js`.

La pagina segreta `spooky-timeline.html` confronta le timeline speculative di *AI 2027*, *Situational Awareness* e *AI 2040*, poi organizza dodici futuri alternativi in un albero decisionale collegato direttamente alle schede con la stessa numerazione. Ogni futuro presenta una sintesi immediata e un racconto espandibile rielaborato dal capitolo 5 di *Life 3.0*, con le pagine del PDF indicate nella scheda. `spooky-timeline.js` gestisce tab, scorrimento e collegamenti attivi; `SPOOKY_TIMELINE.md` documenta lo sblocco e la verifica. Le date restano separate per fonte e i dodici futuri non vengono presentati come previsioni o scenari probabilistici.

Il quarto capitolo ricostruisce in modo interattivo la frontiera dell'efficienza nell'inferenza: velocità percepita (token in output al secondo per utente) contro capacità del sistema (token in output al secondo per megawatt).

Apri direttamente `index.html` oppure avvia un server statico locale:

```powershell
python -m http.server 4173
```

Poi visita `http://localhost:4173`.

Nel confronto di inferenza entrano soltanto modelli aperti con una curva pubblica completa: Kimi K2 Thinking, DeepSeek R1 e Mistral Large 3. I benchmark restano separati per modello, contesto, precisione e piattaforma; i punti digitalizzati dai grafici dei produttori sono indicati come approssimativi.

Le nuove sezioni mantengono separati dati osservati, stime e claim dei produttori. In particolare, 1,11 milioni di H100-equivalent descrivono un sito, non un unico coherent cluster; circa 20 GW per training e inference è mostrato soltanto come ordine di grandezza derivato.
