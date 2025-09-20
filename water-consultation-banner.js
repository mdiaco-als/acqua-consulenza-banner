(function() {
    'use strict';
    
    // Evita doppio caricamento
    if (window.consultationBannerLoaded) return;
    window.consultationBannerLoaded = true;
    
    // CONFIGURAZIONE
    const CONFIG = {
        KEY_DEADLINE: "water_calc_deadline_v3",
        KEY_HIDDEN: "als_water_banner_hidden_v3",
        DURATION_MS: 48 * 60 * 60 * 1000, // 48 ore
        PHONE: "393406743923",
        MESSAGE: "Ciao Massimiliano, voglio prenotare la consulenza gratuita sull'acqua. Preferisco [mattina/pomeriggio/sera]"
    };
    
    // CSS Styles
    const css = `
        .consultation-bar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: #2c5447 !important;
            padding: 12px 16px !important;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
            z-index: 999999 !important;
            color: white !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            transition: all 0.3s ease !important;
            box-sizing: border-box !important;
        }
        
        .consultation-bar * {
            box-sizing: border-box !important;
        }
        
        .consultation-bar .close-btn {
            position: absolute !important;
            top: 8px !important;
            right: 12px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            width: 24px !important;
            height: 24px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            opacity: 0.7 !important;
            transition: all 0.2s ease !important;
        }
        
        .consultation-bar .close-btn:hover {
            opacity: 1 !important;
            background: rgba(239, 68, 68, 0.3) !important;
            border-color: rgba(239, 68, 68, 0.5) !important;
        }
        
        .consultation-bar .title-row {
            width: 100% !important;
            margin-bottom: 8px !important;
            padding: 0 15px !important;
        }
        
        .consultation-bar .title {
            font-size: 18px !important;
            font-weight: 500 !important;
            color: white !important;
            width: 100% !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            margin: 0 !important;
        }
        
        .consultation-bar .bottom-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
        }
        
        .consultation-bar .timer-column {
            flex: 1 !important;
            padding: 0 15px !important;
        }
        
        .consultation-bar .timer-block {
            color: #ffeb3b !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
            transition: all 0.3s ease !important;
            margin: 0 !important;
        }
        
        .consultation-bar .button-column {
            flex: 1 !important;
            display: flex !important;
            justify-content: flex-end !important;
            align-items: center !important;
            padding: 0 15px !important;
        }
        
        .consultation-bar .whatsapp-btn {
            background: #25d366 !important;
            border: none !important;
            border-radius: 20px !important;
            height: 40px !important;
            padding: 0 16px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            text-decoration: none !important;
            color: white !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            white-space: nowrap !important;
            overflow: hidden !important;
        }
        
        .consultation-bar .whatsapp-btn:hover {
            background: #22c55e !important;
            transform: scale(1.02) !important;
        }
        
        .consultation-bar .whatsapp-icon {
            width: 20px !important;
            height: 20px !important;
            fill: white !important;
        }
        
        .consultation-bar .timer-urgent {
            animation: pulse-urgent 1.5s ease-in-out infinite !important;
            color: #ff6b6b !important;
            text-shadow: 0 0 10px rgba(255, 107, 107, 0.5) !important;
        }
        
        .consultation-bar .timer-block.expired {
            color: #a0a0a0 !important;
            animation: none !important;
            text-shadow: none !important;
        }
        
        @keyframes pulse-urgent {
            0%, 100% { 
                transform: scale(1);
                opacity: 1;
            }
            50% { 
                transform: scale(1.05);
                opacity: 0.8;
            }
        }
        
        .consultation-bar.hidden {
            display: none !important;
        }
        
        @media (max-width: 480px) {
            .consultation-bar {
                padding: 10px 12px !important;
                padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
            }
            
            .consultation-bar .whatsapp-btn {
                height: 36px !important;
                padding: 0 12px !important;
                font-size: 13px !important;
            }
        }
        
        @media (max-width: 380px) {
            .consultation-bar .whatsapp-btn span {
                display: none !important;
            }
            
            .consultation-bar .whatsapp-btn {
                width: 40px !important;
                height: 36px !important;
                padding: 0 !important;
                justify-content: center !important;
                border-radius: 18px !important;
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(100px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .consultation-bar {
            animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
        }
    `;
    
    // Crea e inserisce CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    // Crea HTML del banner
    function createBanner() {
        const banner = document.createElement('div');
        banner.className = 'consultation-bar';
        banner.id = 'consultation-bar';
        
        banner.innerHTML = `
            <button class="close-btn" id="close-btn" aria-label="Chiudi banner">×</button>
            
            <div class="title-row">
                <div class="title" id="main-title">Consulenza acqua gratuita</div>
            </div>
            
            <div class="bottom-row">
                <div class="timer-column">
                    <div class="timer-block" id="timer-block">
                        ULTIME:<br><span id="countdown">Caricamento...</span>
                    </div>
                </div>
                
                <div class="button-column">
                    <a href="#" class="whatsapp-btn" id="whatsapp-btn" target="_blank" rel="noopener">
                        <svg class="whatsapp-icon" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                        </svg>
                        <span id="whatsapp-text">Scrivi su WhatsApp</span>
                    </a>
                </div>
            </div>
        `;
        
        return banner;
    }
    
    // Inizializzazione quando DOM è pronto
    function init() {
        // Rimuovi banner esistente se presente
        const existing = document.getElementById('consultation-bar');
        if (existing) existing.remove();
        
        // Crea e inserisci il banner
        const banner = createBanner();
        document.body.appendChild(banner);
        
        // Elementi DOM
        const elements = {
            bar: document.getElementById('consultation-bar'),
            timer: document.getElementById('countdown'),
            timerBlock: document.getElementById('timer-block'),
            close: document.getElementById('close-btn'),
            wa: document.getElementById('whatsapp-btn'),
            title: document.getElementById('main-title')
        };
        
        // Setup WhatsApp link
        if (elements.wa) {
            const waLink = `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(CONFIG.MESSAGE)}`;
            elements.wa.href = waLink;
        }
        
        // FUNZIONE SEMPLICE PER RIDIMENSIONARE IL TESTO
        function fitText(elementId, maxSize = 40, minSize = 8) {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            const container = element.parentElement;
            const containerWidth = container.offsetWidth - 30;
            
            let fontSize = maxSize;
            
            while (fontSize >= minSize) {
                element.style.fontSize = fontSize + 'px';
                
                if (element.scrollWidth <= containerWidth) {
                    break;
                }
                
                fontSize -= 0.5;
            }
        }
        
        // FUNZIONE SPECIALE PER IL PULSANTE WHATSAPP
        function fitWhatsAppButton(buttonId, maxSize = 20, minSize = 10) {
            const button = document.getElementById(buttonId);
            const textSpan = document.getElementById('whatsapp-text');
            if (!button || !textSpan) return;
            
            const container = button.parentElement;
            const containerWidth = container.offsetWidth - 30;
            
            let fontSize = maxSize;
            
            while (fontSize >= minSize) {
                button.style.fontSize = fontSize + 'px';
                textSpan.style.fontSize = fontSize + 'px';
                
                if (button.scrollWidth <= containerWidth) {
                    break;
                }
                
                fontSize -= 0.5;
            }
        }
        
        // FUNZIONE SPECIALE PER IL TIMER
        function fitTimerBlock(elementId, maxSize = 30, minSize = 6) {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            const container = element.parentElement;
            const containerWidth = container.offsetWidth - 30;
            
            let fontSize = minSize;
            let bestFit = minSize;
            
            while (fontSize <= maxSize) {
                element.style.fontSize = fontSize + 'px';
                
                const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || fontSize * 1.2;
                const expectedHeight = lineHeight * 2;
                const actualHeight = element.offsetHeight;
                
                if (actualHeight <= expectedHeight * 1.1 && element.scrollWidth <= containerWidth) {
                    bestFit = fontSize;
                    fontSize += 0.2;
                } else {
                    break;
                }
            }
            
            element.style.fontSize = bestFit + 'px';
        }
        
        // APPLICA IL RIDIMENSIONAMENTO
        function resizeAll() {
            if (!elements.bar || elements.bar.classList.contains('hidden')) return;
            
            fitText('main-title', 50, 14);
            fitTimerBlock('timer-block', 30, 6);
            fitWhatsAppButton('whatsapp-btn', 20, 10);
        }
        
        // Close functionality
        if (elements.close) {
            elements.close.addEventListener('click', function() {
                const hideUntil = Date.now() + 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.KEY_HIDDEN, String(hideUntil));
                
                if (elements.bar) {
                    elements.bar.style.transform = "translateY(100px)";
                    elements.bar.style.opacity = "0";
                    
                    setTimeout(() => {
                        elements.bar.classList.add("hidden");
                        elements.bar.style.transform = "";
                        elements.bar.style.opacity = "";
                    }, 300);
                }
            });
        }
        
        // Verifica se nascosto
        function checkHiddenState() {
            const hiddenUntil = parseInt(localStorage.getItem(CONFIG.KEY_HIDDEN) || "0", 10);
            if (!isNaN(hiddenUntil) && hiddenUntil > Date.now()) {
                elements.bar?.classList.add("hidden");
                return true;
            }
            return false;
        }
        
        // Utility functions
        function padZero(n) { 
            return String(n).padStart(2, '0'); 
        }
        
        function formatTime(ms) {
            if (ms <= 0) return "Lista d'attesa";
            
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            const h = padZero(hours);
            const m = padZero(minutes);
            const s = padZero(seconds);
            
            return `${h} h ${m} m ${s} s`;
        }
        
        // Gestione deadline
        function ensureDeadline() {
            let deadlineISO = localStorage.getItem(CONFIG.KEY_DEADLINE);
            if (!deadlineISO) {
                deadlineISO = new Date(Date.now() + CONFIG.DURATION_MS).toISOString();
                localStorage.setItem(CONFIG.KEY_DEADLINE, deadlineISO);
            }
            return new Date(deadlineISO).getTime();
        }
        
        // Timer principale
        function updateTimer() {
            if (!elements.timer) return;
            
            try {
                const deadline = ensureDeadline();
                const remaining = deadline - Date.now();
                const formattedTime = formatTime(remaining);
                
                elements.timer.textContent = formattedTime;
                
                // Gestione stati del timer
                if (remaining <= 0) {
                    // STATO SCADUTO
                    elements.timerBlock?.classList.remove("timer-urgent");
                    elements.timerBlock?.classList.add("expired");
                    
                    // Cambia titolo
                    if (elements.title) {
                        elements.title.textContent = "Consulenze gratuite terminate";
                    }
                    
                    // Cambia CTA
                    const ctaText = document.getElementById('whatsapp-text');
                    if (ctaText) {
                        ctaText.textContent = "Entra in lista";
                    }
                    
                    // Aggiorna messaggio WhatsApp per lista d'attesa
                    if (elements.wa) {
                        const waitlistMessage = "Ciao Massimiliano, le consulenze gratuite sono terminate. Vorrei entrare in lista d'attesa per la prossima occasione.";
                        const waLink = `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(waitlistMessage)}`;
                        elements.wa.href = waLink;
                    }
                    
                    // NON resetta il deadline - resta in stato scaduto
                    
                } else if (remaining <= 5 * 60 * 1000) {
                    // STATO URGENTE (ultimi 5 minuti)
                    elements.timerBlock?.classList.add("timer-urgent");
                    elements.timerBlock?.classList.remove("expired");
                } else {
                    // STATO NORMALE
                    elements.timerBlock?.classList.remove("timer-urgent", "expired");
                }
                
                setTimeout(resizeAll, 10);
            } catch (error) {
                console.warn('Errore timer:', error);
                elements.timer.textContent = "Lista d'attesa";
            }
        }
        
        // Eventi
        window.addEventListener('load', function() {
            resizeAll();
            setTimeout(resizeAll, 100);
        });
        window.addEventListener('resize', resizeAll);
        
        // Storage events
        window.addEventListener("storage", function(e) {
            if (e.key === CONFIG.KEY_DEADLINE && e.newValue) {
                updateTimer();
            }
            if (e.key === CONFIG.KEY_HIDDEN) {
                const hideUntil = parseInt(e.newValue || "0", 10);
                if (hideUntil > Date.now()) {
                    elements.bar?.classList.add("hidden");
                } else {
                    elements.bar?.classList.remove("hidden");
                    resizeAll();
                }
            }
        });
        
        // Avvia se non nascosto
        if (!checkHiddenState()) {
            updateTimer();
            setInterval(updateTimer, 1000);
            setInterval(resizeAll, 5000);
            
            console.log('✅ Banner Consulenza Acqua caricato con successo');
        }
    }
    
    // Avvia quando DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
