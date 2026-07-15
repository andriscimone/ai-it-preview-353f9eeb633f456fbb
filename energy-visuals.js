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
