// app.js - Controlador Principal da Aplicação AcessaAqui
import { 
  getEstablishments, 
  addEstablishment, 
  getEstablishmentById,
  getReviews, 
  addReview, 
  getUserProfile, 
  saveUserProfile, 
  resetAllData, 
  exportAllData, 
  importAllData,
  DISABILITY_PRESETS 
} from './data.js';

import { 
  ACCESSIBILITY_FEATURES, 
  BADGE_TIERS, 
  calculateAccessibilityScore 
} from './certification.js';

import { MapManager } from './map.js';
import { AccessibilityManager } from './accessibility.js';

class App {
  constructor() {
    this.a11y = new AccessibilityManager();
    this.mapManager = null;
    this.currentTab = 'explore';
    this.viewMode = 'split'; // 'split', 'map', 'list'
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedFilterFeatures = new Set();
    this.autoFilterByProfile = false;
    this.sortBy = 'distance'; // 'distance', 'rating', 'score'
    this.currentEstablishmentModal = null;
    this.cityPresetCoordinates = {
      'sp-paulista': { lat: -23.561414, lng: -46.655881, name: 'São Paulo (Av. Paulista)' },
      'sp-centro': { lat: -23.548900, lng: -46.638800, name: 'São Paulo (Centro)' },
      'rj-copa': { lat: -22.969100, lng: -43.185500, name: 'Rio de Janeiro (Copacabana)' },
      'bh-savassi': { lat: -19.938800, lng: -43.933800, name: 'Belo Horizonte (Savassi)' }
    };

    this.init();
  }

  init() {
    this.initMap();
    this.setupNavigation();
    this.setupSearchAndFilters();
    this.setupUserProfile();
    this.setupEstablishmentRegistration();
    this.setupDetailModal();
    this.setupDataManagement();
    this.setupAccessibilityToolbar();
    this.render();

    // Ouvinte para evento customizado vindo do popup do mapa
    window.addEventListener('open-establishment-details', (e) => {
      if (e.detail?.id) {
        this.openEstablishmentModal(e.detail.id);
      }
    });

    console.log('AcessaAqui inicializado com sucesso.');
  }

  initMap() {
    this.mapManager = new MapManager('map-container', (est) => {
      this.openEstablishmentModal(est.id);
    });
  }

  // ========================== NAVEGAÇÃO ENTRE ABAS ========================== //
  setupNavigation() {
    const tabs = ['explore', 'profile', 'register', 'badges', 'impact'];
    tabs.forEach(tab => {
      const btn = document.getElementById(`tab-btn-${tab}`);
      if (btn) {
        btn.addEventListener('click', () => this.switchTab(tab));
      }
    });

    // Alternador de Visualização (Mapa / Lista / Ambos no Desktop)
    const btnViewMap = document.getElementById('btn-view-map');
    const btnViewList = document.getElementById('btn-view-list');
    const btnViewSplit = document.getElementById('btn-view-split');

    if (btnViewMap) btnViewMap.addEventListener('click', () => this.setViewMode('map'));
    if (btnViewList) btnViewList.addEventListener('click', () => this.setViewMode('list'));
    if (btnViewSplit) btnViewSplit.addEventListener('click', () => this.setViewMode('split'));
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => panel.classList.add('hidden'));

    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activePanel) {
      activePanel.classList.remove('hidden');
    }

    // Atualiza classes ativas na barra de navegação
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const isTarget = btn.id === `tab-btn-${tabName}`;
      btn.setAttribute('aria-selected', String(isTarget));
      if (isTarget) {
        btn.classList.add('border-blue-600', 'text-blue-700', 'font-bold');
        btn.classList.remove('border-transparent', 'text-slate-600');
      } else {
        btn.classList.remove('border-blue-600', 'text-blue-700', 'font-bold');
        btn.classList.add('border-transparent', 'text-slate-600');
      }
    });

    if (tabName === 'explore') {
      this.mapManager.invalidateSize();
      this.render();
    } else if (tabName === 'profile') {
      this.loadUserProfileForm();
    } else if (tabName === 'register') {
      this.updateRegisterBadgePreview();
    }

    this.a11y.announce(`Aba alternada para ${tabName}`);
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const mapCol = document.getElementById('map-column');
    const listCol = document.getElementById('list-column');
    const btnMap = document.getElementById('btn-view-map');
    const btnList = document.getElementById('btn-view-list');
    const btnSplit = document.getElementById('btn-view-split');

    [btnMap, btnList, btnSplit].forEach(b => b?.classList.remove('bg-blue-600', 'text-white'));

    if (mode === 'map') {
      mapCol?.classList.remove('hidden', 'lg:w-1/2', 'xl:w-7/12', 'h-64', 'sm:h-80');
      mapCol?.classList.add('w-full', 'h-full');
      listCol?.classList.add('hidden');
      btnMap?.classList.add('bg-blue-600', 'text-white');
    } else if (mode === 'list') {
      listCol?.classList.remove('hidden', 'lg:w-1/2', 'xl:w-5/12');
      listCol?.classList.add('w-full');
      mapCol?.classList.add('hidden');
      btnList?.classList.add('bg-blue-600', 'text-white');
    } else {
      // Split (Ambos com scroll independente da lista e mapa estático)
      mapCol?.classList.remove('hidden', 'w-full');
      mapCol?.classList.add('lg:w-1/2', 'xl:w-7/12', 'h-64', 'sm:h-80', 'lg:h-full');
      listCol?.classList.remove('hidden', 'w-full');
      listCol?.classList.add('lg:w-1/2', 'xl:w-5/12');
      btnSplit?.classList.add('bg-blue-600', 'text-white');
    }

    this.mapManager.invalidateSize();
  }

  // ========================== BUSCA E FILTROS ========================== //
  setupSearchAndFilters() {
    const inputSearch = document.getElementById('input-search-text');
    if (inputSearch) {
      inputSearch.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    const selectCategory = document.getElementById('select-category');
    if (selectCategory) {
      selectCategory.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.render();
      });
    }

    const selectSort = document.getElementById('select-sort');
    if (selectSort) {
      selectSort.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render();
      });
    }

    // Geolocalização
    const btnGeo = document.getElementById('btn-use-geolocation');
    if (btnGeo) {
      btnGeo.addEventListener('click', () => {
        btnGeo.classList.add('animate-spin');
        this.mapManager.requestGeolocation(
          (loc) => {
            btnGeo.classList.remove('animate-spin');
            this.a11y.announce('Sua localização atual foi identificada.');
            this.render();
          },
          (err) => {
            btnGeo.classList.remove('animate-spin');
            alert(`Não foi possível obter localização exata: ${err}. Usando posição padrão de São Paulo.`);
          }
        );
      });
    }

    // Seletor de Cidades / Regiões
    const selectCityPreset = document.getElementById('select-city-preset');
    if (selectCityPreset) {
      selectCityPreset.addEventListener('change', (e) => {
        const coords = this.cityPresetCoordinates[e.target.value];
        if (coords) {
          this.mapManager.setUserCoordinates(coords.lat, coords.lng);
          this.render();
          this.a11y.announce(`Mapa centralizado em ${coords.name}`);
        }
      });
    }

    // Renderiza chips rápidos de filtros de acessibilidade
    this.renderQuickAccessibilityFilters();

    // Toggle de Match com Perfil Ativo
    const toggleProfileMatch = document.getElementById('toggle-profile-match');
    if (toggleProfileMatch) {
      const profile = getUserProfile();
      this.autoFilterByProfile = profile.autoFilterByProfile || false;
      toggleProfileMatch.checked = this.autoFilterByProfile;
      toggleProfileMatch.addEventListener('change', (e) => {
        this.autoFilterByProfile = e.target.checked;
        const p = getUserProfile();
        p.autoFilterByProfile = this.autoFilterByProfile;
        saveUserProfile(p);
        this.render();
      });
    }
  }

  renderQuickAccessibilityFilters() {
    const container = document.getElementById('quick-filters-container');
    if (!container) return;

    // Filtros prioritários mais procurados
    const priorityFeatures = [
      { id: 'rampa', label: '♿ Rampa / Sem Degraus' },
      { id: 'banheiro_adaptado', label: '🚾 Banheiro Adaptado' },
      { id: 'libras', label: '🤟 Atendimento em Libras' },
      { id: 'cao_guia', label: '🐕 Cão-Guia Permitido' },
      { id: 'cardapio_acessivel', label: '👁️ Braille / Áudio' },
      { id: 'espaco_silencioso', label: '🧠 Espaço Silencioso (TEA)' }
    ];

    container.innerHTML = priorityFeatures.map(feat => {
      const active = this.selectedFilterFeatures.has(feat.id);
      return `
        <button 
          type="button" 
          data-feature-id="${feat.id}"
          class="quick-filter-pill px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 ${
            active 
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
              : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }"
          aria-pressed="${active}"
        >
          <span>${feat.label}</span>
          ${active ? '✕' : ''}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.quick-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const fId = btn.getAttribute('data-feature-id');
        if (this.selectedFilterFeatures.has(fId)) {
          this.selectedFilterFeatures.delete(fId);
        } else {
          this.selectedFilterFeatures.add(fId);
        }
        this.renderQuickAccessibilityFilters();
        this.render();
      });
    });
  }

  // ========================== FILTRAGEM E RENDERIZAÇÃO ========================== //
  getFilteredEstablishments() {
    let list = getEstablishments();
    const userLoc = this.mapManager?.userLocation || { lat: -23.561414, lng: -46.655881 };

    // Calcula distância para cada um
    list = list.map(item => {
      const distance = this.mapManager.calculateDistance(
        userLoc.lat,
        userLoc.lng,
        item.lat,
        item.lng
      );
      return { ...item, distance };
    });

    // Filtro por Texto (Nome, descrição, endereço, bairro)
    if (this.searchTerm) {
      list = list.filter(item => {
        const fullText = `${item.name} ${item.description} ${item.address} ${item.category} ${item.city}`.toLowerCase();
        return fullText.includes(this.searchTerm);
      });
    }

    // Filtro por Categoria
    if (this.selectedCategory !== 'all') {
      list = list.filter(item => item.category.toLowerCase().includes(this.selectedCategory.toLowerCase()));
    }

    // Filtro por Recursos de Acessibilidade selecionados manualmente
    if (this.selectedFilterFeatures.size > 0) {
      list = list.filter(item => {
        const itemFeats = new Set(item.features || []);
        for (const req of this.selectedFilterFeatures) {
          if (!itemFeats.has(req)) return false;
        }
        return true;
      });
    }

    // Filtro Automático por Perfil de Necessidades do Usuário
    if (this.autoFilterByProfile) {
      const profile = getUserProfile();
      if (profile.activePreferences && profile.activePreferences.length > 0) {
        list = list.filter(item => {
          const itemFeats = new Set(item.features || []);
          return profile.activePreferences.every(pref => itemFeats.has(pref));
        });
      }
    }

    // Ordenação
    if (this.sortBy === 'distance') {
      list.sort((a, b) => a.distance - b.distance);
    } else if (this.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'score') {
      list.sort((a, b) => (b.scoreData?.score || 0) - (a.scoreData?.score || 0));
    }

    return list;
  }

  render() {
    const list = this.getFilteredEstablishments();
    this.renderList(list);
    this.mapManager.renderEstablishments(list);

    const countEl = document.getElementById('results-count');
    if (countEl) {
      countEl.textContent = `${list.length} ${list.length === 1 ? 'estabelecimento encontrado' : 'estabelecimentos encontrados'}`;
    }
  }

  renderList(establishments) {
    const container = document.getElementById('establishments-list');
    if (!container) return;

    if (establishments.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm my-6">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">Nenhum estabelecimento encontrado</h3>
          <p class="text-sm text-slate-500 mb-4 max-w-md mx-auto">
            Não encontramos nenhum local correspondente com todos os critérios selecionados no momento. Tente remover alguns filtros ou ampliar a busca.
          </p>
          <button 
            type="button" 
            id="btn-clear-filters"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Limpar Filtros de Acessibilidade
          </button>
        </div>
      `;

      const clearBtn = document.getElementById('btn-clear-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.selectedFilterFeatures.clear();
          this.selectedCategory = 'all';
          this.searchTerm = '';
          const input = document.getElementById('input-search-text');
          if (input) input.value = '';
          const selectCat = document.getElementById('select-category');
          if (selectCat) selectCat.value = 'all';
          this.renderQuickAccessibilityFilters();
          this.render();
        });
      }
      return;
    }

    container.innerHTML = establishments.map(est => {
      const tier = est.scoreData?.tier || BADGE_TIERS.INICIANTE;
      const features = (est.features || []).slice(0, 4);

      return `
        <article 
          class="card-establishment bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col sm:flex-row group"
          tabindex="0"
          aria-labelledby="est-title-${est.id}"
        >
          <!-- Imagem / Destaque (Preenchimento 100% de ponta a ponta sem sobras cinzas) -->
          <div class="w-full sm:w-52 md:w-56 h-48 sm:h-auto self-stretch relative shrink-0 overflow-hidden bg-slate-200">
            <img 
              src="${est.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}" 
              alt="${est.name}"
              class="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none sm:hidden"></div>
            <div class="absolute top-2.5 left-2.5 z-10">
              <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md ${tier.badgeClass}">
                ${tier.name.split(' - ')[0]}
              </span>
            </div>
            ${est.verifiedByCommunity ? `
              <div class="absolute bottom-2.5 left-2.5 z-10">
                <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white shadow-md">
                  ✓ Verificado
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Informações -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    ${est.category}
                  </span>
                  <h3 id="est-title-${est.id}" class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    ${est.name}
                  </h3>
                </div>
                <div class="text-right shrink-0">
                  <span class="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    ★ ${est.rating.toFixed(1)} <span class="text-[10px] text-slate-500 font-normal">(${est.reviewsCount})</span>
                  </span>
                </div>
              </div>

              <p class="text-xs text-slate-500 mb-2 flex items-center gap-1">
                <span>📍 ${est.address}</span>
                <span>•</span>
                <span class="font-semibold text-emerald-700">${est.distance ? est.distance.toFixed(1) + ' km' : ''}</span>
              </p>

              <p class="text-xs text-slate-600 line-clamp-2 mb-3">
                ${est.description}
              </p>

              <!-- Tags de Acessibilidade -->
              <div class="flex flex-wrap gap-1 mb-3">
                ${features.map(fId => {
                  const fDef = ACCESSIBILITY_FEATURES[fId];
                  return fDef ? `
                    <span class="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                      ✓ ${fDef.label}
                    </span>
                  ` : '';
                }).join('')}
                ${(est.features || []).length > 4 ? `
                  <span class="text-[11px] text-slate-500 font-medium self-center pl-1">
                    +${est.features.length - 4} outros
                  </span>
                ` : ''}
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button 
                type="button" 
                class="btn-speak-summary text-xs text-slate-600 hover:text-blue-700 flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 transition"
                data-est-id="${est.id}"
                title="Ouvir audiodescrição deste estabelecimento"
              >
                🔊 <span>Ouvir resumo</span>
              </button>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  class="btn-focus-map text-xs font-medium text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  data-est-id="${est.id}"
                >
                  Ver no Mapa
                </button>
                <button 
                  type="button" 
                  class="btn-open-details text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
                  data-est-id="${est.id}"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Eventos dos botões da lista
    container.querySelectorAll('.btn-open-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-est-id');
        this.openEstablishmentModal(id);
      });
    });

    container.querySelectorAll('.btn-focus-map').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-est-id');
        const est = establishments.find(e => e.id === id);
        if (est) {
          if (this.viewMode === 'list') {
            this.setViewMode('split');
          }
          this.mapManager.focusEstablishment(est);
        }
      });
    });

    container.querySelectorAll('.btn-speak-summary').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-est-id');
        const est = establishments.find(e => e.id === id);
        if (est) {
          const tier = est.scoreData?.tier?.name || '';
          const feats = (est.features || []).map(f => ACCESSIBILITY_FEATURES[f]?.label || '').filter(Boolean).join(', ');
          const text = `${est.name}. Categoria: ${est.category}. Classificação: ${tier}. Endereço: ${est.address}. Principais recursos de acessibilidade disponíveis: ${feats}. Avaliação dos usuários: nota ${est.rating.toFixed(1)} com base em ${est.reviewsCount} avaliações.`;
          this.a11y.speak(text);
        }
      });
    });
  }

  // ========================== MODAL DE DETALHES ========================== //
  setupDetailModal() {
    const modal = document.getElementById('establishment-detail-modal');
    const closeBtn = document.getElementById('btn-close-modal');
    const backdrop = document.getElementById('modal-backdrop');

    const closeModal = () => {
      if (modal) modal.classList.add('hidden');
      this.a11y.stopSpeaking();
      this.currentEstablishmentModal = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Form de Nova Avaliação no Modal
    const formReview = document.getElementById('form-add-review');
    if (formReview) {
      formReview.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!this.currentEstablishmentModal) return;

        const author = document.getElementById('input-review-author')?.value.trim();
        const role = document.getElementById('input-review-role')?.value.trim();
        const rating = document.getElementById('select-review-rating')?.value;
        const comment = document.getElementById('textarea-review-comment')?.value.trim();

        if (!comment) {
          alert('Por favor, escreva um breve comentário sobre a acessibilidade encontrada.');
          return;
        }

        addReview(this.currentEstablishmentModal.id, {
          author: author || 'Membro da Comunidade',
          authorRole: role || 'Visitante',
          rating: Number(rating) || 5,
          comment
        });

        alert('Sua avaliação foi enviada com sucesso! Muito obrigado por contribuir com a inclusão.');
        formReview.reset();
        this.openEstablishmentModal(this.currentEstablishmentModal.id);
        this.render(); // atualiza notas na listagem
      });
    }

    // Botão de Ouvir Detalhes no Modal
    const btnSpeakModal = document.getElementById('btn-modal-speech');
    if (btnSpeakModal) {
      btnSpeakModal.addEventListener('click', () => {
        if (!this.currentEstablishmentModal) return;
        const est = this.currentEstablishmentModal;
        const featsList = (est.features || []).map(f => ACCESSIBILITY_FEATURES[f]?.label).filter(Boolean).join('. ');
        const speechText = `Detalhes de acessibilidade de ${est.name}. Localizado em ${est.address}. ${est.description}. Recursos certificados: ${featsList}. Selo atual: ${est.scoreData?.tier?.name}.`;
        this.a11y.speak(speechText);
      });
    }
  }

  openEstablishmentModal(establishmentId) {
    const est = getEstablishmentById(establishmentId);
    if (!est) return;

    this.currentEstablishmentModal = est;
    const modal = document.getElementById('establishment-detail-modal');
    if (!modal) return;

    const tier = est.scoreData?.tier || BADGE_TIERS.INICIANTE;
    const reviews = getReviews(est.id);

    // Preenche dados principais
    document.getElementById('modal-est-name').textContent = est.name;
    document.getElementById('modal-est-category').textContent = `${this.mapManager.getCategoryEmoji(est.category)} ${est.category}`;
    document.getElementById('modal-est-address').textContent = `📍 ${est.address} - ${est.city}/${est.state}`;
    document.getElementById('modal-est-description').textContent = est.description;
    document.getElementById('modal-est-rating').textContent = `★ ${est.rating.toFixed(1)} (${est.reviewsCount} avaliações)`;

    const imgEl = document.getElementById('modal-est-image');
    if (imgEl) {
      imgEl.src = est.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
      imgEl.alt = `Foto de ${est.name}`;
    }

    // Contatos
    const phoneEl = document.getElementById('modal-est-phone');
    if (phoneEl) {
      phoneEl.textContent = est.phone || 'Não informado';
    }
    const whatsBtn = document.getElementById('modal-est-whatsapp-btn');
    if (whatsBtn) {
      if (est.whatsapp) {
        whatsBtn.href = `https://wa.me/55${est.whatsapp.replace(/\D/g, '')}`;
        whatsBtn.classList.remove('hidden');
      } else {
        whatsBtn.classList.add('hidden');
      }
    }

    // Selo & Pontuação
    const badgeContainer = document.getElementById('modal-est-badge-container');
    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <div class="p-4 rounded-xl text-white ${tier.badgeClass} flex items-center justify-between shadow-md">
          <div>
            <div class="text-xs uppercase tracking-wider font-semibold opacity-90">Classificação Oficial</div>
            <div class="text-lg font-bold">${tier.name}</div>
            <p class="text-xs opacity-90 mt-0.5">${tier.description}</p>
          </div>
          <div class="text-right pl-4">
            <div class="text-2xl font-black">${est.scoreData?.score || 0}</div>
            <div class="text-[10px] uppercase font-semibold">pontos de 170</div>
          </div>
        </div>
      `;
    }

    // Recursos de Acessibilidade divididos por Categorias
    const featuresListEl = document.getElementById('modal-est-features-list');
    if (featuresListEl) {
      const activeSet = new Set(est.features || []);
      const categoriesMap = {
        fisica: '♿ Acessibilidade Arquitetônica e Estrutural',
        sanitario: '🚾 Sanitários e Mobiliário',
        visual: '👁️ Acessibilidade Visual e Cão-Guia',
        auditiva: '🤟 Comunicação e Acessibilidade Auditiva',
        cognitiva: '🧠 Acolhimento Neurodivergente e Cognitivo'
      };

      let html = '';
      Object.entries(categoriesMap).forEach(([catKey, catTitle]) => {
        const catFeatures = Object.values(ACCESSIBILITY_FEATURES).filter(f => f.category === catKey);
        html += `
          <div class="mb-4">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              ${catTitle}
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${catFeatures.map(feat => {
                const isAvailable = activeSet.has(feat.id);
                return `
                  <div class="p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                    isAvailable 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                  }">
                    <span class="text-sm shrink-0">${isAvailable ? '✅' : '❌'}</span>
                    <div>
                      <div class="font-semibold">${feat.label}</div>
                      <div class="text-[11px] ${isAvailable ? 'text-emerald-700' : 'text-slate-400'} font-normal">${feat.description}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });
      featuresListEl.innerHTML = html;
    }

    // Lista de Avaliações
    const reviewsContainer = document.getElementById('modal-est-reviews-list');
    if (reviewsContainer) {
      if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
          <div class="text-center py-6 text-xs text-slate-500">
            Ainda não há avaliações comunitárias para este local. Seja o primeiro a relatar sua experiência!
          </div>
        `;
      } else {
        reviewsContainer.innerHTML = reviews.map(r => `
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-2">
            <div class="flex items-center justify-between mb-1">
              <div>
                <span class="font-bold text-slate-800">${r.author}</span>
                <span class="text-slate-500 ml-1">(${r.authorRole || 'Comunidade'})</span>
              </div>
              <div class="flex items-center gap-1 text-amber-500 font-bold">
                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
              </div>
            </div>
            <p class="text-slate-700 mb-1 leading-relaxed">"${r.comment}"</p>
            <div class="text-[10px] text-slate-400">Publicado em ${r.date}</div>
          </div>
        `).join('');
      }
    }

    modal.classList.remove('hidden');
    this.a11y.announce(`Abrindo detalhes de ${est.name}`);
  }

  // ========================== PERFIL DO USUÁRIO ========================== //
  setupUserProfile() {
    // Renderiza os Presets de Necessidades (Pública-alvo)
    const presetsContainer = document.getElementById('user-profile-presets');
    if (presetsContainer) {
      presetsContainer.innerHTML = Object.entries(DISABILITY_PRESETS).map(([key, def]) => `
        <label class="cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition flex items-start gap-3">
          <input 
            type="checkbox" 
            name="disability_profile" 
            value="${key}" 
            class="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div class="text-xs font-bold text-slate-900">${def.label}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Ativa recursos essenciais recomendados</div>
          </div>
        </label>
      `).join('');
    }

    // Renderiza lista completa de preferências para marcar individualmente
    const prefsContainer = document.getElementById('user-profile-features-checklist');
    if (prefsContainer) {
      prefsContainer.innerHTML = Object.values(ACCESSIBILITY_FEATURES).map(feat => `
        <label class="cursor-pointer p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center gap-2 text-xs">
          <input 
            type="checkbox" 
            name="user_feature_pref" 
            value="${feat.id}" 
            class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span class="text-slate-800 font-medium">${feat.label}</span>
        </label>
      `).join('');
    }

    // Salvar Perfil
    const formProfile = document.getElementById('form-user-profile');
    if (formProfile) {
      formProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-profile-name')?.value.trim() || 'Usuário Inclusivo';
        const notes = document.getElementById('textarea-profile-notes')?.value.trim() || '';
        const autoFilter = document.getElementById('checkbox-profile-autofilter')?.checked || false;

        const checkedDisabilities = Array.from(document.querySelectorAll('input[name="disability_profile"]:checked')).map(el => el.value);
        const checkedFeatures = Array.from(document.querySelectorAll('input[name="user_feature_pref"]:checked')).map(el => el.value);

        const newProfile = {
          name,
          notes,
          disabilityProfiles: checkedDisabilities,
          activePreferences: checkedFeatures,
          autoFilterByProfile: autoFilter
        };

        saveUserProfile(newProfile);
        this.autoFilterByProfile = autoFilter;
        const toggleHome = document.getElementById('toggle-profile-match');
        if (toggleHome) toggleHome.checked = autoFilter;

        alert('Perfil e preferências de acessibilidade salvos com sucesso!');
        this.switchTab('explore');
      });
    }

    // Quando clicar em um preset de deficiência, seleciona automaticamente os recursos correspondentes
    if (presetsContainer) {
      presetsContainer.addEventListener('change', (e) => {
        if (e.target.name === 'disability_profile') {
          const profileKey = e.target.value;
          const preset = DISABILITY_PRESETS[profileKey];
          if (preset) {
            preset.recommendedFeatures.forEach(featId => {
              const chk = document.querySelector(`input[name="user_feature_pref"][value="${featId}"]`);
              if (chk && e.target.checked) {
                chk.checked = true;
              }
            });
          }
        }
      });
    }
  }

  loadUserProfileForm() {
    const profile = getUserProfile();
    const nameInput = document.getElementById('input-profile-name');
    const notesInput = document.getElementById('textarea-profile-notes');
    const autoFilterChk = document.getElementById('checkbox-profile-autofilter');

    if (nameInput) nameInput.value = profile.name || '';
    if (notesInput) notesInput.value = profile.notes || '';
    if (autoFilterChk) autoFilterChk.checked = profile.autoFilterByProfile || false;

    // Marca presets
    document.querySelectorAll('input[name="disability_profile"]').forEach(input => {
      input.checked = (profile.disabilityProfiles || []).includes(input.value);
    });

    // Marca features
    document.querySelectorAll('input[name="user_feature_pref"]').forEach(input => {
      input.checked = (profile.activePreferences || []).includes(input.value);
    });
  }

  // ==================== CADASTRO DE ESTABELECIMENTOS ==================== //
  setupEstablishmentRegistration() {
    const featuresContainer = document.getElementById('register-features-checklist');
    if (featuresContainer) {
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
          <div class="mb-5">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">${catTitle}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${catFeats.map(feat => `
                <label class="cursor-pointer p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition flex items-start gap-2.5 text-xs">
                  <input 
                    type="checkbox" 
                    name="register_feature" 
                    value="${feat.id}" 
                    class="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 feature-checkbox-calc"
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
      featuresContainer.innerHTML = html;

      // Cálculo em tempo real do selo no cadastro
      featuresContainer.addEventListener('change', () => {
        this.updateRegisterBadgePreview();
      });
    }

    // Formulário de Cadastro
    const formRegister = document.getElementById('form-register-establishment');
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('input-reg-name')?.value.trim();
        const category = document.getElementById('select-reg-category')?.value;
        const address = document.getElementById('input-reg-address')?.value.trim();
        const city = document.getElementById('input-reg-city')?.value.trim() || 'São Paulo';
        const state = document.getElementById('input-reg-state')?.value.trim() || 'SP';
        const phone = document.getElementById('input-reg-phone')?.value.trim();
        const whatsapp = document.getElementById('input-reg-whatsapp')?.value.trim();
        const website = document.getElementById('input-reg-website')?.value.trim();
        const description = document.getElementById('textarea-reg-description')?.value.trim();
        const plan = document.getElementById('select-reg-plan')?.value || 'Gratuito';

        let lat = parseFloat(document.getElementById('input-reg-lat')?.value);
        let lng = parseFloat(document.getElementById('input-reg-lng')?.value);

        if (isNaN(lat) || isNaN(lng)) {
          // Usa ponto próximo ao centro com ligeira variação aleatória para não sobrepor
          lat = -23.561414 + (Math.random() - 0.5) * 0.02;
          lng = -46.655881 + (Math.random() - 0.5) * 0.02;
        }

        const checkedFeatures = Array.from(document.querySelectorAll('input[name="register_feature"]:checked')).map(el => el.value);

        const newEst = addEstablishment({
          name,
          category,
          address,
          city,
          state,
          phone,
          whatsapp,
          website,
          description,
          partnershipPlan: plan,
          lat,
          lng,
          features: checkedFeatures,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
        });

        alert(`Estabelecimento "${newEst.name}" cadastrado com sucesso! Foi classificado como: ${newEst.scoreData?.tier?.name}.`);
        formRegister.reset();
        this.updateRegisterBadgePreview();
        this.switchTab('explore');
      });
    }
  }

  updateRegisterBadgePreview() {
    const checked = Array.from(document.querySelectorAll('input[name="register_feature"]:checked')).map(el => el.value);
    const scoreData = calculateAccessibilityScore(checked);
    const previewContainer = document.getElementById('register-badge-preview');

    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="p-4 rounded-xl text-white ${scoreData.tier.badgeClass} flex items-center justify-between shadow-md transition-all duration-300">
          <div>
            <div class="text-[11px] uppercase tracking-wider font-semibold opacity-90">Prévia do Selo Conquistado</div>
            <div class="text-lg font-extrabold">${scoreData.tier.name}</div>
            <p class="text-xs opacity-90 mt-0.5">${scoreData.tier.description}</p>
          </div>
          <div class="text-right pl-4">
            <div class="text-2xl font-black">${scoreData.score} pts</div>
            <div class="text-[10px] uppercase font-semibold">${scoreData.percentage}% de conformidade</div>
          </div>
        </div>
      `;
    }
  }

  // ======================= GESTÃO DE DADOS (IMPORT/EXPORT/RESET) ======================= //
  setupDataManagement() {
    const btnReset = document.getElementById('btn-reset-demo-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Deseja restaurar todos os dados para o padrão de demonstração original?')) {
          resetAllData();
          alert('Dados restaurados com sucesso!');
          location.reload();
        }
      });
    }

    const btnExport = document.getElementById('btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = exportAllData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `acessaaqui_dados_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const inputImport = document.getElementById('input-import-data');
    if (inputImport) {
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (content && importAllData(content)) {
            alert('Dados importados com sucesso!');
            location.reload();
          } else {
            alert('Falha ao importar o arquivo. Verifique o formato JSON.');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // ======================= BARRA DE ACESSIBILIDADE DIGITAL ======================= //
  setupAccessibilityToolbar() {
    // Abrir/Fechar painel flutuante
    const btnToggle = document.getElementById('btn-toggle-a11y-panel');
    const panel = document.getElementById('accessibility-panel');
    const btnClose = document.getElementById('btn-close-a11y-panel');

    if (btnToggle && panel) {
      btnToggle.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
          panel.querySelector('button')?.focus();
        }
      });
    }

    if (btnClose && panel) {
      btnClose.addEventListener('click', () => panel.classList.add('hidden'));
    }

    // Botões de Tamanho de Fonte
    document.getElementById('btn-a11y-font-plus')?.addEventListener('click', () => this.a11y.changeFontSize(1));
    document.getElementById('btn-a11y-font-minus')?.addEventListener('click', () => this.a11y.changeFontSize(-1));
    document.getElementById('btn-a11y-font-reset')?.addEventListener('click', () => this.a11y.resetFontSize());

    // Botões de Contraste
    document.getElementById('btn-a11y-contrast-dark')?.addEventListener('click', () => this.a11y.setContrastMode('high-contrast-dark'));
    document.getElementById('btn-a11y-contrast-light')?.addEventListener('click', () => this.a11y.setContrastMode('high-contrast-light'));
    document.getElementById('btn-a11y-contrast-normal')?.addEventListener('click', () => this.a11y.setContrastMode('normal'));

    // Botão Dislexia
    document.getElementById('btn-a11y-dyslexia')?.addEventListener('click', () => this.a11y.toggleDyslexicFont());

    // Botão Guia de Leitura
    document.getElementById('btn-a11y-guide')?.addEventListener('click', () => this.a11y.toggleReadingGuide());

    // Botão Narrador Global
    const btnTTS = document.getElementById('btn-tts-global');
    if (btnTTS) {
      btnTTS.addEventListener('click', () => {
        if (this.a11y.speaking) {
          this.a11y.stopSpeaking();
        } else {
          const text = "Você está na plataforma AcessaAqui, sistema de localização e identificação de estabelecimentos com acessibilidade. Use as teclas Alt + A para o menu de acessibilidade, ou navegue pelo mapa e lista de locais disponíveis.";
          this.a11y.speak(text);
        }
      });
    }
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.AcessaAquiApp = new App();
});

