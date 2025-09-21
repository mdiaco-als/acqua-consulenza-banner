(function () {
  'use strict';
  if (window.consultationBannerLoaded) return;
  window.consultationBannerLoaded = true;

// —— CONFIG (legge i data-* dal tag <script> che include il file) ——
const _scr = document.currentScript;
const _ds  = _scr ? _scr.dataset : {};
const CONFIG = {
  KEY_DEADLINE: "water_calc_deadline_v3",
  DURATION_MS: (Number(_ds.durationHours) > 0 ? Number(_ds.durationHours) : 48) * 3600 * 1000,
  PHONE: _ds.phone || "393406743923",
  MESSAGE: _ds.message || "Ciao Massimiliano, voglio prenotare la consulenza gratuita sull'acqua. Preferisco [mattina/pomeriggio/sera]"
};

  // —— UTILS ——
  const throttle = (fn, wait = 150) => { let t = 0; return (...a)=>{ const n=Date.now(); if(n-t>=wait){ t=n; fn(...a);} }; };
  const pad2 = n => String(n).padStart(2,'0');
  function contentWidth(node){
    if (!node) return 0;
    const cs = getComputedStyle(node);
    const pl = parseFloat(cs.paddingLeft)||0, pr = parseFloat(cs.paddingRight)||0;
    return Math.max(0, node.clientWidth - pl - pr);
  }

  // —— CSS OTTIMIZZATO PER DESKTOP ——
  const css = `
    :root{ --cb-extra-offset: 0px; }
    .consultation-bar{
      position:fixed; left:0; right:0;
      bottom: var(--cb-extra-offset, 0px);
      background:#2c5447; color:#fff; z-index:999999;
      font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      transition: transform .3s ease, opacity .3s ease, bottom .2s ease;
      animation: slideUp .6s cubic-bezier(.4,0,.2,1) forwards;
      -webkit-text-size-adjust:100%; text-size-adjust:100%;
      box-sizing:border-box;
    }
    .consultation-bar *{ box-sizing:border-box; }

    /* LAYOUT DESKTOP: TUTTO SU UNA RIGA */
    @media (min-width: 768px) {
      .consultation-bar {
        padding: 12px 24px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom,0px));
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      
      .consultation-bar .title-section {
        flex: 0 0 auto;
      }
      
      .consultation-bar .timer-section {
        flex: 1;
        text-align: center;
      }
      
      .consultation-bar .button-section {
        flex: 0 0 auto;
      }
      
      /* Nascondi layout mobile su desktop */
      .consultation-bar .title-row,
      .consultation-bar .bottom-row {
        display: none;
      }
    }

    /* LAYOUT MOBILE: MANTIENE IL DESIGN ORIGINALE */
    @media (max-width: 767px) {
      .consultation-bar {
        padding: 12px 16px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom,0px));
      }
      
      /* Nascondi layout desktop su mobile */
      .consultation-bar .title-section,
      .consultation-bar .timer-section,
      .consultation-bar .button-section {
        display: none;
      }
      
      .consultation-bar .title-row {
        width: 100%;
        margin-bottom: 8px;
        padding: 0 15px;
      }
      
      .consultation-bar .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      
      .consultation-bar .timer-column {
        flex: 1;
        padding: 0 15px;
      }
      
      .consultation-bar .button-column {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 0 15px;
      }
    }

    /* TITOLO */
    .consultation-bar .title{
      margin: 0;
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    @media (min-width: 768px) {
      .consultation-bar .title {
        font-size: 18px;
        line-height: 1.2;
      }
    }
    
    @media (max-width: 767px) {
      .consultation-bar .title {
        font-size: 18px; /* sovrascritta dal JS */
      }
    }

    /* TIMER */
    .consultation-bar .timer-block{
      color: #ffeb3b;
      font-weight: 700;
      letter-spacing: 0.2px;
      margin: 0;
    }
    
    @media (min-width: 768px) {
      .consultation-bar .timer-block {
        font-size: 16px;
        line-height: 1.3;
      }
      
      .consultation-bar #timer-label {
        display: inline;
        margin-right: 8px;
      }
      
      .consultation-bar #countdown {
        display: inline;
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum" 1, "lnum" 1;
      }
    }
    
    @media (max-width: 767px) {
      .consultation-bar .timer-block {
        font-size: 13px;
        line-height: 1.2;
      }
      
      .consultation-bar #timer-label {
        display: inline-block;
      }
      
      .consultation-bar #countdown {
        white-space: nowrap;
        display: inline-block;
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum" 1, "lnum" 1;
      }
    }

    .consultation-bar .timer-block.expired{ color:#a0a0a0; text-shadow:none; }
    .consultation-bar .timer-urgent{ animation:pulse-urgent 1.5s ease-in-out infinite; color:#ff6b6b; text-shadow:0 0 10px rgba(255,107,107,.5); }

    /* PULSANTE WHATSAPP */
    .consultation-bar .whatsapp-btn{
      background: #25d366;
      color: #fff;
      border: 0;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      transition: transform .2s ease, background .2s ease;
    }
    .consultation-bar .whatsapp-btn:hover{ background:#22c55e; transform:scale(1.02); }
    .consultation-bar .whatsapp-icon{ fill:#fff; }

    @media (min-width: 768px) {
      .consultation-bar .whatsapp-btn {
        height: 40px;
        padding: 0 20px;
        font-size: 15px;
      }
      .consultation-bar .whatsapp-icon {
        width: 20px;
        height: 20px;
      }
    }

    /* RESPONSIVE MOBILE */
    @media (max-width: 414px){
      .consultation-bar{ padding-left:10px; padding-right:10px; }
      .consultation-bar .title-row{ padding:0 8px; }
      .consultation-bar .timer-column{ padding:0 10px; }
      .consultation-bar .button-column{ padding:0 10px; }
    }
    @media (max-width: 480px){
      .consultation-bar{ padding-top:10px; padding-bottom:calc(10px + env(safe-area-inset-bottom,0px)); }
      .consultation-bar .whatsapp-btn{ height:36px; padding:0 12px; font-size:13px; }
    }
    @media (max-width: 380px){
      .consultation-bar .whatsapp-btn span{ display:none; }
      .consultation-bar .whatsapp-btn{ width:40px; height:36px; padding:0; justify-content:center; border-radius:18px; }
    }

    @keyframes slideUp{ from{ opacity:0; transform:translateY(100px);} to{ opacity:1; transform:translateY(0);} }
    @keyframes pulse-urgent{ 0%,100%{ transform:scale(1); opacity:1;} 50%{ transform:scale(1.05); opacity:.85;} }
    @media (prefers-reduced-motion:reduce){
      .consultation-bar{ animation:none; }
      .consultation-bar .timer-urgent{ animation:none; text-shadow:none; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // —— MARKUP CON LAYOUT RESPONSIVO ——
  function createBanner(){
    const el = document.createElement('div');
    el.className = 'consultation-bar';
    el.id = 'consultation-bar';
    el.innerHTML = `
      <!-- LAYOUT DESKTOP -->
      <div class="title-section">
        <div class="title" id="main-title">Consulenza acqua gratuita</div>
      </div>
      
      <div class="timer-section">
        <div class="timer-block" id="timer-block">
          <span id="timer-label">ULTIME:</span>
          <span id="countdown">Caricamento...</span>
        </div>
      </div>
      
      <div class="button-section">
        <a href="#" class="whatsapp-btn" id="whatsapp-btn" target="_blank" rel="noopener" aria-label="Scrivi su WhatsApp per prenotare la consulenza">
          <svg class="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
          </svg>
          <span id="whatsapp-text">Scrivi su WhatsApp</span>
        </a>
      </div>
      
      <!-- LAYOUT MOBILE -->
      <div class="title-row">
        <div class="title" id="main-title-mobile">Consulenza acqua gratuita</div>
      </div>
      <div class="bottom-row">
        <div class="timer-column">
          <div class="timer-block" id="timer-block-mobile">
            <span id="timer-label-mobile">ULTIME:</span><br>
            <span id="countdown-mobile">Caricamento...</span>
          </div>
        </div>
        <div class="button-column">
          <a href="#" class="whatsapp-btn" id="whatsapp-btn-mobile" target="_blank" rel="noopener" aria-label="Scrivi su WhatsApp per prenotare la consulenza">
            <svg class="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
            <span id="whatsapp-text-mobile">Scrivi su WhatsApp</span>
          </a>
        </div>
      </div>
    `;
    return el;
  }

  // —— FIT FUNZIONI ——
  function fitTitleOneLine(id, maxSize=64, minSize=16){
    const el = document.getElementById(id);
    if (!el) return;
    const cw = contentWidth(el.parentElement);
    if (cw <= 0) return;

    const prevDisp = el.style.display, prevFS = el.style.fontSize;
    const BASE = 100, EPS = 2;
    el.style.display = 'inline-block';
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = BASE + 'px';
    const natural = el.scrollWidth;

    if (natural > 0){
      let target = ((cw - EPS) / natural) * BASE;
      target = Math.round(Math.max(minSize, Math.min(maxSize, target)) * 2) / 2;
      el.style.fontSize = target + 'px';
      let guard = 0;
      while (el.scrollWidth > cw && target > minSize && guard < 8){
        target -= 0.5; el.style.fontSize = target + 'px'; guard++;
      }
    }
    el.style.display = prevDisp || '';
    if (!el.style.fontSize) el.style.fontSize = prevFS;
  }

  function fitWhatsAppButton(id, maxSize=20, minSize=12){
    const btn = document.getElementById(id), txt = document.getElementById('whatsapp-text');
    if (!btn || !txt) return;
    const cw = contentWidth(btn.parentElement);
    if (cw <= 0) return;

    const BASE = 24, EPS = 1.5;
    btn.style.fontSize = BASE + 'px';
    txt.style.fontSize = BASE + 'px';
    const w = btn.scrollWidth;
    let target = ((cw - EPS) / w) * BASE;
    target = Math.round(Math.max(minSize, Math.min(maxSize, target)) * 2) / 2;
    btn.style.fontSize = target + 'px';
    txt.style.fontSize = target + 'px';

    let guard = 0;
    while (btn.scrollWidth > cw && target > minSize && guard < 6){
      target -= 0.5;
      btn.style.fontSize = target + 'px';
      txt.style.fontSize = target + 'px';
      guard++;
    }
  }

  function fitTimerBlock(id, maxSize=30, minSize=10){
    const block = document.getElementById(id);
    if (!block) return;
    const cw = contentWidth(block.parentElement);
    if (cw <= 0) return;

    const label = document.getElementById('timer-label');
    const countdown = document.getElementById('countdown');
    if (!label || !countdown) return;

    const realText = countdown.textContent;
    const nbsp = '\u00A0';
    const sampleCountdown = `88${nbsp}h${nbsp}88${nbsp}m${nbsp}88${nbsp}s`;

    const BASE = 30, EPS = 2;
    block.style.fontSize = BASE + 'px';

    const prevLabel = label.textContent;
    const prevCountdown = countdown.textContent;

    countdown.textContent = sampleCountdown;
    const wLabel = label.scrollWidth, wCount = countdown.scrollWidth;

    const natMax = Math.max(wLabel, wCount);
    if (natMax > 0){
      let target = ((cw - EPS) / natMax) * BASE;
      target = Math.max(minSize, Math.min(maxSize, target));
      block.style.fontSize = target + 'px';
    }

    label.textContent = prevLabel;
    countdown.textContent = prevCountdown || realText;
  }

  function resizeAll(){
    fitTitleOneLine('main-title', 64, 16);
    fitTitleOneLine('main-title-mobile', 64, 16);
    fitTimerBlock('timer-block', 30, 12);
    fitTimerBlock('timer-block-mobile', 30, 12);
    fitWhatsAppButton('whatsapp-btn', 20, 12);
    fitWhatsAppButton('whatsapp-btn-mobile', 20, 12);
    updateLayoutOffsets();
  }

  // —— LAYOUT: evita di coprire bottoni in fondo ——
  function detectFixedFooterHeight(){
    let extra = 0;
    try{
      const nodes = document.body.getElementsByTagName('*');
      for (let i=0; i<nodes.length; i++){
        const n = nodes[i];
        if (n.id === 'consultation-bar') continue;
        const cs = getComputedStyle(n);
        if (cs.position !== 'fixed') continue;
        const rect = n.getBoundingClientRect();
        const atBottom = (window.innerHeight - rect.bottom) <= 2;
        const plausible = rect.height > 0 && rect.height < window.innerHeight * 0.5;
        if (atBottom && plausible){
          extra = Math.max(extra, Math.ceil(rect.height));
        }
      }
    } catch(e){}
    return extra;
  }
  function updateLayoutOffsets(){
    const bar = document.getElementById('consultation-bar');
    if (!bar) return;
    const barH = Math.ceil(bar.getBoundingClientRect().height);
    const extra = detectFixedFooterHeight();
    document.documentElement.style.setProperty('--cb-extra-offset', extra + 'px');
    const desired = barH + extra + 8;
    const current = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    if (Math.abs(current - desired) > 1){
      document.body.style.paddingBottom = desired + 'px';
    }
  }

  // —— DEADLINE & SYNC (fuori da init, così sono sempre disponibili) ——
  function ensureDeadline(){
    let iso = localStorage.getItem(CONFIG.KEY_DEADLINE);
    if (!iso){
      iso = new Date(Date.now() + CONFIG.DURATION_MS).toISOString();
      localStorage.setItem(CONFIG.KEY_DEADLINE, iso);
    }
    return new Date(iso).getTime();
  }
  function getDeadlineISO(){ return new Date(ensureDeadline()).toISOString(); }
  function sendDeadlineTo(targetWin){
    try { targetWin?.postMessage({ type: 'watercalc:deadline', deadline: getDeadlineISO() }, '*'); } catch(e){}
  }
  function broadcastDeadline(){
    const frame = document.getElementById('watercalc');
    if (frame && frame.contentWindow) sendDeadlineTo(frame.contentWindow);
  }

  // —— TIMER (DOM-live: cerca i nodi a ogni tick, così sopravvive ai re-render) ——
  let lastState = 'normal';
  function formatTime(ms){
    if (ms <= 0) return "Lista d'attesa";
    const total = Math.floor(ms/1000);
    const h = Math.floor(total/3600), m = Math.floor((total%3600)/60), s = total%60;
    const nbsp = '\u00A0';
    return `${pad2(h)}${nbsp}h${nbsp}${pad2(m)}${nbsp}m${nbsp}${pad2(s)}${nbsp}s`;
  }
  function updateTimer(){
    const timerEl = document.getElementById('countdown');
    const timerElMobile = document.getElementById('countdown-mobile');
    const titleEl = document.getElementById('main-title');
    const titleElMobile = document.getElementById('main-title-mobile');
    const blockEl = document.getElementById('timer-block');
    const blockElMobile = document.getElementById('timer-block-mobile');
    const waBtn = document.getElementById('whatsapp-btn');
    const waBtnMobile = document.getElementById('whatsapp-btn-mobile');
    const waText = document.getElementById('whatsapp-text');
    const waTextMobile = document.getElementById('whatsapp-text-mobile');

    if (!timerEl && !timerElMobile) return; // se il banner non è montato ora, aspettiamo il prossimo tick

    try{
      const remaining = ensureDeadline() - Date.now();
      const timeText = formatTime(remaining);
      if (timerEl) timerEl.textContent = timeText;
      if (timerElMobile) timerElMobile.textContent = timeText;

      let state = 'normal';
      if (remaining <= 0) state = 'expired';
      else if (remaining <= 5*60*1000) state = 'urgent';

      if (state !== lastState){
        [blockEl, blockElMobile].forEach(block => {
          if (block) {
            if (state === 'expired'){
              block.classList.remove('timer-urgent'); block.classList.add('expired');
            } else if (state === 'urgent'){
              block.classList.add('timer-urgent'); block.classList.remove('expired');
            } else {
              block.classList.remove('timer-urgent','expired');
            }
          }
        });

        if (state === 'expired'){
          const expiredTitle = "Consulenze gratuite terminate";
          const expiredText = "Entra in lista";
          const expiredMessage = "Ciao Massimiliano, le consulenze gratuite sono terminate. Vorrei entrare in lista d'attesa per la prossima occasione.";
          
          if (titleEl) titleEl.textContent = expiredTitle;
          if (titleElMobile) titleElMobile.textContent = expiredTitle;
          if (waText) waText.textContent = expiredText;
          if (waTextMobile) waTextMobile.textContent = expiredText;
          if (waBtn) waBtn.href = `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(expiredMessage)}`;
          if (waBtnMobile) waBtnMobile.href = `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(expiredMessage)}`;
          
          requestAnimationFrame(()=> requestAnimationFrame(resizeAll));
        }
        lastState = state;
      }
    } catch(e){
      console.warn('Errore timer:', e);
      if (timerEl) timerEl.textContent = "Lista d'attesa";
      if (timerElMobile) timerElMobile.textContent = "Lista d'attesa";
    }
  }

  // —— MOUNT / INIT ——
  function mountMarkup(){
    const existing = document.getElementById('consultation-bar');
    if (existing) existing.remove();
    const bar = createBanner();
    document.body.appendChild(bar);

    const wa = document.getElementById('whatsapp-btn');
    const waMobile = document.getElementById('whatsapp-btn-mobile');
    if (wa) wa.href = `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(CONFIG.MESSAGE)}`;
    if (waMobile) waMobile.href = `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(CONFIG.MESSAGE)}`;
    
    // primo fit dopo layout/font
    const firstFit = () => { resizeAll(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(firstFit);
    else requestAnimationFrame(() => requestAnimationFrame(firstFit));
  }

  function initOnce(){
    if (window.__cbInitDone) return;
    window.__cbInitDone = true;

    // listener globali (una volta sola)
    window.addEventListener('resize', throttle(resizeAll, 150));
    window.addEventListener('orientationchange', () => setTimeout(resizeAll, 60));

    if ('ResizeObserver' in window){
      const ro = new ResizeObserver(throttle(resizeAll, 150));
      ro.observe(document.documentElement);
    }

    // osserva il DOM: se il banner sparisce (SPA re-render), lo rimontiamo
    if ('MutationObserver' in window){
      const keepAlive = new MutationObserver(throttle(() => {
        if (!document.getElementById('consultation-bar')){
          mountMarkup();
          broadcastDeadline();
        }
        updateLayoutOffsets();
      }, 200));
      keepAlive.observe(document.body, { childList:true, subtree:true });
    }

    // visibilità/pagina mostrata (iOS back-forward cache, SPA)
    window.addEventListener('pageshow', () => {
      if (!document.getElementById('consultation-bar')) {
        mountMarkup();
        broadcastDeadline();
      }
      resizeAll();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible'){
        if (!document.getElementById('consultation-bar')) {
          mountMarkup();
          broadcastDeadline();
        }
        resizeAll();
      }
    });

    // messaggi dall'iframe (richiesta deadline)
    window.addEventListener('message', (e) => {
      if (e?.data?.type === 'watercalc:get-deadline') sendDeadlineTo(e.source);
    });

    // invia deadline all'iframe appena possibile
    const frame = document.getElementById('watercalc');
    if (frame){
      frame.addEventListener('load', () => setTimeout(broadcastDeadline, 0));
    }
    broadcastDeadline();

    // storage sync
    window.addEventListener('storage', (e) => {
      if (e.key === CONFIG.KEY_DEADLINE) {
        updateTimer();
        broadcastDeadline();
      }
    });

    // timer: assicurati di non avviare più intervalli
    if (!window.__cbInterval){
      updateTimer();
      window.__cbInterval = setInterval(updateTimer, 1000);
    }
  }

  function init(){
    mountMarkup();
    initOnce();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
