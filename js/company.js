import { 
      getEstablishments,
      getMyEstablishments, 
      addEstablishment, 
      deleteEstablishment,
      getMyFeedback,
      getCurrentCompany,
      logoutCompany
    } from './data.js';

    import { 
      ACCESSIBILITY_FEATURES, 
      calculateAccessibilityScore,
      BADGE_TIERS
    } from './certification.js';

    document.addEventListener('DOMContentLoaded', async () => {
      // Carrega dados da sessão da empresa
      const companySession = await getCurrentCompany();
      if (!companySession) { location.href = '../index.html?entrar=1'; return; }

      const nameEl = document.getElementById('header-company-name');
      const cnpjEl = document.getElementById('header-company-cnpj');
      if (nameEl) nameEl.innerHTML = companySession.name;
      document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await logoutCompany();
        location.href = '../index.html';
      });
      if (cnpjEl) cnpjEl.textContent = `CNPJ: ${companySession.cnpj || 'Cadastrado'}`;

      // ==================== NAVEGAÇÃO DE ABAS ==================== //
      const tabBtns = document.querySelectorAll('.company-tab-btn');
      const tabPanels = document.querySelectorAll('.company-tab-panel');

      const switchCompanyTab = (targetId) => {
        tabPanels.forEach(p => p.classList.add('hidden'));
        document.getElementById(`panel-${targetId}`)?.classList.remove('hidden');

        tabBtns.forEach(b => {
          const isTarget = b.id === `tab-btn-${targetId}`;
          b.setAttribute('aria-selected', String(isTarget));
          if (isTarget) {
            b.classList.add('border-amber-600', 'text-amber-700', 'font-bold');
            b.classList.remove('border-transparent', 'text-slate-600');
          } else {
            b.classList.remove('border-amber-600', 'text-amber-700', 'font-bold');
            b.classList.add('border-transparent', 'text-slate-600');
          }
        });
      };

      document.getElementById('tab-btn-company-register')?.addEventListener('click', () => switchCompanyTab('company-register'));
      document.getElementById('tab-btn-company-certificate')?.addEventListener('click', () => switchCompanyTab('company-certificate'));
      document.getElementById('tab-btn-company-reviews')?.addEventListener('click', () => switchCompanyTab('company-reviews'));
      document.getElementById('tab-btn-company-plans')?.addEventListener('click', () => switchCompanyTab('company-plans'));

      document.getElementById('btn-scroll-to-register-form')?.addEventListener('click', () => {
        document.getElementById('section-register-form')?.scrollIntoView({ behavior: 'smooth' });
      });

      // ==================== RENDERIZAÇÃO DOS ESTABELECIMENTOS DA EMPRESA ==================== //
      const renderCompanyUnits = async () => {
        const list = await getMyEstablishments();
        const container = document.getElementById('company-establishments-list');
        const samplesContainer = document.getElementById('sample-establishments-list');
        const selectCert = document.getElementById('select-certificate-establishment');

        if (container) {
          container.innerHTML = !list.length ? '<p class="text-xs text-slate-500 col-span-full">Nenhuma unidade cadastrada ainda. Use o formulário de cadastro para adicionar a primeira.</p>' : list.map(est => {
            const tier = est.scoreData?.tier || BADGE_TIERS.INICIANTE;
            return `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <span class="text-xs font-bold text-amber-700">${est.category}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white ${tier.badgeClass}">${tier.name.split(' - ')[0]}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm mb-1">${est.name}</h4>
                  <p class="text-xs text-slate-500 mb-2">📍 ${est.address}</p>
                  <div class="text-xs font-semibold text-slate-700">★ ${est.rating.toFixed(1)} (${est.reviewsCount} avaliações)</div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span class="text-slate-500 font-mono">${est.scoreData?.score || 0} pts</span>
                  <button type="button" class="text-amber-700 font-bold hover:underline btn-emit-cert" data-est-id="${est.id}">
                    Ver relatório →
                  </button>
                  <button type="button" class="text-rose-700 font-bold hover:underline btn-del-est" data-est-id="${est.id}">Excluir</button>
                </div>
              </div>
            `;
          }).join('');

          container.querySelectorAll('.btn-emit-cert').forEach(btn => {
            btn.addEventListener('click', () => {
              const estId = btn.getAttribute('data-est-id');
              if (selectCert) selectCert.value = estId;
              loadCertificateForEstablishment(estId);
              switchCompanyTab('company-certificate');
            });
          });

          container.querySelectorAll('.btn-del-est').forEach(btn => btn.addEventListener('click', async () => {
            if (!confirm('Excluir esta unidade e suas avaliações? Esta ação não pode ser desfeita.')) return;
            await deleteEstablishment(btn.dataset.estId);
            await renderCompanyUnits();
            await renderFeedbacks();
          }));
        }

        if (samplesContainer) {
          const samples = (await getEstablishments()).filter((est) => est.isSample);
          samplesContainer.innerHTML = samples.length ? samples.map((est) => `
            <article class="rounded-xl border border-indigo-200 bg-white p-4">
              <span class="text-[10px] font-bold uppercase tracking-wide text-rose-700">Fictício</span>
              <h4 class="mt-1 text-sm font-bold text-slate-900">${est.name}</h4>
              <p class="mt-1 text-xs text-slate-600">${est.address}</p>
              <p class="mt-2 text-[11px] text-slate-500">Acessibilidade não verificada</p>
            </article>
          `).join('') : '<p class="text-xs text-slate-500">Os exemplos ainda não foram carregados.</p>';
        }

        if (selectCert) {
          selectCert.innerHTML = list.length ? list.map(est => `
            <option value="${est.id}">${est.name}</option>
          `).join('') : '<option value="">Cadastre uma unidade para gerar o relatório</option>';
          selectCert.disabled = list.length === 0;

          if (list.length > 0) {
            loadCertificateForEstablishment(list[0].id);
          }
        }
      };

      // ==================== CHECKLIST DE ACESSIBILIDADE & PRÉVIA DO SELO ==================== //
      const checklistContainer = document.getElementById('register-features-checklist');
      if (checklistContainer) {
        const categoriesMap = {
          fisica: '♿ Acessibilidade Arquitetônica e Estrutural',
          sanitario: '🚾 Sanitários e Mobiliário',
          visual: '👁️ Recursos Visuais e Cão-Guia',
          auditiva: '🤟 Comunicação e Libras',
          cognitiva: '🧠 Acolhimento Neurodivergente'
        };

        let html = '';
        Object.entries(categoriesMap).forEach(([catKey, catTitle]) => {
          const catFeats = Object.values(ACCESSIBILITY_FEATURES).filter(f => f.category === catKey);
          html += `
            <div class="mb-4">
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">${catTitle}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${catFeats.map(feat => `
                  <label class="cursor-pointer p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-slate-50 transition flex items-start gap-2.5 text-xs">
                    <input 
                      type="checkbox" 
                      name="register_feature" 
                      value="${feat.id}" 
                      class="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 feature-checkbox-calc"
                    />
                    <div>
                      <span class="font-bold text-slate-900 block">${feat.label}</span>
                      <span class="text-[11px] text-slate-500">${feat.description} (+${feat.points} pts)</span>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        });
        checklistContainer.innerHTML = html;

        checklistContainer.addEventListener('change', () => updateBadgePreview());
      }

      const updateBadgePreview = () => {
        const checked = Array.from(document.querySelectorAll('input[name="register_feature"]:checked')).map(el => el.value);
        const scoreData = calculateAccessibilityScore(checked);
        const previewEl = document.getElementById('register-badge-preview');

        if (previewEl) {
          previewEl.innerHTML = `
            <div class="p-4 rounded-xl text-white ${scoreData.tier.badgeClass} flex items-center justify-between shadow-md transition-all">
              <div>
                <div class="text-[11px] uppercase tracking-wider font-semibold opacity-90">Classificação Atingida</div>
                <div class="text-lg font-black">${scoreData.tier.name}</div>
                <p class="text-xs opacity-90 mt-0.5">${scoreData.tier.description}</p>
              </div>
              <div class="text-right pl-4">
                <div class="text-2xl font-black">${scoreData.score} pts</div>
                <div class="text-[10px] uppercase font-semibold">${scoreData.percentage}% de conformidade</div>
              </div>
            </div>
          `;
        }
      };

      updateBadgePreview();

      // Submissão do Formulário de Cadastro
      document.getElementById('form-register-establishment')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('input-reg-name').value.trim();
        const category = document.getElementById('select-reg-category').value;
        const address = document.getElementById('input-reg-address').value.trim();
        const city = document.getElementById('input-reg-city').value.trim();
        const state = document.getElementById('input-reg-state')?.value.trim().toUpperCase() || '';
        const phone = document.getElementById('input-reg-phone').value.trim();
        const whatsapp = document.getElementById('input-reg-whatsapp').value.trim();
        const plan = document.getElementById('select-reg-plan').value;
        const description = document.getElementById('textarea-reg-description').value.trim();

        const checkedFeatures = Array.from(document.querySelectorAll('input[name="register_feature"]:checked')).map(el => el.value);
        const latValue = document.getElementById('input-reg-lat')?.value.trim() || '';
        const lngValue = document.getElementById('input-reg-lng')?.value.trim() || '';
        if (Boolean(latValue) !== Boolean(lngValue)) {
          alert('Preencha latitude e longitude juntas ou deixe as duas vazias para localizar pelo endereço.');
          return;
        }
        const lat = latValue ? Number(latValue) : null;
        const lng = lngValue ? Number(lngValue) : null;
        if (latValue && (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180)) {
          alert('Confira as coordenadas antes de salvar.');
          return;
        }

        const newEst = await addEstablishment({
          name,
          category,
          address,
          city,
          state,
          phone,
          whatsapp,
          partnershipPlan: plan,
          description,
          features: checkedFeatures,
          lat: lat ?? undefined,
          lng: lng ?? undefined
        });

        alert(`Unidade "${newEst.name}" cadastrada. Classificação calculada: ${newEst.scoreData?.tier?.name}.`);
        document.getElementById('form-register-establishment').reset();
        updateBadgePreview();
        await renderCompanyUnits();
      });

      // ==================== CARREGAMENTO DO CERTIFICADO ==================== //
      const loadCertificateForEstablishment = async (estId) => {
        const all = await getMyEstablishments();
        const est = all.find(e => String(e.id) === String(estId)) || all[0];
        if (!est) return;

        const tier = est.scoreData?.tier || BADGE_TIERS.INICIANTE;

        document.getElementById('cert-establishment-name').innerHTML = est.name;
        document.getElementById('cert-establishment-address').innerHTML = `${est.address} - ${est.city}/${est.state}`;
        document.getElementById('cert-badge-tier-name').textContent = tier.name;

        const badgeBox = document.getElementById('cert-badge-box');
        if (badgeBox) {
          badgeBox.className = `px-6 py-3 rounded-2xl text-white ${tier.badgeClass} shadow-lg inline-flex items-center gap-3`;
        }

        const iconsMap = { diamante: '💎', ouro: '🥇', prata: '🥈', bronze: '🥉', iniciante: '⏳' };
        document.getElementById('cert-badge-icon').textContent = iconsMap[tier.id] || '🏅';
        document.getElementById('cert-auth-code').textContent = est.certCode;
        document.getElementById('cert-date-issue').textContent = new Date(est.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR');
        const qrBox = document.getElementById('cert-qr');
        if (qrBox && window.QRCode) {
          qrBox.innerHTML = '';
          new QRCode(qrBox, { text: `${location.origin}/verificar/${est.certCode}`, width: 64, height: 64 });
        }
      };

      document.getElementById('select-certificate-establishment')?.addEventListener('change', (e) => {
        loadCertificateForEstablishment(e.target.value);
      });

      // ==================== AVALIAÇÕES E FEEDBACKS ==================== //
      const renderFeedbacks = async () => {
        const { reviews, barriers } = await getMyFeedback();
        const container = document.getElementById('company-feedback-list');

        if (container) {
          let html = '';

          if (barriers.length > 0) {
            html += `
              <div class="mb-4">
                <h4 class="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">⚠️ Avisos e Barreiras Relatadas pelos Clientes:</h4>
                <div class="space-y-2">
                  ${barriers.map(b => `
                    <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-start justify-between gap-3">
                      <div>
                        <div class="font-bold text-amber-900">${b.title}</div>
                        <p class="text-amber-800 mt-0.5">${b.description}</p>
                        <div class="text-[10px] text-amber-700 mt-1">Reportado por ${b.author} em ${b.date}</div>
                      </div>
                      <span class="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] uppercase">Em atenção</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }

          html += `
            <div>
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Relatos e Notas Recebidas:</h4>
              <div class="space-y-2">
                ${reviews.map(r => `
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-slate-800">${r.author} <span class="font-normal text-slate-500">(${r.authorRole})</span></span>
                      <span class="text-amber-500 font-bold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <p class="text-slate-600">"${r.comment}"</p>
                    <div class="text-[10px] text-slate-400 mt-1">${r.date}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;

          container.innerHTML = html;
        }
      };

      // Inicializa
      await renderCompanyUnits();
      await renderFeedbacks();
    });
