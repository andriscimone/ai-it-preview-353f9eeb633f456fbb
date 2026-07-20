# AI.it — capire la corsa all'intelligenza artificiale

Il sito introduce le scaling laws e la corsa tra energia, chip e algoritmi. La homepage funziona come ingresso generale; `sistema.html` è la panoramica che collega i quattro capitoli principali:

- scala fisica dell'AI, con distinzione fra cluster interconnesso, sito in H100-equivalent e potenza;
- confronto Ampere, Hopper, Blackwell e Rubin su memoria HBM, banda e NVLink;
- stime cumulative delle unità prodotte, prezzo, TDP e deployment pubblico per visualizzare la crescita industriale delle quattro generazioni;
- simulatore del progresso algoritmico e casi concreti di intelligenza per compute;
- frontiera dell'inferenza per velocità percepita e token prodotti per megawatt.

I quattro capitoli principali sono `energia.html`, `chip.html`, `algoritmi.html` e `inferenza.html`. Tutti condividono navigazione, tema, stile editoriale e script, ma caricano soltanto il contenuto del capitolo scelto. `sistema.css` contiene il design specifico della loro pagina panoramica.

La sezione visibile “Dossier” mantiene l'indirizzo tecnico `altro.html`, così i vecchi collegamenti non si rompono, e raccoglie `benchmark.html`, `politica.html` e `guerra.html`. `novita.html` è una sezione principale autonoma, collocata subito dopo Dossier nella navigazione, e usa un elenco espandibile: ogni notizia chiusa occupa tre righe — metadati, titolo e sintesi — mentre il clic apre contesto e immagini nella stessa pagina. `novita.css` gestisce questo elenco. La prima pagina dedicata, `news-jacobiana.html`, mostra prima il meme e poi il post originale a piena larghezza, quindi separa calcoli verificati, attribuzione riportata e informazioni mancanti; `news-jacobiana.css` e `news-jacobiana.js` ne gestiscono il design e l'apertura esclusiva dei quattro approfondimenti. `altro.css` resta dedicato alle pagine Dossier; `dossier.js` gestisce le animazioni progressive, la timeline interattiva dei dati METR e il confronto fra le leaderboard ARC-AGI-2 e ARC-AGI-3. I dati ARC sono incorporati nel file per mantenere la pagina statica: quando la leaderboard ufficiale cambia, vanno aggiornati insieme alla data di verifica visibile in `benchmark.html`. La pagina Politica ricostruisce il cambio di strategia americana da Biden a Trump: `politica.css` contiene il layout editoriale e mobile, mentre `politica.js` aggiorna la timeline durante lo scorrimento e applica i filtri per atti, notizie e contesto globale. La pagina Guerra parte da una premessa sulla velocità decisionale, presenta Palantir prima di Anduril e usa `guerra.js` per rendere esplorabile la catena sensore → dati → comprensione → decisione → azione; la fotografia in `assets/anduril-field-test-editorial-v1.png` apre il secondo capitolo.

La sezione “Mappa” della homepage mostra gli 11 percorsi principali in tre livelli: Home → Il sistema + Dossier + Novità; Il sistema → quattro capitoli; Dossier → tre percorsi. I singoli articoli si aprono dal relativo indice e non diventano nuovi nodi della mappa. I nodi aggiornano un pannello descrittivo e sono utilizzabili anche con le frecce della tastiera. `scripts/generate-sitemap-pdf.py` legge gli stessi dati dalla homepage e genera `output/pdf/mappa-completa-ai-it.pdf`; nel PDF compare anche `spooky-timeline.html`, chiaramente indicata come esperienza nascosta e non presente nella mappa pubblica.

Il capitolo Energia aggiunge una visualizzazione nativa e accessibile della relazione tra PIL ed energia. `energy.css` contiene soltanto lo stile di questa pagina; `energy-visuals.js` legge `assets/energy-gdp-2024.json` e disegna il grafico nel browser, senza backend o librerie esterne.

Il capitolo Algoritmi apre con una premessa storica dal perceptron al Transformer, corregge la confusione fra architettura di von Neumann e determinismo e accompagna la lettura con una dimostrazione laterale controllata dallo scorrimento. La sequenza parte dalla retta deterministica, mostra perché le regole esplicite non bastano, visualizza la riduzione dell'errore durante l'addestramento e arriva alla distribuzione probabilistica e alla self-attention. Prosegue separando tre leve — compute grezzo, efficienza algoritmica e sblocco delle capacità — e cita il saggio *Situational Awareness: The Decade Ahead*. `algorithms.css` contiene il design specifico della pagina; `algorithm-visuals.js` gestisce lo scrollytelling continuo, gli esploratori interattivi e il confronto che rende visibile la riduzione dalla stima non ufficiale di 1.700B per GPT-4 fino a modelli da 2B capaci di raggiungere la sua baseline su GPQA Diamond, mentre il simulatore del tasso storico rimane nel file condiviso `app.js`.

La pagina segreta `spooky-timeline.html` apre con *Accelerando*: un'introduzione sul circuito di miglioramento dell'AI, tre grafici interni di Anthropic e OpenAI e un registro richiudibile di 43 segnali del 2025-2026. Dati aziendali, dichiarazioni e interpretazioni restano esplicitamente distinti. La pagina confronta poi le timeline speculative di *AI 2027*, *Situational Awareness* e *AI 2040* e organizza dodici futuri alternativi in un albero decisionale collegato direttamente alle schede con la stessa numerazione. `spooky-accelerando.css` contiene la direzione visiva più estrema della soglia iniziale; `spooky-timeline.js` gestisce tab, scorrimento e collegamenti attivi; `SPOOKY_TIMELINE.md` documenta lo sblocco e la verifica. Le date restano separate per fonte e i dodici futuri non vengono presentati come previsioni o scenari probabilistici.

Il quarto capitolo ricostruisce in modo interattivo la frontiera dell'efficienza nell'inferenza: velocità percepita (token in output al secondo per utente) contro capacità del sistema (token in output al secondo per megawatt).

Per provarlo localmente, avvia un server statico dalla cartella del progetto:

```powershell
python -m http.server 4173
```

Poi visita `http://localhost:4173`.

Nel confronto di inferenza entrano soltanto modelli aperti con una curva pubblica completa: Kimi K2 Thinking, DeepSeek R1 e Mistral Large 3. I benchmark restano separati per modello, contesto, precisione e piattaforma; i punti digitalizzati dai grafici dei produttori sono indicati come approssimativi.

Le nuove sezioni mantengono separati dati osservati, stime e claim dei produttori. In particolare, 1,11 milioni di H100-equivalent descrivono un sito, non un unico coherent cluster; circa 20 GW per training e inference è mostrato soltanto come ordine di grandezza derivato.
