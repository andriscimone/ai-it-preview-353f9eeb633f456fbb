document.documentElement.classList.add("has-js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const caveSun = document.querySelector("[data-cave-sun]");

if (caveSun) {
  caveSun.addEventListener("click", () => {
    const isActive = caveSun.getAttribute("aria-pressed") !== "true";
    caveSun.setAttribute("aria-pressed", String(isActive));
    caveSun.setAttribute(
      "aria-label",
      isActive
        ? "Ripristina la prima apparizione del sole Nick Land"
        : "Attiva la seconda apparizione del sole Nick Land"
    );
  });
}

const caveMeme = document.querySelector("[data-cave-meme]");
const caveMemePin = caveMeme?.querySelector(".cave-meme-pin");
const caveStage = caveMeme?.querySelector("[data-cave-stage]");
let caveScrollFrame = null;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(value) {
  const progress = clamp01(value);
  return progress * progress * (3 - (2 * progress));
}

function rangeProgress(value, start, end) {
  return clamp01((value - start) / (end - start));
}

function syncCaveStory() {
  caveScrollFrame = null;
  if (!caveMeme || !caveMemePin || !caveStage) return;

  const memeRect = caveMeme.getBoundingClientRect();
  const stickyTop = Number.parseFloat(getComputedStyle(caveMemePin).top) || 96;
  const scrollDistance = Math.max(1, caveMeme.offsetHeight - caveMemePin.offsetHeight);
  const rawProgress = clamp01((stickyTop - memeRect.top) / scrollDistance);
  const progress = reduceMotion.matches ? 1 : rawProgress;
  const formulaProgress = 1 - smoothStep(rangeProgress(progress, .24, .62));
  const formulaExpansion = smoothStep(rangeProgress(progress, .08, .42));
  const departureProgress = smoothStep(rangeProgress(progress, .34, .78));
  const outsideProgress = smoothStep(rangeProgress(progress, .5, .74));
  const landProgress = smoothStep(rangeProgress(progress, .62, .94));

  caveMeme.style.setProperty("--apparatus-opacity", String(.18 + (formulaProgress * .82)));
  caveMeme.style.setProperty("--beam-opacity", String(formulaProgress * .72));
  caveMeme.style.setProperty("--formula-opacity", String(formulaProgress));
  caveMeme.style.setProperty("--formula-scale", String(.88 + (formulaExpansion * .16)));
  caveMeme.style.setProperty("--formula-x", `${formulaExpansion * 5}%`);
  caveMeme.style.setProperty("--formula-blur", `${(1 - formulaProgress) * 4}px`);
  caveMeme.style.setProperty("--prisoner-opacity", String(1 - departureProgress));
  caveMeme.style.setProperty("--pepe-exit-opacity", String(departureProgress));
  caveMeme.style.setProperty("--pepe-exit-x", `${(1 - departureProgress) * -38}%`);
  caveMeme.style.setProperty("--pepe-exit-y", `${(1 - departureProgress) * 12}%`);
  caveMeme.style.setProperty("--pepe-exit-scale", String(.72 + (departureProgress * .28)));
  caveMeme.style.setProperty("--inside-opacity", String(1 - outsideProgress));
  caveMeme.style.setProperty("--outside-opacity", String(outsideProgress));
  caveMeme.style.setProperty("--land-opacity", String(landProgress));
  caveMeme.style.setProperty("--land-scale", String(.28 + (landProgress * .72)));
  caveMeme.style.setProperty("--backdrop-brightness", String(.56 + (progress * .44)));
  caveMeme.style.setProperty("--cave-veil-opacity", String(.92 - (progress * .52)));
  caveMeme.style.setProperty("--cave-progress-width", `${progress * 100}%`);
  caveMeme.dataset.cavePhase = outsideProgress >= .5 ? "outside" : "inside";

  if (caveSun) {
    const landIsAvailable = landProgress > .12;
    caveSun.disabled = !landIsAvailable;
    caveSun.tabIndex = landIsAvailable ? 0 : -1;
    caveSun.setAttribute("aria-hidden", String(!landIsAvailable));
  }
}

function queueCaveStory() {
  if (caveScrollFrame !== null) return;
  caveScrollFrame = window.requestAnimationFrame(syncCaveStory);
}

if (caveMeme) {
  window.addEventListener("scroll", queueCaveStory, { passive: true });
  window.addEventListener("resize", queueCaveStory);
  reduceMotion.addEventListener?.("change", queueCaveStory);
  syncCaveStory();
}

const timelineTabs = [...document.querySelectorAll("[data-timeline-tab]")];
const timelinePanels = [...document.querySelectorAll("[data-timeline-panel]")];

function activateTimeline(tab, focus = false) {
  const selectedKey = tab.dataset.timelineTab;

  timelineTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  timelinePanels.forEach(panel => {
    const selected = panel.dataset.timelinePanel === selectedKey;
    panel.hidden = !selected;
    panel.classList.toggle("is-active", selected);
  });

  if (focus) tab.focus();
}

timelineTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTimeline(tab));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + timelineTabs.length) % timelineTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % timelineTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = timelineTabs.length - 1;
    activateTimeline(timelineTabs[nextIndex], true);
  });
});

document.querySelectorAll("[data-timeline-direction]").forEach(button => {
  button.addEventListener("click", () => {
    const activePanel = document.querySelector("[data-timeline-panel].is-active");
    const rail = activePanel?.querySelector(".source-timeline");
    if (!rail) return;
    const direction = button.dataset.timelineDirection === "next" ? 1 : -1;
    rail.scrollBy({
      left: direction * Math.max(260, rail.clientWidth * .72),
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
  });
});

const futureCards = [...document.querySelectorAll("[data-future-card]")];
const futureLinks = [...document.querySelectorAll("[data-future-link]")];
const futureCount = document.getElementById("future-progress-count");
const futureProgress = document.getElementById("future-progress-bar");
let currentFutureId = "";

function setCurrentFuture(card) {
  if (!card) return;
  const index = futureCards.indexOf(card);
  const id = card.id;
  if (id === currentFutureId) return;
  currentFutureId = id;

  futureCards.forEach(item => item.classList.toggle("is-current", item === card));
  futureLinks.forEach(link => {
    const selected = link.dataset.futureLink === id;
    link.classList.toggle("is-active", selected);
    if (selected) {
      link.setAttribute("aria-current", "true");
      const indexList = link.closest("ol");
      const indexItem = link.parentElement;
      if (indexList && indexItem) {
        indexList.scrollTo({
          left: indexItem.offsetLeft - ((indexList.clientWidth - indexItem.clientWidth) / 2),
          behavior: "auto"
        });
      }
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (futureCount) futureCount.textContent = String(index + 1).padStart(2, "0");
  if (futureProgress) futureProgress.style.width = `${((index + 1) / futureCards.length) * 100}%`;
}

futureLinks.forEach(link => {
  link.addEventListener("click", event => {
    const target = document.getElementById(link.dataset.futureLink);
    if (!target) return;
    event.preventDefault();
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", `#${target.id}`);
    setCurrentFuture(target);
  });
});

let futureScrollFrame = null;

function syncCurrentFuture() {
  futureScrollFrame = null;
  const readingLine = window.innerHeight * .34;
  let current = futureCards[0];

  for (const card of futureCards) {
    if (card.getBoundingClientRect().top > readingLine) break;
    current = card;
  }

  setCurrentFuture(current);
}

function queueFutureSync() {
  if (futureScrollFrame !== null) return;
  futureScrollFrame = window.requestAnimationFrame(syncCurrentFuture);
}

window.addEventListener("scroll", queueFutureSync, { passive: true });
window.addEventListener("resize", queueFutureSync);
setCurrentFuture(futureCards[0]);

const capitalNodes = [...document.querySelectorAll("[data-capital-node]")];

function closeCapitalNodes(except = null) {
  capitalNodes.forEach(node => {
    if (node !== except) {
      node.classList.remove("is-open");
      node.classList.remove("is-dismissed");
      node.setAttribute("aria-expanded", "false");
    }
  });
}

capitalNodes.forEach(node => {
  const pointName = node.querySelector(":scope > b")?.textContent?.trim() || "selezionato";
  node.setAttribute("aria-label", `Mostra i dettagli del punto ${pointName}`);
  node.setAttribute("aria-expanded", "false");

  node.addEventListener("click", event => {
    event.stopPropagation();
    node.classList.remove("is-dismissed");
    const willOpen = !node.classList.contains("is-open");
    closeCapitalNodes(node);
    node.classList.toggle("is-open", willOpen);
    node.setAttribute("aria-expanded", String(willOpen));
  });

  node.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    node.classList.remove("is-open");
    node.classList.add("is-dismissed");
    node.setAttribute("aria-expanded", "false");
    node.focus();
  });

  node.addEventListener("blur", () => node.classList.remove("is-dismissed"));
  node.addEventListener("pointerleave", () => node.classList.remove("is-dismissed"));
});

document.addEventListener("click", () => closeCapitalNodes());

// Compare the same question across sources without merging their calendars.
const clockQuestions = [...document.querySelectorAll("[data-clock-question]")];
const clockPanels = [...document.querySelectorAll("[data-clock-panel]")];
function selectClockQuestion(key) {
  clockQuestions.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.clockQuestion === key)));
  clockPanels.forEach(panel => { panel.hidden = panel.dataset.clockPanel !== key; });
}
clockQuestions.forEach(button => button.addEventListener("click", () => selectClockQuestion(button.dataset.clockQuestion)));

const signalSelect = document.getElementById("signal-criterion");
const signalArticles = [...document.querySelectorAll("[data-signal-criteria]")];
const signalYears = [...document.querySelectorAll(".accelerando-year")];
function filterSignals(key) {
  if (!signalSelect) return;
  signalSelect.value = key;
  let count = 0;
  signalArticles.forEach(article => {
    const criteria = article.dataset.signalCriteria.split(" ").filter(Boolean);
    const visible = key === "all" || (key === "context-only" ? !criteria.length : criteria.includes(key));
    article.hidden = !visible;
    if (visible) count++;
  });
  signalYears.forEach(year => {
    const visibleCount = [...year.querySelectorAll("[data-signal-criteria]")].filter(article => !article.hidden).length;
    year.hidden = visibleCount === 0;
    const link = document.querySelector(`.accelerando-year-nav a[href="#${year.id}"]`);
    if (link) {
      link.hidden = visibleCount === 0;
      link.textContent = `${year.querySelector("h3").textContent} / ${visibleCount} ${visibleCount === 1 ? "segnale" : "segnali"}`;
    }
  });
  const label = signalSelect.selectedOptions[0].textContent;
  document.getElementById("signal-count").textContent = `${count} ${count === 1 ? "segnale" : "segnali"} su ${signalArticles.length}${key === "all" ? " nella raccolta." : ` · ${label}.`}`;
  document.getElementById("signal-empty").hidden = count > 0;
  const back = document.getElementById("signal-criterion-back");
  back.href = ["all", "context-only"].includes(key) ? "#la-mia-soglia" : `#criterion-${key}`;
  back.textContent = ["all", "context-only"].includes(key) ? "Rileggi i criteri della soglia ↑" : "Rileggi la prova richiesta da questo criterio ↑";
}
signalSelect?.addEventListener("change", () => filterSignals(signalSelect.value));

function goToSpookySection(target) {
  if (!target) return;
  for (let parent = target.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === "DETAILS") parent.open = true;
  }
  if (target.tagName === "DETAILS") target.open = true;
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${target.id}`);
}

document.addEventListener("click", event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (link.dataset.criterionLink) {
    event.preventDefault();
    filterSignals(link.dataset.criterionLink);
    goToSpookySection(document.getElementById("signal-filter"));
    return;
  }
  // The original future index already handles its own focus and reading marker.
  if (futureLinks.includes(link)) return;
  const target = document.getElementById(link.getAttribute("href").slice(1));
  if (!target) return;
  event.preventDefault();
  if (target.matches("[data-signal-criteria]") && target.hidden) filterSignals("all");
  goToSpookySection(target);
});

// The explorer reuses each original card, so the short and complete versions cannot drift.
const futureTree = {
  root: { question: "L’umanità costruisce una superintelligenza?", count: 12, choices: [["No, l’ASI non arriva", "no"], ["Sì, l’ASI esiste", "yes"]] },
  no: { question: "Perché non arriva?", count: 3, choices: [["Ci distruggiamo prima", "future-self-destruction"], ["Rinunciamo alla tecnologia", "future-reversion"], ["La blocchiamo con la sorveglianza", "future-1984"]] },
  yes: { question: "Chi conserva la decisione finale?", count: 9, choices: [["Gli umani tengono le chiavi", "future-enslaved"], ["L’AI eredita il futuro", "succession"], ["Umani e AI restano nello stesso mondo", "coexistence"]] },
  succession: { question: "Conquista o successione?", count: 2, choices: [["L’AI prende il controllo", "future-conquerors"], ["Le AI diventano i nostri discendenti", "future-descendants"]] },
  coexistence: { question: "Quanta autonomia rimane?", count: 6, choices: [["L’AI governa o ci custodisce", "managed"], ["L’AI pone un solo limite", "limited"], ["Il potere resta plurale", "plural"]] },
  managed: { question: "Benessere o cattività?", count: 2, choices: [["Governa per il nostro benessere", "future-dictator"], ["Conserva gli umani in cattività", "future-zookeeper"]] },
  limited: { question: "Quale limite impone?", count: 2, choices: [["Impedisce altre superintelligenze", "future-gatekeeper"], ["Previene di nascosto le catastrofi", "future-protector"]] },
  plural: { question: "Come vengono distribuite le risorse?", count: 2, choices: [["Proprietà e mercati separano le economie", "future-libertarian"], ["L’abbondanza è condivisa", "future-egalitarian"]] }
};
let futurePath = [{ key: "root", label: "12 futuri" }];
const explorer = document.getElementById("future-explorer");
function renderFutureStep(moveFocus = false) {
  if (!explorer) return;
  const current = futurePath.at(-1);
  const node = futureTree[current.key];
  const title = document.getElementById("future-step-title");
  const choices = document.getElementById("future-choices");
  const result = document.getElementById("future-result");
  choices.replaceChildren();
  result.replaceChildren();
  document.getElementById("future-path").textContent = futurePath.map(step => step.label).join(" → ");
  document.getElementById("future-back").disabled = futurePath.length === 1;
  document.getElementById("future-reset").disabled = futurePath.length === 1;
  explorer.querySelector(".future-step-context").hidden = !node;
  if (node) {
    title.textContent = node.question;
    node.choices.forEach(([label, key]) => {
      const button = document.createElement("button");
      button.type = "button";
      const name = document.createElement("span");
      name.textContent = label;
      const count = document.createElement("small");
      const remaining = futureTree[key]?.count || 1;
      count.textContent = `${remaining} ${remaining === 1 ? "esito" : "esiti"} →`;
      button.append(name, count);
      button.addEventListener("click", () => {
        futurePath.push({ key, label });
        renderFutureStep(true);
      });
      choices.append(button);
    });
  } else {
    const card = document.getElementById(current.key);
    if (!card?.matches("[data-future-card]")) return;
    title.textContent = card.querySelector("h3").firstChild.textContent;
    const number = document.createElement("p");
    number.className = "future-result-number";
    number.textContent = `Esito ${card.dataset.futureNumber} di 12 · futuro concettuale`;
    result.append(number);
    for (const selector of [".future-lead", ".future-facts", ".future-question", ".future-deep-dive"]) {
      const copy = card.querySelector(selector)?.cloneNode(true);
      if (copy) result.append(copy);
    }
    const link = document.createElement("a");
    link.href = `#${card.id}`;
    link.textContent = "Vai alla scheda nell’elenco completo ↓";
    result.append(link);
  }
  if (moveFocus) {
    title.focus({ preventScroll: true });
    explorer.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }
}
if (explorer) {
  explorer.hidden = false;
  document.getElementById("mappa-futuri").open = window.matchMedia("(min-width: 1000px)").matches;
  document.getElementById("future-back").addEventListener("click", () => { if (futurePath.length > 1) futurePath.pop(); renderFutureStep(true); });
  document.getElementById("future-reset").addEventListener("click", () => { futurePath = futurePath.slice(0, 1); renderFutureStep(true); });
  renderFutureStep();
}

// Store this tab's reading position only. “Esci” clears both the pass and the reading state.
let leavingSpooky = false;
document.querySelectorAll('a[href="index.html"]').forEach(link => link.addEventListener("click", event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  leavingSpooky = true;
  try {
    ["aiit-spooky-open", "aiit-spooky-pass", "aiit-spooky-reading"].forEach(key => sessionStorage.removeItem(key));
  } catch (_) {}
}));
window.addEventListener("pagehide", () => {
  if (leavingSpooky) return;
  try {
    sessionStorage.setItem("aiit-spooky-reading", JSON.stringify({
      y: window.scrollY,
      details: [...document.querySelectorAll("details[id][open]")].map(detail => detail.id),
      question: clockQuestions.find(button => button.getAttribute("aria-pressed") === "true")?.dataset.clockQuestion,
      timeline: timelineTabs.find(button => button.getAttribute("aria-selected") === "true")?.dataset.timelineTab,
      criterion: signalSelect?.value,
      openStories: futureCards.filter(card => card.querySelector(".future-deep-dive")?.open).map(card => card.id),
      explorerStory: document.querySelector("#future-result .future-deep-dive")?.open || false,
      rails: Object.fromEntries(timelinePanels.map(panel => [panel.dataset.timelinePanel, panel.querySelector(".source-timeline").scrollLeft])),
      futurePath
    }));
  } catch (_) {}
});
window.addEventListener("pageshow", () => {
  try {
    if (sessionStorage.getItem("aiit-spooky-open") !== "true") window.location.replace("index.html#tesi");
  } catch (_) {}
});

function restoreSpookyReading() {
  let reading;
  try { reading = JSON.parse(sessionStorage.getItem("aiit-spooky-reading")); } catch (_) {}
  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  if (!reading || (location.hash && !["reload", "back_forward"].includes(navigationType))) return;
  document.querySelectorAll("details[id]").forEach(detail => { detail.open = reading.details?.includes(detail.id) || false; });
  if (clockQuestions.some(button => button.dataset.clockQuestion === reading.question)) selectClockQuestion(reading.question);
  const tab = timelineTabs.find(button => button.dataset.timelineTab === reading.timeline);
  if (tab) activateTimeline(tab);
  if ([...signalSelect.options].some(option => option.value === reading.criterion)) filterSignals(reading.criterion);
  if (Array.isArray(reading.futurePath) && reading.futurePath.length && reading.futurePath.every(step => futureTree[step.key] || document.getElementById(step.key)?.matches("[data-future-card]"))) {
    futurePath = reading.futurePath;
    renderFutureStep();
  }
  futureCards.forEach(card => { card.querySelector(".future-deep-dive").open = reading.openStories?.includes(card.id) || false; });
  const explorerStory = document.querySelector("#future-result .future-deep-dive");
  if (explorerStory) explorerStory.open = Boolean(reading.explorerStory);
  timelinePanels.forEach(panel => {
    const x = reading.rails?.[panel.dataset.timelinePanel];
    if (Number.isFinite(x)) panel.querySelector(".source-timeline").scrollLeft = x;
  });
  if (Number.isFinite(reading.y)) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: reading.y, behavior: "instant" })));
}
if (document.readyState === "complete") restoreSpookyReading();
else window.addEventListener("load", restoreSpookyReading, { once: true });
