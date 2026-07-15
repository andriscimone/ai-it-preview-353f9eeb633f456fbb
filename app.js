const NS = "http://www.w3.org/2000/svg";

const scenes = {
  rubin: {
    title: "Kimi K2 Thinking · input 32K / output 8K",
    chartHeadline: "Vera Rubin NVL72",
    chartClaim: "Fino a 10× più token per MW",
    chartSubtitle: "Kimi K2-Thinking (32K/8K)",
    status: "Proiezione NVIDIA · dati ricostruiti",
    note: "Stesso modello, stesso input e stesso output. Le curve sono ricostruite dalla Figura 38 di NVIDIA: i valori intermedi sono stime.",
    xMin: 50,
    xMax: 450,
    yMax: 5_500_000,
    yTick: 1_000_000,
    defaultX: 225,
    step: 5,
    unitMode: "curve",
    caption: "più token per megawatt",
    series: [
      {
        name: "Vera Rubin NVL72",
        short: "Vera Rubin",
        color: "var(--chart-primary)",
        points: [[50,5300000],[75,5050000],[100,4800000],[125,4550000],[150,4350000],[175,4150000],[200,4000000],[225,3900000],[250,3700000],[275,3400000],[300,2900000],[325,1900000],[350,1050000],[375,550000],[400,250000],[425,80000],[440,30000]]
      },
      {
        name: "GB200 Blackwell NVL72",
        short: "Blackwell",
        color: "var(--chart-secondary)",
        points: [[50,3200000],[75,2850000],[100,2450000],[125,2050000],[150,1600000],[175,1150000],[200,750000],[225,500000],[250,370000],[300,310000],[350,190000],[400,50000]]
      }
    ]
  },
  blackwell: {
    title: "DeepSeek R1 · input 32K / output 8K",
    chartHeadline: "Blackwell Ultra NVL72",
    chartClaim: "Più throughput, stessa responsiveness",
    chartSubtitle: "DeepSeek R1 (32K/8K)",
    status: "Proiezione NVIDIA · dati ricostruiti",
    note: "Stesso scenario previsto. Le curve sono ricostruite dal grafico NVIDIA su GB300 NVL72: conta la forma e l'ordine di grandezza, non il singolo valore.",
    xMin: 0,
    xMax: 600,
    rangeMin: 6,
    rangeMax: 570,
    yMax: 1_000_000,
    yTick: 200_000,
    defaultX: 65,
    step: 5,
    unitMode: "curve",
    caption: "più token per megawatt",
    series: [
      {
        name: "GB300 Blackwell Ultra NVL72",
        short: "Blackwell Ultra",
        color: "var(--chart-primary)",
        points: [[32,960000],[44,920000],[58,885000],[71,840000],[98,760000],[165,680000],[247,560000],[344,430000],[411,290000],[453,175000],[478,55000],[573,35000]]
      },
      {
        name: "H100 Hopper",
        short: "Hopper",
        color: "var(--chart-secondary)",
        points: [[6,178000],[16,130000],[31,101000],[55,65000],[65,46000],[77,26000],[92,16000],[128,10000],[164,6000],[224,6000]]
      }
    ]
  },
  mistral: {
    title: "Mistral Large 3 · input 8K / output 1K",
    chartHeadline: "GB200 NVL72",
    chartClaim: "Fino a 10× più token per MW",
    chartSubtitle: "Mistral Large 3 · NVFP4 (8K/1K)",
    status: "Benchmark NVIDIA · curva pubblica ricostruita",
    note: "Stesso modello e contesto. Curve digitalizzate dalla Figura 1 di NVIDIA su Mistral Large 3: i punti intermedi sono stime e il confronto vale solo per questo workload NVFP4.",
    xMin: 0,
    xMax: 160,
    rangeMin: 12,
    xTick: 25,
    yMax: 7_000_000,
    yTick: 1_000_000,
    defaultX: 40,
    step: 1,
    unitMode: "curve",
    caption: "più token per megawatt",
    series: [
      {
        name: "GB200 Blackwell NVL72",
        short: "GB200",
        color: "var(--chart-primary)",
        points: [[20,6200000],[30,5500000],[40,5100000],[50,3900000],[58,2400000],[68,1300000],[80,620000],[95,450000],[110,320000],[125,180000],[145,120000],[151,20000]]
      },
      {
        name: "H200",
        short: "H200",
        color: "var(--chart-secondary)",
        points: [[12,1700000],[28,650000],[40,500000],[55,250000],[70,130000],[90,20000]]
      }
    ]
  }
};

const svg = document.getElementById("frontier-chart");
const range = document.getElementById("speed-range");
const rangeValue = document.getElementById("range-value");
const readingSpeed = document.getElementById("reading-speed");
const readingRatio = document.getElementById("reading-ratio");
const readingCaption = document.getElementById("reading-caption");
const chartTitle = document.getElementById("chart-title");
const chartStatus = document.getElementById("chart-status");
const chartNote = document.getElementById("chart-note");
const legend = document.getElementById("chart-legend");
const tooltip = document.getElementById("chart-tooltip");
const chartReading = document.getElementById("chart-reading");
const liveComparison = document.getElementById("live-comparison");
const chartBody = document.getElementById("chart-body");
const chartControls = document.getElementById("chart-controls");
if (chartBody && chartReading && chartControls && liveComparison) {
  chartBody.after(chartReading);
  chartReading.after(chartControls);
  chartControls.after(liveComparison);
}
const themeToggle = document.getElementById("theme-toggle");
const themeToggleLabel = document.getElementById("theme-toggle-label");
const themeToggleIcon = themeToggle.querySelector(".theme-toggle-icon");
const themeColor = document.getElementById("theme-color");
let activeScene = "rubin";
let hiddenSeries = new Set();
let resizeTimer;

function el(tag, attrs = {}, text = "") {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function compact(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("it-IT", { maximumFractionDigits: 1 })}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000).toLocaleString("it-IT")}K`;
  return Math.round(value).toLocaleString("it-IT");
}

function ratioText(value, approximate = false) {
  if (!Number.isFinite(value)) return "—";
  const formatted = value.toLocaleString("it-IT", { maximumFractionDigits: value >= 10 ? 0 : 1 });
  return `${approximate ? "≈" : ""}${formatted}×`;
}

function metricCompact(value) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("it-IT", { maximumFractionDigits: 2 })}M`;
  if (value >= 100_000) return `${Math.round(value / 1_000).toLocaleString("it-IT")}K`;
  return Math.round(value).toLocaleString("it-IT");
}

function renderLiveMetrics(scene, selectedX, values = []) {
  const rows = scene.series.map((series, index) => {
    const item = values.find(value => value.index === index);
    const throughput = item?.y;
    const usersPerMW = selectedX > 0 ? throughput / selectedX : NaN;
    const throughputExact = Number.isFinite(throughput) ? `${Math.round(throughput).toLocaleString("it-IT")} TPS/MW` : "dato non disponibile";
    const usersExact = Number.isFinite(usersPerMW) ? `${Math.round(usersPerMW).toLocaleString("it-IT")} utenti simultanei` : "dato non disponibile";
    return `
      <div class="live-system" data-hidden="${hiddenSeries.has(index)}">
        <div class="live-system-head">
          <span class="live-system-swatch" style="background:${series.color}"></span>
          <span>${series.name}</span>
        </div>
        <div class="live-metrics">
          <div class="live-metric">
            <span>Throughput totale / MW</span>
            <strong>${metricCompact(throughput)}</strong>
            <small>${throughputExact}</small>
          </div>
          <div class="live-metric">
            <span>Utenti serviti / MW</span>
            <strong>${metricCompact(usersPerMW)}</strong>
            <small>${usersExact}</small>
          </div>
        </div>
      </div>`;
  }).join("");

  const note = `Utenti/MW è una stima teorica di concorrenza: throughput totale ÷ ${selectedX.toLocaleString("it-IT")} TPS per utente. “—” indica che la curva pubblica non copre quel punto.`;
  liveComparison.innerHTML = `${rows}<p class="live-comparison-note">${note}</p>`;
}

function interpolate(points, x) {
  if (x < points[0][0] || x > points.at(-1)[0]) return NaN;
  if (x === points[0][0]) return points[0][1];
  if (x === points.at(-1)[0]) return points.at(-1)[1];
  for (let i = 1; i < points.length; i++) {
    const [x2, y2] = points[i];
    const [x1, y1] = points[i - 1];
    if (x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
}

function smoothPath(points, xScale, yScale) {
  const p = points.map(([x, y]) => [xScale(x), yScale(y)]);
  if (p.length < 2) return "";
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const current = p[i];
    const next = p[i + 1];
    const midX = (current[0] + next[0]) / 2;
    d += ` C ${midX} ${current[1]}, ${midX} ${next[1]}, ${next[0]} ${next[1]}`;
  }
  return d;
}

function renderLegend(scene) {
  legend.innerHTML = "";
  scene.series.forEach((series, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "legend-button";
    button.setAttribute("aria-pressed", String(!hiddenSeries.has(i)));
    button.innerHTML = `<span class="legend-swatch" style="background:${series.color}"></span>${series.short}`;
    button.addEventListener("click", () => {
      if (hiddenSeries.has(i)) hiddenSeries.delete(i); else hiddenSeries.add(i);
      render();
    });
    legend.appendChild(button);
  });
}

function chartGeometry() {
  const mobile = window.innerWidth <= 600;
  const width = mobile ? 760 : 1100;
  return {
    mobile,
    width,
    height: 520,
    plot: {
      left: mobile ? 142 : 210,
      right: width - (mobile ? 30 : 48),
      top: 100,
      bottom: 365
    }
  };
}

function addChartDefs() {
  const defs = el("defs");
  const gradient = el("linearGradient", { id: "focus-band", x1: "0%", x2: "100%" });
  gradient.appendChild(el("stop", { offset: "0%", "stop-color": "var(--chart-primary)", "stop-opacity": "0" }));
  gradient.appendChild(el("stop", { offset: "50%", "stop-color": "var(--chart-primary)", "stop-opacity": ".2" }));
  gradient.appendChild(el("stop", { offset: "100%", "stop-color": "var(--chart-primary)", "stop-opacity": "0" }));
  defs.appendChild(gradient);

  const marker = el("marker", { id: "focus-arrow", viewBox: "0 0 10 10", refX: "5", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
  marker.appendChild(el("path", { d: "M 0 10 L 5 0 L 10 10 z", fill: "var(--chart-primary)" }));
  defs.appendChild(marker);
  svg.appendChild(defs);
}

function renderChartHeading(scene, width) {
  const center = width / 2;
  svg.appendChild(el("text", { x: center, y: 52, "text-anchor": "middle", fill: "var(--chart-primary)", "font-family": "Manrope", "font-size": "20", "font-weight": "600" }, scene.chartSubtitle));
}

function renderAxes(scene, plot, xScale, yScale, geometry) {
  const axes = el("g", { "aria-hidden": "true" });
  const tickSize = geometry.mobile ? 17 : 15;

  for (let value = 0; value <= scene.yMax; value += scene.yTick) {
    const y = yScale(value);
    axes.appendChild(el("line", { x1: plot.left - 8, x2: plot.left, y1: y, y2: y, stroke: "var(--chart-axis)", "stroke-width": "1.5" }));
    axes.appendChild(el("text", { x: plot.left - 16, y: y + 5, "text-anchor": "end", fill: "var(--chart-muted)", "font-family": "DM Mono", "font-size": tickSize }, geometry.mobile ? compact(value) : Math.round(value).toLocaleString("it-IT")));
  }

  const xStep = scene.xTick || (scene.xMax > 1000 ? 500 : 100);
  for (let value = scene.xMin; value <= scene.xMax; value += xStep) {
    const x = xScale(value);
    axes.appendChild(el("line", { x1: x, x2: x, y1: plot.bottom, y2: plot.bottom + 8, stroke: "var(--chart-axis)", "stroke-width": "1.5" }));
    axes.appendChild(el("text", { x, y: plot.bottom + 32, "text-anchor": "middle", fill: "var(--chart-muted)", "font-family": "DM Mono", "font-size": tickSize }, value.toLocaleString("it-IT")));
  }

  axes.appendChild(el("line", { x1: plot.left, x2: plot.left, y1: plot.top, y2: plot.bottom, stroke: "var(--chart-axis)", "stroke-width": "1.5" }));
  axes.appendChild(el("line", { x1: plot.left, x2: plot.right, y1: plot.bottom, y2: plot.bottom, stroke: "var(--chart-axis)", "stroke-width": "1.5" }));
  axes.appendChild(el("text", { x: (plot.left + plot.right) / 2, y: plot.bottom + 82, "text-anchor": "middle", fill: "var(--chart-text)", "font-family": "Manrope", "font-size": geometry.mobile ? "20" : "18", "font-weight": "600" }, "TPS / UTENTE (RESPONSIVENESS) →"));

  const calloutX = geometry.mobile ? 48 : 42;
  axes.appendChild(el("text", { x: calloutX, y: 260, "text-anchor": "middle", fill: "var(--chart-text)", "font-family": "Manrope", "font-size": geometry.mobile ? "17" : "16", "font-weight": "600" }, "PIÙ IN ALTO"));
  axes.appendChild(el("text", { x: calloutX, y: 281, "text-anchor": "middle", fill: "var(--chart-text)", "font-family": "Manrope", "font-size": geometry.mobile ? "17" : "16", "font-weight": "600" }, "È MEGLIO"));
  axes.appendChild(el("line", { x1: calloutX, x2: calloutX, y1: 286, y2: 240, stroke: "var(--chart-axis)", "stroke-width": "4", "marker-end": "url(#focus-arrow)" }));
  axes.appendChild(el("text", { x: calloutX, y: 422, "text-anchor": "middle", fill: "var(--chart-text)", "font-family": "Manrope", "font-size": geometry.mobile ? "18" : "17", "font-weight": "600" }, "THROUGHPUT"));
  axes.appendChild(el("text", { x: calloutX, y: 448, "text-anchor": "middle", fill: "var(--chart-text)", "font-family": "DM Mono", "font-size": geometry.mobile ? "17" : "15" }, "TPS / MW"));
  axes.querySelectorAll("text").forEach(node => {
    if (Number(node.getAttribute("x")) !== calloutX) return;
    const y = Number(node.getAttribute("y"));
    if (y === 260) node.setAttribute("y", "176");
    if (y === 281) node.setAttribute("y", "197");
    if (y === 422) node.setAttribute("y", "326");
    if (y === 448) node.setAttribute("y", "349");
  });
  svg.appendChild(axes);
}

function renderCurveScene(scene) {
  const geometry = chartGeometry();
  const { width, height, plot } = geometry;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const xScale = x => plot.left + ((x - scene.xMin) / (scene.xMax - scene.xMin)) * (plot.right - plot.left);
  const yScale = y => plot.bottom - (y / scene.yMax) * (plot.bottom - plot.top);
  addChartDefs();
  renderChartHeading(scene, width);

  const selectedX = Number(range.value);
  const lineX = xScale(selectedX);
  const bandWidth = geometry.mobile ? 96 : 150;
  svg.appendChild(el("rect", { x: lineX - bandWidth / 2, y: plot.top, width: bandWidth, height: plot.bottom - plot.top, fill: "url(#focus-band)", class: "selection-band" }));
  renderAxes(scene, plot, xScale, yScale, geometry);

  scene.series.forEach((series, index) => {
    const visible = !hiddenSeries.has(index);
    svg.appendChild(el("path", {
      d: smoothPath(series.points, xScale, yScale),
      fill: "none",
      stroke: series.color,
      "stroke-width": index === 0 ? "6" : "4.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      opacity: visible ? "1" : ".1",
      class: "chart-path"
    }));

    series.points.forEach(([x, y], pointIndex) => {
      if (pointIndex % Math.max(1, Math.floor(series.points.length / 8)) !== 0) return;
      const tooltipHtml = `<strong>${series.name}</strong>${x.toLocaleString("it-IT")} TPS/utente<br>${compact(y)} TPS/MW`;
      const tooltipLabel = `${series.name}: ${x.toLocaleString("it-IT")} token al secondo per utente, ${Math.round(y).toLocaleString("it-IT")} token al secondo per megawatt`;
      const hit = el("circle", {
        cx: xScale(x), cy: yScale(y), r: "13", fill: "transparent", opacity: visible ? "1" : "0", class: "chart-point",
        tabindex: visible ? "0" : "-1", role: "img", "aria-label": tooltipLabel, "aria-hidden": String(!visible)
      });
      hit.style.cursor = "crosshair";
      hit.addEventListener("mouseenter", event => showTooltip(event, tooltipHtml));
      hit.addEventListener("mouseleave", hideTooltip);
      hit.addEventListener("focus", event => showTooltip(event, tooltipHtml));
      hit.addEventListener("blur", hideTooltip);
      hit.addEventListener("click", event => {
        event.stopPropagation();
        showTooltip(event, tooltipHtml);
      });
      svg.appendChild(hit);
    });

    const labelIndex = index === 0 ? Math.floor(series.points.length * .53) : Math.floor(series.points.length * .58);
    const labelPoint = series.points[Math.min(series.points.length - 1, labelIndex)];
    svg.appendChild(el("text", {
      x: xScale(labelPoint[0]) + 14,
      y: yScale(labelPoint[1]) + (index === 0 ? -12 : 26),
      fill: "var(--chart-text)",
      "font-family": "Manrope",
      "font-size": geometry.mobile ? "19" : "17",
      "font-weight": "600",
      opacity: visible ? "1" : ".2"
    }, series.short));
  });

  const values = scene.series.map((series, index) => ({ ...series, index, y: interpolate(series.points, selectedX) }));
  const valid = values.filter(item => !hiddenSeries.has(item.index) && Number.isFinite(item.y));
  const ratio = valid.length >= 2 ? valid[0].y / valid[1].y : null;
  const shorterSeries = scene.series.reduce((shortest, series) => series.points.length < shortest.points.length ? series : shortest, scene.series[0]);
  const tailThreshold = shorterSeries.points.at(-3)?.[0] ?? Infinity;
  const approximateRatio = Boolean(ratio && selectedX > tailThreshold);
  const formattedRatio = ratioText(ratio, approximateRatio);

  if (ratio) {
    const top = yScale(valid[0].y);
    const bottom = yScale(valid[1].y);
    svg.appendChild(el("line", {
      x1: lineX,
      x2: lineX,
      y1: bottom - 5,
      y2: top + 13,
      stroke: "var(--chart-primary)",
      "stroke-width": "4",
      "stroke-dasharray": "10 9",
      "marker-end": "url(#focus-arrow)",
      class: "selection-line"
    }));
    const placeLeft = selectedX > scene.xMin + (scene.xMax - scene.xMin) * .72;
    svg.appendChild(el("text", {
      x: lineX + (placeLeft ? -16 : 16),
      y: (top + bottom) / 2 + 10,
      "text-anchor": placeLeft ? "end" : "start",
      fill: "var(--chart-text)",
      "font-family": "Manrope",
      "font-size": geometry.mobile ? "34" : "38",
      "font-weight": "600"
    }, formattedRatio));
  }

  readingRatio.textContent = ratio ? formattedRatio : (valid.length ? compact(valid[0].y) : "—");
  readingCaption.textContent = ratio
    ? `${scene.caption}${approximateRatio ? ` · ${shorterSeries.short} oltre il suo range pratico a questa velocità` : ""}`
    : (valid.length ? "throughput della serie visibile" : "fuori dalla curva pubblica");
  renderLiveMetrics(scene, selectedX, values);
}

function showTooltip(event, html) {
  tooltip.innerHTML = html;
  tooltip.hidden = false;
  const stage = document.querySelector(".chart-stage").getBoundingClientRect();
  const target = event.target.getBoundingClientRect();
  const width = tooltip.offsetWidth;
  tooltip.style.left = `${Math.max(8, Math.min(stage.width - width - 8, target.left - stage.left + 14))}px`;
  tooltip.style.top = `${Math.max(8, target.top - stage.top - tooltip.offsetHeight - 10)}px`;
}
function hideTooltip() { if (tooltip) tooltip.hidden = true; }

function render() {
  const scene = scenes[activeScene];
  svg.replaceChildren();
  svg.appendChild(el("title", { id: "svg-title" }, scene.title));
  svg.appendChild(el("desc", { id: "svg-desc" }, scene.note));
  chartTitle.textContent = scene.title;
  chartStatus.textContent = scene.status;
  chartNote.textContent = `${scene.note} Claim del produttore: «${scene.chartClaim}».`;
  rangeValue.textContent = Number(range.value).toLocaleString("it-IT");
  readingSpeed.textContent = Number(range.value).toLocaleString("it-IT");
  range.setAttribute("aria-valuetext", `${Number(range.value).toLocaleString("it-IT")} token al secondo per utente`);
  chartReading.hidden = false;
  renderLegend(scene);
  renderCurveScene(scene);
}

function setScene(key) {
  activeScene = key;
  hiddenSeries = new Set();
  const scene = scenes[key];
  range.min = scene.rangeMin ?? scene.xMin;
  range.max = scene.rangeMax ?? Math.min(scene.xMax, Math.max(...scene.series.flatMap(s => s.points.map(p => p[0]))));
  range.step = scene.step;
  range.value = scene.defaultX;
  document.querySelectorAll(".workload-tab").forEach(tab => {
    const selected = tab.dataset.scene === key;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-pressed", String(selected));
  });
  render();
}

if (range) {
  range.addEventListener("input", render);
  document.querySelectorAll(".workload-tab").forEach(tab => tab.addEventListener("click", () => setScene(tab.dataset.scene)));
}

document.querySelectorAll(".driver-point-track").forEach(track => {
  const panel = track.closest(".driver-body");
  const infoTitle = panel.querySelector(".driver-point-info h5");
  const infoCopy = panel.querySelector(".driver-point-info p");

  track.querySelectorAll(".driver-point").forEach(point => {
    point.addEventListener("click", () => {
      track.querySelectorAll(".driver-point").forEach(item => {
        const active = item === point;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      infoTitle.textContent = point.dataset.label;
      infoCopy.textContent = point.dataset.copy;
    });
  });
});

const energySeries = [
  { date: "2024-08-11", value: 80_344, label: "Google Papillion", owner: "Google", status: "osservato" },
  { date: "2024-09-02", value: 100_000, label: "Colossus 1", owner: "xAI", status: "osservato" },
  { date: "2025-02-17", value: 200_000, label: "Colossus 1", owner: "xAI", status: "osservato" },
  { date: "2025-06-23", value: 300_152, label: "Amazon New Carlisle", owner: "Anthropic / Amazon", status: "osservato" },
  { date: "2025-10-14", value: 373_926, label: "Fairwater Atlanta", owner: "Microsoft", status: "osservato" },
  { date: "2025-12-23", value: 471_450, label: "Amazon New Carlisle", owner: "Anthropic / Amazon", status: "osservato" },
  { date: "2026-02-27", value: 493_684, label: "Prometheus", owner: "Meta", status: "osservato" },
  { date: "2026-03-23", value: 687_216, label: "Amazon New Carlisle", owner: "Anthropic / Amazon", status: "osservato" },
  { date: "2026-05-28", value: 763_012, label: "Prometheus", owner: "Meta", status: "osservato" },
  { date: "2026-07-01", value: 1_111_673, label: "Colossus 2", owner: "xAI (SpaceXAI)", status: "stima corrente" }
];

const energyViews = {
  site: {
    title: "Record del più grande sito AI",
    subtitle: "Compute installato in H100-equivalent · agosto 2024 – luglio 2026",
    label: "La misura corretta",
    definitionTitle: "H100-equivalent di un sito",
    definitionCopy: "Normalizza chip diversi rispetto alla capacità FP8 di una H100. Misura la scala di un campus, non il numero di GPU fisiche e neppure un singolo job coerente.",
    rule: "Non chiamarlo coherent cluster.",
    ruleCopy: "Un sito può ospitare più fabric e più cluster.",
    note: "La serie Epoch misura il record di compute installato in un singolo sito. L'ultimo punto è una stima corrente del database. Dati Epoch consultati a luglio 2026; il database è aggiornato di continuo.",
    source: "https://epoch.ai/data-insights/largest-data-center-compute"
  },
  cluster: {
    title: "Cluster esplicitamente interconnesso",
    subtitle: "GPU Hopper (H100/H200) dichiarate nello stesso fabric · disclosure pubbliche xAI",
    label: "La misura più vicina a coherent",
    definitionTitle: "GPU nello stesso cluster di rete",
    definitionCopy: "È la disclosure pubblica più vicina a un coherent cluster: le GPU sono descritte nello stesso sistema interconnesso. Non dimostra però che ogni training job le utilizzi tutte insieme.",
    rule: "200.000 GPU Hopper è il limite verificabile.",
    ruleCopy: "xAI dichiara oggi più GPU complessive, ma non sempre esplicita un unico dominio coerente comparabile.",
    note: "NVIDIA descriveva Colossus con 100.000 GPU Hopper nell'ottobre 2024; il raddoppio dichiarato a 200.000 è un mix H100+H200.",
    source: "https://x.ai/colossus"
  },
  power: {
    title: "Quanti gigawatt sono davvero AI?",
    subtitle: "Capacità nominale, facility power e IT power · grandezze da non sommare",
    label: "La domanda più difficile",
    definitionTitle: "Training + inference non è misurato",
    definitionCopy: "Il numero globale pubblico più difendibile è 30 GW di capacità nominale AI a fine 2025. Circa 20 GW per training più inference è soltanto una derivazione dalla ripartizione approssimativa in terzi.",
    rule: "Capacità non significa consumo medio.",
    ruleCopy: "E 14,6 GW dei siti tracciati è un sottoinsieme dei 30 GW globali, non un valore da aggiungere.",
    note: "30 GW è una stima globale Epoch. 14,6 GW facility e 11,2 GW IT appartengono ai 72 siti censiti; ≈20 GW è un ordine di grandezza derivato. Dati Epoch consultati a luglio 2026; il database è aggiornato di continuo.",
    source: "https://epoch.ai/data-insights/ai-datacenter-power"
  }
};

const energySvg = document.getElementById("energy-chart");
const energyTooltip = document.getElementById("energy-tooltip");
const energySourceLink = document.getElementById("energy-source-link");
let activeEnergyView = "site";

function showEnergyTooltip(event, html) {
  energyTooltip.innerHTML = html;
  energyTooltip.hidden = false;
  const stage = energyTooltip.parentElement.getBoundingClientRect();
  const target = event.target.getBoundingClientRect();
  const width = energyTooltip.offsetWidth;
  energyTooltip.style.left = `${Math.max(8, Math.min(stage.width - width - 8, target.left - stage.left + 16))}px`;
  energyTooltip.style.top = `${Math.max(8, target.top - stage.top - energyTooltip.offsetHeight - 10)}px`;
}

function hideEnergyTooltip() { if (energyTooltip) energyTooltip.hidden = true; }

function energyGeometry() {
  const mobile = window.innerWidth <= 600;
  return {
    width: mobile ? 560 : 980,
    height: 580,
    plot: { left: mobile ? 92 : 128, right: mobile ? 530 : 934, top: 70, bottom: 472 },
    mobile
  };
}

function energyText(x, y, text, attrs = {}) {
  return el("text", {
    x, y,
    fill: "var(--chart-muted)",
    "font-family": "DM Mono",
    "font-size": "13",
    ...attrs
  }, text);
}

function renderEnergySite(geometry) {
  const { plot } = geometry;
  const max = 1_200_000;
  const x = index => plot.left + (index / (energySeries.length - 1)) * (plot.right - plot.left);
  const y = value => plot.bottom - (value / max) * (plot.bottom - plot.top);

  [0, 300_000, 600_000, 900_000, 1_200_000].forEach(value => {
    const yy = y(value);
    energySvg.appendChild(el("line", { x1: plot.left, x2: plot.right, y1: yy, y2: yy, stroke: "var(--chart-grid)", "stroke-width": "1" }));
    energySvg.appendChild(energyText(plot.left - 16, yy + 5, compact(value), { "text-anchor": "end" }));
  });

  const points = energySeries.map((item, index) => [x(index), y(item.value)]);
  let path = `M ${points[0][0]} ${points[0][1]}`;
  points.slice(1).forEach(point => { path += ` L ${point[0]} ${point[1]}`; });
  energySvg.appendChild(el("path", { d: path, fill: "none", stroke: "var(--chart-primary)", "stroke-width": "5", "stroke-linejoin": "round", "stroke-linecap": "round" }));

  energySeries.forEach((item, index) => {
    const [cx, cy] = points[index];
    const tooltipHtml = `<strong>${item.label}</strong>${new Date(item.date).toLocaleDateString("it-IT", { month: "short", year: "numeric" })}<br>${item.value.toLocaleString("it-IT")} H100-eq<br>${item.owner} · ${item.status}`;
    const tooltipLabel = `${item.label}, ${new Date(item.date).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}: ${item.value.toLocaleString("it-IT")} H100-equivalent, ${item.owner}, ${item.status}`;
    const point = el("circle", {
      cx, cy, r: index === energySeries.length - 1 ? "8" : "5", fill: "var(--chart-surface)", stroke: "var(--chart-primary)", "stroke-width": "4",
      class: "energy-point", tabindex: "0", role: "img", "aria-label": tooltipLabel
    });
    point.style.cursor = "crosshair";
    point.addEventListener("mouseenter", event => showEnergyTooltip(event, tooltipHtml));
    point.addEventListener("mouseleave", hideEnergyTooltip);
    point.addEventListener("focus", event => showEnergyTooltip(event, tooltipHtml));
    point.addEventListener("blur", hideEnergyTooltip);
    point.addEventListener("click", event => {
      event.stopPropagation();
      showEnergyTooltip(event, tooltipHtml);
    });
    energySvg.appendChild(point);
  });

  [0, 2, 4, 6, 8, 9].forEach(index => {
    const date = new Date(energySeries[index].date);
    energySvg.appendChild(energyText(x(index), plot.bottom + 34, date.toLocaleDateString("it-IT", { month: "short", year: index === 0 || index === 9 ? "2-digit" : undefined }), { "text-anchor": "middle" }));
  });
  const last = energySeries.at(-1);
  energySvg.appendChild(energyText(x(9) - 10, y(last.value) - 22, "1,11M H100-eq", { "text-anchor": "end", fill: "var(--chart-text)", "font-family": "Manrope", "font-size": "18", "font-weight": "600" }));
}

function renderEnergyBars(geometry, rows, max, unit) {
  const { plot } = geometry;
  const barHeight = 54;
  const gap = rows.length === 2 ? 80 : 32;
  const startY = rows.length === 2 ? 130 : 82;
  rows.forEach((row, index) => {
    const y = startY + index * (barHeight + gap);
    const width = (row.value / max) * (plot.right - plot.left);
    energySvg.appendChild(energyText(plot.left - 14, y + 33, row.label, { "text-anchor": "end", fill: "var(--chart-text)", "font-family": "Manrope", "font-size": "15", "font-weight": "600" }));
    energySvg.appendChild(el("rect", { x: plot.left, y, width: plot.right - plot.left, height: barHeight, fill: "var(--chart-grid)" }));
    energySvg.appendChild(el("rect", { x: plot.left, y, width, height: barHeight, fill: row.estimated ? "none" : "var(--chart-primary)", stroke: row.estimated ? "var(--chart-primary)" : "none", "stroke-width": row.estimated ? "3" : "0", "stroke-dasharray": row.estimated ? "9 7" : "none" }));
    energySvg.appendChild(energyText(Math.min(plot.right - 8, plot.left + width + 14), y + 34, `${row.display || row.value.toLocaleString("it-IT")} ${unit}`, { fill: "var(--chart-text)", "font-family": "DM Mono", "font-size": "14", "font-weight": "500" }));
    if (row.note) energySvg.appendChild(energyText(plot.left, y + barHeight + 20, row.note, { "font-size": "12" }));
  });
}

function renderEnergy() {
  if (!energySvg) return;
  const view = energyViews[activeEnergyView];
  const geometry = energyGeometry();
  energySvg.replaceChildren();
  energySvg.setAttribute("viewBox", `0 0 ${geometry.width} ${geometry.height}`);
  energySvg.appendChild(el("title", { id: "energy-svg-title" }, view.title));
  energySvg.appendChild(el("desc", { id: "energy-svg-desc" }, view.subtitle));

  if (activeEnergyView === "site") renderEnergySite(geometry);
  if (activeEnergyView === "cluster") renderEnergyBars(geometry, [
    { label: "Ott 2024", value: 100_000, display: "100.000", note: "NVIDIA · cluster Hopper" },
    { label: "Feb 2025", value: 200_000, display: "200.000", note: "xAI · singolo cluster interconnesso (mix H100+H200)" }
  ], 220_000, "GPU");
  if (activeEnergyView === "power") renderEnergyBars(geometry, [
    { label: "Globale AI", value: 30, display: "30", note: "capacità nominale · Q4 2025" },
    { label: "Training + inference", value: 20, display: "≈20", note: "derivazione · non misurato", estimated: true },
    { label: "72 siti · facility", value: 14.6, display: "14,6", note: "sottoinsieme tracciato" },
    { label: "72 siti · IT", value: 11.2, display: "11,2", note: "potenza ai server" }
  ], 32, "GW");

  document.getElementById("energy-chart-title").textContent = view.title;
  document.getElementById("energy-chart-subtitle").textContent = view.subtitle;
  document.getElementById("energy-definition-label").textContent = view.label;
  document.getElementById("energy-definition-title").textContent = view.definitionTitle;
  document.getElementById("energy-definition-copy").textContent = view.definitionCopy;
  document.querySelector("#energy-definition-rule strong").textContent = view.rule;
  document.querySelector("#energy-definition-rule span").textContent = view.ruleCopy;
  document.getElementById("energy-chart-note").textContent = view.note;
  energySourceLink.href = view.source;
}

document.querySelectorAll("[data-energy-view]").forEach(button => {
  button.addEventListener("click", () => {
    activeEnergyView = button.dataset.energyView;
    document.querySelectorAll("[data-energy-view]").forEach(item => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderEnergy();
  });
});

const chips = {
  ampere: {
    architecture: "Ampere", generation: "2020 · A100 80GB SXM", summary: "Il punto di partenza: 80 GB HBM2e, Tensor Core maturi e NVLink da 600 GB/s. Non supporta ancora FP8.",
    memory: 80, bandwidth: 2.039, nvlink: .6, peak: .312, precision: "FP16/BF16 denso", tdp: "400 W", transistors: "54,2 miliardi", status: "Prodotto", note: "Base di confronto. Le barre mostrano memoria, banda HBM e NVLink rispetto ad A100 = 1.", source: "https://www.nvidia.com/en-us/data-center/a100/"
  },
  hopper: {
    architecture: "Hopper", generation: "2022 · H100 SXM", summary: "Il Transformer Engine porta FP8 nel training e nell'inference. La banda HBM cresce del 64% e NVLink del 50% rispetto ad A100.",
    memory: 80, bandwidth: 3.35, nvlink: .9, peak: 1.979, precision: "FP8 denso", tdp: "700 W", transistors: "80 miliardi", status: "Prodotto", note: "FP8 cambia la precisione del calcolo, quindi il picco tensoriale non è direttamente confrontabile con l'FP16 di A100.", source: "https://www.nvidia.com/en-us/data-center/h100/"
  },
  blackwell: {
    architecture: "Blackwell", generation: "2024 · B200", summary: "HBM3e da 180 GB, 8 TB/s e NVLink da 1,8 TB/s. FP4 sposta il limite dell'inference e il rack diventa parte dell'architettura.",
    memory: 180, bandwidth: 8, nvlink: 1.8, peak: 9, precision: "FP4 denso", tdp: "1.000 W", transistors: "208 miliardi", status: "Prodotto", note: "DGX B200 è dichiarato fino a 3× nel training e 15× nell'inference rispetto a DGX H100: risultati workload-specific.", source: "https://www.nvidia.com/en-us/data-center/dgx-b200/"
  },
  rubin: {
    architecture: "Rubin", generation: "2026 · Rubin GPU", summary: "HBM4 da 288 GB, 22 TB/s e NVLink 6 da 3,6 TB/s per GPU. Il progetto nasce direttamente come sistema rack-scale.",
    memory: 288, bandwidth: 22, nvlink: 3.6, peak: 35, precision: "NVFP4 training denso", tdp: "Non pubblicato", transistors: "336 miliardi", status: "Piena produzione · H2 2026", note: "NVIDIA dichiara la piattaforma in piena produzione e i primi sistemi dai partner nella seconda metà del 2026. Prezzo, TDP e volumi unitari non sono ancora pubblici.", source: "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Vera-Rubin-Ramps-Into-Full-Production-to-Power-Agentic-AI-Factories-Worldwide/default.aspx"
  }
};

let activeChip = "ampere";

function itNumber(value, digits = 3) {
  return value.toLocaleString("it-IT", { maximumFractionDigits: digits });
}

function renderChipBars(selectedKey) {
  const container = document.getElementById("chip-bars");
  const metrics = [
    { key: "memory", label: "Memoria HBM", unit: "GB" },
    { key: "bandwidth", label: "Banda HBM", unit: "TB/s" },
    { key: "nvlink", label: "NVLink per GPU", unit: "TB/s" }
  ];
  const entries = Object.entries(chips);
  container.innerHTML = metrics.map(metric => {
    const max = Math.max(...entries.map(([, chip]) => chip[metric.key]));
    const base = chips.ampere[metric.key];
    const selected = chips[selectedKey][metric.key];
    const rows = entries.map(([key, chip]) => {
      const ratio = chip[metric.key] / base;
      return `<div class="chip-bar-row" data-selected="${key === selectedKey}">
        <span>${chip.architecture}</span>
        <div class="chip-bar-track"><i style="width:${(chip[metric.key] / max) * 100}%"></i></div>
        <strong>${itNumber(ratio, 2)}×</strong>
      </div>`;
    }).join("");
    return `<section class="chip-metric"><header><span>${metric.label} · A100 = 1</span><strong>${itNumber(selected)} ${metric.unit}</strong></header>${rows}</section>`;
  }).join("");
}

function renderChip() {
  const chip = chips[activeChip];
  document.getElementById("chip-generation").textContent = chip.generation;
  document.getElementById("chip-lab-title").textContent = chip.architecture;
  document.getElementById("chip-summary").textContent = chip.summary;
  document.getElementById("chip-detail-peak").textContent = `${itNumber(chip.peak)} PF`;
  document.getElementById("chip-detail-precision").textContent = chip.precision;
  document.getElementById("chip-detail-memory").textContent = `${itNumber(chip.memory)} GB`;
  document.getElementById("chip-detail-bandwidth").textContent = `${itNumber(chip.bandwidth)} TB/s`;
  document.getElementById("chip-detail-nvlink").textContent = `${itNumber(chip.nvlink)} TB/s`;
  document.getElementById("chip-detail-tdp").textContent = chip.tdp;
  document.getElementById("chip-detail-transistors").textContent = chip.transistors;
  document.getElementById("chip-detail-status").textContent = chip.status;
  document.getElementById("chip-detail-note").textContent = chip.note;
  document.getElementById("chip-source-link").href = chip.source;
  renderChipBars(activeChip);
}

document.querySelectorAll("[data-chip]").forEach(button => {
  button.addEventListener("click", () => {
    activeChip = button.dataset.chip;
    document.querySelectorAll("[data-chip]").forEach(item => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderChip();
  });
});

const algorithmRange = document.getElementById("algorithm-months");
const algorithmPresetButtons = [...document.querySelectorAll("[data-algorithm-months]")];
const computeGridToday = document.getElementById("compute-grid-today");
const computeGridFuture = document.getElementById("compute-grid-future");

function makeComputeTiles(grid, className = "") {
  if (!grid || grid.children.length) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 100; index += 1) {
    const tile = document.createElement("i");
    tile.setAttribute("aria-hidden", "true");
    if (className) tile.className = className;
    fragment.appendChild(tile);
  }
  grid.appendChild(fragment);
}

makeComputeTiles(computeGridToday);
makeComputeTiles(computeGridFuture, "is-required");

function renderAlgorithm() {
  const months = Number(algorithmRange.value);
  const multiplier = 2 ** (months / 8);
  const compute = 100 / multiplier;
  const freed = 100 - compute;
  const requiredTiles = Math.max(1, Math.round(compute));
  const computeDigits = Number.isInteger(compute) ? 0 : (compute >= 10 ? 1 : 2);
  document.getElementById("algorithm-months-value").textContent = months.toLocaleString("it-IT");
  document.getElementById("compute-required").textContent = `${itNumber(compute, computeDigits)}%`;
  document.getElementById("effective-multiplier").textContent = `${itNumber(multiplier, multiplier < 10 ? 1 : 0)}×`;
  document.getElementById("compute-freed").textContent = `${itNumber(freed, freed >= 10 ? 0 : 1)}%`;
  document.getElementById("algorithm-divisor").textContent = `÷ ${itNumber(multiplier, multiplier < 10 ? 1 : 0)}`;
  document.getElementById("algorithm-answer-time").textContent = months === 0 ? "Oggi" : `Dopo ${months.toLocaleString("it-IT")} mesi`;
  document.getElementById("algorithm-future-label").textContent = months === 0 ? "Con il tasso storico" : `Dopo ${months.toLocaleString("it-IT")} mesi`;
  document.getElementById("algorithm-answer-compute").textContent = `${compute === 100 ? "100" : `circa ${itNumber(compute, computeDigits)}`} blocchi su 100`;
  [...computeGridFuture.children].forEach((tile, index) => tile.classList.toggle("is-required", index < requiredTiles));
  computeGridFuture.setAttribute("aria-label", `${months === 0 ? "Oggi" : `Dopo ${months} mesi`} servono circa ${itNumber(compute, computeDigits)} blocchi di compute su 100 per lo stesso target`);
  algorithmPresetButtons.forEach(button => {
    const selected = Number(button.dataset.algorithmMonths) === months;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  algorithmRange.setAttribute("aria-valuetext", `${months} mesi: ${itNumber(compute, 1)} per cento del compute richiesto`);
}

if (algorithmRange) algorithmRange.addEventListener("input", renderAlgorithm);
algorithmPresetButtons.forEach(button => button.addEventListener("click", () => {
  algorithmRange.value = button.dataset.algorithmMonths;
  renderAlgorithm();
}));

function applyTheme(theme, persist = false) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Passa al tema chiaro" : "Passa al tema scuro");
  themeToggleLabel.textContent = isDark ? "Chiaro" : "Scuro";
  themeToggleIcon.textContent = isDark ? "☀" : "☾";
  themeColor.setAttribute("content", isDark ? "#090b09" : "#f2f0e8");
  if (persist) {
    try { localStorage.setItem("aiit-theme", isDark ? "dark" : "light"); } catch (_) {}
  }
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next, true);
  if (svg) render();
  if (energySvg) renderEnergy();
});

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (svg) render();
    if (energySvg) renderEnergy();
  }, 120);
});

const overlay = document.getElementById("method-overlay");
const methodOpen = document.getElementById("method-open");
const methodClose = document.getElementById("method-close");
const methodPanel = document.getElementById("method-panel");
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const backgroundRegions = [document.querySelector("header"), document.querySelector(".section-nav"), document.querySelector("main")].filter(Boolean);
function openMethod() {
  overlay.hidden = false;
  methodOpen.setAttribute("aria-expanded", "true");
  backgroundRegions.forEach(region => region.setAttribute("inert", ""));
  document.body.style.overflow = "hidden";
  methodClose.focus();
}
function closeMethod() {
  overlay.hidden = true;
  methodOpen.setAttribute("aria-expanded", "false");
  backgroundRegions.forEach(region => region.removeAttribute("inert"));
  document.body.style.overflow = "";
  methodOpen.focus();
}
if (overlay) {
  methodOpen.addEventListener("click", openMethod);
  methodClose.addEventListener("click", closeMethod);
  document.querySelector(".overlay-scrim").addEventListener("click", closeMethod);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) closeMethod();
    if (event.key !== "Tab" || overlay.hidden) return;
    const focusable = [...methodPanel.querySelectorAll(focusableSelector)].filter(node => !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !methodPanel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !methodPanel.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });
}

document.addEventListener("click", event => {
  if (!event.target.closest(".chart-point")) hideTooltip();
  if (!event.target.closest(".energy-point")) hideEnergyTooltip();
});

applyTheme(document.documentElement.dataset.theme || "light");
if (svg) setScene("rubin");
if (energySvg) renderEnergy();
if (document.getElementById("chip-bars")) renderChip();
if (algorithmRange) renderAlgorithm();

const homeRevealItems = [...document.querySelectorAll(".home-page [data-reveal]")];
if (homeRevealItems.length && "IntersectionObserver" in window) {
  document.body.classList.add("reveal-ready");
  const homeRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      homeRevealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  homeRevealItems.forEach(item => homeRevealObserver.observe(item));
}

const secretWord = document.getElementById("secret-word");
if (secretWord) {
  const requiredClicks = 7;
  const clickWindow = 2200;
  let secretClicks = [];
  let listeningTimer;

  secretWord.addEventListener("click", () => {
    const now = performance.now();
    secretClicks = secretClicks.filter(time => now - time <= clickWindow);
    secretClicks.push(now);
    secretWord.classList.toggle("is-listening", secretClicks.length >= 4);
    clearTimeout(listeningTimer);
    listeningTimer = setTimeout(() => {
      secretClicks = [];
      secretWord.classList.remove("is-listening");
    }, clickWindow);

    if (secretClicks.length < requiredClicks) return;
    try { sessionStorage.setItem("aiit-spooky-pass", String(Date.now())); } catch (_) {}
    document.body.classList.add("secret-unlocking");
    window.setTimeout(() => window.location.assign("spooky-timeline.html"), 420);
  });
}
