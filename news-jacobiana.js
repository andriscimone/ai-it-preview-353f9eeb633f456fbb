document.documentElement.classList.add("news-js");

const pointLabels = {
  a: "A = (0, 0, −¼)",
  b: "B = (1, −3/2, 13/2)",
  c: "C = (−1, 3/2, 13/2)"
};

const verifiedPoints = new Set();
const pointButtons = Array.from(document.querySelectorAll("[data-point]"));
const output = document.querySelector("#stage-output");
const outputCount = document.querySelector("#stage-output-count");
const resultIcon = document.querySelector("#certificate-result-icon");
const resultText = document.querySelector("#certificate-result-text");
const resetButton = document.querySelector("#certificate-reset");

function updateCertificate(point) {
  const count = verifiedPoints.size;
  outputCount.textContent = `${count} di 3 verificati`;

  if (count === 3) {
    output.classList.add("is-complete");
    resultIcon.textContent = "✓";
    resultText.innerHTML = "<strong>Controesempio completato.</strong> Tre ingressi distinti producono la stessa uscita: F non può avere un inverso globale.";
    resetButton.hidden = false;
    return;
  }

  resultIcon.textContent = "✓";
  resultText.textContent = `${pointLabels[point]} produce esattamente (−¼, 0, 0). Ne mancano ${3 - count}.`;
}

pointButtons.forEach(button => {
  button.addEventListener("click", () => {
    const point = button.dataset.point;
    verifiedPoints.add(point);
    button.setAttribute("aria-pressed", "true");
    document.querySelector(`[data-stage-point="${point}"]`)?.classList.add("is-active");
    document.querySelector(`[data-path="${point}"]`)?.classList.add("is-active");
    updateCertificate(point);
  });
});

resetButton?.addEventListener("click", () => {
  verifiedPoints.clear();
  pointButtons.forEach(button => button.setAttribute("aria-pressed", "false"));
  document.querySelectorAll("[data-stage-point], [data-path]").forEach(element => element.classList.remove("is-active"));
  output.classList.remove("is-complete");
  outputCount.textContent = "0 di 3 verificati";
  resultIcon.textContent = "○";
  resultText.textContent = "Scegli un punto per iniziare il controllo.";
  resetButton.hidden = true;
  pointButtons[0]?.focus();
});

const revealItems = document.querySelectorAll("[data-news-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -7%" });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

const progressBar = document.querySelector("#reading-progress-bar");
let progressFrame = null;
function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  progressFrame = null;
}
window.addEventListener("scroll", () => {
  if (progressFrame !== null) return;
  progressFrame = window.requestAnimationFrame(updateReadingProgress);
}, { passive: true });
updateReadingProgress();
