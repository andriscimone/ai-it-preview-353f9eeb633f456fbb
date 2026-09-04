(() => {
  'use strict';
  if (!document.querySelector('.energy-page')) return;
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = (value, digits = 0) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(value);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const superscript = value => String(value).replace(/[0-9-]/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹' [Number(digit)] || '⁻');
  const date = value => new Date(value + 'T12:00:00Z').toLocaleDateString('it-IT', { month:'short', year:'numeric', timeZone:'UTC' });
  const sources = [
    ['bio','Biomassa tradizionale','var(--history-biomass)'], ['coal','Carbone','var(--history-coal)'],
    ['oil','Petrolio','var(--history-oil)'], ['gas','Gas','var(--history-gas)'],
    ['hydro','Idroelettrico','var(--history-hydro)'], ['nuclear','Nucleare','var(--history-nuclear)'],
    ['modern','Rinnovabili moderne','var(--history-modern)']
  ];
  function node(tag, attributes = {}, content) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (content != null) element.textContent = content;
    return element;
  }
  function label(svg, x, y, text, anchor = 'start', strong = false) {
    svg.append(node('text', { x, y, 'text-anchor':anchor, class:strong ? 'el-svg-label is-strong' : 'el-svg-label' }, text));
  }
  function line(svg, x1, y1, x2, y2, attrs = {}) {
    svg.append(node('line', { x1,y1,x2,y2, stroke:'var(--chart-grid)', 'stroke-width':1, ...attrs }));
  }
  function canvas(id, height, title, description) {
    const svg = $(id), width = Math.max(240, Math.round(svg.getBoundingClientRect().width));
    svg.replaceChildren(node('title', {}, title), node('desc', {}, description));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.height = height + 'px';
    return { svg, width, height, left:52, right:width-24, top:30, bottom:height-48 };
  }
  function axes(g, xticks, yticks, x, y) {
    yticks.forEach(([v,t]) => { line(g.svg,g.left,y(v),g.right,y(v)); label(g.svg,g.left-9,y(v)+4,t,'end'); });
    xticks.forEach(([v,t], i) => { line(g.svg,x(v),g.bottom,x(v),g.bottom+5); label(g.svg,x(v),g.bottom+24,t,i === 0 ? 'start' : i === xticks.length-1 ? 'end' : 'middle'); });
  }
  function path(points) { return points.map(([x,y],i) => `${i ? 'L':'M'}${x},${y}`).join(' '); }
  function curve(g, points, attrs = {}) {
    g.svg.append(node('path',{d:path(points),fill:'none',stroke:'var(--chart-primary)','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round',...attrs}));
  }
  function dot(svg,x,y,selected = false, attrs = {}) { svg.append(node('circle',{cx:x,cy:y,r:selected?6:3.5,fill:'var(--chart-primary)',stroke:'var(--chart-surface)','stroke-width':2,...attrs})); }
  function press(selector, value, key) {
    document.querySelectorAll(selector).forEach(button => button.setAttribute('aria-pressed', String(button.dataset[key] === value)));
  }
  const specialNames = { ITA:'Italia', USA:'Stati Uniti', CHN:'Cina', IND:'India', NOR:'Norvegia', GBR:'Regno Unito' };
  const countryName = row => specialNames[row.c] || row.n;
  function bars(rows, max, units, options = {}) {
    return '<div class="energy-lab-bars">' + rows.map(row => `<div class="energy-lab-bar-row"><div><span>${esc(row.name)}</span><strong>${fmt(row.value, options.digits || 0)} ${units}</strong></div><div class="energy-lab-bar-track"><i style="width:${Math.max(0,Math.min(100,row.value/max*100))}%;background:${row.color || 'var(--chart-primary)'}"></i></div>${row.note ? `<small>${esc(row.note)}</small>` : ''}</div>`).join('')+'</div>';
  }

  let history = [], historyMode = 'total', historyYear = 2024;
  function renderHistory() {
    if (!history.length) return;
    const row = history.reduce((best,item) => Math.abs(item.y-historyYear)<Math.abs(best.y-historyYear) ? item : best);
    const perPerson = historyMode === 'person';
    const g = canvas('el-history-chart',340,'Energia primaria mondiale, 1800–2024',perPerson?'Potenza primaria media per persona. Il 2024 non ha un dato pro capite.':'Energia primaria globale annua. Le distanze orizzontali rispettano gli anni.');
    const x = year => g.left+(year-1800)/224*(g.right-g.left);
    const y = value => g.bottom-value/(perPerson?3:200)*(g.bottom-g.top);
    axes(g,[[1800,'1800'],[1900,'1900'],[2024,'2024']],perPerson?[[0,'0'],[1,'1'],[2,'2'],[3,'3']]:[[0,'0'],[50,'50'],[100,'100'],[150,'150'],[200,'200']],x,y);
    const rows = perPerson ? history.filter(item=>Number.isFinite(item.pw)) : history;
    const valueOf = item => perPerson ? item.pw/1000 : item.t/1000;
    const points = rows.map(item=>[x(item.y),y(valueOf(item))]);
    if (!perPerson) g.svg.append(node('path',{d:path(points)+` L${points.at(-1)[0]},${g.bottom} L${g.left},${g.bottom} Z`,fill:'var(--chart-primary)',opacity:'.09'}));
    curve(g,points);
    if(perPerson) { line(g.svg,g.left,y(.1),g.right,y(.1),{'stroke-dasharray':'3 4',stroke:'var(--chart-muted)'}); label(g.svg,g.right,y(.1)-8,'0,1 kW · alimentazione','end'); }
    line(g.svg,x(row.y),g.top,x(row.y),g.bottom,{'stroke-dasharray':'4 4',stroke:'var(--chart-text)'});
    if (!perPerson || Number.isFinite(row.pw)) dot(g.svg,x(row.y),y(valueOf(row)),true);
    const hit = node('rect',{x:g.left,y:g.top,width:g.right-g.left,height:g.bottom-g.top,fill:'transparent',class:'el-chart-touch'});
    hit.addEventListener('click',event=>{const rect=g.svg.getBoundingClientRect();historyYear=1800+Math.max(0,Math.min(1,(event.clientX-rect.left-g.left)/(g.right-g.left)))*224;renderHistory();});
    g.svg.append(hit);
    $('el-history-year').value = row.y;
    $('el-history-year').setAttribute('aria-valuetext',String(row.y));
    $('el-history-year-label').textContent = row.y;
    $('el-history-unit').textContent = perPerson ? 'Potenza primaria media · kW / persona' : 'Energia primaria · migliaia di TWh / anno';
    const hours = new Date(Date.UTC(row.y+1,0,1))-new Date(Date.UTC(row.y,0,1));
    const tw = row.t/(hours/3600000);
    const available = Number.isFinite(row.pw);
    const headline = perPerson ? (available?`${fmt(row.pw/1000,2)} <small>kW/persona</small>`:'Dato non disponibile') : `${fmt(row.t)} <small>TWh</small>`;
    const description = perPerson ? (available?`${fmt(row.pw/100,1)} volte il riferimento alimentare da 100 W. È energia primaria nell'economia, non lavoro muscolare.`:'La serie pro capite termina al 2023. Il valore 2024 non viene stimato o sostituito con quello dell’anno precedente.') : `${fmt(tw,1)} TW di potenza primaria media. ${fmt(row.t/history[0].t,1)} volte il totale del 1800.`;
    const mixes = [...sources].map(([key,name,color])=>({name,value:row[key]/row.t*100,color})).sort((a,b)=>b.value-a.value);
    $('el-history-reading').innerHTML = `<span class="energy-lab-eyebrow">${row.y} · ${perPerson?'per persona':'totale mondiale'}</span><strong class="energy-lab-big">${headline}</strong><p>${description}</p><h3>Il mix in quell'anno</h3>${bars(mixes,100,'%',{digits:1})}<p class="energy-lab-small">Le quote riguardano tutta l'energia primaria. Rinnovabili moderne: solare, eolico e altre rinnovabili, esclusi idroelettrico e biomassa tradizionale.</p>`;
    document.querySelectorAll('[data-el-year]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.elYear) === row.y)));
  }
  document.querySelectorAll('[data-el-history]').forEach(button=>button.addEventListener('click',()=>{historyMode=button.dataset.elHistory;press('[data-el-history]',historyMode,'elHistory');renderHistory();}));
  document.querySelectorAll('[data-el-year]').forEach(button=>button.addEventListener('click',()=>{historyYear=Number(button.dataset.elYear);renderHistory();}));
  $('el-history-year').addEventListener('input',event=>{historyYear=Number(event.target.value);renderHistory();});

  let countries = [], countryA = 'ITA', countryB = 'USA';
  function renderCountries() {
    if (!countries.length) return;
    const a = countries.find(row=>row.c===countryA), b = countries.find(row=>row.c===countryB);
    const g = canvas('el-gdp-chart',370,'Energia e PIL per persona, 2024','Ogni punto è un Paese o territorio. Cerchio e rombo indicano i due Paesi selezionati. Gli assi sono logaritmici.');
    const x = e=>g.left+(Math.log10(e)-Math.log10(200))/(Math.log10(300000)-Math.log10(200))*(g.right-g.left);
    const y = v=>g.bottom-(Math.log10(v)-3)/(Math.log10(160000)-3)*(g.bottom-g.top);
    axes(g,[[300,'0,3'],[3000,'3'],[30000,'30'],[300000,'300']],[[1000,'1'],[10000,'10'],[100000,'100']],x,y);
    [300,3000,30000,300000].forEach(value=>line(g.svg,x(value),g.top,x(value),g.bottom,{'stroke-dasharray':'2 5'}));
    countries.forEach(row=>{
      const point = node('circle',{cx:x(row.e),cy:y(row.g),r:3.5,fill:'var(--chart-muted)',opacity:'.45'});
      point.append(node('title',{},`${countryName(row)}: ${fmt(row.e/1000,1)} MWh, ${fmt(row.g)} $ internazionali per persona`));
      point.addEventListener('click',()=>{countryA=row.c;$('el-country-a').value=countryA;renderCountries();});
      g.svg.append(point);
    });
    const selectedPoint=(row,second)=>{
      const cx=x(row.e),cy=y(row.g);
      const mark=second?node('path',{d:`M${cx},${cy-8} L${cx+8},${cy} L${cx},${cy+8} L${cx-8},${cy} Z`,fill:'var(--energy-blue)'}):node('circle',{cx,cy,r:7,fill:'var(--chart-primary)'});
      mark.setAttribute('stroke','var(--chart-surface)');mark.setAttribute('stroke-width','2');g.svg.append(mark);
    };
    selectedPoint(b,true);selectedPoint(a,false);
    // One generous pointer layer makes dense scatter points usable on a touch screen.
    const hit=node('rect',{x:g.left,y:g.top,width:g.right-g.left,height:g.bottom-g.top,fill:'transparent',class:'el-chart-touch'});
    hit.addEventListener('click',event=>{const rect=g.svg.getBoundingClientRect();const px=event.clientX-rect.left,py=event.clientY-rect.top;const nearest=countries.reduce((best,row)=>Math.hypot(x(row.e)-px,y(row.g)-py)<Math.hypot(x(best.e)-px,y(best.g)-py)?row:best);countryA=nearest.c;$('el-country-a').value=countryA;renderCountries();});g.svg.append(hit);
    $('el-gdp-reading').innerHTML=`<span class="energy-lab-eyebrow">Confronto · ${a.c===b.c?'stesso Paese':'2024'}</span><h3><span class="energy-lab-key is-a">●</span> ${esc(countryName(a))}<br /><span class="energy-lab-key is-b">◆</span> ${esc(countryName(b))}</h3><p>Energia primaria per persona</p>${bars([{name:countryName(a),value:a.e/1000},{name:countryName(b),value:b.e/1000,color:'var(--energy-blue)'}],Math.max(a.e,b.e)/1000,'MWh',{digits:1})}<p>PIL pro capite · $ internazionali</p>${bars([{name:countryName(a),value:a.g},{name:countryName(b),value:b.g,color:'var(--energy-blue)'}],Math.max(a.g,b.g),'$')}<p class="energy-lab-comparison">${esc(countryName(a))}: <strong>${fmt(a.e/b.e,2)}×</strong> l'energia e <strong>${fmt(a.g/b.g,2)}×</strong> il PIL pro capite di ${esc(countryName(b))}.</p><p class="energy-lab-small">Ogni coppia di barre parte da zero e ha la propria scala. I valori restano visibili per confronti precisi.</p>`;
  }
  $('el-country-a').addEventListener('change',event=>{countryA=event.target.value;renderCountries();});
  $('el-country-b').addEventListener('change',event=>{countryB=event.target.value;renderCountries();});

  // Source snapshots: Epoch 11 June 2026 (frontier), Epoch 16 January 2026 (power).
  // 'Future frontier' remains planned even after its date: a past target is not an observation.
  const sites = [
    ['2024-08-11',80344,'Google Papillion'],['2024-09-02',100000,'Colossus 1'],['2025-02-17',200000,'Colossus 1'],
    ['2025-06-23',300152,'Anthropic–Amazon New Carlisle'],['2025-10-14',373926,'Microsoft Fairwater Atlanta'],
    ['2025-12-23',471450,'Anthropic–Amazon New Carlisle'],['2026-02-27',493684,'Meta Prometheus'],
    ['2026-03-23',687216,'Anthropic–Amazon New Carlisle'],['2026-05-28',763012,'Meta Prometheus']
  ];
  const plans = [['2026-06-21',820000,'Anthropic–Amazon New Carlisle'],['2026-07-01',1111673,'Colossus 2']];
  const power = [.15,.38,.60,.88,1.21,1.77,2.61,3.69,5.51,7.69,10.31,13.50,17.55,21.73,26.92,31.24].map((v,i)=>[`${2022+Math.floor(i/4)}-${['03-31','06-30','09-30','12-31'][i%4]}`,v]);
  let infra = 'site', infraIndex=8, showPlans=false;
  function renderInfra() {
    const g=canvas('el-infra-chart',350,'Scala dell’infrastruttura AI','Le osservazioni sono piene; piani o estrapolazioni sono tratteggiati.');
    let heading, metric, copy, note, source;
    $('el-plans-control').hidden=infra!=='site';$('el-infra-slider').hidden=infra==='cluster';
    const slider=$('el-infra-point');
    if(infra==='cluster') {
      const left=8,right=g.width-12;
      const rows=[['Ottobre 2024',100000],['Febbraio 2025',200000]];
      rows.forEach(([name,v],i)=>{const yy=50+i*130;label(g.svg,left,yy,name,'start',true);label(g.svg,right,yy,`${fmt(v)} GPU`,'end',true);g.svg.append(node('rect',{x:left,y:yy+18,width:right-left,height:26,rx:4,fill:'var(--chart-grid)'}),node('rect',{x:left,y:yy+18,width:v/200000*(right-left),height:26,rx:4,fill:'var(--chart-primary)'}));});
      label(g.svg,left,320,'Barre da zero · stessa unità');
      heading='Colossus · dichiarazione del produttore';metric='200.000 <small>GPU</small>';copy='Nel febbraio 2025 xAI ha dichiarato il raddoppio del cluster. Un cluster conta GPU interconnesse; un campus può ospitare più cluster. Il numero non prova che ogni addestramento usi tutte le GPU insieme.';
      note='Confronto storico 2024–2025 · non una classifica globale dei cluster attuali.';source='https://x.ai/colossus';$('el-infra-unit').textContent='Colossus · GPU dichiarate nello stesso cluster';
    } else {
      const isPower=infra==='power';
      const rows=isPower?power:(showPlans?[...sites,...plans]:sites);
      infraIndex=Math.max(0,Math.min(infraIndex,rows.length-1));
      slider.max=rows.length-1;slider.value=infraIndex;
      const first=Date.parse(rows[0][0]),last=Date.parse(rows.at(-1)[0]);
      const x=d=>g.left+(Date.parse(d)-first)/(last-first)*(g.right-g.left);
      const max=isPower?35:showPlans?1200000:800000;
      const y=v=>g.bottom-v/max*(g.bottom-g.top);
      const ticks=isPower?[[0,'0'],[10,'10'],[20,'20'],[30,'30']]:showPlans?[[0,'0'],[400000,'400K'],[800000,'800K'],[1200000,'1,2M']]:[[0,'0'],[200000,'200K'],[400000,'400K'],[600000,'600K'],[800000,'800K']];
      axes(g,[[rows[0][0],date(rows[0][0])],[rows.at(-1)[0],date(rows.at(-1)[0])]],ticks,x,y);
      let previous=null;
      rows.forEach((row,i)=>{
        const xx=x(row[0]),yy=y(row[1]),estimate=isPower?i===15:i>=sites.length;
        if(previous) { const p=isPower?`M${previous[0]},${previous[1]} L${xx},${yy}`:`M${previous[0]},${previous[1]} H${xx} V${yy}`;g.svg.append(node('path',{d:p,fill:'none',stroke:'var(--chart-primary)','stroke-width':3,'stroke-dasharray':estimate?'5 5':'none'})); }
        dot(g.svg,xx,yy,i===infraIndex,{fill:estimate?'var(--chart-surface)':'var(--chart-primary)',stroke:'var(--chart-primary)'});
        previous=[xx,yy];
      });
      const selected=rows[infraIndex],estimated=isPower?infraIndex===15:infraIndex>=sites.length;
      line(g.svg,x(selected[0]),g.top,x(selected[0]),g.bottom,{'stroke-dasharray':'3 5',stroke:'var(--chart-muted)'});
      dot(g.svg,x(selected[0]),y(selected[1]),true);
      $('el-infra-point-label').textContent=date(selected[0]);slider.setAttribute('aria-valuetext',`${date(selected[0])}: ${fmt(selected[1],2)} ${isPower?'GW':'H100-equivalent'}`);
      heading=`${date(selected[0])} · ${isPower?(estimated?'estrapolazione Epoch':'stima Epoch'):(estimated?'progetto nella fonte':'frontiera osservata nella fonte')}`;
      metric=`${fmt(selected[1],isPower?2:0)} <small>${isPower?'GW':'H100-eq'}</small>`;
      copy=isPower?'Capacità nominale stimata dai chip venduti, con un fattore di circa 2,5 per server, rete, raffreddamento e altra infrastruttura. Non è il consumo medio e non si somma ai dati dei singoli siti.':`<strong>${esc(selected[2])}.</strong> Compute concentrato nello stesso sito, normalizzato rispetto a H100. ${estimated?'La fonte del giugno 2026 lo classificava come “Future frontier”: la data prevista non conferma l’entrata in servizio.':'I gradini indicano quando cambia il record nel campione; non descrivono una crescita continua del singolo campus.'}`;
      note=isPower?'16 trimestri · Q1 2022–Q4 2025. Ultimo punto estrapolato nella fonte del 16 gennaio 2026.':'Articolo Epoch del 11 giugno 2026 · snapshot storico. I progetti sono separati dalle osservazioni.';
      source=isPower?'https://epoch.ai/data-insights/ai-datacenter-power':'https://epoch.ai/data-insights/largest-data-center-compute';
      $('el-infra-unit').textContent=isPower?'Capacità nominale dei data center AI · GW':'Record nel campione · H100-equivalent';
      const hit=node('rect',{x:g.left,y:g.top,width:g.right-g.left,height:g.bottom-g.top,fill:'transparent',class:'el-chart-touch'});
      hit.addEventListener('click',event=>{const xx=event.clientX-g.svg.getBoundingClientRect().left;infraIndex=rows.reduce((best,row,i)=>Math.abs(x(row[0])-xx)<Math.abs(x(rows[best][0])-xx)?i:best,0);renderInfra();});g.svg.append(hit);
    }
    $('el-infra-reading').innerHTML=`<span class="energy-lab-eyebrow">${heading}</span><strong class="energy-lab-big">${metric}</strong><p>${copy}</p><div class="energy-lab-definition"><strong>${infra==='power'?'Potenza ≠ energia':infra==='site'?'Sito ≠ cluster':'GPU ≠ H100-equivalent'}</strong><p>${infra==='power'?'Un GW per un’ora equivale a un GWh. Per parlare di consumo annuale servono tempo e utilizzo effettivo.':infra==='site'?'Il numero descrive la scala del campus; non garantisce un unico sistema di rete.':'Le H100-equivalent normalizzano la capacità di calcolo di chip diversi. Non contano le schede fisiche.'}</p></div>`;
    $('el-infra-note').textContent=note;$('el-infra-source').href=source;
  }
  document.querySelectorAll('[data-el-infra]').forEach(button=>button.addEventListener('click',()=>{infra=button.dataset.elInfra;infraIndex=infra==='power'?15:showPlans?10:8;press('[data-el-infra]',infra,'elInfra');renderInfra();}));
  $('el-infra-plans').addEventListener('change',event=>{showPlans=event.target.checked;infraIndex=showPlans?10:8;renderInfra();});
  $('el-infra-point').addEventListener('input',event=>{infraIndex=Number(event.target.value);renderInfra();});

  const worldPower=186382.8/8784*1e12, worldExponent=Math.log10(worldPower);
  let kExponent=worldExponent;
  function renderKardashev() {
    const g=canvas('el-k-chart',310,'La scala logaritmica di Kardashev–Sagan','Soglie convenzionali: Tipo I 10 elevato 16 watt, Tipo II 10 elevato 26 watt, Tipo III 10 elevato 36 watt.');
    g.left=30;g.right=g.width-30;
    const x=e=>g.left+(e-12)/24*(g.right-g.left),yy=150;
    line(g.svg,g.left,yy,g.right,yy,{stroke:'var(--chart-muted)','stroke-width':2});
    for(let e=12;e<=36;e++) line(g.svg,x(e),yy-4,x(e),yy+5);
    [[16,'I'],[26,'II'],[36,'III']].forEach(([e,name])=>{line(g.svg,x(e),yy-60,x(e),yy+35,{'stroke-dasharray':'3 4'});label(g.svg,x(e),yy-82,`Tipo ${name}`,'middle',true);label(g.svg,x(e),yy+61,`10${superscript(e)}`,'middle');});
    line(g.svg,x(worldExponent),yy+5,x(worldExponent),yy+86,{stroke:'var(--chart-primary)'});label(g.svg,g.left,yy+108,'Mondo 2024 · ≈21,2 TW','start',true);
    g.svg.append(node('circle',{cx:x(kExponent),cy:yy,r:8,fill:'var(--chart-primary)',stroke:'var(--chart-surface)','stroke-width':3}));
    const k=(kExponent-6)/10, p=10**kExponent,ratio=p/worldPower;
    const worldSelected=Math.abs(kExponent-worldExponent)<.001;
    $('el-k-power').value=kExponent;$('el-k-power').setAttribute('aria-valuetext',`Indice K ${fmt(k,2)}, ${fmt(ratio,1)} volte la potenza mondiale del 2024`);
    $('el-k-power-label').textContent=`K = ${fmt(k,2)}`;
    const reference=worldSelected?'Mondo 2024':kExponent===16?'Tipo I · soglia convenzionale':kExponent===26?'Tipo II · soglia convenzionale':kExponent===36?'Tipo III · soglia convenzionale':'Esplorazione ipotetica';
    const displayPower=p<1e15?`${fmt(p/1e12,1)} TW`:`10<sup>${fmt(kExponent,2)}</sup> W`;
    const ratioDisplay=ratio<1e6?fmt(ratio,ratio<10?2:0):`10<sup>${fmt(Math.log10(ratio),1)}</sup>`;
    $('el-k-reading').innerHTML=`<span class="energy-lab-eyebrow">${reference}</span><strong class="energy-lab-big">${fmt(k,2)} <small>indice K</small></strong><p class="energy-k-power">${displayPower}</p><p><strong>${ratioDisplay}×</strong> la potenza primaria media mondiale del 2024.</p><div class="energy-lab-definition"><strong>${worldSelected?'Il Tipo I è ancora circa 471× più in alto.':kExponent<16?'Sotto la soglia del Tipo I':kExponent<26?'Dalla scala planetaria a quella stellare':'Dalla scala stellare a quella galattica'}</strong><p>${worldSelected?'Lo 0,73 è una posizione su una scala logaritmica, non il 73% di una barra di progresso.':'È un confronto di potenze. Non indica fattibilità tecnica, data di arrivo o qualità di una civiltà.'}</p></div>`;
    document.querySelectorAll('[data-el-k]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.elK==='world'?worldSelected:Number(button.dataset.elK)===kExponent)));
  }
  document.querySelectorAll('[data-el-k]').forEach(button=>button.addEventListener('click',()=>{kExponent=button.dataset.elK==='world'?worldExponent:Number(button.dataset.elK);renderKardashev();}));
  $('el-k-power').addEventListener('input',event=>{kExponent=Number(event.target.value);renderKardashev();});
  function renderBuild() {
    const g=canvas('el-build-chart',280,'Tempi di costruzione','Intervalli di durata, con gli estremi minimo e massimo espliciti.');g.left=12;g.right=g.width-18;
    const x=v=>g.left+v/15*(g.right-g.left);
    [0,5,10,15].forEach(v=>{line(g.svg,x(v),25,x(v),245,{'stroke-dasharray':'3 5'});label(g.svg,x(v),270,String(v),v===0?'start':v===15?'end':'middle');});
    [['Data center',1,3],['Solare / eolico',1,5],['Nuova rete',5,15]].forEach(([name,min,max],i)=>{const y=45+i*80;label(g.svg,g.left,y,name,'start',true);label(g.svg,g.right,y,`${min}–${max} anni`,'end',true);line(g.svg,x(min),y+22,x(max),y+22,{stroke:i===2?'var(--energy-warm)':'var(--chart-primary)','stroke-width':9,'stroke-linecap':'round'});[min,max].forEach(v=>g.svg.append(node('circle',{cx:x(v),cy:y+22,r:5,fill:'var(--chart-surface)',stroke:i===2?'var(--energy-warm)':'var(--chart-primary)','stroke-width':2})));});
  }
  function failed(id,message) { $(id).innerHTML=`<p>${message}</p><p>Ricarica la pagina oppure apri i dati dal link della fonte.</p>`; }
  fetch('assets/world-energy-history.json').then(response=>{if(!response.ok)throw Error(response.status);return response.json();}).then(data=>{
    history=data.filter(row=>Number.isFinite(row.y)&&Number.isFinite(row.t)&&row.t>0).sort((a,b)=>a.y-b.y);if(!history.length)throw Error('Empty data');renderHistory();
  }).catch(()=>failed('el-history-reading','I dati storici non sono disponibili in questo momento.'));
  fetch('assets/energy-gdp-2024.json').then(response=>{if(!response.ok)throw Error(response.status);return response.json();}).then(data=>{
    countries=data.filter(row=>row.g>0&&row.e>0).sort((a,b)=>countryName(a).localeCompare(countryName(b),'it'));
    if(!countries.length)throw Error('Empty data');
    ['el-country-a','el-country-b'].forEach(id=>{$(id).replaceChildren(...countries.map(row=>{const option=document.createElement('option');option.value=row.c;option.textContent=countryName(row);return option;}));});
    $('el-country-a').value=countryA;$('el-country-b').value=countryB;renderCountries();
  }).catch(()=>failed('el-gdp-reading','Il confronto tra Paesi non è disponibile in questo momento.'));
  renderInfra();renderKardashev();renderBuild();
  let resize;
  const observer=new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(()=>{renderHistory();renderCountries();renderInfra();renderKardashev();renderBuild();},100);});
  document.querySelectorAll('.energy-lab-chart').forEach(svg=>observer.observe(svg.parentElement));
})();
