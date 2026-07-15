const spookyMoments = [
  {
    horizon: "ADESSO",
    code: "S-00",
    label: "Il punto di partenza",
    title: "Il compito resta nelle tue mani.",
    copy: "L'AI aiuta dentro un'attività: propone, riassume, scrive. La persona sceglie ancora i passaggi e tiene insieme il risultato.",
    question: "Quanto rapidamente l'assistenza diventa delega?"
  },
  {
    horizon: "+12 MESI",
    code: "S-01",
    label: "La delega",
    title: "Descrivi il risultato. Il sistema trova i passaggi.",
    copy: "In questo scenario non chiedi più una singola risposta. Affidi un obiettivo, controlli il piano e intervieni soltanto quando qualcosa devia.",
    question: "Se non osservi ogni passaggio, sai ancora spiegare il risultato?"
  },
  {
    horizon: "+24 MESI",
    code: "S-02",
    label: "La squadra sintetica",
    title: "Il software comincia a coordinare altro software.",
    copy: "Agenti specializzati si dividono ricerca, scrittura, codice e verifica. La persona non dirige più ogni azione: progetta il sistema che le esegue.",
    question: "Chi è responsabile quando nessun singolo agente vede l'intero processo?"
  },
  {
    horizon: "+36 MESI",
    code: "S-03",
    label: "L'abbondanza cognitiva",
    title: "Produrre una prima risposta costa quasi niente.",
    copy: "Se analisi, software e contenuti diventano abbondanti, il valore si sposta: dalla produzione alla scelta, dalla velocità alla fiducia, dall'output al giudizio.",
    question: "Come riconosci ciò che merita attenzione quando tutto può essere prodotto?"
  },
  {
    horizon: "+60 MESI",
    code: "S-04",
    label: "Il lavoro del controllo",
    title: "Fare non è più il collo di bottiglia. Decidere sì.",
    copy: "Nello scenario più distante, le persone definiscono obiettivi, limiti e responsabilità mentre sistemi automatici eseguono gran parte del lavoro intermedio.",
    question: "Chi decide gli obiettivi di sistemi che possono agire a una scala enorme?"
  }
];

const momentStops = [...document.querySelectorAll(".timeline-stop")];
const momentHorizon = document.getElementById("moment-horizon");
const momentCode = document.getElementById("moment-code");
const momentNumber = document.getElementById("moment-number");
const momentLabel = document.getElementById("moment-label");
const momentTitle = document.getElementById("moment-title");
const momentCopy = document.getElementById("moment-copy");
const momentQuestion = document.getElementById("moment-question");
const timelineProgress = document.getElementById("timeline-progress");
const timelineReading = document.querySelector(".timeline-reading");

function selectMoment(index) {
  const moment = spookyMoments[index];
  if (!moment) return;
  momentStops.forEach((stop, stopIndex) => {
    const selected = stopIndex === index;
    stop.classList.toggle("is-active", selected);
    stop.setAttribute("aria-pressed", String(selected));
  });
  momentHorizon.textContent = moment.horizon;
  momentCode.textContent = moment.code;
  momentNumber.textContent = String(index).padStart(2, "0");
  momentLabel.textContent = moment.label;
  momentTitle.textContent = moment.title;
  momentCopy.textContent = moment.copy;
  momentQuestion.textContent = moment.question;
  timelineProgress.style.setProperty("--timeline-progress", `${(index / (spookyMoments.length - 1)) * 100}%`);
  timelineReading.dataset.moment = String(index);
}

momentStops.forEach((stop, index) => {
  stop.addEventListener("click", () => selectMoment(index));
  stop.addEventListener("keydown", event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(spookyMoments.length - 1, index + direction));
    momentStops[nextIndex].focus();
    selectMoment(nextIndex);
  });
});

selectMoment(0);
