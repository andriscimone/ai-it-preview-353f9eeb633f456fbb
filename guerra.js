const warDecisionSteps = {
  observe: {
    kicker: "01 · input",
    title: "Vedere ciò che sta accadendo.",
    copy: "Radar, satelliti, telecamere e altri sensori producono segnali separati. Prima di qualsiasi decisione serve capire che cosa è stato rilevato, con quale qualità e con quale margine di errore.",
    risk: "Un sensore può essere disturbato, incompleto o interpretato male."
  },
  connect: {
    kicker: "02 · infrastruttura",
    title: "Far parlare dati che nascono separati.",
    copy: "Formati, livelli di segretezza e sistemi differenti devono essere collegati. Qui operano piattaforme come quelle di Palantir, insieme a molte altre infrastrutture militari e governative.",
    risk: "Se la fonte, il tempo o il contesto si perdono, la mappa comune può sembrare più certa dei dati originali."
  },
  understand: {
    kicker: "03 · interpretazione",
    title: "Trasformare segnali in una situazione leggibile.",
    copy: "Software, modelli e analisti cercano correlazioni, classificano oggetti e costruiscono ipotesi. L’AI può ridurre il carico cognitivo, ma non elimina ambiguità, bias o falsi positivi.",
    risk: "Una classificazione plausibile può essere scambiata per un fatto verificato."
  },
  decide: {
    kicker: "04 · responsabilità",
    title: "Scegliere che cosa fare — o non fare.",
    copy: "Il comando valuta opzioni, regole d’ingaggio e conseguenze. “Human in the loop” ha senso solo se è chiaro quale decisione resta umana e se la persona dispone di tempo e informazioni sufficienti.",
    risk: "La velocità del sistema può trasformare l’autorizzazione umana in un controllo puramente formale."
  },
  act: {
    kicker: "05 · mondo fisico",
    title: "Tradurre la decisione in movimento.",
    copy: "Velivoli, droni, sistemi subacquei, disturbo elettronico e intercettori eseguono una missione. Anduril lavora soprattutto su questo collegamento tra software, sensori e macchine autonome.",
    risk: "Nel mondo fisico un errore non è più soltanto un dato sbagliato: può produrre conseguenze irreversibili."
  }
};

const warStepButtons = [...document.querySelectorAll("[data-war-step]")];
const warStepKicker = document.getElementById("war-step-kicker");
const warStepTitle = document.getElementById("war-step-title");
const warStepCopy = document.getElementById("war-step-copy");
const warStepRisk = document.getElementById("war-step-risk");

function renderWarDecisionStep(key) {
  const step = warDecisionSteps[key];
  if (!step || !warStepTitle) return;

  warStepKicker.textContent = step.kicker;
  warStepTitle.textContent = step.title;
  warStepCopy.textContent = step.copy;
  warStepRisk.textContent = step.risk;

  warStepButtons.forEach(button => {
    const selected = button.dataset.warStep === key;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

warStepButtons.forEach(button => {
  button.addEventListener("click", () => renderWarDecisionStep(button.dataset.warStep));
});
