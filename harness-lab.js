(() => {
  const experiments = window.aiitBenchmarkData?.astraHarness;
  if (!experiments) return;
  const percent = value => value.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  const dollars = value => '$' + Math.round(value).toLocaleString('it-IT');

  document.querySelectorAll('[data-harness-lab]').forEach(lab => {
    const effort = lab.querySelector('[data-harness-effort]');
    const metrics = [...lab.querySelectorAll('[data-harness-metric]')];
    let metric = 'score';
    function render() {
      const experiment = experiments.find(row => row.effort === effort.value);
      if (!experiment) return;
      const scoreView = metric === 'score';
      const maximum = scoreView ? 100 : 60000;
      lab.querySelector('[data-harness-axis]').textContent = scoreView ? 'Punteggio ARC‑AGI‑3 · scala 0–100%' : 'Costo della valutazione · scala $0–$60.000';
      for (const key of ['standard', 'adapter']) {
        const row = lab.querySelector(`[data-harness-row="${key}"]`);
        row.querySelector('[data-harness-bar]').style.width = `${experiment[key][metric] / maximum * 100}%`;
        row.querySelector('[data-harness-value]').textContent = scoreView ? percent(experiment[key].score) : dollars(experiment[key].cost);
        row.querySelector('[data-harness-detail]').textContent = `${percent(experiment[key].score)} · ${dollars(experiment[key].cost)} per la valutazione`;
      }
      const delta = experiment.adapter.score - experiment.standard.score;
      lab.querySelector('[data-harness-reading]').textContent = `Con reasoning ${effort.selectedOptions[0].text}: l’adattatore ottiene ${delta.toLocaleString('it-IT',{maximumFractionDigits:1})} punti percentuali in più e costa ${dollars(experiment.standard.cost-experiment.adapter.cost)} in meno nello stesso test. I costi non sono prezzi per domanda.`;
      metrics.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.harnessMetric === metric)));
    }
    effort.addEventListener('change', render);
    metrics.forEach(button => button.addEventListener('click', () => { metric = button.dataset.harnessMetric; render(); }));
    render();
  });
})();
