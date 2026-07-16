const historyEvents = [...document.querySelectorAll(".history-event")];
const historyFilters = [...document.querySelectorAll(".history-filter")];
const historyYears = [...document.querySelectorAll(".history-year")];
const historyRail = document.querySelector(".history-rail");
const activeEra = document.getElementById("active-era");
const activeDate = document.getElementById("active-date");
const activeTitle = document.getElementById("active-title");
const historyProgressFill = document.getElementById("history-progress-fill");

let visibleHistoryEvents = [...historyEvents];
let activeHistoryEvent = historyEvents[0];

function updateHistoryRail(event) {
  if (!event || !historyRail) return;
  activeHistoryEvent?.classList.remove("is-active");
  activeHistoryEvent = event;
  activeHistoryEvent.classList.add("is-active");

  const era = event.dataset.era;
  activeEra.textContent = era;
  activeDate.textContent = event.dataset.date;
  activeTitle.textContent = event.dataset.title;
  historyRail.classList.toggle("is-trump", era === "Trump");

  const index = visibleHistoryEvents.indexOf(event);
  const progress = visibleHistoryEvents.length > 1 ? ((index + 1) / visibleHistoryEvents.length) * 100 : 100;
  historyProgressFill.style.width = `${progress}%`;
}

function findCurrentHistoryEvent() {
  if (!visibleHistoryEvents.length) return;
  const anchor = Math.min(window.innerHeight * .44, 390);
  let current = visibleHistoryEvents[0];

  visibleHistoryEvents.forEach(event => {
    if (event.getBoundingClientRect().top <= anchor) current = event;
  });

  updateHistoryRail(current);
}

function updateVisibleYears() {
  historyYears.forEach(year => {
    let sibling = year.nextElementSibling;
    let hasVisibleEvent = false;
    while (sibling && !sibling.classList.contains("history-year")) {
      if (sibling.classList.contains("history-event") && !sibling.hidden) hasVisibleEvent = true;
      sibling = sibling.nextElementSibling;
    }
    year.hidden = !hasVisibleEvent;
  });
}

function filterHistory(kind) {
  historyEvents.forEach(event => {
    event.hidden = kind !== "all" && event.dataset.kind !== kind;
  });
  visibleHistoryEvents = historyEvents.filter(event => !event.hidden);
  updateVisibleYears();

  historyFilters.forEach(button => {
    const selected = button.dataset.filter === kind;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  findCurrentHistoryEvent();
}

historyFilters.forEach(button => {
  button.addEventListener("click", () => filterHistory(button.dataset.filter));
});

let historyScrollFrame;
window.addEventListener("scroll", () => {
  if (historyScrollFrame) return;
  historyScrollFrame = requestAnimationFrame(() => {
    findCurrentHistoryEvent();
    historyScrollFrame = null;
  });
}, { passive: true });

window.addEventListener("resize", findCurrentHistoryEvent);

if (historyEvents.length) {
  updateHistoryRail(historyEvents[0]);
  findCurrentHistoryEvent();
}
