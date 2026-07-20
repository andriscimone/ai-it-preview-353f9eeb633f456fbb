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
