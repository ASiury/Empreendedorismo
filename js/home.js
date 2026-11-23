import { AccessibilityManager } from './accessibility.js';
    import { getUserProfile, saveUserProfile, loginCompany, registerCompany, getCurrentCompany } from './data.js';

    document.addEventListener('DOMContentLoaded', () => {
      const a11y = new AccessibilityManager();

      // Botão Narrador no Topo
      document.getElementById('btn-tts-global')?.addEventListener('click', () => {
        if (a11y.speaking) {
          a11y.stopSpeaking();
        } else {
          a11y.speak('Bem-vindo ao AcessaAqui, programa de inclusão e acessibilidade. Escolha seu acesso: Sou Cliente para navegar pelo mapa de estabelecimentos acessíveis, ou Sou Empresa para cadastrar seu local e emitir o selo de certificação.');
        }
      });

      // Painel de Acessibilidade
      const panel = document.getElementById('accessibility-panel');
      document.getElementById('btn-toggle-a11y-panel')?.addEventListener('click', () => {
        panel?.classList.toggle('hidden');
      });
      document.getElementById('btn-close-a11y-panel')?.addEventListener('click', () => {
        panel?.classList.add('hidden');
      });

      // Controles Acessibilidade
      document.getElementById('btn-a11y-font-plus')?.addEventListener('click', () => a11y.changeFontSize(1));
      document.getElementById('btn-a11y-font-minus')?.addEventListener('click', () => a11y.changeFontSize(-1));
      document.getElementById('btn-a11y-font-reset')?.addEventListener('click', () => a11y.resetFontSize());
      document.getElementById('btn-a11y-contrast-dark')?.addEventListener('click', () => a11y.setContrastMode('high-contrast-dark'));
      document.getElementById('btn-a11y-contrast-light')?.addEventListener('click', () => a11y.setContrastMode('high-contrast-light'));
      document.getElementById('btn-a11y-contrast-normal')?.addEventListener('click', () => a11y.setContrastMode('normal'));
      document.getElementById('btn-a11y-dyslexia')?.addEventListener('click', () => a11y.toggleDyslexicFont());
      document.getElementById('btn-a11y-guide')?.addEventListener('click', () => a11y.toggleReadingGuide());

      // ================= MODAL DA EMPRESA ================= //
      const companyModal = document.getElementById('company-auth-modal');
      const openCompanyBtn = document.getElementById('btn-open-company-login-modal');
      const closeCompanyBtn = document.getElementById('btn-close-company-modal');
      const companyBackdrop = document.getElementById('company-auth-backdrop');

      const openCompany = async () => {
        try {
          if (await getCurrentCompany()) {
            window.location.href = 'view/empresa.html';
            return;
          }
        } catch { /* A tela de autenticação mostra o erro quando o usuário enviar o formulário. */ }
        setAuthMode('login');
        companyModal?.classList.remove('hidden');
        document.getElementById('login-email')?.focus();
      };
      const closeCompany = () => companyModal?.classList.add('hidden');

      openCompanyBtn?.addEventListener('click', openCompany);
      closeCompanyBtn?.addEventListener('click', closeCompany);
      companyBackdrop?.addEventListener('click', closeCompany);

      const showErr = (id, message) => {
        const el = document.getElementById(id);
        if (el) { el.textContent = message; el.classList.remove('hidden'); }
      };
      const setAuthMode = (mode) => {
        const login = mode === 'login';
        document.getElementById('form-company-login')?.classList.toggle('hidden', !login);
        document.getElementById('form-company-register')?.classList.toggle('hidden', login);
        [['auth-tab-login', login], ['auth-tab-register', !login]].forEach(([id, active]) => {
          const button = document.getElementById(id);
          button?.classList.toggle('border-amber-600', active);
          button?.classList.toggle('text-amber-700', active);
          button?.classList.toggle('border-transparent', !active);
          button?.classList.toggle('text-slate-600', !active);
          button?.setAttribute('aria-selected', String(active));
        });
      };
      document.getElementById('auth-tab-login')?.addEventListener('click', () => setAuthMode('login'));
      document.getElementById('auth-tab-register')?.addEventListener('click', () => setAuthMode('register'));
      if (new URLSearchParams(location.search).has('entrar')) openCompany();

      document.getElementById('form-company-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const error = document.getElementById('login-error');
        error?.classList.add('hidden');
        try {
          await loginCompany({
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
          });
          window.location.href = 'view/empresa.html';
        } catch (err) { showErr('login-error', err.message); }
      });

      document.getElementById('form-company-register')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const error = document.getElementById('register-error');
        error?.classList.add('hidden');
        try {
          await registerCompany({
            cnpj: document.getElementById('company-cnpj').value,
            name: document.getElementById('company-name').value,
            email: document.getElementById('company-email').value,
            phone: document.getElementById('company-phone').value,
            category: document.getElementById('company-category').value,
            password: document.getElementById('company-password').value
          });
          window.location.href = 'view/empresa.html';
        } catch (err) { showErr('register-error', err.message); }
      });

      // ================= MODAL DO CLIENTE ================= //
      const clientModal = document.getElementById('client-profile-modal');
      const openClientBtn = document.getElementById('btn-open-client-profile-modal');
      const closeClientBtn = document.getElementById('btn-close-client-modal');
      const clientBackdrop = document.getElementById('client-profile-backdrop');

      const openClient = () => clientModal?.classList.remove('hidden');
      const closeClient = () => clientModal?.classList.add('hidden');

      openClientBtn?.addEventListener('click', openClient);
      closeClientBtn?.addEventListener('click', closeClient);
      clientBackdrop?.addEventListener('click', closeClient);

      // Submissão Rápida Cliente
      document.getElementById('form-quick-client-profile')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('quick-client-name').value.trim() || 'Usuário Inclusivo';
        const checked = Array.from(document.querySelectorAll('input[name="quick_feature"]:checked')).map(el => el.value);

        const profile = getUserProfile();
        profile.name = name;
        if (checked.length > 0) {
          profile.activePreferences = checked;
          profile.autoFilterByProfile = true;
        }
        saveUserProfile(profile);
        window.location.href = 'view/usuario.html';
      });

    });
