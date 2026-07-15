const progressCopy = {
  compute: {
    label: "01 · Compute grezzo",
    value: "Più chip, più energia, più tempo",
    copy: "È la leva fisica: aumenta il numero di operazioni disponibili per addestrare o eseguire il modello.",
    caveat: "Misurare i FLOP non basta a prevedere la capacità: contano dati, architettura e ricetta di training."
  },
  efficiency: {
    label: "02 · Efficienza algoritmica",
    value: "10× meno calcolo = +1 OOM effettivo",
    copy: "È la leva più vicina a un confronto controllato: si fissa lo stesso obiettivo e si misura quanto compute serve per raggiungerlo.",
    caveat: "Misurabile solo se task, target e protocollo restano comparabili."
  },
  unhobbling: {
    label: "03 · Sblocco delle capacità",
    value: "Stesso modello, uso radicalmente migliore",
    copy: "Post-training, ragionamento, strumenti, scaffolding e contesto possono trasformare una capacità latente in un comportamento utile.",
    caveat: "È difficile convertirlo in un solo moltiplicatore: il guadagno cambia molto da compito a compito."
  }
};

const progressVisual = document.querySelector(".progress-visual");
const progressButtons = [...document.querySelectorAll("[data-progress-lever]")];

function setProgressLever(key) {
  const item = progressCopy[key];
  if (!item || !progressVisual) return;
  progressVisual.dataset.activeLever = key;
  document.getElementById("progress-reading-label").textContent = item.label;
  document.getElementById("progress-reading-value").textContent = item.value;
  document.getElementById("progress-reading-copy").textContent = item.copy;
  document.getElementById("progress-reading-caveat").textContent = item.caveat;
  progressButtons.forEach(button => {
    const selected = button.dataset.progressLever === key;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

progressButtons.forEach(button => button.addEventListener("click", () => setProgressLever(button.dataset.progressLever)));

const benchmarkModels = [
  {
    name: "Phi-4",
    lab: "Microsoft",
    labKey: "microsoft",
    date: "2024-12-12",
    release: "12 dicembre 2024",
    size: 14,
    sizeLabel: "14B",
    score: 56.1,
    source: "https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/",
    note: "È il primo modello compatto della serie a superare chiaramente il 39% di GPT-4: qualità dei dati sintetici e post-training contano quanto la scala."
  },
  {
    name: "R1 Distill 1.5B",
    lab: "DeepSeek",
    labKey: "deepseek",
    date: "2025-01-20",
    release: "20 gennaio 2025",
    size: 1.5,
    sizeLabel: "1,5B",
    score: 33.8,
    source: "https://github.com/deepseek-ai/DeepSeek-R1",
    note: "È molto piccolo, ma resta sotto la soglia GPT-4. Serve a mostrare che ridurre i parametri non basta: la prestazione deve restare comparabile."
  },
  {
    name: "R1 Distill 7B",
    lab: "DeepSeek",
    labKey: "deepseek",
    date: "2025-01-20",
    release: "20 gennaio 2025",
    size: 7,
    sizeLabel: "7B",
    score: 49.1,
    source: "https://github.com/deepseek-ai/DeepSeek-R1",
    note: "La distillazione trasferisce parte del ragionamento di R1 in un modello denso da 7B: metà dei parametri di Phi-4, ma ancora sopra GPT-4."
  },
  {
    name: "Gemma 3 4B",
    lab: "Google DeepMind",
    labKey: "google",
    date: "2025-03-12",
    release: "12 marzo 2025",
    size: 4,
    sizeLabel: "4B",
    score: 30.8,
    source: "https://ai.google.dev/gemma/docs/core/model_card_3",
    note: "È progettato per funzionare su hardware più accessibile, ma su questo test resta sotto la baseline GPT-4."
  },
  {
    name: "Gemma 3 12B",
    lab: "Google DeepMind",
    labKey: "google",
    date: "2025-03-12",
    release: "12 marzo 2025",
    size: 12,
    sizeLabel: "12B",
    score: 40.9,
    source: "https://ai.google.dev/gemma/docs/core/model_card_3",
    note: "Supera di poco la soglia del 39%. È un buon promemoria: due modelli della stessa famiglia possono trovarsi ai lati opposti del target."
  },
  {
    name: "Qwen3-4B Thinking",
    lab: "Qwen",
    labKey: "qwen",
    date: "2025-08-06",
    release: "6 agosto 2025",
    size: 4,
    sizeLabel: "4B",
    score: 65.8,
    source: "https://huggingface.co/Qwen/Qwen3.5-0.8B",
    note: "La versione Thinking 2507 porta un modello da 4B molto oltre la soglia GPT-4, usando più compute durante la risposta."
  },
  {
    name: "Qwen3.5-0.8B",
    lab: "Qwen",
    labKey: "qwen",
    date: "2026-03-02",
    release: "2 marzo 2026",
    size: 0.8,
    sizeLabel: "0,8B",
    score: 11.9,
    source: "https://huggingface.co/Qwen/Qwen3.5-0.8B",
    note: "È il punto più piccolo del grafico, ma non raggiunge il target. Mostra il limite attuale della miniaturizzazione su questo compito scientifico."
  },
  {
    name: "Qwen3.5-2B",
    lab: "Qwen",
    labKey: "qwen",
    date: "2026-03-02",
    release: "2 marzo 2026",
    size: 2,
    sizeLabel: "2B",
    score: 51.6,
    source: "https://huggingface.co/Qwen/Qwen3.5-2B",
    note: "Con due miliardi di parametri supera la baseline GPT-4 del paper. Il risultato usa la modalità di ragionamento pubblicata nel model card."
  },
  {
    name: "Qwen3.5-4B",
    lab: "Qwen",
    labKey: "qwen",
    date: "2026-03-02",
    release: "2 marzo 2026",
    size: 4,
    sizeLabel: "4B",
    score: 76.2,
    source: "https://huggingface.co/Qwen/Qwen3.5-4B",
    note: "Resta abbastanza piccolo per l'esecuzione locale, ma produce un margine molto più ampio rispetto al target GPT-4."
  },
  {
    name: "Gemma 4 E2B",
    lab: "Google DeepMind",
    labKey: "google",
    date: "2026-04-02",
    release: "2 aprile 2026",
    size: 2.3,
    sizeLabel: "2,3B eff.",
    score: 43.4,
    source: "https://ai.google.dev/gemma/docs/core/model_card_4",
    note: "Google indica 2,3B parametri effettivi durante l'inferenza e 5,1B totali includendo gli embedding. È pensato per dispositivi edge e supera il 39%."
  }
];

const benchmarkPlot = document.getElementById("benchmark-plot");
const benchmarkChart = document.getElementById("benchmark-chart");
const benchmarkPoints = document.getElementById("benchmark-points");
let selectedBenchmarkModel = benchmarkModels.findIndex(model => model.name === "Qwen3.5-2B");
let benchmarkLayout = null;

function benchmarkNumber(value) {
  return value.toLocaleString("it-IT", { maximumFractionDigits: 1 });
}

function svgNode(tag, attributes = {}, text = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function benchmarkCoordinates(model) {
  if (!benchmarkLayout) return { x: 0, y: 0 };
  const time = new Date(`${model.date}T00:00:00Z`).getTime();
  const x = benchmarkLayout.left + ((time - benchmarkLayout.start) / (benchmarkLayout.end - benchmarkLayout.start)) * benchmarkLayout.plotWidth;
  const sizePosition = Math.log2(benchmarkLayout.maxSize / model.size) / Math.log2(benchmarkLayout.maxSize / benchmarkLayout.minSize);
  const y = benchmarkLayout.top + sizePosition * benchmarkLayout.plotHeight;
  return { x, y };
}

function updateBenchmarkGuide() {
  if (!benchmarkChart || !benchmarkLayout) return;
  benchmarkChart.querySelectorAll(".benchmark-selected-guide").forEach(node => node.remove());
  const point = benchmarkCoordinates(benchmarkModels[selectedBenchmarkModel]);
  const verticalGuide = svgNode("line", {
    class: "benchmark-selected-guide",
    x1: point.x,
    y1: point.y,
    x2: point.x,
    y2: benchmarkLayout.bottom
  });
  const horizontalGuide = svgNode("line", {
    class: "benchmark-selected-guide",
    x1: benchmarkLayout.left,
    y1: point.y,
    x2: point.x,
    y2: point.y
  });
  benchmarkChart.append(verticalGuide, horizontalGuide);
}

function selectBenchmarkModel(index) {
  const model = benchmarkModels[index];
  if (!model) return;
  selectedBenchmarkModel = index;
  benchmarkPoints?.querySelectorAll(".benchmark-point").forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.getElementById("benchmark-detail-size").textContent = model.sizeLabel;
  document.getElementById("benchmark-detail-score").textContent = `${benchmarkNumber(model.score)}%`;
  document.getElementById("benchmark-detail-date").textContent = `${model.release} · ${model.lab}`;
  document.getElementById("benchmark-detail-name").textContent = model.name;
  document.getElementById("benchmark-detail-note").textContent = model.note;
  const source = document.getElementById("benchmark-detail-source");
  source.href = model.source;
  source.textContent = "Apri model card e risultati ↗";
  updateBenchmarkGuide();
}

function createBenchmarkPoints() {
  if (!benchmarkPoints || benchmarkPoints.children.length) return;
  benchmarkModels.forEach((model, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "benchmark-point";
    button.dataset.lab = model.labKey;
    button.dataset.status = model.score >= 39 ? "meets" : "below";
    button.dataset.label = `${model.name} · ${model.sizeLabel} · ${benchmarkNumber(model.score)}%`;
    button.classList.toggle("is-below", model.score < 39);
    button.setAttribute("aria-label", `${model.name}, ${model.sizeLabel} parametri, uscito il ${model.release}, ${benchmarkNumber(model.score)} per cento su GPQA Diamond`);
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<i aria-hidden="true"></i>';
    button.addEventListener("click", () => selectBenchmarkModel(index));
    benchmarkPoints.appendChild(button);
  });
}

function renderBenchmarkChart() {
  if (!benchmarkPlot || !benchmarkChart || !benchmarkPoints) return;
  const width = Math.max(300, Math.round(benchmarkPlot.clientWidth));
  const height = Math.max(430, Math.round(benchmarkPlot.clientHeight));
  const compact = width < 620;
  const left = compact ? 46 : 68;
  const right = compact ? 14 : 34;
  const top = compact ? 54 : 58;
  const bottom = height - (compact ? 50 : 58);
  const plotWidth = width - left - right;
  const plotHeight = bottom - top;
  const start = Date.parse("2023-01-01T00:00:00Z");
  const end = Date.parse("2026-06-01T00:00:00Z");
  const maxSize = 32;
  const minSize = 0.75;
  benchmarkLayout = { width, height, left, right, top, bottom, plotWidth, plotHeight, start, end, maxSize, minSize };

  benchmarkChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  benchmarkChart.replaceChildren(
    svgNode("title", { id: "benchmark-chart-title" }, "Dimensione dei modelli aperti rispetto alla soglia GPT-4 su GPQA Diamond"),
    svgNode("desc", { id: "benchmark-chart-desc" }, "Asse orizzontale: data di uscita. Asse verticale logaritmico: miliardi di parametri attivi o effettivi; più in basso significa più piccolo. I punti pieni raggiungono almeno il 39 per cento di GPT-4.")
  );

  const yScale = size => top + (Math.log2(maxSize / size) / Math.log2(maxSize / minSize)) * plotHeight;
  [32, 16, 8, 4, 2, 1].forEach(size => {
    const y = yScale(size);
    benchmarkChart.appendChild(svgNode("line", { class: "benchmark-chart-grid", x1: left, y1: y, x2: width - right, y2: y }));
    benchmarkChart.appendChild(svgNode("text", { class: "benchmark-chart-axis", x: left - 9, y: y + 3, "text-anchor": "end" }, `${size}B`));
  });

  [2023, 2024, 2025, 2026].forEach(year => {
    const time = Date.parse(`${year}-01-01T00:00:00Z`);
    const x = left + ((time - start) / (end - start)) * plotWidth;
    benchmarkChart.appendChild(svgNode("line", { class: "benchmark-chart-grid", x1: x, y1: top, x2: x, y2: bottom }));
    benchmarkChart.appendChild(svgNode("text", { class: "benchmark-chart-axis", x, y: bottom + 28, "text-anchor": year === 2023 ? "start" : "middle" }, String(year)));
  });

  const targetX = left + ((Date.parse("2023-11-20T00:00:00Z") - start) / (end - start)) * plotWidth;
  benchmarkChart.appendChild(svgNode("line", { class: "benchmark-target-line", x1: targetX, y1: top, x2: targetX, y2: bottom }));
  benchmarkChart.appendChild(svgNode("text", { class: "benchmark-target-label", x: targetX + 8, y: top - 16 }, compact ? "GPT-4 · 39% · STIMA 1.700B" : "TARGET GPT-4 · 39% · STIMA 1.700 MILIARDI DI PARAMETRI"));

  benchmarkChart.appendChild(svgNode("text", { class: "benchmark-chart-axis-title", x: left, y: 17 }, compact ? "PARAMETRI · PIÙ PICCOLO ↓" : "PARAMETRI ATTIVI / EFFETTIVI (MILIARDI) · PIÙ PICCOLO ↓"));
  benchmarkChart.appendChild(svgNode("text", { class: "benchmark-chart-axis-title", x: width - right, y: height - 11, "text-anchor": "end" }, "DATA DI USCITA →"));

  [...benchmarkPoints.children].forEach((button, index) => {
    const point = benchmarkCoordinates(benchmarkModels[index]);
    button.style.left = `${point.x}px`;
    button.style.top = `${point.y}px`;
    button.dataset.side = point.x > width - 110 ? "left" : "center";
  });
  updateBenchmarkGuide();
}

if (benchmarkPlot && benchmarkChart && benchmarkPoints) {
  createBenchmarkPoints();
  renderBenchmarkChart();
  selectBenchmarkModel(selectedBenchmarkModel);
  const benchmarkResizeObserver = new ResizeObserver(renderBenchmarkChart);
  benchmarkResizeObserver.observe(benchmarkPlot);
}

const shrinkMilestones = [
  {
    name: "GPT-4",
    lab: "OpenAI",
    date: "20 novembre 2023",
    year: "2023",
    size: 1700,
    sizeLabel: "1.700B",
    score: 39,
    source: "https://arxiv.org/abs/2311.12022",
    note: "È il punto di partenza. Il 39% è la baseline pubblicata nel paper GPQA; 1.700B è una stima non ufficiale dei parametri totali, non un dato dichiarato da OpenAI."
  },
  {
    name: "Phi-4",
    lab: "Microsoft",
    date: "12 dicembre 2024",
    year: "2024",
    size: 14,
    sizeLabel: "14B",
    score: 56.1,
    source: "https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/",
    note: "Un modello denso da 14B supera la baseline GPT-4 su GPQA Diamond. È il primo grande salto visibile di questa sequenza."
  },
  {
    name: "R1 Distill 7B",
    lab: "DeepSeek",
    date: "20 gennaio 2025",
    year: "gen 2025",
    size: 7,
    sizeLabel: "7B",
    score: 49.1,
    source: "https://github.com/deepseek-ai/DeepSeek-R1",
    note: "La distillazione trasferisce parte del ragionamento di R1 in un modello da 7B, dimezzando ancora la dimensione rispetto a Phi-4."
  },
  {
    name: "Qwen3-4B Thinking",
    lab: "Qwen",
    date: "6 agosto 2025",
    year: "ago 2025",
    size: 4,
    sizeLabel: "4B",
    score: 65.8,
    source: "https://huggingface.co/Qwen/Qwen3.5-0.8B",
    note: "Il modello da 4B usa la modalità Thinking: meno parametri, ma più lavoro durante la risposta, e resta sopra la baseline GPT-4."
  },
  {
    name: "Qwen3.5-2B",
    lab: "Qwen",
    date: "2 marzo 2026",
    year: "mar 2026",
    size: 2,
    sizeLabel: "2B",
    score: 51.6,
    source: "https://huggingface.co/Qwen/Qwen3.5-2B",
    note: "Con due miliardi di parametri supera la baseline GPT-4 del paper. Il risultato usa la modalità di ragionamento pubblicata nel model card."
  }
];

const shrinkOriginSize = 1700;
const shrinkMilestoneList = document.getElementById("benchmark-milestones");
const shrinkStage = document.getElementById("benchmark-shrink-stage");
const shrinkRemnant = document.getElementById("benchmark-scale-remnant");
const shrinkZoomSteps = document.getElementById("benchmark-zoom-steps");

function shrinkPercent(value) {
  const digits = value < 1 ? 2 : value < 10 ? 1 : 0;
  return value.toLocaleString("it-IT", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function shrinkRatio(value) {
  const ratio = shrinkOriginSize / value;
  return ratio >= 10 ? Math.round(ratio).toLocaleString("it-IT") : ratio.toLocaleString("it-IT", { maximumFractionDigits: 1 });
}

function renderShrinkSteps(model) {
  if (!shrinkZoomSteps) return;
  const steps = model.size === shrinkOriginSize ? [shrinkOriginSize] : [shrinkOriginSize, 170, 17, model.size];
  const nodes = [];
  steps.forEach((value, index) => {
    const item = document.createElement("span");
    item.className = index === steps.length - 1 ? "is-final" : "";
    item.textContent = value === shrinkOriginSize ? "1.700B" : `${benchmarkNumber(value)}B`;
    nodes.push(item);
    if (index < steps.length - 1) {
      const divider = document.createElement("i");
      divider.textContent = `÷${(value / steps[index + 1]).toLocaleString("it-IT", { maximumFractionDigits: 1 })}`;
      nodes.push(divider);
    }
  });
  shrinkZoomSteps.replaceChildren(...nodes);
  document.getElementById("benchmark-zoom-label").textContent = model.size === shrinkOriginSize
    ? "Questo è il punto di partenza"
    : "Tre zoom rendono visibile il salto di scala";
}

function selectShrinkMilestone(index) {
  const model = shrinkMilestones[index];
  if (!model) return;
  const remaining = (model.size / shrinkOriginSize) * 100;
  const ratio = shrinkRatio(model.size);

  shrinkMilestoneList?.querySelectorAll("button").forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  document.getElementById("benchmark-current-summary").textContent = `1.700B → ${model.sizeLabel}`;
  document.getElementById("benchmark-ratio").textContent = `${ratio}×`;
  document.getElementById("benchmark-ratio-label").textContent = model.size === shrinkOriginSize ? "stessa dimensione" : "meno parametri";
  document.getElementById("benchmark-selected-label").textContent = `${model.year} · ${model.name}`;
  document.getElementById("benchmark-selected-size").textContent = model.sizeLabel;
  document.getElementById("benchmark-remaining-label").textContent = model.size === shrinkOriginSize
    ? "Siamo ancora al 100%"
    : `Al modello selezionato resta lo ${shrinkPercent(remaining)}%`;
  document.getElementById("benchmark-scale-end").textContent = model.sizeLabel;
  shrinkRemnant?.style.setProperty("--benchmark-remaining", `${remaining}%`);

  document.getElementById("benchmark-detail-size").textContent = model.sizeLabel;
  document.getElementById("benchmark-detail-score").textContent = `${benchmarkNumber(model.score)}%`;
  document.getElementById("benchmark-detail-date").textContent = `${model.date} · ${model.lab}`;
  document.getElementById("benchmark-detail-name").textContent = model.name;
  document.getElementById("benchmark-detail-note").textContent = model.note;
  const source = document.getElementById("benchmark-detail-source");
  source.href = model.source;
  source.textContent = model.name === "GPT-4" ? "Apri il paper GPQA ↗" : "Apri model card e risultati ↗";

  if (shrinkStage) {
    shrinkStage.dataset.origin = String(model.size === shrinkOriginSize);
    shrinkStage.setAttribute("aria-label", `${model.name} usa ${model.sizeLabel} parametri: circa ${ratio} volte meno della stima di 1.700 miliardi per GPT-4, con ${benchmarkNumber(model.score)} per cento su GPQA Diamond.`);
  }
  renderShrinkSteps(model);
}

function createShrinkMilestones() {
  if (!shrinkMilestoneList || shrinkMilestoneList.children.length) return;
  shrinkMilestones.forEach((model, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${model.year}: seleziona ${model.name}, ${model.sizeLabel}`);
    button.innerHTML = `<span>${model.year}</span><strong>${model.name}</strong><small>${model.sizeLabel} · ${benchmarkNumber(model.score)}%</small>`;
    button.addEventListener("click", () => selectShrinkMilestone(index));
    shrinkMilestoneList.appendChild(button);
  });
}

if (shrinkMilestoneList && shrinkStage) {
  createShrinkMilestones();
  selectShrinkMilestone(shrinkMilestones.length - 1);
}

const unlockCopy = {
  posttraining: {
    kicker: "01 · Post-training",
    title: "Imparare a rispondere all'intento umano",
    copy: "Tecniche come RLHF e fine-tuning trasformano un predittore di testo grezzo in un assistente più utile e controllabile.",
    caveat: "Il guadagno dipende dalle preferenze e dalle valutazioni usate: non equivale automaticamente a più conoscenza."
  },
  reasoning: {
    kicker: "02 · Ragionamento",
    title: "Pensare prima di rispondere",
    copy: "Passaggi intermedi, verifica e correzione permettono al modello di dedicare più lavoro ai problemi difficili invece di produrre subito la prima risposta.",
    caveat: "Più token non garantiscono una risposta migliore: senza una buona strategia il modello può ripetere o amplificare gli errori."
  },
  scaffolding: {
    kicker: "03 · Scaffolding",
    title: "Dividere un compito in ruoli e passaggi",
    copy: "Un sistema può pianificare, generare alternative, criticare il risultato e iterare. Il modello di base è lo stesso; cambia l'orchestrazione intorno a lui.",
    caveat: "Le pipeline più elaborate consumano più tempo e token e possono propagare errori tra i passaggi."
  },
  tools: {
    kicker: "04 · Strumenti",
    title: "Uscire dalla sola finestra di chat",
    copy: "Calcolatrice, codice, ricerca e applicazioni esterne danno al modello accesso a dati e azioni che non può affidabilmente simulare nel testo.",
    caveat: "Più capacità d'azione richiede più controlli: permessi, conferme, tracciabilità e limiti chiari."
  },
  context: {
    kicker: "05 · Contesto",
    title: "Sapere abbastanza del problema reale",
    copy: "Documenti, cronologia e istruzioni pertinenti riducono l'ambiguità. Un modello più piccolo con il contesto giusto può batterne uno più grande ma disinformato.",
    caveat: "Una finestra più lunga non assicura attenzione perfetta: qualità, ordine e pertinenza del contesto restano decisive."
  }
};

const unlockStage = document.querySelector("[data-unlock-stage]");
const unlockButtons = [...document.querySelectorAll("[data-unlock]")];

function setUnlock(key) {
  const item = unlockCopy[key];
  if (!item || !unlockStage) return;
  unlockStage.dataset.unlockStage = key;
  document.getElementById("unlock-kicker").textContent = item.kicker;
  document.getElementById("unlock-title").textContent = item.title;
  document.getElementById("unlock-copy").textContent = item.copy;
  document.getElementById("unlock-caveat").textContent = item.caveat;
  unlockButtons.forEach(button => {
    const selected = button.dataset.unlock === key;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

unlockButtons.forEach(button => button.addEventListener("click", () => setUnlock(button.dataset.unlock)));
