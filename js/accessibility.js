// accessibility.js - Módulo de Acessibilidade Digital (WCAG 2.1 AA/AAA)

const STORAGE_KEY_A11Y = 'acessa_a11y_settings_v1';

export class AccessibilityManager {
  constructor() {
    this.settings = {
      fontSizeStep: 0, // -1 (90%), 0 (100%), 1 (115%), 2 (130%), 3 (145%)
      contrastMode: 'normal', // normal, high-contrast-dark, high-contrast-light
      dyslexicFont: false,
      readingGuide: false,
      speechRate: 1.0,
      speechPitch: 1.0
    };
    this.synth = window.speechSynthesis || null;
    this.speaking = false;
    this.currentUtterance = null;
    this.readingGuideElement = null;

    this.loadSettings();
    this.initDOM();
    this.applySettings();
    this.setupKeyboardShortcuts();
    this.setupVLibras();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_A11Y);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Não foi possível carregar configurações de acessibilidade:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_A11Y, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Não foi possível salvar configurações de acessibilidade:', e);
    }
  }

  initDOM() {
    // Cria régua de leitura (Reading Guide)
    this.readingGuideElement = document.createElement('div');
    this.readingGuideElement.id = 'reading-guide-line';
    this.readingGuideElement.style.display = 'none';
    document.body.appendChild(this.readingGuideElement);

    window.addEventListener('mousemove', (e) => {
      if (this.settings.readingGuide) {
        this.readingGuideElement.style.top = `${e.clientY - 20}px`;
      }
    });
  }

  applySettings() {
    const root = document.documentElement;

    // Tamanho da fonte
    const fontSizes = ['90%', '100%', '115%', '130%', '145%'];
    const idx = Math.min(Math.max(this.settings.fontSizeStep + 1, 0), fontSizes.length - 1);
    root.style.fontSize = fontSizes[idx];

    // Contraste
    root.classList.remove('theme-high-contrast-dark', 'theme-high-contrast-light');
    if (this.settings.contrastMode === 'high-contrast-dark') {
      root.classList.add('theme-high-contrast-dark');
    } else if (this.settings.contrastMode === 'high-contrast-light') {
      root.classList.add('theme-high-contrast-light');
    }

    // Fonte dislexia
    if (this.settings.dyslexicFont) {
      root.classList.add('font-dyslexic');
    } else {
      root.classList.remove('font-dyslexic');
    }

    // Guia de leitura
    if (this.settings.readingGuide) {
      this.readingGuideElement.style.display = 'block';
    } else {
      this.readingGuideElement.style.display = 'none';
    }

    this.updateControlsState();
  }

  changeFontSize(delta) {
    this.settings.fontSizeStep = Math.min(Math.max(this.settings.fontSizeStep + delta, -1), 3);
    this.applySettings();
    this.saveSettings();
    this.announce(`Tamanho do texto ajustado para nível ${this.settings.fontSizeStep}`);
  }

  resetFontSize() {
    this.settings.fontSizeStep = 0;
    this.applySettings();
    this.saveSettings();
    this.announce('Tamanho do texto redefinido para o padrão.');
  }

  setContrastMode(mode) {
    this.settings.contrastMode = mode;
    this.applySettings();
    this.saveSettings();
    const modeNames = {
      'normal': 'Contraste padrão ativado.',
      'high-contrast-dark': 'Alto contraste escuro ativado.',
      'high-contrast-light': 'Alto contraste claro ativado.'
    };
    this.announce(modeNames[mode] || 'Contraste modificado.');
  }

  toggleDyslexicFont() {
    this.settings.dyslexicFont = !this.settings.dyslexicFont;
    this.applySettings();
    this.saveSettings();
    this.announce(this.settings.dyslexicFont ? 'Fonte com alta legibilidade ativada.' : 'Fonte padrão ativada.');
  }

  toggleReadingGuide() {
    this.settings.readingGuide = !this.settings.readingGuide;
    this.applySettings();
    this.saveSettings();
    this.announce(this.settings.readingGuide ? 'Guia de leitura ativada.' : 'Guia de leitura desativada.');
  }

  // Síntese de Voz (Text-to-Speech)
  speak(text) {
    if (!this.synth) {
      alert('Seu navegador não oferece suporte nativo à síntese de voz (Web Speech API).');
      return;
    }

    this.stopSpeaking();

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = this.settings.speechRate || 0.7;
    utterance.pitch = this.settings.speechPitch || 0.6;

    // Seleciona voz brasileira se disponível
    const voices = this.synth.getVoices();
    const brVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt'));
    if (brVoice) {
      utterance.voice = brVoice;
    }

    utterance.onstart = () => {
      this.speaking = true;
      document.body.classList.add('tts-playing');
      const btn = document.getElementById('btn-tts-global');
      if (btn) btn.classList.add('animate-pulse', 'text-amber-400');
    };

    utterance.onend = utterance.onerror = () => {
      this.speaking = false;
      document.body.classList.remove('tts-playing');
      const btn = document.getElementById('btn-tts-global');
      if (btn) btn.classList.remove('animate-pulse', 'text-amber-400');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.speaking = false;
      document.body.classList.remove('tts-playing');
      const btn = document.getElementById('btn-tts-global');
      if (btn) btn.classList.remove('animate-pulse', 'text-amber-400');
    }
  }

  // Notificação acessível para leitores de tela
  announce(message) {
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 50);
    }
  }

  updateControlsState() {
    const btnDyslexia = document.getElementById('btn-a11y-dyslexia');
    if (btnDyslexia) {
      btnDyslexia.setAttribute('aria-pressed', String(this.settings.dyslexicFont));
    }
    const btnGuide = document.getElementById('btn-a11y-guide');
    if (btnGuide) {
      btnGuide.setAttribute('aria-pressed', String(this.settings.readingGuide));
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Alt + A: Foca no menu de acessibilidade
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const drawer = document.getElementById('accessibility-panel');
        if (drawer) {
          drawer.classList.toggle('hidden');
          const firstBtn = drawer.querySelector('button');
          if (firstBtn) firstBtn.focus();
        }
      }
      // Alt + M: Ir para o Mapa
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const tabMap = document.getElementById('tab-btn-explore');
        if (tabMap) tabMap.click();
      }
      // Alt + S: Parar sintetizador de voz
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.stopSpeaking();
      }
    });
  }

  setupVLibras() {
    // Carrega script oficial do VLibras do Governo Federal
    try {
      if (!document.getElementById('vlibras-script')) {
        const script = document.createElement('script');
        script.id = 'vlibras-script';
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.onload = () => {
          if (window.VLibras) {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
          }
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      console.warn('Aviso: VLibras indisponível em modo offline/sandbox.', err);
    }
  }
}

