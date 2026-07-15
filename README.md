# AI.it — capire la corsa all'intelligenza artificiale

Il sito introduce le scaling laws e la corsa tra energia, chip e algoritmi. La homepage funziona come indice e conduce a quattro pagine tematiche indipendenti:

- scala fisica dell'AI, con distinzione fra cluster interconnesso, sito in H100-equivalent e potenza;
- confronto Ampere, Hopper, Blackwell e Rubin su memoria HBM, banda e NVLink;
- stime cumulative delle unità prodotte, prezzo, TDP e deployment pubblico per visualizzare la crescita industriale delle quattro generazioni;
- simulatore del progresso algoritmico e casi concreti di intelligenza per compute;
- frontiera dell'inferenza per velocità percepita e token prodotti per megawatt.

Le pagine sono `energia.html`, `chip.html`, `algoritmi.html` e `inferenza.html`. Tutte condividono navigazione, tema, stile editoriale e script, ma caricano soltanto il contenuto del capitolo scelto.

Il quarto capitolo ricostruisce in modo interattivo la frontiera dell'efficienza nell'inferenza: velocità percepita (token in output al secondo per utente) contro capacità del sistema (token in output al secondo per megawatt).

Apri direttamente `index.html` oppure avvia un server statico locale:

```powershell
python -m http.server 4173
```

Poi visita `http://localhost:4173`.

Nel confronto di inferenza entrano soltanto modelli aperti con una curva pubblica completa: Kimi K2 Thinking, DeepSeek R1 e Mistral Large 3. I benchmark restano separati per modello, contesto, precisione e piattaforma; i punti digitalizzati dai grafici dei produttori sono indicati come approssimativi.

Le nuove sezioni mantengono separati dati osservati, stime e claim dei produttori. In particolare, 1,11 milioni di H100-equivalent descrivono un sito, non un unico coherent cluster; circa 20 GW per training e inference è mostrato soltanto come ordine di grandezza derivato.
