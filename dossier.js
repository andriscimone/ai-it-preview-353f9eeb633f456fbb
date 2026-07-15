const dossierRevealItems = [...document.querySelectorAll("[data-dossier-reveal]")];

if (dossierRevealItems.length && "IntersectionObserver" in window) {
  document.body.classList.add("reveal-ready");
  const dossierRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      dossierRevealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.06 });
  dossierRevealItems.forEach(item => dossierRevealObserver.observe(item));
}

const metrModels = {
  gpt4: { name: "GPT‑4", date: "14 marzo 2023 · OpenAI", duration: "circa 4 minuti", ci: "1,9 – 8,0 min", status: "Il confronto parte da pochi minuti: è una misura su task tecnici, non autonomia generale." },
  gpt4o: { name: "GPT‑4o", date: "13 maggio 2024 · OpenAI", duration: "circa 7 minuti", ci: "4,0 – 12,9 min", status: "La barra cresce, ma resta nell’ordine di un piccolo compito tecnico." },
  sonnet35: { name: "Claude 3.5 Sonnet", date: "20 giugno 2024 · Anthropic", duration: "circa 11 minuti", ci: "5,5 – 22,4 min", status: "L’intervallo mostra quanta cautela serve anche quando la stima centrale sembra precisa." },
  o1: { name: "o1", date: "5 dicembre 2024 · OpenAI", duration: "circa 39 minuti", ci: "21 – 65 min", status: "È il primo salto visivo verso un compito umano vicino a un’ora." },
  sonnet37: { name: "Claude 3.7 Sonnet", date: "24 febbraio 2025 · Anthropic", duration: "circa un’ora", ci: "33 min – 1 h 44", status: "P50 significa comunque riuscire una volta su due, non lavorare senza errori per un’ora." },
  o3: { name: "o3", date: "16 aprile 2025 · OpenAI", duration: "circa 2 ore", ci: "1 h 15 – 3 h 11", status: "La durata è quella del task per un esperto umano, non il tempo trascorso dall’agente." },
  gpt5: { name: "GPT‑5", date: "7 agosto 2025 · OpenAI", duration: "circa 3 ore e 23 minuti", ci: "1 h 53 – 6 h 46", status: "Il valore resta specifico dei 228 task e dello scaffold usato da METR." },
  opus45: { name: "Claude Opus 4.5", date: "24 novembre 2025 · Anthropic", duration: "circa 4 ore e 53 minuti", ci: "2 h 42 – 10 h 24", status: "L’intervallo è già più che triplo: meglio leggere l’ordine di grandezza dei decimali." },
  opus46: { name: "Claude Opus 4.6", date: "5 febbraio 2026 · Anthropic", duration: "circa 12 ore", ci: "5 h 17 – 60 h 34", status: "La stima centrale è sotto la parete, ma l’intervallo attraversa ampiamente la zona satura." },
  gemini31: { name: "Gemini 3.1 Pro", date: "19 febbraio 2026 · Google", duration: "circa 6 ore e 24 minuti", ci: "3 h 54 – 11 h 35", status: "Essere più recente non significa automaticamente avere la barra più lunga." },
  gpt54: { name: "GPT‑5.4", date: "5 marzo 2026 · OpenAI", duration: "circa 5 ore e 42 minuti", ci: "3 h 07 – 12 h 49", status: "È un intervallo ampio: non leggere pochi minuti di differenza come una classifica definitiva." },
  mythos: { name: "Claude Mythos Preview (early)", date: "7 aprile 2026 · Anthropic", duration: "circa 17 ore e 25 minuti", ci: "8 h 29 – 55 h 04", status: "La stima centrale supera le 16 ore: METR la tratta come saturazione della suite, non come record preciso." }
};

const metrButtons = [...document.querySelectorAll(".metr-model-row[data-metr-model]")];
const metrReadingName = document.getElementById("metr-reading-name");
const metrReadingDate = document.getElementById("metr-reading-date");
const metrReadingCopy = document.getElementById("metr-reading-copy");
const metrReadingCi = document.getElementById("metr-reading-ci");
const metrReadingStatus = document.getElementById("metr-reading-status");
const metrMaxMinutes = 32 * 60;

function metrPosition(minutes) {
  const boundedMinutes = Math.max(1, Math.min(minutes, metrMaxMinutes));
  return `${(Math.log(boundedMinutes) / Math.log(metrMaxMinutes)) * 100}%`;
}

function renderMetrModel(key) {
  const model = metrModels[key];
  if (!model || !metrReadingName) return;
  metrReadingName.textContent = model.name;
  metrReadingDate.textContent = model.date;
  metrReadingCopy.innerHTML = `Su compiti che richiedono <strong>${model.duration}</strong> a un esperto, l’agente ha una probabilità stimata del 50% di riuscire.`;
  metrReadingCi.textContent = model.ci;
  metrReadingStatus.textContent = model.status;
  metrButtons.forEach(button => {
    const selected = button.dataset.metrModel === key;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

metrButtons.forEach(button => {
  button.style.setProperty("--metr-row", metrPosition(Number(button.dataset.metrMinutes)));
  button.addEventListener("click", () => renderMetrModel(button.dataset.metrModel));
});
