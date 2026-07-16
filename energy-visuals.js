(() => {
  const svg = document.querySelector("#gdp-energy-chart");
  const frame = document.querySelector("#gdp-energy-frame");
  const tooltip = document.querySelector("#gdp-chart-tooltip");
  const detail = document.querySelector("#gdp-country-detail");
  const controls = [...document.querySelectorAll("[data-gdp-country]")];

  if (!svg || !frame || !tooltip || !detail) return;

  const NS = "http://www.w3.org/2000/svg";
  const featuredNames = {
    ITA: "Italia",
    USA: "Stati Uniti",
    CHN: "Cina",
    IND: "India",
    NOR: "Norvegia",
  };
  const number = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
  const money = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  let dataset = [];
  let selectedCode = "ITA";
  let resizeTimer;

  function make(tag, attributes = {}, text = "") {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    if (text) node.textContent = text;
    return node;
  }

  function logScale(value, domainMin, domainMax, rangeMin, rangeMax) {
    const ratio =
      (Math.log10(value) - Math.log10(domainMin)) /
      (Math.log10(domainMax) - Math.log10(domainMin));
    return rangeMin + ratio * (rangeMax - rangeMin);
  }

  function formatEnergy(value) {
    if (value >= 1000) {
      return `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(value / 1000)} MWh`;
    }
    return `${number.format(value)} kWh`;
  }

  function countryLabel(country) {
    return featuredNames[country.c] || country.n;
  }

  function updateDetail(country) {
    const label = countryLabel(country);
    detail.innerHTML =
      `<strong>${label}</strong> · ${money.format(country.g)} di PIL pro capite · ` +
      `${formatEnergy(country.e)} di energia primaria per persona`;
  }

  function updateControls() {
    controls.forEach((button) => {
      const active = button.dataset.gdpCountry === selectedCode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function selectCountry(code) {
    const country = dataset.find((item) => item.c === code);
    if (!country) return;
    selectedCode = code;
    updateControls();
    updateDetail(country);
    render();
  }

  function showTooltip(event, country) {
    const bounds = frame.getBoundingClientRect();
    tooltip.innerHTML =
      `<strong>${countryLabel(country)}</strong>` +
      `<span>PIL: ${money.format(country.g)} / persona</span>` +
      `<span>Energia: ${formatEnergy(country.e)} / persona</span>`;
    tooltip.hidden = false;

    const desiredLeft = event.clientX - bounds.left + 16;
    const desiredTop = event.clientY - bounds.top + 14;
    const maxLeft = bounds.width - tooltip.offsetWidth - 12;
    tooltip.style.left = `${Math.max(10, Math.min(desiredLeft, maxLeft))}px`;
    tooltip.style.top = `${Math.max(56, desiredTop)}px`;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function regression(points) {
    const values = points.map((country) => [Math.log10(country.g), Math.log10(country.e)]);
    const meanX = values.reduce((sum, pair) => sum + pair[0], 0) / values.length;
    const meanY = values.reduce((sum, pair) => sum + pair[1], 0) / values.length;
    const numerator = values.reduce(
      (sum, pair) => sum + (pair[0] - meanX) * (pair[1] - meanY),
      0,
    );
    const denominator = values.reduce((sum, pair) => sum + (pair[0] - meanX) ** 2, 0);
    const slope = numerator / denominator;
    return { slope, intercept: meanY - slope * meanX };
  }

  function render() {
    if (!dataset.length) return;

    const compact = window.innerWidth < 700;
    const width = compact ? 720 : 1120;
    const height = 620;
    const margin = compact
      ? { top: 58, right: 24, bottom: 78, left: 78 }
      : { top: 54, right: 42, bottom: 82, left: 98 };
    const plot = {
      left: margin.left,
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
    };
    const xMin = 900;
    const xMax = 160000;
    const yMin = 200;
    const yMax = 250000;
    const x = (value) => logScale(value, xMin, xMax, plot.left, plot.right);
    const y = (value) => logScale(value, yMin, yMax, plot.bottom, plot.top);
    const xTicks = compact
      ? [1000, 5000, 20000, 100000]
      : [1000, 2000, 5000, 10000, 20000, 50000, 100000];
    const yTicks = compact
      ? [500, 2000, 10000, 50000, 200000]
      : [500, 1000, 5000, 10000, 50000, 100000, 200000];

    svg.replaceChildren();
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.append(
      make("title", { id: "gdp-svg-title" }, "Energia primaria per persona e PIL pro capite nel 2024"),
      make(
        "desc",
        { id: "gdp-svg-desc" },
        "Ogni punto rappresenta un Paese. La linea tratteggiata mostra la relazione media positiva tra ricchezza ed energia.",
      ),
    );

    const zoneX = x(40000);
    const zoneY = y(18694);
    svg.append(
      make("rect", {
        class: "gdp-rich-zone",
        x: zoneX,
        y: zoneY,
        width: Math.max(0, plot.right - zoneX),
        height: Math.max(0, plot.bottom - zoneY),
        rx: 8,
      }),
      make(
        "text",
        {
          class: "gdp-zone-label",
          x: plot.right - 12,
          y: plot.bottom - 14,
          "text-anchor": "end",
        },
        compact ? "RICCHI + POCA ENERGIA: QUASI VUOTO" : "IL QUADRANTE «RICCHI + POCA ENERGIA» È QUASI VUOTO",
      ),
    );

    xTicks.forEach((tick) => {
      const px = x(tick);
      svg.append(
        make("line", {
          class: "gdp-grid-line",
          x1: px,
          y1: plot.top,
          x2: px,
          y2: plot.bottom,
        }),
        make(
          "text",
          {
            class: "gdp-axis-text",
            x: px,
            y: plot.bottom + 27,
            "text-anchor": "middle",
          },
          tick >= 1000 ? `${tick / 1000}k` : String(tick),
        ),
      );
    });

    yTicks.forEach((tick) => {
      const py = y(tick);
      svg.append(
        make("line", {
          class: "gdp-grid-line",
          x1: plot.left,
          y1: py,
          x2: plot.right,
          y2: py,
        }),
        make(
          "text",
          {
            class: "gdp-axis-text",
            x: plot.left - 15,
            y: py + 4,
            "text-anchor": "end",
          },
          tick >= 1000 ? `${tick / 1000}k` : String(tick),
        ),
      );
    });

    svg.append(
      make("line", {
        class: "gdp-axis-line",
        x1: plot.left,
        y1: plot.bottom,
        x2: plot.right,
        y2: plot.bottom,
      }),
      make("line", {
        class: "gdp-axis-line",
        x1: plot.left,
        y1: plot.top,
        x2: plot.left,
        y2: plot.bottom,
      }),
      make(
        "text",
        {
          class: "gdp-axis-label",
          x: (plot.left + plot.right) / 2,
          y: height - 19,
          "text-anchor": "middle",
        },
        "PIL PRO CAPITE · $ INTERNAZIONALI 2021",
      ),
      make(
        "text",
        {
          class: "gdp-axis-label",
          x: 20,
          y: (plot.top + plot.bottom) / 2,
          transform: `rotate(-90 20 ${(plot.top + plot.bottom) / 2})`,
          "text-anchor": "middle",
        },
        "ENERGIA PRIMARIA · KWH PER PERSONA",
      ),
    );

    const fit = regression(dataset);
    const fitStartX = 1200;
    const fitEndX = 135000;
    const fitStartY = 10 ** (fit.intercept + fit.slope * Math.log10(fitStartX));
    const fitEndY = 10 ** (fit.intercept + fit.slope * Math.log10(fitEndX));
    svg.append(
      make("path", {
        class: "gdp-trend-line",
        d: `M ${x(fitStartX)} ${y(fitStartY)} L ${x(fitEndX)} ${y(fitEndY)}`,
      }),
      make(
        "text",
        {
          class: "gdp-trend-label",
          x: x(compact ? 3200 : 6500),
          y: y(10 ** (fit.intercept + fit.slope * Math.log10(compact ? 3200 : 6500))) - 11,
        },
        "RELAZIONE MEDIA",
      ),
    );

    const pointsLayer = make("g", { "aria-label": "Paesi" });
    dataset.forEach((country) => {
      const selected = country.c === selectedCode;
      const featured = Object.hasOwn(featuredNames, country.c);
      const circle = make("circle", {
        class:
          "gdp-country-point" +
          (featured ? " is-featured" : "") +
          (selected ? " is-selected" : ""),
        cx: x(country.g),
        cy: y(country.e),
        r: selected ? 8 : featured ? 5.5 : 3.7,
        "data-code": country.c,
        "aria-label": `${countryLabel(country)}: PIL ${money.format(country.g)}, energia ${formatEnergy(country.e)} per persona`,
      });

      if (featured) {
        circle.setAttribute("tabindex", "0");
        circle.setAttribute("role", "button");
      }

      circle.addEventListener("pointermove", (event) => showTooltip(event, country));
      circle.addEventListener("pointerleave", hideTooltip);
      circle.addEventListener("focus", (event) => {
        const bounds = circle.getBoundingClientRect();
        showTooltip(
          { clientX: bounds.left + bounds.width / 2, clientY: bounds.top + bounds.height / 2 },
          country,
        );
      });
      circle.addEventListener("blur", hideTooltip);
      circle.addEventListener("click", () => {
        if (featured) selectCountry(country.c);
        else updateDetail(country);
      });
      circle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCountry(country.c);
        }
      });
      pointsLayer.append(circle);
    });
    svg.append(pointsLayer);

    const selected = dataset.find((country) => country.c === selectedCode);
    if (selected) {
      const selectedX = x(selected.g);
      const selectedY = y(selected.e);
      svg.append(
        make("circle", {
          class: "gdp-selected-halo",
          cx: selectedX,
          cy: selectedY,
          r: 15,
          "pointer-events": "none",
        }),
        make(
          "text",
          {
            class: "gdp-selected-label",
            x: selectedX + (selectedX > plot.right - 120 ? -14 : 14),
            y: selectedY - 14,
            "text-anchor": selectedX > plot.right - 120 ? "end" : "start",
            "pointer-events": "none",
          },
          countryLabel(selected),
        ),
      );
    }
  }

  controls.forEach((button) => {
    button.addEventListener("click", () => selectCountry(button.dataset.gdpCountry));
  });

  fetch("assets/energy-gdp-2024.json")
    .then((response) => {
      if (!response.ok) throw new Error("dataset non disponibile");
      return response.json();
    })
    .then((data) => {
      dataset = data
        .map((country) => ({
          n: country.n,
          c: country.c,
          g: Number(country.g),
          e: Number(country.e),
        }))
        .filter(
          (country) =>
            country.n &&
            country.c &&
            Number.isFinite(country.g) &&
            Number.isFinite(country.e) &&
            country.g > 0 &&
            country.e > 0,
        );
      selectCountry(selectedCode);
    })
    .catch(() => {
      detail.textContent =
        "Il grafico non si è caricato. I dati originali restano disponibili nel link alla fonte.";
      detail.classList.add("is-error");
    });

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 120);
  });
})();

(() => {
  const svg = document.querySelector("#energy-history-chart");
  const stage = document.querySelector("#energy-history-stage");
  const tooltip = document.querySelector("#energy-history-tooltip");
  const reading = document.querySelector("#energy-history-reading");
  const controls = [...document.querySelectorAll("[data-history-year]")];

  if (!svg || !stage || !tooltip || !reading) return;

  const NS = "http://www.w3.org/2000/svg";
  const sources = [
    { key: "bio", className: "is-biomass", label: "biomassa tradizionale" },
    { key: "coal", className: "is-coal", label: "carbone" },
    { key: "oil", className: "is-oil", label: "petrolio" },
    { key: "gas", className: "is-gas", label: "gas" },
    { key: "hydro", className: "is-hydro", label: "idroelettrico" },
    { key: "nuclear", className: "is-nuclear", label: "nucleare" },
    { key: "modern", className: "is-modern", label: "rinnovabili moderne" },
  ];
  const integer = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });
  let dataset = [];
  let selectedYear = 2024;
  let layout = null;
  let resizeTimer;

  function make(tag, attributes = {}, text = "") {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    if (text) node.textContent = text;
    return node;
  }

  function linePath(points) {
    return points.map((point, index) => (index ? "L " : "M ") + point[0] + " " + point[1]).join(" ");
  }

  function nearestRow(year) {
    return dataset.reduce((nearest, row) =>
      Math.abs(row.y - year) < Math.abs(nearest.y - year) ? row : nearest,
    );
  }

  function populationRow(row) {
    if (Number.isFinite(row.pw)) return row;
    return [...dataset].reverse().find((candidate) => candidate.y <= row.y && Number.isFinite(candidate.pw));
  }

  function dominantSource(row) {
    return sources.reduce((best, source) =>
      Number(row[source.key]) > Number(row[best.key]) ? source : best,
    );
  }

  function formatPower(value) {
    if (!Number.isFinite(value)) return "dato non disponibile";
    return value >= 1000 ? decimal.format(value / 1000) + " kW/persona" : integer.format(value) + " W/persona";
  }

  function showTooltip(event, row, perCapitaRow) {
    const bounds = stage.getBoundingClientRect();
    const source = dominantSource(row);
    tooltip.innerHTML =
      "<strong>" + row.y + "</strong>" +
      "<span>" + integer.format(row.t) + " TWh · " + decimal.format(row.t / 8760) + " TW medi</span>" +
      "<span>" + formatPower(perCapitaRow?.pw) + "</span>" +
      "<span>Fonte maggiore: " + source.label + "</span>";
    tooltip.hidden = false;
    const desiredLeft = event.clientX - bounds.left + 16;
    const desiredTop = event.clientY - bounds.top + 14;
    const maxLeft = bounds.width - tooltip.offsetWidth - 12;
    tooltip.style.left = Math.max(10, Math.min(desiredLeft, maxLeft)) + "px";
    tooltip.style.top = Math.max(10, desiredTop) + "px";
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function updateSelection(year, event) {
    if (!dataset.length || !layout) return;
    const row = nearestRow(Number(year));
    const perCapita = populationRow(row);
    const px = layout.x(row.y);
    const topY = layout.yTop(row.t);
    const personY = layout.yPerson(perCapita?.pw || 0);
    selectedYear = row.y;

    const line = svg.querySelector("#history-marker-line");
    const topDot = svg.querySelector("#history-total-dot");
    const personDot = svg.querySelector("#history-person-dot");
    const label = svg.querySelector("#history-marker-label");
    if (line) {
      line.setAttribute("x1", px);
      line.setAttribute("x2", px);
    }
    if (topDot) {
      topDot.setAttribute("cx", px);
      topDot.setAttribute("cy", topY);
    }
    if (personDot) {
      personDot.setAttribute("cx", px);
      personDot.setAttribute("cy", personY);
    }
    if (label) {
      const nearRight = px > layout.right - 54;
      label.setAttribute("x", px + (nearRight ? -8 : 8));
      label.setAttribute("text-anchor", nearRight ? "end" : "start");
      label.textContent = row.y;
    }

    controls.forEach((button) => {
      const active = Number(button.dataset.historyYear) === row.y;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const source = dominantSource(row);
    const factor = row.t / dataset[0].t;
    const populationNote = perCapita?.y === row.y ? "" : " · dato pro capite " + perCapita?.y;
    reading.innerHTML =
      "<span>" + row.y + "</span>" +
      "<strong>" + integer.format(row.t) + " TWh · " + decimal.format(row.t / 8760) + " TW medi</strong>" +
      "<p>" + formatPower(perCapita?.pw) + populationNote + ". Fonte principale: " +
      source.label + ". Scala globale: " + decimal.format(factor) + "× il 1800.</p>";

    if (event) showTooltip(event, row, perCapita);
  }

  function render() {
    if (!dataset.length) return;

    const compact = window.innerWidth < 700;
    const width = compact ? 720 : 1120;
    const height = compact ? 860 : 760;
    const left = compact ? 78 : 92;
    const right = width - (compact ? 28 : 48);
    const topPlot = {
      top: 68,
      bottom: compact ? 468 : 442,
    };
    const personPlot = {
      top: compact ? 594 : 544,
      bottom: compact ? 782 : 688,
    };
    const maxTotal = 200000;
    const maxPerson = 3000;
    const x = (year) => left + ((year - 1800) / (2024 - 1800)) * (right - left);
    const yTop = (value) => topPlot.bottom - (value / maxTotal) * (topPlot.bottom - topPlot.top);
    const yPerson = (value) =>
      personPlot.bottom - (Math.min(value, maxPerson) / maxPerson) * (personPlot.bottom - personPlot.top);
    const xTicks = compact ? [1800, 1900, 1950, 2000, 2024] : [1800, 1850, 1900, 1950, 2000, 2024];
    const totalTicks = compact ? [0, 100000, 200000] : [0, 50000, 100000, 150000, 200000];
    const personTicks = [0, 1000, 2000, 3000];

    layout = { width, height, left, right, topPlot, personPlot, x, yTop, yPerson };
    svg.replaceChildren();
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.append(
      make("title", { id: "history-svg-title" }, "Consumo globale di energia primaria dal 1800 al 2024 e potenza media per persona"),
      make(
        "desc",
        { id: "history-svg-desc" },
        "Il grafico superiore mostra la crescita dell'energia globale per fonte. Quello inferiore mostra la potenza primaria media per persona e una linea di riferimento alimentare da cento watt.",
      ),
    );

    totalTicks.forEach((tick) => {
      const py = yTop(tick);
      svg.append(
        make("line", { class: "history-grid-line", x1: left, y1: py, x2: right, y2: py }),
        make(
          "text",
          { class: "history-axis-text", x: left - 14, y: py + 4, "text-anchor": "end" },
          tick === 0 ? "0" : tick / 1000 + "k",
        ),
      );
    });

    personTicks.forEach((tick) => {
      const py = yPerson(tick);
      svg.append(
        make("line", { class: "history-grid-line", x1: left, y1: py, x2: right, y2: py }),
        make(
          "text",
          { class: "history-axis-text", x: left - 14, y: py + 4, "text-anchor": "end" },
          tick >= 1000 ? tick / 1000 + "k" : String(tick),
        ),
      );
    });

    xTicks.forEach((tick) => {
      const px = x(tick);
      svg.append(
        make("line", {
          class: "history-grid-line",
          x1: px,
          y1: topPlot.top,
          x2: px,
          y2: personPlot.bottom,
        }),
        make(
          "text",
          {
            class: "history-axis-text",
            x: px,
            y: personPlot.bottom + 29,
            "text-anchor": tick === 1800 ? "start" : tick === 2024 ? "end" : "middle",
          },
          String(tick),
        ),
      );
    });

    svg.append(
      make(
        "text",
        { class: "history-axis-label", x: left, y: topPlot.top - 28 },
        "ENERGIA PRIMARIA GLOBALE · TWh/ANNO",
      ),
      make(
        "text",
        { class: "history-axis-label", x: left, y: personPlot.top - 28 },
        "POTENZA PRIMARIA MEDIA PER PERSONA · W",
      ),
      make("line", {
        class: "history-axis-line",
        x1: left,
        y1: topPlot.bottom,
        x2: right,
        y2: topPlot.bottom,
      }),
      make("line", {
        class: "history-axis-line",
        x1: left,
        y1: personPlot.bottom,
        x2: right,
        y2: personPlot.bottom,
      }),
    );

    const cumulative = dataset.map(() => 0);
    sources.forEach((source) => {
      const lower = [...cumulative];
      const upper = dataset.map((row, index) => {
        cumulative[index] += Number(row[source.key]) || 0;
        return cumulative[index];
      });
      const upperPoints = dataset.map((row, index) => [x(row.y), yTop(upper[index])]);
      const lowerPoints = [...dataset]
        .reverse()
        .map((row, reverseIndex) => {
          const index = dataset.length - 1 - reverseIndex;
          return [x(row.y), yTop(lower[index])];
        });
      const path =
        linePath(upperPoints) +
        " " +
        lowerPoints.map((point) => "L " + point[0] + " " + point[1]).join(" ") +
        " Z";
      svg.append(make("path", { class: "history-area " + source.className, d: path }));
    });

    svg.append(
      make("path", {
        class: "history-total-line",
        d: linePath(dataset.map((row) => [x(row.y), yTop(row.t)])),
      }),
      make(
        "text",
        { class: "history-annotation", x: x(1800) + 8, y: yTop(dataset[0].t) - 12 },
        "0,65 TW",
      ),
      make(
        "text",
        {
          class: "history-annotation",
          x: x(2024) - 14,
          y: yTop(dataset[dataset.length - 1].t) + 28,
          "text-anchor": "end",
        },
        "21,3 TW",
      ),
    );

    const personRows = dataset.filter((row) => Number.isFinite(row.pw));
    const personPoints = personRows.map((row) => [x(row.y), yPerson(row.pw)]);
    const personArea =
      linePath(personPoints) +
      " L " + x(personRows[personRows.length - 1].y) + " " + personPlot.bottom +
      " L " + x(personRows[0].y) + " " + personPlot.bottom +
      " Z";
    const foodY = yPerson(100);
    svg.append(
      make("path", { class: "history-person-area", d: personArea }),
      make("path", { class: "history-person-line", d: linePath(personPoints) }),
      make("line", {
        class: "history-food-line",
        x1: left,
        y1: foodY,
        x2: right,
        y2: foodY,
      }),
      make(
        "text",
        { class: "history-food-label", x: right - 4, y: foodY - 8, "text-anchor": "end" },
        "≈100 W · ENERGIA DAL CIBO",
      ),
    );

    svg.append(
      make("line", {
        id: "history-marker-line",
        class: "history-marker-line",
        x1: right,
        y1: topPlot.top,
        x2: right,
        y2: personPlot.bottom,
      }),
      make("circle", {
        id: "history-total-dot",
        class: "history-marker-dot",
        cx: right,
        cy: yTop(dataset[dataset.length - 1].t),
        r: compact ? 7 : 6,
      }),
      make("circle", {
        id: "history-person-dot",
        class: "history-marker-dot",
        cx: right,
        cy: yPerson(personRows[personRows.length - 1].pw),
        r: compact ? 7 : 6,
      }),
      make(
        "text",
        {
          id: "history-marker-label",
          class: "history-marker-label",
          x: right - 8,
          y: topPlot.top + 18,
          "text-anchor": "end",
        },
        String(selectedYear),
      ),
    );

    const hitArea = make("rect", {
      class: "history-hit-area",
      x: left,
      y: topPlot.top,
      width: right - left,
      height: personPlot.bottom - topPlot.top,
    });
    hitArea.addEventListener("pointermove", (event) => {
      const bounds = svg.getBoundingClientRect();
      const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
      const year = 1800 + ((svgX - left) / (right - left)) * (2024 - 1800);
      updateSelection(Math.max(1800, Math.min(2024, year)), event);
    });
    hitArea.addEventListener("pointerdown", (event) => {
      const bounds = svg.getBoundingClientRect();
      const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
      const year = 1800 + ((svgX - left) / (right - left)) * (2024 - 1800);
      updateSelection(Math.max(1800, Math.min(2024, year)), event);
    });
    hitArea.addEventListener("pointerleave", hideTooltip);
    svg.append(hitArea);

    updateSelection(selectedYear);
  }

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      hideTooltip();
      updateSelection(Number(button.dataset.historyYear));
    });
  });

  fetch("assets/world-energy-history.json")
    .then((response) => {
      if (!response.ok) throw new Error("dataset storico non disponibile");
      return response.json();
    })
    .then((data) => {
      dataset = data
        .map((row) => ({
          y: Number(row.y),
          t: Number(row.t),
          bio: Number(row.bio),
          coal: Number(row.coal),
          oil: Number(row.oil),
          gas: Number(row.gas),
          hydro: Number(row.hydro),
          nuclear: Number(row.nuclear),
          modern: Number(row.modern),
          pw: row.pw == null ? null : Number(row.pw),
        }))
        .filter((row) => Number.isFinite(row.y) && Number.isFinite(row.t));
      render();
    })
    .catch(() => {
      reading.innerHTML =
        "<span>Errore</span><strong>Il grafico storico non si è caricato.</strong>" +
        "<p>I dati originali restano disponibili nel collegamento a Our World in Data.</p>";
    });

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 120);
  });
})();
