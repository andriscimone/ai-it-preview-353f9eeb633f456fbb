const classicInput = document.getElementById("classic-x");
const generationModeButtons = [...document.querySelectorAll("[data-generation-mode]")];
const modelSampleOutputs = [...document.querySelectorAll("#model-samples output")];
let generationMode = "sampling";

function updateClassicEquation() {
  if (!classicInput) return;
  const x = Number(classicInput.value);
  const y = (2 * x) + 1;
  document.getElementById("classic-x-value").textContent = String(x);
  document.getElementById("classic-input").textContent = `input ${x}`;
  document.getElementById("classic-operation").textContent = `2 × ${x} + 1`;
  document.getElementById("classic-output").textContent = `output ${y}`;
}

const illustrativeTokens = [
  { token: "blu", probability: 58 },
  { token: "sereno", probability: 22 },
  { token: "grigio", probability: 13 },
  { token: "immenso", probability: 7 }
];

function sampleIllustrativeToken() {
  if (generationMode === "greedy") return illustrativeTokens[0].token;
  const draw = Math.random() * 100;
  let cumulative = 0;
  for (const item of illustrativeTokens) {
    cumulative += item.probability;
    if (draw < cumulative) return item.token;
  }
  return illustrativeTokens[illustrativeTokens.length - 1].token;
}

function renderModelSamples() {
  modelSampleOutputs.forEach(output => { output.textContent = sampleIllustrativeToken(); });
}

classicInput?.addEventListener("input", updateClassicEquation);
generationModeButtons.forEach(button => button.addEventListener("click", () => {
  generationMode = button.dataset.generationMode;
  generationModeButtons.forEach(option => {
    const selected = option === button;
    option.classList.toggle("is-active", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
  renderModelSamples();
}));
document.getElementById("generate-samples")?.addEventListener("click", renderModelSamples);
updateClassicEquation();

const storyStage = document.getElementById("algorithm-story-stage");
const storyViewport = storyStage?.querySelector(".story-stage-viewport");
const storySteps = [...document.querySelectorAll("[data-story-step]")];
const storyScenes = [...document.querySelectorAll("[data-story-scene]")];
const storyEquationInput = document.getElementById("story-equation-x");
const storyReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeStoryKey = "equation";
let storyFrameRequested = false;
let storyMobileStatic = false;

const storySceneCopy = {
  equation: {
    index: "Passaggio 1 di 5",
    title: "Conosci la regola. Conosci il risultato.",
    caption: "Qui la regola è leggibile: lo stesso input attraversa sempre gli stessi passaggi."
  },
  rules: {
    index: "Passaggio 2 di 5",
    title: "Ma per molte domande la regola non la conosciamo.",
    caption: "Aggiungere condizioni a mano non risolve il problema: il mondo reale produce sempre un caso non previsto."
  },
  training: {
    index: "Passaggio 3 di 5",
    title: "Allora mostriamo esempi e correggiamo l'errore.",
    caption: "Addestrare significa ripetere questo ciclo milioni di volte: tentativo, errore, piccola correzione."
  },
  probability: {
    index: "Passaggio 4 di 5",
    title: "La risposta diventa una distribuzione, non una certezza.",
    caption: "Le percentuali sono illustrative: mostrano che il modello valuta più continuazioni prima di sceglierne una."
  },
  attention: {
    index: "Passaggio 5 di 5",
    title: "Il Transformer decide dove guardare nel contesto.",
    caption: "L'attenzione non comprende come una persona: calcola quali relazioni aiutano di più a costruire la rappresentazione."
  }
};

function clampStory(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function updateStoryEquation() {
  if (!storyEquationInput) return;
  const x = Number(storyEquationInput.value);
  const y = (2 * x) + 1;
  const chartX = 70 + ((x + 4) / 10) * 400;
  const chartY = 430 - ((y + 7) / 20) * 360;
  const point = document.getElementById("story-equation-point");
  const pointLabel = document.getElementById("story-equation-point-label");
  document.getElementById("story-equation-x-value").textContent = String(x);
  document.getElementById("story-equation-y").textContent = String(y);
  point?.setAttribute("cx", String(chartX));
  point?.setAttribute("cy", String(chartY));
  if (pointLabel) {
    pointLabel.textContent = `x ${x} → y ${y}`;
    pointLabel.setAttribute("x", String(chartX > 370 ? chartX - 92 : chartX + 16));
    pointLabel.setAttribute("y", String(chartY < 105 ? chartY + 30 : chartY - 16));
  }
}

function setStoryScene(key) {
  const copy = storySceneCopy[key];
  if (!copy || !storyStage || !storyViewport) return;
  activeStoryKey = key;
  storyStage.querySelectorAll('[data-story-select]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.storySelect === key));
  });
  storyViewport.dataset.activeStory = key;
  document.getElementById("story-stage-index").textContent = copy.index;
  document.getElementById("story-stage-title").textContent = copy.title;
  document.getElementById("story-stage-caption").textContent = copy.caption;
  storyScenes.forEach(scene => {
    const selected = scene.dataset.storyScene === key;
    scene.classList.toggle("is-active", selected);
    scene.setAttribute("aria-hidden", String(!selected));
    scene.inert = !selected;
  });
}

function updateStoryMotion(key, rawProgress) {
  const progress = storyReducedMotion.matches ? 1 : clampStory(rawProgress);
  if (key === "equation") {
    const line = document.getElementById("story-equation-line");
    const point = document.getElementById("story-equation-point");
    const label = document.getElementById("story-equation-point-label");
    if (line) line.style.strokeDashoffset = String(540 * (1 - progress));
    const pointProgress = clampStory((progress - .24) / .18);
    if (point) point.style.opacity = String(pointProgress);
    if (label) label.style.opacity = String(pointProgress);
  }

  if (key === "rules") {
    document.querySelectorAll("[data-rule-order]").forEach(rule => {
      const order = Number(rule.dataset.ruleOrder);
      const localProgress = clampStory((progress - order * .1) / .22);
      rule.style.opacity = String(localProgress);
      rule.style.transform = `translateX(${(1 - localProgress) * -18}px)`;
    });
  }

  if (key === "training") {
    const start = { y1: 244, y2: 326 };
    const end = { y1: 414, y2: 79 };
    const y1 = start.y1 + (end.y1 - start.y1) * progress;
    const y2 = start.y2 + (end.y2 - start.y2) * progress;
    const line = document.getElementById("story-training-line");
    line?.setAttribute("d", `M78 ${y1}L464 ${y2}`);
    const predictedY = x => y1 + ((x - 78) / (464 - 78)) * (y2 - y1);
    document.getElementById("training-error-a")?.setAttribute("d", `M142 354V${predictedY(142)}`);
    document.getElementById("training-error-b")?.setAttribute("d", `M273 250V${predictedY(273)}`);
    document.getElementById("training-error-c")?.setAttribute("d", `M405 126V${predictedY(405)}`);
    document.getElementById("story-training-step").textContent = String(1 + Math.round(progress * 999));
    document.getElementById("story-training-error").textContent = (8.4 - progress * 7.6).toFixed(1).replace(".", ",");
  }

  if (key === "probability") {
    document.querySelectorAll("[data-probability]").forEach(bar => {
      const target = Number(bar.dataset.probability);
      bar.querySelector("i").style.width = `${target * progress}%`;
    });
    document.getElementById("probability-selected-token").textContent = progress > .72 ? "output più probabile: “blu”" : "4 continuazioni possibili";
  }

  if (key === "attention") {
    document.querySelectorAll("[data-attention-order]").forEach(link => {
      const order = Number(link.dataset.attentionOrder);
      const localProgress = clampStory((progress - order * .12) / .42);
      link.style.strokeDashoffset = String(440 * (1 - localProgress));
    });
  }
}

function renderStoryFromScroll() {
  storyFrameRequested = false;
  if (!storyStage || !storySteps.length) return;
  if (window.innerWidth <= 900) {
    if (storyMobileStatic) return;
    storyMobileStatic = true;
    setStoryScene(activeStoryKey);
    updateStoryMotion(activeStoryKey, 1);
    document.getElementById("story-stage-progress").style.width = `${(Object.keys(storySceneCopy).indexOf(activeStoryKey) + 1) * 20}%`;
    return;
  }
  storyMobileStatic = false;

  const readingLine = window.innerHeight * .46;
  let activeIndex = 0;
  storySteps.forEach((step, index) => {
    if (step.getBoundingClientRect().top <= readingLine) activeIndex = index;
  });
  const activeStep = storySteps[activeIndex];
  const rect = activeStep.getBoundingClientRect();
  const progress = clampStory((window.innerHeight * .7 - rect.top) / Math.max(rect.height, window.innerHeight * .62));
  const key = activeStep.dataset.storyStep;
  if (key !== activeStoryKey) setStoryScene(key);
  updateStoryMotion(key, progress);
  const chapterProgress = ((activeIndex + progress) / storySteps.length) * 100;
  document.getElementById("story-stage-progress").style.width = `${chapterProgress}%`;
}

function requestStoryFrame() {
  if (window.innerWidth <= 900 && storyMobileStatic) return;
  if (storyFrameRequested) return;
  storyFrameRequested = true;
  requestAnimationFrame(renderStoryFromScroll);
}

if (storyStage) {
  const selector = document.createElement("div");
  selector.className = "story-mobile-controls";
  selector.setAttribute("aria-label", "Esplora le cinque dimostrazioni");
  const labels = ["Regola", "Limiti", "Training", "Probabilità", "Attenzione"];
  Object.keys(storySceneCopy).forEach((key, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.storySelect = key;
    button.textContent = (index + 1) + ". " + labels[index];
    button.setAttribute("aria-pressed", String(key === activeStoryKey));
    button.addEventListener("click", () => {
      setStoryScene(key); updateStoryMotion(key, 1);
      document.getElementById("story-stage-progress").style.width = ((index + 1) * 20) + "%";
      selector.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    });
    selector.appendChild(button);
  });
  storyStage.querySelector(".story-stage-header").after(selector);
}
storyEquationInput?.addEventListener("input", updateStoryEquation);
window.addEventListener("scroll", requestStoryFrame, { passive: true });
window.addEventListener("resize", () => {
  storyMobileStatic = false;
  requestStoryFrame();
});
storyReducedMotion.addEventListener("change", requestStoryFrame);
updateStoryEquation();
setStoryScene("equation");
requestStoryFrame();

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

// The simulator applies a historical rate to an index; it contains no model forecasts.
const efficiencyLab = document.getElementById("efficienza");
const efficiencyMonths = document.getElementById("efficiency-months");
const efficiencyCurve = document.getElementById("efficiency-curve");
const efficiencyState = { months: 16, halfLife: 8, use: "save" };
const efficiencyFormat = value => value.toLocaleString("it-IT", { maximumFractionDigits: value < 1 ? 3 : 2 });
const efficiencyCompute = (months, halfLife) => 100 * 2 ** (-months / halfLife);
function efficiencySetText(id, value) { const node = document.getElementById(id); if (node) node.textContent = value; }
function efficiencySvgNode(tag, attributes, text = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  node.textContent = text;
  return node;
}
function renderEfficiencyCurve() {
  if (!efficiencyCurve) return;
  const width = Math.max(220, efficiencyCurve.clientWidth);
  const height = 240;
  const left = 36, right = 13, top = 28, bottom = height - 37;
  const x = months => left + (months / 32) * (width - left - right);
  const y = compute => bottom - (compute / 100) * (bottom - top);
  const points = halfLife => Array.from({ length: 65 }, (_, index) => `${x(index / 2)},${y(efficiencyCompute(index / 2, halfLife))}`);
  efficiencyCurve.setAttribute("viewBox", `0 0 ${width} ${height}`);
  efficiencyCurve.replaceChildren(
    efficiencySvgNode("title", { id: "efficiency-curve-title" }, "Compute per lo stesso target, indice iniziale 100"),
    efficiencySvgNode("desc", { id: "efficiency-curve-desc" }, `Curva calcolata con dimezzamento ogni ${efficiencyState.halfLife} mesi. A ${efficiencyState.months} mesi richiede ${efficiencyFormat(efficiencyCompute(efficiencyState.months, efficiencyState.halfLife))} unità. La fascia deriva dagli estremi storici di 2 e 22 mesi; non è una previsione.`)
  );
  [0, 25, 50, 75, 100].forEach(value => {
    efficiencyCurve.append(efficiencySvgNode("line", { x1: left, y1: y(value), x2: width - right, y2: y(value), class: "efficiency-gridline" }), efficiencySvgNode("text", { x: left - 7, y: y(value) + 4, "text-anchor": "end", class: "efficiency-axis-text" }, String(value)));
  });
  [0, 8, 16, 24, 32].forEach(value => efficiencyCurve.append(efficiencySvgNode("text", { x: x(value), y: bottom + 23, "text-anchor": value === 0 ? "start" : value === 32 ? "end" : "middle", class: "efficiency-axis-text" }, value === 32 ? "32 mesi" : String(value))));
  efficiencyCurve.append(efficiencySvgNode("text", { x: left, y: 15, class: "efficiency-axis-text" }, "Compute · indice"));
  efficiencyCurve.append(efficiencySvgNode("polygon", { points: [...points(2), ...points(22).reverse()].join(" "), class: "efficiency-band" }));
  [2, 22].forEach(rate => efficiencyCurve.append(efficiencySvgNode("polyline", { points: points(rate).join(" "), class: "efficiency-bound" })));
  efficiencyCurve.append(efficiencySvgNode("polyline", { points: points(efficiencyState.halfLife).join(" "), class: "efficiency-line" }));
  const selectedX = x(efficiencyState.months), selectedY = y(efficiencyCompute(efficiencyState.months, efficiencyState.halfLife));
  efficiencyCurve.append(efficiencySvgNode("line", { x1: selectedX, y1: top, x2: selectedX, y2: bottom, class: "efficiency-guide" }), efficiencySvgNode("circle", { cx: selectedX, cy: selectedY, r: 5, class: "efficiency-point" }));
}
function renderEfficiency() {
  if (!efficiencyMonths) return;
  const { months, halfLife, use } = efficiencyState;
  const required = efficiencyCompute(months, halfLife);
  const saved = 100 - required;
  const multiplier = 100 / required;
  efficiencyMonths.value = String(months);
  efficiencyMonths.setAttribute("aria-valuetext", `${months} mesi; ${efficiencyFormat(required)} unità su 100 per lo stesso target`);
  efficiencySetText("efficiency-months-value", String(months));
  efficiencySetText("efficiency-required", efficiencyFormat(required));
  document.getElementById("efficiency-required-bar").style.width = `${required}%`;
  document.getElementById("efficiency-freed-bar").style.width = `${saved}%`;
  efficiencyLab.dataset.efficiencyAllocation = use;
  efficiencySetText("efficiency-reading-kicker", use === "save" ? "A parità di target" : "A parità di budget");
  efficiencySetText("efficiency-result", use === "save" ? `${efficiencyFormat(saved)}%` : `${efficiencyFormat(multiplier)}×`);
  efficiencySetText("efficiency-result-title", use === "save" ? "di compute risparmiato" : "il calcolo equivalente");
  efficiencySetText("efficiency-result-copy", use === "save" ? `A ${months} mesi, con un dimezzamento ogni ${halfLife}, servono ${efficiencyFormat(required)} unità delle 100 iniziali. Il target resta identico.` : `Le stesse 100 unità valgono ${efficiencyFormat(100 * multiplier)} unità della ricetta iniziale. È un'equivalenza di calcolo rispetto a quel target.`);
  efficiencySetText("efficiency-result-limit", use === "save" ? "Risparmio di operazioni, senza conversione automatica in euro, energia o tempo." : "4× il compute equivalente non significa 4× l'intelligenza. Per prevedere nuove capacità serve una relazione misurata tra calcolo e performance.");
  efficiencyLab.querySelectorAll("[data-efficiency-months]").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.efficiencyMonths) === months)));
  efficiencyLab.querySelectorAll("[data-efficiency-rate]").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.efficiencyRate) === halfLife)));
  efficiencyLab.querySelectorAll("[data-efficiency-use]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.efficiencyUse === use)));
  efficiencyLab.querySelectorAll("[data-efficiency-step]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.efficiencyStep === (months === 0 ? "baseline" : use === "save" ? "saving" : "reinvest"))));
  renderEfficiencyCurve();
}
if (efficiencyMonths) {
  efficiencyMonths.addEventListener("input", () => { efficiencyState.months = Number(efficiencyMonths.value); renderEfficiency(); });
  efficiencyLab.querySelectorAll("[data-efficiency-months]").forEach(button => button.addEventListener("click", () => { efficiencyState.months = Number(button.dataset.efficiencyMonths); renderEfficiency(); }));
  efficiencyLab.querySelectorAll("[data-efficiency-rate]").forEach(button => button.addEventListener("click", () => { efficiencyState.halfLife = Number(button.dataset.efficiencyRate); renderEfficiency(); }));
  efficiencyLab.querySelectorAll("[data-efficiency-use]").forEach(button => button.addEventListener("click", () => { efficiencyState.use = button.dataset.efficiencyUse; renderEfficiency(); }));
  efficiencyLab.querySelectorAll("[data-efficiency-step]").forEach(button => button.addEventListener("click", () => {
    const step = button.dataset.efficiencyStep;
    efficiencyState.months = step === "baseline" ? 0 : 16;
    efficiencyState.halfLife = 8;
    efficiencyState.use = step === "reinvest" ? "reuse" : "save";
    renderEfficiency();
  }));
  new ResizeObserver(renderEfficiencyCurve).observe(efficiencyCurve);
  renderEfficiency();
}

// Provider model-card results: each family is shown separately; no compute ratio is inferred.
const efficiencyModelFamilies = {
  gemma: { lab: "Google DeepMind · Gemma 4", source: "https://ai.google.dev/gemma/docs/core/model_card_4", models: [
    { name: "E2B", score: 43.4, params: "2,3B effettivi · 5,1B con embeddings", note: "Effettivi esclude buona parte delle tabelle di embeddings. Il totale con queste tabelle è 5,1B: i due numeri descrivono aspetti diversi." },
    { name: "12B Unified", score: 78.8, params: "11,95 miliardi", note: "Immagini e audio entrano direttamente nel modello linguistico, senza encoder dedicati. Questo cambiamento di architettura, da solo, non quantifica il risparmio." },
    { name: "26B A4B", score: 82.3, params: "25,2B totali · 3,8B attivi", note: "Seleziona gli esperti per ciascun token. I 25,2B descrivono il totale; 3,8B sono la parte attiva. Energia e velocità richiedono altre misure." },
    { name: "31B", score: 84.3, params: "30,7 miliardi", note: "Variante densa della famiglia. Il punteggio dichiarato non quantifica il calcolo necessario all'addestramento né quello usato durante le risposte." }
  ] },
  qwen: { lab: "Qwen · Qwen3.5", source: "https://huggingface.co/Qwen/Qwen3.5-9B", models: [
    { name: "4B", score: 76.2, params: "4B · componente linguistica", note: "Modello denso della famiglia Qwen3.5. Il valore è quello della tabella ufficiale GPQA Diamond con ragionamento; il numero nel nome non comprende automaticamente tutte le componenti multimodali." },
    { name: "9B", score: 81.7, params: "9B · componente linguistica", note: "Combina blocchi Gated DeltaNet e attenzione. Il ragionamento durante la risposta contribuisce al risultato: per confrontare l'efficienza servirebbe fissare anche il budget di generazione." },
    { name: "27B", score: 85.5, params: "27B · componente linguistica", source: "https://huggingface.co/Qwen/Qwen3.5-27B", note: "La scheda ufficiale riporta questo risultato per la variante densa da 27B. È una valutazione del produttore; non viene ricavato un rapporto costo/prestazioni dai soli parametri." }
  ] }
};
const efficiencyModelBars = document.getElementById("efficiency-model-bars");
let efficiencyFamily = "gemma";
function selectEfficiencyModel(index) {
  const family = efficiencyModelFamilies[efficiencyFamily];
  const model = family.models[index];
  efficiencyModelBars.querySelectorAll("button").forEach((button, row) => button.setAttribute("aria-pressed", String(row === index)));
  efficiencySetText("efficiency-model-lab", family.lab);
  efficiencySetText("efficiency-model-name", `${efficiencyFamily === "gemma" ? "Gemma 4" : "Qwen3.5"} ${model.name}`);
  efficiencySetText("efficiency-model-params", model.params);
  efficiencySetText("efficiency-model-score", `${efficiencyFormat(model.score)}%`);
  efficiencySetText("efficiency-model-note", model.note);
  document.getElementById("efficiency-model-source").href = model.source || family.source;
}
function renderEfficiencyModels() {
  if (!efficiencyModelBars) return;
  const family = efficiencyModelFamilies[efficiencyFamily];
  efficiencyModelBars.replaceChildren();
  family.models.forEach((model, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "efficiency-model-row";
    button.setAttribute("aria-label", `${model.name}, GPQA Diamond ${efficiencyFormat(model.score)} per cento. Mostra dettagli.`);
    button.innerHTML = `<span>${model.name}</span><strong>${efficiencyFormat(model.score)}%</strong><i aria-hidden="true"><b style="width:${model.score}%"></b></i>`;
    button.addEventListener("click", () => selectEfficiencyModel(index));
    efficiencyModelBars.appendChild(button);
  });
  const ticks = document.createElement("div");
  ticks.className = "efficiency-ticks";
  ticks.setAttribute("aria-hidden", "true");
  ticks.innerHTML = "<span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span>";
  efficiencyModelBars.appendChild(ticks);
  document.querySelectorAll("[data-efficiency-family]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.efficiencyFamily === efficiencyFamily)));
  selectEfficiencyModel(1);
}
document.querySelectorAll("[data-efficiency-family]").forEach(button => button.addEventListener("click", () => { efficiencyFamily = button.dataset.efficiencyFamily; renderEfficiencyModels(); }));
renderEfficiencyModels();

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
