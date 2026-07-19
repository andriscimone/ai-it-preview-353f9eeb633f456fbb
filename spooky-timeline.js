document.documentElement.classList.add("has-js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
