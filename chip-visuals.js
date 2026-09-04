/* Editorial chart contracts: historical milestones use dated dots with a log
 * count axis; comparisons use zero-based bars and exact labels. Illustrative
 * labs explicitly expose their assumptions. One blue root plus neutral marks;
 * selection also uses outlines, labels and aria-pressed. No chart library. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  if (!$("cc-hardware-bars")) return;
  const number = (n, digits = 1) => new Intl.NumberFormat("it-IT", { maximumFractionDigits: digits }).format(n);
  const source = (href, label) => `<a href="${href}" target="_blank" rel="noreferrer">${label} ↗</a>`;
  const sources = {
    intel: "https://software.intel.com/content/dam/www/public/us/en/documents/corporate-information/museum-transistors-to-transformations-brochure.pdf",
    a100: "https://www.nvidia.com/en-us/data-center/a100/",
    h100: "https://www.nvidia.com/en-us/data-center/h100/",
    b200: "https://www.nvidia.com/en-us/data-center/dgx-b200/",
    b300: "https://docs.nvidia.com/dgx/dgxb300-user-guide/introduction-to-dgxb300.html",
    rubin: "https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/",
    rubinArchitecture: "https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/",
    mi455: "https://www.amd.com/en/products/accelerators/instinct/mi400/mi455x.html"
  };
  const milestones = [
    { year: 1971, name: "Intel 4004", count: 2300, kind: "CPU", source: sources.intel },
    { year: 1978, name: "Intel 8086", count: 29000, kind: "CPU", source: sources.intel },
    { year: 1982, name: "Intel 286", count: 134000, kind: "CPU", source: sources.intel },
    { year: 1993, name: "Intel Pentium", count: 3100000, kind: "CPU", source: sources.intel },
    { year: 2000, name: "Intel Pentium 4", count: 42000000, kind: "CPU", source: sources.intel },
    { year: 2020, name: "NVIDIA A100", count: 54200000000, kind: "GPU", source: "https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf" },
    { year: 2022, name: "NVIDIA H100", count: 80000000000, kind: "GPU", source: "https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/" },
    { year: 2024, name: "NVIDIA Blackwell", count: 208000000000, kind: "GPU · due die", source: "https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/" },
    { year: 2026, name: "NVIDIA Rubin", count: 336000000000, kind: "GPU · due die", source: sources.rubinArchitecture }
  ];
  const countLabel = value => value >= 1e9 ? `${number(value / 1e9)} miliardi` : value >= 1e6 ? `${number(value / 1e6)} milioni` : number(value, 0);
  let milestoneIndex = 8;
  $("cc-milestone").innerHTML = milestones.map((d, i) => `<option value="${i}"${i === milestoneIndex ? " selected" : ""}>${d.year} · ${d.name}</option>`).join("");
  $("cc-transistor-table").innerHTML = `<table><caption>Dispositivi selezionati: conteggi dichiarati</caption><thead><tr><th>Anno / dispositivo</th><th>Transistor</th><th>Fonte</th></tr></thead><tbody>${milestones.map(d => `<tr><th>${d.year} · ${d.name}</th><td>${number(d.count, 0)}</td><td>${source(d.source, "Produttore")}</td></tr>`).join("")}</tbody></table>`;

  function renderMilestones() {
    const container = $("cc-transistor-plot");
    const width = Math.max(250, Math.round(container.clientWidth));
    const height = width < 500 ? 310 : 370;
    const left = width < 500 ? 54 : 75, right = 22, top = 25, bottom = 46;
    const x = year => left + (year - 1971) / 55 * (width - left - right);
    const y = count => height - bottom - (Math.log10(count) - 3) / 9 * (height - top - bottom);
    const ticks = [[1e3, "mille"], [1e6, "1 mln"], [1e9, "1 mld"], [1e12, "1.000 mld"]];
    const dates = width < 500 ? [1971, 2000, 2026] : [1971, 1980, 1990, 2000, 2010, 2026];
    container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Transistor su scala logaritmica: da 2.300 nel 1971 a 336 miliardi nel 2026. Usa il selettore per leggere ogni chip.">
      ${ticks.map(([value, label]) => `<line class="cc-grid-line" x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}"/><text class="cc-tick" text-anchor="end" x="${left - 9}" y="${y(value) + 4}">${label}</text>`).join("")}
      ${dates.map(year => `<text class="cc-tick" text-anchor="middle" x="${x(year)}" y="${height - 18}">${year}</text>`).join("")}
      <text class="cc-tick" x="${left}" y="14">Transistor · scala logaritmica</text>
      ${milestones.map((d, i) => `<circle class="cc-milestone-dot${i === milestoneIndex ? " is-selected" : ""}${d.kind.startsWith("CPU") ? " is-cpu" : ""}" cx="${x(d.year)}" cy="${y(d.count)}" r="${i === milestoneIndex ? 9 : 5}"><title>${d.year} · ${d.name}: ${countLabel(d.count)} transistor</title></circle>`).join("")}
    </svg>`;
    const d = milestones[milestoneIndex];
    $("cc-milestone-detail").innerHTML = `<span>${d.year} · ${d.kind}</span><strong>${d.name}</strong><p><b>${countLabel(d.count)} transistor</b> · ${number(d.count / 2300, 0)} volte il conteggio del 4004.</p>`;
  }
  $("cc-milestone").addEventListener("change", event => { milestoneIndex = Number(event.target.value); renderMilestones(); });
  new ResizeObserver(renderMilestones).observe($("cc-transistor-plot"));
  renderMilestones();

  const productivity = [["1948–1960", 2.8], ["1960–1973", 3], ["1973–1981", 1.1], ["1981–1997", 1.7], ["1997–2005", 3.3], ["2005–2018", 1.4]];
  $("cc-productivity-bars").innerHTML = `<div class="cc-scale"><span>0%</span><span>2%</span><span>4%</span></div>${productivity.map(([label, value]) => `<div class="cc-bar-item"><div class="cc-bar-label"><span>${label}</span><strong>${number(value)}%</strong></div><div class="cc-bar-track" aria-hidden="true"><i style="width:${value / 4 * 100}%"></i></div></div>`).join("")}`;

  const taskCells = Array.from({ length: 32 }, (_, i) => `<i data-cell="${i}"></i>`).join("");
  $("cc-cpu-grid").innerHTML = $("cc-gpu-grid").innerHTML = taskCells;
  let work = "independent";
  function renderParallel() {
    const step = Number($("cc-parallel-step").value);
    const cpu = Math.min(32, step), gpu = Math.min(32, step * (work === "independent" ? 8 : 1));
    $("cc-step-label").textContent = `Passo ${step} di 32`;
    $("cc-parallel-step").setAttribute("aria-valuetext", `Passo ${step}: un esecutore ${cpu} operazioni, otto esecutori ${gpu} operazioni`);
    $("cc-cpu-count").textContent = `${cpu} / 32`;
    $("cc-gpu-count").textContent = `${gpu} / 32`;
    for (const [id, done] of [["cc-cpu-grid", cpu], ["cc-gpu-grid", gpu]]) $(id).querySelectorAll("i").forEach((cell, i) => cell.classList.toggle("is-done", i < done));
    $("cc-parallel-explanation").textContent = work === "independent" ? "Le operazioni indipendenti riempiono tutte le corsie." : "Sette corsie aspettano: manca il risultato del passo precedente.";
    $("cc-parallel-result").innerHTML = work === "independent" ? "<strong>32 passi oppure 4.</strong><p>Nel modello ideale, dividere il lavoro indipendente tra otto esecutori lo completa in un ottavo dei passi.</p>" : "<strong>32 passi in entrambi i casi.</strong><p>Aggiungere esecutori non spezza una catena di dipendenze. Il programma deve offrire lavoro da distribuire.</p>";
  }
  document.querySelectorAll("[data-cc-work]").forEach(button => button.addEventListener("click", () => { work = button.dataset.ccWork; document.querySelectorAll("[data-cc-work]").forEach(b => b.setAttribute("aria-pressed", String(b === button))); renderParallel(); }));
  $("cc-parallel-step").addEventListener("input", renderParallel);
  renderParallel();

  function renderRoofline() {
    const bandwidth = Number($("cc-bandwidth").value), intensity = Number($("cc-intensity").value);
    const memoryCeiling = bandwidth * intensity, result = Math.min(100, memoryCeiling);
    $("cc-bandwidth-value").textContent = `${bandwidth} TB/s`;
    $("cc-intensity-value").textContent = String(intensity);
    $("cc-bandwidth").setAttribute("aria-valuetext", `${bandwidth} terabyte al secondo`);
    $("cc-intensity").setAttribute("aria-valuetext", `${intensity} operazioni per byte`);
    $("cc-roof-bars").innerHTML = `<div class="cc-scale"><span>0</span><span>50</span><span>100 TFLOP/s</span></div><div class="cc-bar-item"><div class="cc-bar-label"><span>Tetto del chip</span><strong>100 TFLOP/s</strong></div><div class="cc-bar-track cc-bar-reference" aria-hidden="true"><i style="width:100%"></i></div></div><div class="cc-bar-item"><div class="cc-bar-label"><span>Calcolo alimentato dai dati</span><strong>${result} TFLOP/s</strong></div><div class="cc-bar-track" aria-hidden="true"><i style="width:${result}%"></i></div></div>`;
    $("cc-roof-result").innerHTML = `<span>Limite attivo: ${memoryCeiling < 100 ? "memoria" : memoryCeiling === 100 ? "memoria e calcolo" : "calcolo"}</span><strong>${result}% del tetto teorico</strong><p>${memoryCeiling < 100 ? `${bandwidth} TB/s × ${intensity} operazioni per byte = ${memoryCeiling} TFLOP/s. Più unità di calcolo resterebbero comunque in attesa.` : `La memoria può alimentare ${memoryCeiling} TFLOP/s, ma il chip si ferma a 100. Aumentare ancora la banda non alza il risultato di questo modello.`}</p>`;
  }
  ["cc-bandwidth", "cc-intensity"].forEach(id => $(id).addEventListener("input", renderRoofline));
  renderRoofline();

  let bits = 16;
  function renderWeights() {
    const parameters = Number($("cc-parameters").value), size = parameters * bits / 8;
    $("cc-parameters-value").textContent = number(parameters, 0);
    $("cc-parameters").setAttribute("aria-valuetext", `${parameters} miliardi di parametri`);
    const max = parameters * 2;
    $("cc-weight-bars").innerHTML = [16, 8, 4].map(precision => `<div class="cc-bar-item${precision === bits ? " is-selected" : ""}"><div class="cc-bar-label"><span>${precision} bit${precision === bits ? " · selezionato" : ""}</span><strong>${number(parameters * precision / 8)} GB</strong></div><div class="cc-bar-track${precision !== bits ? " cc-bar-reference" : ""}" aria-hidden="true"><i style="width:${parameters * precision / 8 / max * 100}%"></i></div></div>`).join("");
    $("cc-weight-result").innerHTML = `<strong>${number(size)} GB per i soli pesi</strong><p>${number(parameters, 0)} miliardi di parametri × ${bits} bit ÷ 8. ${bits === 16 ? "Passa a 8 o 4 bit per vedere come cambia l'ingombro teorico." : `Rispetto a 16 bit, il peso teorico si riduce di ${number((1 - bits / 16) * 100)}%.`}</p>`;
  }
  $("cc-parameters").addEventListener("input", renderWeights);
  document.querySelectorAll("[data-cc-bits]").forEach(button => button.addEventListener("click", () => { bits = Number(button.dataset.ccBits); document.querySelectorAll("[data-cc-bits]").forEach(b => b.setAttribute("aria-pressed", String(b === button))); renderWeights(); }));
  renderWeights();

  const hardware = [
    { id: "a100", name: "A100 80 GB SXM", label: "A100", maker: "NVIDIA", generation: "Ampere · riferimento 2020", memory: 80, bandwidth: 2.039, type: "HBM2e", source: sources.a100, note: "La configurazione SXM da 80 GB fornisce il punto di partenza storico. Le varianti PCIe hanno specifiche diverse." },
    { id: "h100", name: "H100 SXM", label: "H100", maker: "NVIDIA", generation: "Hopper · 2022", memory: 80, bandwidth: 3.35, type: "HBM3", source: sources.h100, note: "La capacità resta a 80 GB, mentre la banda cresce. È un esempio del perché spazio disponibile e velocità di trasferimento vadano letti separatamente." },
    { id: "b200", name: "B200 in DGX B200", label: "B200", maker: "NVIDIA", generation: "Blackwell · 2024", memory: 180, bandwidth: 8, type: "HBM3e", source: sources.b200, note: "La scheda DGX B200 dichiara 1.440 GB e 64 TB/s per otto GPU: qui sono divisi per otto. Altre configurazioni Blackwell possono avere quantità di memoria differenti." },
    { id: "b300", name: "B300 in DGX B300", label: "B300", maker: "NVIDIA", generation: "Blackwell Ultra · 2025", memory: 288, bandwidth: 8, type: "HBM3e", source: sources.b300, note: "La guida DGX B300 indica 288 GB per GPU. La banda da 8 TB/s è documentata nel confronto ufficiale NVIDIA cuTile: aumenta la capacità rispetto a B200, non questo picco di banda." },
    { id: "rubin", name: "Rubin GPU", label: "Rubin", maker: "NVIDIA", generation: "2026 · specifiche preliminari", memory: 288, bandwidth: 22, type: "HBM4", source: sources.rubin, preliminary: true, note: "NVIDIA indica tutti i valori come massimi e preliminari, soggetti a modifica. Il confronto riguarda la singola GPU Rubin, non la somma delle 72 GPU del rack NVL72." },
    { id: "mi455", name: "Instinct MI455X", label: "MI455X", maker: "AMD", generation: "Lancio · 23 luglio 2026", memory: 432, bandwidth: 23.3, type: "HBM4", source: sources.mi455, note: "La scheda AMD della MI455X, progettata per Helios, dichiara 432 GB e fino a 23,3 TB/s. Questa specifica non descrive da sola la disponibilità commerciale dei sistemi o la velocità di un modello." }
  ];
  let metric = "memory", selectedHardware = "rubin";
  $("cc-hardware-table").innerHTML = `<table><caption>Specifiche per singola GPU</caption><thead><tr><th>Configurazione</th><th>Memoria</th><th>Banda HBM</th><th>Fonte</th></tr></thead><tbody>${hardware.map(d => `<tr><th>${d.name}${d.preliminary ? " (preliminare)" : ""}</th><td>${d.memory} GB</td><td>${number(d.bandwidth, 3)} TB/s</td><td>${source(d.source, d.maker)}</td></tr>`).join("")}</tbody></table><p>${source("https://build.nvidia.com/spark/cutile-kernels/platform-comparison", "NVIDIA · fonte aggiuntiva della banda B300")}</p>`;
  function renderHardware() {
    const max = metric === "memory" ? 480 : 24, unit = metric === "memory" ? "GB" : "TB/s";
    $("cc-hardware-axis").textContent = `${metric === "memory" ? "Memoria" : "Banda HBM di picco"} per singola GPU · ${unit} · scala da zero`;
    const chart = $("cc-hardware-bars");
    chart.innerHTML = `<div class="cc-scale"><span>0</span><span>${number(max / 2)}</span><span>${max} ${unit}</span></div>${hardware.map(d => `<button type="button" class="cc-hardware-row${d.preliminary ? " is-preliminary" : ""}" data-cc-hardware="${d.id}" aria-pressed="${d.id === selectedHardware}" aria-label="${d.maker} ${d.name}, ${number(d[metric], 3)} ${unit}${d.preliminary ? ", specifiche preliminari" : ""}"><span class="cc-bar-label"><span><b>${d.label}</b><small>${d.maker}${d.preliminary ? " · preliminare" : ""}</small></span><strong>${number(d[metric], 3)} <small>${unit}</small></strong></span><span class="cc-bar-track" aria-hidden="true"><i style="width:${d[metric] / max * 100}%"></i></span></button>`).join("")}`;
    chart.querySelectorAll("[data-cc-hardware]").forEach(button => button.addEventListener("click", () => {
      selectedHardware = button.dataset.ccHardware;
      chart.querySelectorAll("[data-cc-hardware]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
      renderHardwareDetail();
    }));
    renderHardwareDetail();
  }
  function renderHardwareDetail() {
    const d = hardware.find(item => item.id === selectedHardware);
    $("cc-hardware-detail").innerHTML = `<div><span class="cc-eyebrow">${d.generation}</span><h4>${d.maker} ${d.name}</h4><p>${d.note}</p>${source(d.source, "Scheda del produttore")}</div><dl><div><dt>Capacità ${d.type}</dt><dd>${d.memory} <small>GB</small></dd></div><div><dt>Banda di picco</dt><dd>${number(d.bandwidth, 3)} <small>TB/s</small></dd></div></dl>`;
  }
  document.querySelectorAll("[data-cc-metric]").forEach(button => button.addEventListener("click", () => { metric = button.dataset.ccMetric; document.querySelectorAll("[data-cc-metric]").forEach(b => b.setAttribute("aria-pressed", String(b === button))); renderHardware(); }));
  renderHardware();

  const industry = [
    { name: "A100", period: "2022–2023", units: .896, low: .69, high: 1.16, price: 12, power: .4 },
    { name: "H100 / H200", period: "Q3 2022–2025", units: 4.31, low: 3.64, high: 5.09, price: 25, power: .7 },
    { name: "B200 / B300", period: "Q4 2024–Q2 2026", units: 5.17, low: 4.4, high: 6.06, price: 40.3, power: 1.31 }
  ];
  let industryMetric = "units";
  function renderIndustry() {
    const config = {
      units: { max: 6.5, unit: "mln", title: "Unità cumulative stimate · milioni", note: "Barra: stima centrale aggregata. Segmento con estremi: somma dei limiti 5°–95° dei batch, non un intervallo di confidenza del totale. Le finestre temporali differiscono." },
      price: { max: 45, unit: "mila $", title: "Prezzo medio stimato per chip · migliaia di dollari", note: "Medie ponderate e arrotondate sul periodo di ciascuna famiglia. Non sono listini ufficiali né prezzi di un intero server." },
      power: { max: 1.5, unit: "kW", title: "TDP medio ponderato per chip · kW", note: "Potenza nominale di progetto, non consumo elettrico misurato durante l'uso. B200/B300 è una media fra prodotti differenti; non descrive il TDP di una singola scheda." }
    }[industryMetric];
    $("cc-industry-axis").textContent = config.title;
    $("cc-industry-note").textContent = config.note;
    $("cc-industry-bars").innerHTML = `<div class="cc-scale"><span>0</span><span>${number(config.max / 2, 2)}</span><span>${number(config.max)} ${config.unit}</span></div>${industry.map(d => `<div class="cc-bar-item cc-industry-row"><div class="cc-bar-label"><span><b>${d.name}</b><small>${d.period}</small></span><strong>≈${number(d[industryMetric], industryMetric === "power" ? 2 : 2)} <small>${config.unit}</small></strong></div><div class="cc-bar-track" aria-hidden="true"><i style="width:${d[industryMetric] / config.max * 100}%"></i>${industryMetric === "units" ? `<span class="cc-interval" style="left:${d.low / config.max * 100}%;width:${(d.high - d.low) / config.max * 100}%"></span>` : ""}</div>${industryMetric === "units" ? `<p class="cc-interval-label">Somma dei limiti: ${number(d.low, 2)}–${number(d.high, 2)} milioni</p>` : ""}</div>`).join("")}`;
  }
  document.querySelectorAll("[data-cc-industry]").forEach(button => button.addEventListener("click", () => { industryMetric = button.dataset.ccIndustry; document.querySelectorAll("[data-cc-industry]").forEach(b => b.setAttribute("aria-pressed", String(b === button))); renderIndustry(); }));
  renderIndustry();
})();
