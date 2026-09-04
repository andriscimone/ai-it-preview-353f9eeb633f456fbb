const dossierRevealItems = [...document.querySelectorAll("[data-dossier-reveal]")];

if (dossierRevealItems.length && "IntersectionObserver" in window) {
  document.body.classList.add("reveal-ready");
  const dossierRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      dossierRevealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.06 });
  dossierRevealItems.forEach(item => dossierRevealObserver.observe(item));
}

const metrModels = {
  gpt4: { name: "GPT‑4", date: "14 marzo 2023 · OpenAI", duration: "circa 4 minuti", ci: "1,9 – 8,0 min", status: "Il confronto parte da pochi minuti: è una misura su task tecnici, non autonomia generale." },
  gpt4o: { name: "GPT‑4o", date: "13 maggio 2024 · OpenAI", duration: "circa 7 minuti", ci: "4,0 – 12,9 min", status: "La barra cresce, ma resta nell’ordine di un piccolo compito tecnico." },
  sonnet35: { name: "Claude 3.5 Sonnet", date: "20 giugno 2024 · Anthropic", duration: "circa 11 minuti", ci: "5,5 – 22,4 min", status: "L’intervallo mostra quanta cautela serve anche quando la stima centrale sembra precisa." },
  o1: { name: "o1", date: "5 dicembre 2024 · OpenAI", duration: "circa 39 minuti", ci: "21 – 65 min", status: "È il primo salto visivo verso un compito umano vicino a un’ora." },
  sonnet37: { name: "Claude 3.7 Sonnet", date: "24 febbraio 2025 · Anthropic", duration: "circa un’ora", ci: "33 min – 1 h 44", status: "P50 significa comunque riuscire una volta su due, non lavorare senza errori per un’ora." },
  o3: { name: "o3", date: "16 aprile 2025 · OpenAI", duration: "circa 2 ore", ci: "1 h 15 – 3 h 11", status: "La durata è quella del task per un esperto umano, non il tempo trascorso dall’agente." },
  gpt5: { name: "GPT‑5", date: "7 agosto 2025 · OpenAI", duration: "circa 3 ore e 23 minuti", ci: "1 h 53 – 6 h 46", status: "Il valore resta specifico dei 228 task e dello scaffold usato da METR." },
  opus45: { name: "Claude Opus 4.5", date: "24 novembre 2025 · Anthropic", duration: "circa 4 ore e 53 minuti", ci: "2 h 42 – 10 h 24", status: "L’intervallo è già più che triplo: meglio leggere l’ordine di grandezza dei decimali." },
  opus46: { name: "Claude Opus 4.6", date: "5 febbraio 2026 · Anthropic", duration: "circa 12 ore", ci: "5 h 17 – 60 h 34", status: "La stima centrale è sotto la parete, ma l’intervallo attraversa ampiamente la zona satura." },
  gemini31: { name: "Gemini 3.1 Pro", date: "19 febbraio 2026 · Google", duration: "circa 6 ore e 24 minuti", ci: "3 h 54 – 11 h 35", status: "Essere più recente non significa automaticamente avere la barra più lunga." },
  gpt54: { name: "GPT‑5.4", date: "5 marzo 2026 · OpenAI", duration: "circa 5 ore e 42 minuti", ci: "3 h 07 – 12 h 49", status: "È un intervallo ampio: non leggere pochi minuti di differenza come una classifica definitiva." },
  mythos: { name: "Claude Mythos Preview (early)", date: "7 aprile 2026 · Anthropic", duration: "circa 17 ore e 25 minuti", ci: "8 h 29 – 55 h 04", status: "La stima centrale supera le 16 ore: METR la tratta come saturazione della suite, non come record preciso." }
};

const metrButtons = [...document.querySelectorAll(".metr-model-row[data-metr-model]")];
const metrReadingName = document.getElementById("metr-reading-name");
const metrReadingDate = document.getElementById("metr-reading-date");
const metrReadingCopy = document.getElementById("metr-reading-copy");
const metrReadingCi = document.getElementById("metr-reading-ci");
const metrReadingStatus = document.getElementById("metr-reading-status");
const metrMaxMinutes = 32 * 60;

// Keep the selected result beside its bar, even in long mobile rankings.
function chartSelectionNote(button, id, text) {
  if (!button) return;
  let note = document.getElementById(id);
  if (!note) {
    note = document.createElement('p');
    note.id = id;
    note.className = 'chart-selection-note';
    note.setAttribute('role', 'status');
  }
  note.textContent = text;
  button.after(note);
}

function metrPosition(minutes) {
  const boundedMinutes = Math.max(1, Math.min(minutes, metrMaxMinutes));
  return `${(Math.log(boundedMinutes) / Math.log(metrMaxMinutes)) * 100}%`;
}

function renderMetrModel(key) {
  const model = metrModels[key];
  if (!model || !metrReadingName) return;
  metrReadingName.textContent = model.name;
  metrReadingDate.textContent = model.date;
  metrReadingCopy.innerHTML = `Su compiti che richiedono <strong>${model.duration}</strong> a un esperto, l’agente ha una probabilità stimata del 50% di riuscire.`;
  metrReadingCi.textContent = model.ci;
  metrReadingStatus.textContent = model.status;
  metrButtons.forEach(button => {
    const selected = button.dataset.metrModel === key;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  chartSelectionNote(metrButtons.find(button => button.dataset.metrModel === key), 'metr-selection-note',
    `P50: ${model.duration} di lavoro umano. Intervallo di confidenza: ${model.ci}. ${model.status}`);
}

metrButtons.forEach(button => {
  button.style.setProperty("--metr-row", metrPosition(Number(button.dataset.metrMinutes)));
  button.addEventListener("click", () => renderMetrModel(button.dataset.metrModel));
});

const arcLeaderboardData = {
  arc2: { label: "ARC-AGI-2", ariaLabel: "Selezione aggiornata ARC-AGI-2", threshold: 85, thresholdLabel: "Soglia premio · 85%",
    note: "<strong>ARC‑AGI‑2:</strong> selezione di modelli recenti, una configurazione verificata per modello. Budget diversi; costi espressi in USD per task. L’85% era la soglia del premio, non una definizione di AGI.",
    systems: window.aiitBenchmarkData?.arc2 || [] },
  arc3: { label: "ARC-AGI-3", ariaLabel: "ARC-AGI-3 con harness standard", threshold: 100, thresholdLabel: "Riferimento umano · 100%",
    note: "<strong>ARC‑AGI‑3:</strong> qui compaiono solo risultati con harness Standard. Il costo è quello dell’intera valutazione. Le prove con Provider Adapter sono nel laboratorio qui sotto: teniamo visibile la differenza di configurazione.",
    systems: window.aiitBenchmarkData?.arc3 || [] }
};

const arcViewButtons = [...document.querySelectorAll("[data-arc-view]")];
const arcRankingStage = document.querySelector(".arc-ranking-stage");
const arcRankingList = document.getElementById("arc-ranking-list");
const arcThresholdLabel = document.getElementById("arc-threshold-label");
const arcDetailName = document.getElementById("arc-detail-name");
const arcDetailOrg = document.getElementById("arc-detail-org");
const arcDetailScore = document.getElementById("arc-detail-score");
const arcDetailRank = document.getElementById("arc-detail-rank");
const arcDetailCopy = document.getElementById("arc-detail-copy");
const arcRankingNote = document.getElementById("arc-ranking-note");
let activeArcView = "arc2";
let activeArcSystem = "openai-gpt-6-astra-max";

function arcScore(value) {
  return `${value.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function selectArcSystem(id) {
  const benchmark = arcLeaderboardData[activeArcView];
  const index = benchmark.systems.findIndex(system => system.id === id);
  const system = benchmark.systems[index];
  if (!system) return;

  activeArcSystem = id;
  arcRankingList?.querySelectorAll(".arc-rank-row").forEach(button => {
    const selected = button.dataset.arcSystem === id;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  arcDetailName.textContent = system.name;
  arcDetailOrg.textContent = `${system.org} · data indicata da ARC ${new Date(system.date + "T12:00:00Z").toLocaleDateString("it-IT")} · ${system.setup}`;
  arcDetailScore.textContent = arcScore(system.score);
  const cost = document.getElementById("arc-detail-cost");
  if (cost) cost.textContent = system.cost.toLocaleString("it-IT", { maximumFractionDigits: activeArcView === "arc2" ? 3 : 0 }) + " " + system.costUnit;
  const source = document.getElementById("arc-detail-source");
  if (source) source.href = system.source;
  arcDetailRank.textContent = `${index + 1}° nella selezione`;
  arcDetailCopy.textContent = activeArcView === "arc2"
    ? `Risolve esattamente ${arcScore(system.score)} dei task nella valutazione semi-privata. Il punteggio non descrive conoscenza generale né lavoro autonomo.`
    : `Ottiene ${arcScore(system.score)} combinando livelli completati ed efficienza delle azioni su ambienti semi-privati. Il 100% corrisponde alla prestazione umana di riferimento.`;
  chartSelectionNote(arcRankingList.querySelector(`[data-arc-system="${id}"]`), 'arc-selection-note',
    `${system.name} · ${system.setup}. ${arcDetailCopy.textContent} Costo: ${system.cost.toLocaleString("it-IT", { maximumFractionDigits: 3 })} ${system.costUnit}.`);
}

function renderArcLeaderboard(view) {
  const benchmark = arcLeaderboardData[view];
  if (!benchmark || !arcRankingList || !arcRankingStage) return;

  activeArcView = view;
  activeArcSystem = benchmark.systems[0].id;
  arcRankingStage.style.setProperty("--arc-threshold", `${benchmark.threshold}%`);
  arcRankingStage.classList.toggle("is-arc3", view === "arc3");
  arcThresholdLabel.textContent = benchmark.thresholdLabel;
  arcRankingList.setAttribute("aria-label", benchmark.ariaLabel);
  arcRankingNote.innerHTML = benchmark.note;

  arcRankingList.replaceChildren(...benchmark.systems.map((system, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "arc-rank-row";
    button.dataset.arcSystem = system.id;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${index + 1}°: ${system.name}, ${arcScore(system.score)} su ${benchmark.label}`);
    button.style.setProperty("--arc-score", `${system.score}%`);
    button.innerHTML = `<span class="arc-rank-number">${String(index + 1).padStart(2, "0")}</span><span class="arc-rank-identity"><strong>${system.name}</strong><small>${system.org} · ${system.setup}</small></span><span class="arc-rank-track" aria-hidden="true"><i></i><b></b></span><strong class="arc-rank-score">${arcScore(system.score)}</strong>`;
    button.addEventListener("click", () => selectArcSystem(system.id));
    item.appendChild(button);
    return item;
  }));

  arcViewButtons.forEach(button => {
    const selected = button.dataset.arcView === view;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  selectArcSystem(activeArcSystem);
}

arcViewButtons.forEach(button => {
  button.addEventListener("click", () => renderArcLeaderboard(button.dataset.arcView));
});

if (arcRankingList) renderArcLeaderboard(activeArcView);
