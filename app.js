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
  const width = Math.max(260, Math.round(svg.getBoundingClientRect().width || 900));
  const mobile = width < 620;
  const height = mobile ? 340 : 440;
  return { mobile, width, height, plot: { left: mobile ? 48 : 76, right: width - 24, top: 48, bottom: height - 64 } };
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
  svg.appendChild(el("text", { x: width < 620 ? 48 : 76, y: 25, fill: "var(--chart-muted)", "font-family": "Manrope", "font-size": "13" }, "Token al secondo / MW"));
}

function renderAxes(scene, plot, xScale, yScale, geometry) {
  const axes = el("g", { "aria-hidden": "true" });
  const tickSize = 12;
  for (let value = 0; value <= scene.yMax; value += scene.yTick) {
    const y = yScale(value);
    axes.appendChild(el("line", { x1: plot.left, x2: plot.right, y1: y, y2: y, stroke: "var(--chart-grid)" }));
    axes.appendChild(el("text", { x: plot.left - 10, y: y + 4, "text-anchor": "end", fill: "var(--chart-muted)", "font-family": "DM Mono", "font-size": tickSize }, compact(value)));
  }
  const baseStep = scene.xTick || (scene.xMax > 1000 ? 500 : 100);
  const xStep = baseStep * Math.max(1, Math.ceil((scene.xMax - scene.xMin) / baseStep / (geometry.mobile ? 4 : 8)));
  for (let value = scene.xMin; value <= scene.xMax; value += xStep) {
    const x = xScale(value);
    axes.appendChild(el("text", { x, y: plot.bottom + 25, "text-anchor": "middle", fill: "var(--chart-muted)", "font-family": "DM Mono", "font-size": tickSize }, value.toLocaleString("it-IT")));
  }
  axes.appendChild(el("line", { x1: plot.left, x2: plot.right, y1: plot.bottom, y2: plot.bottom, stroke: "var(--chart-axis)" }));
  axes.appendChild(el("text", { x: (plot.left + plot.right) / 2, y: plot.bottom + 52, "text-anchor": "middle", fill: "var(--chart-muted)", "font-family": "Manrope", "font-size": "13" }, "Token al secondo / utente →"));
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
  const bandWidth = geometry.mobile ? 24 : 50;
  svg.appendChild(el("rect", { x: lineX - bandWidth / 2, y: plot.top, width: bandWidth, height: plot.bottom - plot.top, fill: "url(#focus-band)", class: "selection-band" }));
  renderAxes(scene, plot, xScale, yScale, geometry);

  scene.series.forEach((series, index) => {
    const visible = !hiddenSeries.has(index);
    svg.appendChild(el("path", {
      d: smoothPath(series.points, xScale, yScale),
      fill: "none",
      stroke: series.color,
      "stroke-width": index === 0 ? "3.5" : "3",
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
      "font-size": "14",
      "font-weight": "600",
      opacity: geometry.mobile ? "0" : visible ? "1" : ".2"
    }, series.short));
  });

  const values = scene.series.map((series, index) => ({ ...series, index, y: interpolate(series.points, selectedX) }));
  const valid = values.filter(item => !hiddenSeries.has(item.index) && Number.isFinite(item.y));
  const ratio = valid.length >= 2 ? valid[0].y / valid[1].y : null;
  const shorterSeries = scene.series.reduce((shortest, series) => series.points.length < shortest.points.length ? series : shortest, scene.series[0]);
  const tailThreshold = shorterSeries.points.at(-3)?.[0] ?? Infinity;
  const approximateRatio = Boolean(ratio && selectedX > tailThreshold);
  const formattedRatio = ratioText(ratio, approximateRatio);

  if (ratio && !geometry.mobile) {
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
      "font-size": "28",
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

function applyTheme(theme, persist = false) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Passa al tema chiaro" : "Passa al tema scuro");
  themeToggleLabel.textContent = isDark ? "Chiaro" : "Scuro";
  themeToggleIcon.textContent = isDark ? "☀" : "☾";
  themeColor.setAttribute("content", isDark ? "#101820" : "#f8fafb");
  if (persist) {
    try { localStorage.setItem("aiit-theme", isDark ? "dark" : "light"); } catch (_) {}
  }
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next, true);
  if (svg) render();
});

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (svg) render();
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
});

applyTheme(document.documentElement.dataset.theme || "light");
if (svg) setScene("rubin");

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

const scalingRange = document.getElementById("scaling-range");
const scalingOutput = document.getElementById("scaling-output");
const scalingFitPath = document.getElementById("scaling-fit-path");
const scalingFitArea = document.getElementById("scaling-fit-area");
const scalingPlot = document.querySelector(".scaling-plot");
const scalingPoint = document.getElementById("scaling-point");
const scalingCallout = document.getElementById("scaling-callout");
const scalingCalloutLoss = document.getElementById("scaling-callout-loss");
const scalingCalloutCompute = document.getElementById("scaling-callout-compute");
const scalingGuideX = document.getElementById("scaling-guide-x");
const scalingGuideY = document.getElementById("scaling-guide-y");
const scalingMultiple = document.getElementById("scaling-multiple");
const scalingParams = document.getElementById("scaling-params");
const scalingTokens = document.getElementById("scaling-tokens");
const scalingLoss = document.getElementById("scaling-loss");
const scalingPresets = [...document.querySelectorAll("[data-scaling-preset]")];

if (scalingRange && scalingOutput && scalingFitPath && scalingFitArea && scalingPlot && scalingPoint && scalingCallout && scalingCalloutLoss && scalingCalloutCompute && scalingGuideX && scalingGuideY && scalingMultiple && scalingParams && scalingTokens && scalingLoss) {
  const fit = { E: 1.69, A: 406.4, B: 410.7, alpha: 0.34, beta: 0.28 };
  const plot = { x0: 94, x1: 704, y0: 40, y1: 344, logMin: 18, logMax: 25, lossMin: 1.8, lossMax: 3.6 };
  const superscript = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const italianNumber = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 });

  const toSuperscript = value => String(value).split("").map(character => superscript[character] || character).join("");
  const formatScientific = value => {
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / (10 ** exponent);
    return `${italianNumber.format(mantissa)} × 10${toSuperscript(exponent)}`;
  };
  const formatLargeCount = value => {
    if (value >= 1e12) return `${italianNumber.format(value / 1e12)} mila miliardi`;
    if (value >= 1e9) return `${italianNumber.format(value / 1e9)} miliardi`;
    return `${italianNumber.format(value / 1e6)} milioni`;
  };
  const formatMultiplier = value => {
    if (value >= 1e6) return `${italianNumber.format(value / 1e6)} milioni ×`;
    if (value >= 1e3) return `${italianNumber.format(value / 1e3)} mila ×`;
    return `${italianNumber.format(value)} ×`;
  };
  const xForLogCompute = logCompute => plot.x0 + ((logCompute - plot.logMin) / (plot.logMax - plot.logMin)) * (plot.x1 - plot.x0);
  const yForLoss = loss => plot.y0 + ((plot.lossMax - loss) / (plot.lossMax - plot.lossMin)) * (plot.y1 - plot.y0);
  const computeOptimalPoint = logCompute => {
    const compute = 10 ** logCompute;
    const ratio = ((fit.alpha * fit.A) / (fit.beta * fit.B)) * ((compute / 6) ** fit.beta);
    const parameters = ratio ** (1 / (fit.alpha + fit.beta));
    const tokens = compute / (6 * parameters);
    const loss = fit.E + (fit.A / (parameters ** fit.alpha)) + (fit.B / (tokens ** fit.beta));
    return { compute, parameters, tokens, loss, x: xForLogCompute(logCompute), y: yForLoss(loss) };
  };


  const layoutScalingPlot = () => {
    const width = Math.max(260, Math.round(scalingPlot.getBoundingClientRect().width));
    const height = width < 620 ? 310 : 380;
    Object.assign(plot, { x0: 45, x1: width - 24, y0: 46, y1: height - 62 });
    scalingPlot.setAttribute("viewBox", "0 0 " + width + " " + height);
    const grid = scalingPlot.querySelector(".scaling-grid");
    const ticks = scalingPlot.querySelector(".scaling-tick-labels");
    grid.replaceChildren(); ticks.replaceChildren();
    [2, 2.5, 3, 3.5].forEach(loss => {
      const y = yForLoss(loss);
      grid.appendChild(el("path", { d: "M" + plot.x0 + " " + y + "H" + plot.x1 }));
      ticks.appendChild(el("text", { x: plot.x0 - 10, y: y + 4, "text-anchor": "end" }, loss.toLocaleString("it-IT")));
    });
    (width < 420 ? [18, 21, 23, 25] : [18, 20, 22, 24, 25]).forEach(log => {
      ticks.appendChild(el("text", { x: xForLogCompute(log), y: plot.y1 + 25, "text-anchor": "middle" }, "10" + toSuperscript(log)));
    });
    const axisY = scalingPlot.querySelector(".scaling-axis-title-y");
    axisY.removeAttribute("transform");
    axisY.setAttribute("x", plot.x0); axisY.setAttribute("y", 22);
    axisY.textContent = "Training loss · meno è meglio";
    const axisX = scalingPlot.querySelector(".scaling-axis-title-x");
    axisX.setAttribute("x", plot.x1); axisX.setAttribute("y", height - 10);
    axisX.textContent = "Compute (FLOPs) · scala logaritmica →";
    scalingGuideX.setAttribute("x1", plot.x0);
    scalingGuideY.setAttribute("y1", plot.y0);
    const curve = [];
    for (let i = 0; i <= 140; i++) {
      const point = computeOptimalPoint(plot.logMin + (plot.logMax - plot.logMin) * i / 140);
      curve.push((i ? "L" : "M") + point.x.toFixed(2) + " " + point.y.toFixed(2));
    }
    scalingFitPath.setAttribute("d", curve.join(" "));
    scalingFitArea.setAttribute("d", curve.join(" ") + " L" + plot.x1 + " " + plot.y1 + " L" + plot.x0 + " " + plot.y1 + " Z");
  };

  const renderScalingState = () => {
    const point = computeOptimalPoint(Number(scalingRange.value));
    const computeLabel = `${formatScientific(point.compute)} FLOPs`;
    const compactComputeLabel = formatScientific(point.compute);
    const lossNumber = point.loss.toLocaleString("it-IT", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    const lossLabel = `${lossNumber} nats/token`;
    scalingOutput.value = compactComputeLabel;
    scalingOutput.textContent = compactComputeLabel;
    scalingMultiple.textContent = formatMultiplier(point.compute / 1e18);
    scalingParams.textContent = formatLargeCount(point.parameters);
    scalingTokens.textContent = formatLargeCount(point.tokens);
    scalingLoss.textContent = lossNumber;
    scalingPoint.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
    scalingGuideX.setAttribute("x2", point.x.toFixed(2));
    scalingGuideX.setAttribute("y1", point.y.toFixed(2));
    scalingGuideX.setAttribute("y2", point.y.toFixed(2));
    scalingGuideY.setAttribute("x1", point.x.toFixed(2));
    scalingGuideY.setAttribute("x2", point.x.toFixed(2));
    scalingGuideY.setAttribute("y2", point.y.toFixed(2));
    const calloutX = Math.max(plot.x0, Math.min(plot.x1 - 176, point.x > (plot.x0 + plot.x1) / 2 ? point.x - 188 : point.x + 12));
    const calloutY = Math.max(plot.y0 + 4, Math.min(plot.y1 - 60, point.y - 70));
    scalingCallout.setAttribute("transform", `translate(${calloutX.toFixed(2)} ${calloutY.toFixed(2)})`);
    scalingCalloutLoss.textContent = `LOSS ${lossNumber}`;
    scalingCalloutCompute.textContent = computeLabel;
    const progress = ((Number(scalingRange.value) - Number(scalingRange.min)) / (Number(scalingRange.max) - Number(scalingRange.min))) * 100;
    scalingRange.style.setProperty("--scaling-progress", `${progress}%`);
    scalingPresets.forEach(button => {
      const active = Math.abs(Number(button.dataset.scalingPreset) - Number(scalingRange.value)) < 0.001;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    scalingRange.setAttribute("aria-valuetext", `${computeLabel}; ${formatLargeCount(point.parameters)} di parametri; ${formatLargeCount(point.tokens)} di token; loss prevista ${lossLabel}`);
  };

  scalingRange.addEventListener("input", renderScalingState);
  const selectScalingPoint = event => {
    const bounds = scalingPlot.getBoundingClientRect();
    const svgX = ((event.clientX - bounds.left) / bounds.width) * scalingPlot.viewBox.baseVal.width;
    const clampedX = Math.max(plot.x0, Math.min(plot.x1, svgX));
    const logCompute = plot.logMin + ((clampedX - plot.x0) / (plot.x1 - plot.x0)) * (plot.logMax - plot.logMin);
    scalingRange.value = logCompute.toFixed(4);
    renderScalingState();
  };
  scalingPlot.addEventListener("pointerdown", event => {
    if (!event.isPrimary) return;
    scalingPlot.setPointerCapture(event.pointerId);
    selectScalingPoint(event);
  });
  scalingPlot.addEventListener("pointermove", event => {
    if (scalingPlot.hasPointerCapture(event.pointerId)) selectScalingPoint(event);
  });
  const releaseScaling = event => {
    if (scalingPlot.hasPointerCapture(event.pointerId)) scalingPlot.releasePointerCapture(event.pointerId);
  };
  scalingPlot.addEventListener("pointerup", releaseScaling);
  scalingPlot.addEventListener("pointercancel", releaseScaling);
  let scalingResize;
  window.addEventListener("resize", () => {
    clearTimeout(scalingResize);
    scalingResize = setTimeout(() => { layoutScalingPlot(); renderScalingState(); }, 100);
  });
  layoutScalingPlot();
  scalingPresets.forEach(button => button.addEventListener("click", () => {
    scalingRange.value = button.dataset.scalingPreset;
    renderScalingState();
  }));
  renderScalingState();
}

const lifecycleLab = document.getElementById("lifecycle-lab");
const lifecycleButtons = [...document.querySelectorAll("[data-lifecycle]")];
const lifecycleKicker = document.getElementById("lifecycle-kicker");
const lifecycleReadingTitle = document.getElementById("lifecycle-reading-title");
const lifecycleCopy = document.getElementById("lifecycle-copy");
const lifecycleCaveat = document.getElementById("lifecycle-caveat");
const lifecycleLink = document.getElementById("lifecycle-link");
const lifecycleLinkLabel = document.getElementById("lifecycle-link-label");

if (lifecycleLab && lifecycleButtons.length && lifecycleKicker && lifecycleReadingTitle && lifecycleCopy && lifecycleCaveat && lifecycleLink && lifecycleLinkLabel) {
  const lifecycleContent = {
    pretraining: {
      kicker: "01 · Pretraining",
      title: "Costruire il modello base",
      copy: "Dati, parametri e calcolo vengono combinati per ridurre l'errore di previsione. Il simulatore Chinchilla descrive questa fase con un budget di addestramento fissato.",
      caveat: "È una regolarità empirica sulla loss di pretraining: capacità specifiche, architetture moderne e costo di utilizzo richiedono altre misure.",
      href: "#scaling-laws",
      link: "Torna al simulatore Chinchilla"
    },
    posttraining: {
      kicker: "02 · Post-training",
      title: "Orientare la capacità verso un comportamento utile",
      copy: "Fine-tuning, preferenze, dati sintetici e reinforcement learning insegnano al modello come rispondere, ragionare e usare strumenti dopo la formazione della base.",
      caveat: "Il post-training può sbloccare capacità latenti e specializzarle. Il guadagno dipende dagli esempi, dagli obiettivi e dalle valutazioni usate.",
      href: "algoritmi.html#sblocco",
      link: "Continua nel capitolo Algoritmi"
    },
    inference: {
      kicker: "03 · Inferenza",
      title: "Spendere compute per la singola domanda",
      copy: "Più token di ragionamento, verifiche, strumenti o agenti paralleli possono aumentare il lavoro svolto dallo stesso modello su un compito difficile.",
      caveat: "Il vantaggio dipende dal problema e aumenta latenza, energia e costo: più compute non garantisce automaticamente una risposta migliore.",
      href: "inferenza.html#compute-evolution",
      link: "Continua nel capitolo Inferenza"
    }
  };

  const renderLifecycle = stage => {
    const content = lifecycleContent[stage];
    if (!content) return;
    lifecycleLab.dataset.lifecycleStage = stage;
    lifecycleKicker.textContent = content.kicker;
    lifecycleReadingTitle.textContent = content.title;
    lifecycleCopy.textContent = content.copy;
    lifecycleCaveat.textContent = content.caveat;
    lifecycleLink.href = content.href;
    lifecycleLinkLabel.textContent = content.link;
    lifecycleButtons.forEach(button => {
      const active = button.dataset.lifecycle === stage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  lifecycleButtons.forEach(button => button.addEventListener("click", () => {
    renderLifecycle(button.dataset.lifecycle);
  }));
  renderLifecycle(lifecycleLab.dataset.lifecycleStage || "inference");
}

const siteMapExplorer = document.getElementById("site-map-explorer");
if (siteMapExplorer) {
  const siteMapNodes = [...siteMapExplorer.querySelectorAll("[data-map-node]")];
  const siteMapLinks = [...siteMapExplorer.querySelectorAll("[data-map-link]")];
  const siteMapDetailKind = document.getElementById("site-map-detail-kind");
  const siteMapDetailIndex = document.getElementById("site-map-detail-index");
  const siteMapDetailTitle = document.getElementById("site-map-detail-title");
  const siteMapDetailDescription = document.getElementById("site-map-detail-description");
  const siteMapDetailLink = document.getElementById("site-map-detail-link");
  const doubleTapWindow = 450;
  const tapMovementTolerance = 18;
  const doubleTapDistanceTolerance = 42;
  let lastTouchTap = null;
  let isOpeningSiteMapPage = false;

  const resetSiteMapNavigationState = () => {
    lastTouchTap = null;
    isOpeningSiteMapPage = false;
  };

  window.addEventListener("pageshow", resetSiteMapNavigationState);

  const selectSiteMapNode = node => {
    const selectedPath = (node.dataset.mapPath || "").split(" ").filter(Boolean);
    const relatedNodes = new Set(["home", ...selectedPath]);
    const activeAccent = getComputedStyle(node).getPropertyValue("--map-accent").trim() || "var(--home-coral)";

    siteMapExplorer.style.setProperty("--site-map-active", activeAccent);
    siteMapNodes.forEach(candidate => {
      const isActive = candidate === node;
      candidate.classList.toggle("is-active", isActive);
      candidate.classList.toggle("is-related", !isActive && relatedNodes.has(candidate.dataset.mapNode));
      candidate.setAttribute("aria-pressed", String(isActive));
    });
    siteMapLinks.forEach(link => link.classList.toggle("is-active", selectedPath.includes(link.dataset.mapLink)));

    siteMapDetailKind.textContent = node.dataset.mapKind;
    siteMapDetailIndex.textContent = node.dataset.mapIndex;
    siteMapDetailTitle.textContent = node.dataset.mapTitle;
    siteMapDetailDescription.textContent = node.dataset.mapDescription;
    siteMapDetailLink.href = node.dataset.mapHref;
    siteMapDetailLink.firstChild.textContent = `${node.dataset.mapAction} `;
  };

  const openSiteMapNode = node => {
    const targetPage = node.dataset.mapHref;
    if (!targetPage || isOpeningSiteMapPage) return;
    isOpeningSiteMapPage = true;
    window.location.assign(targetPage);
  };

  siteMapNodes.forEach((node, index) => {
    let touchStart = null;

    node.addEventListener("click", () => selectSiteMapNode(node));
    node.addEventListener("dblclick", () => openSiteMapNode(node));
    node.addEventListener("pointerdown", event => {
      if (event.pointerType !== "touch" || !event.isPrimary) return;
      touchStart = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
    });
    node.addEventListener("pointerup", event => {
      if (
        event.pointerType !== "touch" ||
        !event.isPrimary ||
        !touchStart ||
        touchStart.pointerId !== event.pointerId
      ) return;

      const tapDistance = Math.hypot(
        event.clientX - touchStart.x,
        event.clientY - touchStart.y
      );
      touchStart = null;
      if (tapDistance > tapMovementTolerance) {
        lastTouchTap = null;
        return;
      }

      const now = performance.now();
      const isDoubleTap = lastTouchTap &&
        lastTouchTap.node === node &&
        now - lastTouchTap.time <= doubleTapWindow &&
        Math.hypot(
          event.clientX - lastTouchTap.x,
          event.clientY - lastTouchTap.y
        ) <= doubleTapDistanceTolerance;

      if (isDoubleTap) {
        event.preventDefault();
        lastTouchTap = null;
        openSiteMapNode(node);
        return;
      }

      lastTouchTap = {
        node,
        time: now,
        x: event.clientX,
        y: event.clientY
      };
    });
    node.addEventListener("pointercancel", () => {
      touchStart = null;
      lastTouchTap = null;
    });
    node.addEventListener("keydown", event => {
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(index + 1, siteMapNodes.length - 1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(index - 1, 0);
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = siteMapNodes.length - 1;
      else return;

      event.preventDefault();
      siteMapNodes[nextIndex].focus();
      selectSiteMapNode(siteMapNodes[nextIndex]);
    });
  });

  selectSiteMapNode(siteMapNodes.find(node => node.classList.contains("is-active")) || siteMapNodes[0]);
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

const landianTriggers = [...document.querySelectorAll("[data-landian-trigger]")];
const landianTransmission = document.querySelector("[data-landian-transmission]");
const landianExit = document.querySelector("[data-landian-exit]");
const deepseekNews = document.getElementById("deepseek-liang-investor-meeting");
const newsSpookyModeEvent = "aiit:news-spooky-mode";

if (landianTriggers.length && landianTransmission && landianExit && deepseekNews) {
  const requiredLandianClicks = 7;
  const landianClickWindow = 8000;
  const reduceLandianMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const landianThemeColor = document.getElementById("theme-color");
  let landianClicks = [];
  let landianResetTimer;
  let lastLandianTrigger = landianTriggers[0];

  const resetLandianProgress = () => {
    landianClicks = [];
    document.body.removeAttribute("data-landian-progress");
    landianTriggers.forEach(trigger => {
      trigger.classList.remove("is-counting");
      delete trigger.dataset.landianCount;
    });
  };

  const restoreLandianThemeColor = () => {
    if (!landianThemeColor) return;
    const isDark = document.documentElement.dataset.theme === "dark";
    landianThemeColor.setAttribute("content", isDark ? "#090b09" : "#f2f0e8");
  };

  const deactivateLandianMode = (returnFocus = true) => {
    if (!document.body.classList.contains("landian-news-awake")) return;
    document.body.classList.remove("landian-news-awake");
    landianTransmission.hidden = true;
    landianTriggers.forEach(trigger => trigger.setAttribute("aria-pressed", "false"));
    resetLandianProgress();
    restoreLandianThemeColor();
    if (returnFocus) lastLandianTrigger.focus({ preventScroll: true });
  };

  document.addEventListener(newsSpookyModeEvent, event => {
    if (event.detail?.source === "deepseek") return;
    if (document.body.classList.contains("landian-news-awake")) deactivateLandianMode(false);
    else resetLandianProgress();
  });

  const activateLandianMode = trigger => {
    lastLandianTrigger = trigger;
    document.dispatchEvent(new CustomEvent(newsSpookyModeEvent, { detail: { source: "deepseek" } }));
    clearTimeout(landianResetTimer);
    resetLandianProgress();
    document.body.classList.add("landian-news-awake");
    landianTransmission.hidden = false;
    landianTriggers.forEach(item => item.setAttribute("aria-pressed", "true"));
    if (landianThemeColor) landianThemeColor.setAttribute("content", "#020302");
    landianTransmission.scrollIntoView({
      behavior: reduceLandianMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    landianTransmission.focus({ preventScroll: true });
  };

  landianTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      if (document.body.classList.contains("landian-news-awake")) return;

      const now = performance.now();
      landianClicks = landianClicks.filter(time => now - time <= landianClickWindow);
      landianClicks.push(now);
      const progress = Math.min(landianClicks.length, requiredLandianClicks);

      document.body.dataset.landianProgress = String(progress);
      landianTriggers.forEach(item => {
        item.dataset.landianCount = String(progress).padStart(2, "0");
        item.classList.add("is-counting");
      });

      clearTimeout(landianResetTimer);
      landianResetTimer = window.setTimeout(resetLandianProgress, landianClickWindow);

      if (progress >= requiredLandianClicks) activateLandianMode(trigger);
    });
  });

  landianExit.addEventListener("click", () => deactivateLandianMode(true));

  deepseekNews.addEventListener("toggle", () => {
    if (!deepseekNews.open) deactivateLandianMode(false);
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !document.body.classList.contains("landian-news-awake")) return;
    event.preventDefault();
    deactivateLandianMode(true);
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      window.setTimeout(() => {
        if (document.body.classList.contains("landian-news-awake") && landianThemeColor) {
          landianThemeColor.setAttribute("content", "#020302");
        }
      }, 0);
    });
  }
}

const pacingSpookyTrigger = document.querySelector("[data-pacing-spooky-trigger]");
const pacingSpookyTransmission = document.querySelector("[data-pacing-spooky-transmission]");
const pacingSpookyExit = document.querySelector("[data-pacing-spooky-exit]");
const pacingNews = document.getElementById("pacing-the-frontier");

if (pacingSpookyTrigger && pacingSpookyTransmission && pacingSpookyExit && pacingNews) {
  const requiredPacingSpookyClicks = 7;
  const pacingSpookyClickWindow = 8000;
  const reducePacingSpookyMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pacingSpookyThemeColor = document.getElementById("theme-color");
  let pacingSpookyClicks = [];
  let pacingSpookyResetTimer;

  const resetPacingSpookyProgress = () => {
    pacingSpookyClicks = [];
    document.body.removeAttribute("data-pacing-spooky-progress");
    pacingSpookyTrigger.classList.remove("is-counting");
    delete pacingSpookyTrigger.dataset.pacingSpookyCount;
    pacingSpookyTrigger.setAttribute("aria-label", "voce");
  };

  const restorePacingSpookyThemeColor = () => {
    if (!pacingSpookyThemeColor) return;
    const isDark = document.documentElement.dataset.theme === "dark";
    pacingSpookyThemeColor.setAttribute("content", isDark ? "#090b09" : "#f2f0e8");
  };

  const deactivatePacingSpookyMode = (returnFocus = true) => {
    if (!document.body.classList.contains("pacing-news-awake")) return;
    document.body.classList.remove("pacing-news-awake");
    pacingSpookyTransmission.hidden = true;
    pacingSpookyTrigger.setAttribute("aria-expanded", "false");
    resetPacingSpookyProgress();
    restorePacingSpookyThemeColor();
    if (returnFocus) pacingSpookyTrigger.focus({ preventScroll: true });
  };

  document.addEventListener(newsSpookyModeEvent, event => {
    if (event.detail?.source === "pacing") return;
    if (document.body.classList.contains("pacing-news-awake")) deactivatePacingSpookyMode(false);
    else resetPacingSpookyProgress();
  });

  const activatePacingSpookyMode = () => {
    document.dispatchEvent(new CustomEvent(newsSpookyModeEvent, { detail: { source: "pacing" } }));
    clearTimeout(pacingSpookyResetTimer);
    resetPacingSpookyProgress();
    document.body.classList.add("pacing-news-awake");
    pacingSpookyTransmission.hidden = false;
    pacingSpookyTrigger.setAttribute("aria-expanded", "true");
    pacingSpookyTrigger.setAttribute("aria-label", "voce, Spooky Theme attivo");
    if (pacingSpookyThemeColor) pacingSpookyThemeColor.setAttribute("content", "#020302");
    pacingSpookyTransmission.scrollIntoView({
      behavior: reducePacingSpookyMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    pacingSpookyTransmission.focus({ preventScroll: true });
  };

  pacingSpookyTrigger.addEventListener("click", () => {
    if (document.body.classList.contains("pacing-news-awake")) {
      deactivatePacingSpookyMode(true);
      return;
    }

    const now = performance.now();
    pacingSpookyClicks = pacingSpookyClicks.filter(time => now - time <= pacingSpookyClickWindow);
    pacingSpookyClicks.push(now);
    const progress = Math.min(pacingSpookyClicks.length, requiredPacingSpookyClicks);

    document.body.dataset.pacingSpookyProgress = String(progress);
    pacingSpookyTrigger.dataset.pacingSpookyCount = String(progress).padStart(2, "0");
    pacingSpookyTrigger.classList.add("is-counting");
    pacingSpookyTrigger.setAttribute("aria-label", `voce, ${progress} clic su 7`);

    clearTimeout(pacingSpookyResetTimer);
    pacingSpookyResetTimer = window.setTimeout(resetPacingSpookyProgress, pacingSpookyClickWindow);

    if (progress >= requiredPacingSpookyClicks) activatePacingSpookyMode();
  });

  pacingSpookyExit.addEventListener("click", () => deactivatePacingSpookyMode(true));

  pacingNews.addEventListener("toggle", () => {
    if (pacingNews.open) return;
    if (document.body.classList.contains("pacing-news-awake")) deactivatePacingSpookyMode(false);
    else resetPacingSpookyProgress();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !document.body.classList.contains("pacing-news-awake")) return;
    event.preventDefault();
    deactivatePacingSpookyMode(true);
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      window.setTimeout(() => {
        if (document.body.classList.contains("pacing-news-awake") && pacingSpookyThemeColor) {
          pacingSpookyThemeColor.setAttribute("content", "#020302");
        }
      }, 0);
    });
  }
}

const expandableNewsItems = document.querySelectorAll("details.news-list-item");

// The annual budgets live beside their explanations in novita.html.
// Keeping the mileage fixed makes each break-even fare annual cost / 10,000.
const cybercabCost = document.getElementById("cybercab-cost");
if (cybercabCost) {
  const annualKm = Number(cybercabCost.dataset.annualKm);
  const taxiRate = Number(cybercabCost.dataset.taxiRate);
  const budget = [...cybercabCost.querySelectorAll("[data-cc-cost]")];
  const car = {
    min: budget.reduce((sum, item) => sum + Number(item.dataset.min), 0),
    max: budget.reduce((sum, item) => sum + Number(item.dataset.max), 0)
  };
  const garageBudget = cybercabCost.querySelector("[data-cc-garage]").dataset;
  const garage = { min: car.min + Number(garageBudget.min), max: car.max + Number(garageBudget.max) };
  const input = document.getElementById("cybercab-km-price");
  const chart = document.getElementById("cybercab-cost-chart");
  const plot = cybercabCost.querySelector(".cybercab-cost-plot");
  const zoomButton = document.getElementById("cybercab-cost-zoom");
  const number = value => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0, useGrouping: "always" }).format(value);
  const fare = value => new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const euroRange = range => `${number(range.min)}–${number(range.max)}`;
  const threshold = range => `${fare(range.min / annualKm)}–${fare(range.max / annualKm)} €/km`;
  let zoomed = false;

  for (const [name, range] of [["car", car], ["garage", garage]]) {
    const panel = cybercabCost.querySelector(`[data-cc-scenario="${name}"]`);
    panel.querySelector("[data-cc-annual]").innerHTML = `${euroRange(range)} €<small>/anno</small>`;
    panel.querySelector("[data-cc-threshold]").textContent = threshold(range);
  }

  const compare = (annual, range, label) => {
    if (annual < range.min) return `${label}: risparmi ${number(range.min - annual)}–${number(range.max - annual)} € l’anno.`;
    if (annual > range.max) return `${label}: spendi ${number(annual - range.max)}–${number(annual - range.min)} € in più l’anno.`;
    if (annual === range.min) return `${label}: pareggi lo scenario meno costoso; negli altri risparmi fino a ${number(range.max - annual)} €.`;
    if (annual === range.max) return `${label}: pareggi lo scenario più costoso; negli altri spendi fino a ${number(annual - range.min)} € in più.`;
    return `${label}: dipende dalle tue spese, da ${number(annual - range.min)} € in più a ${number(range.max - annual)} € di risparmio l’anno.`;
  };

  const drawCybercabCost = () => {
    const width = Math.round(plot.getBoundingClientRect().width);
    if (!width) return; // The article starts closed; ResizeObserver draws on opening.
    const height = 410;
    const left = 58, right = width - 16, top = 58, bottom = height - 65;
    const maxRate = zoomed ? 0.8 : taxiRate;
    const rate = Number(input.value);
    const x = value => left + value / maxRate * (right - left);
    const y = value => bottom - value / (maxRate * annualKm) * (bottom - top);
    const text = (px, py, content, anchor = "start", className = "") => `<text x="${px}" y="${py}" text-anchor="${anchor}" class="${className}">${content}</text>`;
    let marks = `<defs><pattern id="cc-garage-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path class="cc-hatch" d="M-2 2L2 -2M0 8L8 0M6 10L10 6"/></pattern></defs>`;
    marks += text(left, 20, "Spesa annua (€)");
    for (let tick = 0; tick <= 4; tick += 1) {
      const cost = maxRate * annualKm * tick / 4;
      marks += `<path class="cc-grid" d="M${left} ${y(cost)}H${right}"/>`;
      marks += text(left - 9, y(cost) + 4, number(cost), "end", "cc-tick");
      marks += text(x(maxRate * tick / 4), bottom + 25, tick ? fare(maxRate * tick / 4) : "0", tick === 4 ? "end" : "middle", "cc-tick");
    }
    for (const [range, type] of [[car, "car"], [garage, "garage"]]) {
      const rect = `x="${left}" y="${y(range.max)}" width="${right - left}" height="${y(range.min) - y(range.max)}"`;
      marks += `<rect class="cc-${type}-band" ${rect}/>`;
      if (type === "garage") marks += `<rect ${rect} fill="url(#cc-garage-hatch)"/>`;
    }
    marks += `<path class="cc-axis" d="M${left} ${top}V${bottom}H${right}"/>`;
    marks += `<path class="cc-fare-line" d="M${left} ${bottom}L${right} ${top}"/>`;
    for (const cost of [car.min, car.max, garage.min, garage.max]) {
      marks += `<circle class="cc-point" cx="${x(cost / annualKm)}" cy="${y(cost)}" r="3.5"/>`;
    }
    marks += text(right - 8, y((car.min + car.max) / 2) + 5, "Senza garage", "end", "cc-band-label");
    marks += text(right - 8, y((garage.min + garage.max) / 2) + 5, "Con garage", "end", "cc-band-label");
    if (rate <= maxRate) {
      marks += `<path class="cc-selected-guide" d="M${x(rate)} ${bottom}V${y(rate * annualKm)}H${left}"/>`;
      marks += `<circle class="cc-selected-point" cx="${x(rate)}" cy="${y(rate * annualKm)}" r="6"/>`;
    }
    if (!zoomed) {
      marks += `<rect class="cc-taxi-point" x="${x(taxiRate) - 5}" y="${y(taxiRate * annualKm) - 5}" width="10" height="10"/>`;
      marks += text(right - 8, top - 14, `Taxi: ipotesi ${fare(taxiRate)} €/km`, "end");
    }
    marks += text((left + right) / 2, height - 8, "Prezzo medio corse (€/km)", "middle");
    chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
    chart.querySelector(".cc-plot-marks").innerHTML = marks;
    document.getElementById("cybercab-chart-scale").textContent = zoomed
      ? `Zoom · 0–0,80 €/km${rate > maxRate ? " · prezzo selezionato fuori scala" : ""}`
      : "Scala completa · 0–2 €/km";
    zoomButton.setAttribute("aria-pressed", String(zoomed));
    zoomButton.textContent = zoomed ? "Mostra anche il taxi" : "Zoom sul pareggio";
  };

  const updateCybercabCost = () => {
    const rate = Number(input.value);
    const annual = Math.round(rate * annualKm);
    input.setAttribute("aria-valuetext", `${fare(rate)} euro al chilometro, ${number(annual)} euro all’anno`);
    document.getElementById("cybercab-km-price-value").textContent = `${fare(rate)} €/km`;
    document.getElementById("cybercab-annual-price").innerHTML = `${number(annual)} €<small>/anno</small>`;
    document.getElementById("cybercab-cost-verdict").textContent = `${compare(annual, car, "Senza garage")} ${compare(annual, garage, "Con garage")}`;
    document.getElementById("cybercab-chart-description").textContent = `Per ${number(annualKm)} km annui, corse a ${fare(rate)} euro al km costano ${number(annual)} euro. Mantenimento auto: ${euroRange(car)} euro senza garage e ${euroRange(garage)} euro con garage. Pareggio rispettivamente a ${threshold(car)} e ${threshold(garage)}. Taxi nell’ipotesi a ${fare(taxiRate)} euro al km: ${number(taxiRate * annualKm)} euro annui. Acquisto escluso.`;
    drawCybercabCost();
  };
  input.addEventListener("input", () => {
    if (Number(input.value) > 0.8) zoomed = false;
    updateCybercabCost();
  });
  zoomButton.addEventListener("click", () => { zoomed = !zoomed; drawCybercabCost(); });
  new ResizeObserver(drawCybercabCost).observe(plot);
  cybercabCost.querySelector(".cybercab-cost-controls").hidden = false;
  cybercabCost.querySelector(".cybercab-cost-toolbar").hidden = false;
  updateCybercabCost();

  const openCybercabAnchor = () => {
    const anchor = location.hash.slice(1);
    if (!["n19-cybercab", "cybercab-cost", "cybercab-cost-title"].includes(anchor)) return;
    cybercabCost.closest("details.news-list-item").open = true;
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: "start", behavior: "auto" }));
  };
  window.addEventListener("hashchange", openCybercabAnchor);
  openCybercabAnchor();
}

const activeSystemSubnavLink = document.querySelector('.system-subnav [aria-current="page"]');
if (activeSystemSubnavLink) {
  window.requestAnimationFrame(() => {
    const subnav = activeSystemSubnavLink.closest(".system-subnav");
    if (!subnav || subnav.scrollWidth <= subnav.clientWidth) return;
    const centeredLeft = activeSystemSubnavLink.offsetLeft - ((subnav.clientWidth - activeSystemSubnavLink.offsetWidth) / 2);
    subnav.scrollTo({ left: Math.max(0, centeredLeft), behavior: "auto" });
  });
}

if (expandableNewsItems.length) {
  const reduceNewsMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  expandableNewsItems.forEach(newsItem => {
    const summary = newsItem.querySelector(":scope > summary");
    const footerActions = newsItem.querySelector(".news-item-footer > div");
    if (!summary || !footerActions || footerActions.querySelector(".news-item-close")) return;

    const closeButton = document.createElement("button");
    const title = summary.querySelector(".news-item-title")?.textContent?.trim();
    closeButton.className = "news-item-close";
    closeButton.type = "button";
    closeButton.textContent = "Meno";
    closeButton.setAttribute("aria-label", title ? `Riduci la notizia: ${title}` : "Riduci la notizia");

    closeButton.addEventListener("click", () => {
      newsItem.open = false;
      summary.focus({ preventScroll: true });
      window.requestAnimationFrame(() => {
        summary.scrollIntoView({
          behavior: reduceNewsMotion.matches ? "auto" : "smooth",
          block: "center"
        });
      });
    });

    footerActions.append(closeButton);
  });
}
