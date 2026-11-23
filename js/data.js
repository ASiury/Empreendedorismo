// data.js - Repositório de dados com LocalStorage e Seed Inicial Realista
import { calculateAccessibilityScore, ACCESSIBILITY_FEATURES } from './certification.js';

const STORAGE_KEY_ESTABLISHMENTS = 'acessa_estabelecimentos_v1';
const STORAGE_KEY_PROFILE = 'acessa_usuario_perfil_v1';
const STORAGE_KEY_REVIEWS = 'acessa_avaliacoes_v1';
const STORAGE_KEY_BARRIERS = 'acessa_barreiras_v1';

export const SEED_BARRIERS = [
  {
    id: 'bar-1',
    establishmentId: 'est-2',
    author: 'Mariana P.',
    barrierType: 'Manutenção Temporária',
    title: 'Elevador de acesso ao mezanino em manutenção nesta semana',
    description: 'A administração informou que a equipe técnica está trocando a placa eletrônica. Acesso ao piso térreo e plateia principal segue 100% normal.',
    date: '2026-11-02',
    status: 'investigando'
  }
];

// Dados iniciais enriquecidos e realistas
export const SEED_ESTABLISHMENTS = [
  {
    id: 'est-1',
    name: 'Café & Livraria Harmonia Inclusiva',
    category: 'Restaurante / Café',
    description: 'Espaço acolhedor com café especial, livraria, cardápio acessível por voz e funcionários fluentes em Libras. Banheiro totalmente adaptado e área sensorial silenciosa.',
    address: 'Av. Paulista, 1578 - Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3288-4455',
    whatsapp: '11988776655',
    website: 'https://exemplo.com.br/cafearmonia',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    lat: -23.561414,
    lng: -46.655881,
    features: [
      'rampa',
      'sem_degraus',
      'portas_largas',
      'banheiro_adaptado',
      'balcao_acessivel',
      'cardapio_acessivel',
      'piso_tatil',
      'sinalizacao_contraste',
      'cao_guia',
      'libras',
      'atendimento_digital',
      'espaco_silencioso',
      'atendimento_humanizado'
    ],
    reviewsCount: 14,
    rating: 4.9,
    verifiedByCommunity: true,
    partnershipPlan: 'Empresa Inclusiva Ouro'
  },
  {
    id: 'est-2',
    name: 'Teatro Municipal Sérgio Cardoso',
    category: 'Cultura / Teatro',
    description: 'Espaço cultural com apresentações com audiodescrição e tradução em Libras. Vagas para cadeirantes na plateia e elevador para todos os andares.',
    address: 'R. Rui Barbosa, 153 - Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3882-8080',
    whatsapp: '11977665544',
    website: 'https://exemplo.com.br/teatro',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    lat: -23.55832,
    lng: -46.64811,
    features: [
      'rampa',
      'elevador',
      'portas_largas',
      'estacionamento_pcd',
      'banheiro_adaptado',
      'cardapio_acessivel',
      'piso_tatil',
      'cao_guia',
      'libras',
      'alarme_visual',
      'atendimento_humanizado'
    ],
    reviewsCount: 22,
    rating: 4.8,
    verifiedByCommunity: true,
    partnershipPlan: 'Parceria Institucional Pública'
  },
  {
    id: 'est-3',
    name: 'Clínica Saúde & Cuidado Integrado',
    category: 'Saúde / Clínica',
    description: 'Centro de atendimento médico e terapêutico multidisciplinar com acessibilidade arquitetônica plena, macas elétricas com regulagem de altura e piso tátil.',
    address: 'Rua Vergueiro, 1020 - Paraíso',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3145-2200',
    whatsapp: '11999881122',
    website: 'https://exemplo.com.br/clinica-saude',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    lat: -23.57390,
    lng: -46.63980,
    features: [
      'rampa',
      'sem_degraus',
      'elevador',
      'portas_largas',
      'estacionamento_pcd',
      'banheiro_adaptado',
      'balcao_acessivel',
      'piso_tatil',
      'sinalizacao_contraste',
      'cao_guia',
      'atendimento_digital',
      'espaco_silencioso',
      'atendimento_humanizado'
    ],
    reviewsCount: 9,
    rating: 4.9,
    verifiedByCommunity: true,
    partnershipPlan: 'Empresa Inclusiva Prata'
  },
  {
    id: 'est-4',
    name: 'Bistrô & Trattoria Bella Vista',
    category: 'Restaurante / Café',
    description: 'Cozinha italiana artesanal com rampa na entrada e mesa exclusiva para cadeirantes. Conta com cardápio acessível via QR Code e equipe prestativa.',
    address: 'Alameda Santos, 980 - Cerqueira César',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3251-1199',
    whatsapp: '11981234567',
    website: 'https://exemplo.com.br/bellavista',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    lat: -23.56620,
    lng: -46.65210,
    features: [
      'rampa',
      'portas_largas',
      'banheiro_adaptado',
      'balcao_acessivel',
      'cardapio_acessivel',
      'cao_guia',
      'atendimento_digital'
    ],
    reviewsCount: 7,
    rating: 4.4,
    verifiedByCommunity: false,
    partnershipPlan: 'Gratuito'
  },
  {
    id: 'est-5',
    name: 'Parque Trianon - Área de Vivência e Lazer',
    category: 'Lazer / Parque',
    description: 'Parque urbano com caminhos acessíveis calçados, banheiros públicos adaptados reformados, sinalização tátil e permissão total para cães de assistência.',
    address: 'Rua Peixoto Gomide, 949 - Cerqueira César',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3289-2169',
    whatsapp: '',
    website: 'https://exemplo.com.br/parquetrianon',
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    lat: -23.56270,
    lng: -46.65750,
    features: [
      'sem_degraus',
      'portas_largas',
      'banheiro_adaptado',
      'piso_tatil',
      'sinalizacao_contraste',
      'cao_guia',
      'espaco_silencioso'
    ],
    reviewsCount: 31,
    rating: 4.6,
    verifiedByCommunity: true,
    partnershipPlan: 'Público / Governamental'
  },
  {
    id: 'est-6',
    name: 'Supermercado Central Mais Inclusivo',
    category: 'Comércio / Supermercado',
    description: 'Supermercado com carrinhos adaptados para cadeirantes, corredores espaçosos, checkout acessível, atendimento preferencial ágil e suporte para pessoas cegas.',
    address: 'Rua Augusta, 1400 - Consolação',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3341-9000',
    whatsapp: '11977778899',
    website: 'https://exemplo.com.br/supermercado-central',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    lat: -23.55480,
    lng: -46.65820,
    features: [
      'rampa',
      'sem_degraus',
      'portas_largas',
      'estacionamento_pcd',
      'banheiro_adaptado',
      'balcao_acessivel',
      'sinalizacao_contraste',
      'cao_guia',
      'libras',
      'atendimento_humanizado'
    ],
    reviewsCount: 18,
    rating: 4.7,
    verifiedByCommunity: true,
    partnershipPlan: 'Empresa Inclusiva Ouro'
  },
  {
    id: 'est-7',
    name: 'Hotel Plaza Jardins Acessível',
    category: 'Hotelaria / Turismo',
    description: 'Hotel com quartos 100% adaptados com barras de apoio, alarmes sonoros e visuais, banheira com assento, equipe trilíngue incluindo Libras e buffet acessível.',
    address: 'Alameda Lorena, 1100 - Jardim Paulista',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3066-5000',
    whatsapp: '11999112233',
    website: 'https://exemplo.com.br/hotel-plazajardins',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    lat: -23.56950,
    lng: -46.66310,
    features: [
      'rampa',
      'sem_degraus',
      'elevador',
      'portas_largas',
      'estacionamento_pcd',
      'banheiro_adaptado',
      'balcao_acessivel',
      'cardapio_acessivel',
      'piso_tatil',
      'sinalizacao_contraste',
      'cao_guia',
      'libras',
      'atendimento_digital',
      'alarme_visual',
      'espaco_silencioso',
      'atendimento_humanizado'
    ],
    reviewsCount: 26,
    rating: 5.0,
    verifiedByCommunity: true,
    partnershipPlan: 'Empresa Inclusiva Diamante'
  }
];

export const SEED_REVIEWS = [
  {
    id: 'rev-1',
    establishmentId: 'est-1',
    author: 'Mariana Silva',
    authorRole: 'Usuária de cadeira de rodas',
    rating: 5,
    accessibilityRating: 5,
    serviceRating: 5,
    date: '2026-10-24',
    comment: 'Fiquei encantada! A rampa é suave, o banheiro é realmente adaptado com espaço para a cadeira girar e as atendentes foram super atenciosas.',
    verified: true
  },
  {
    id: 'rev-2',
    establishmentId: 'est-1',
    author: 'Carlos Eduardo Santos',
    authorRole: 'Pessoa com deficiência auditiva',
    rating: 5,
    accessibilityRating: 5,
    serviceRating: 5,
    date: '2026-10-18',
    comment: 'Fui atendido em Libras logo na entrada pelo garçom Rafael. Que sensação maravilhosa de autonomia!',
    verified: true
  },
  {
    id: 'rev-3',
    establishmentId: 'est-2',
    author: 'Beatriz Fontes',
    authorRole: 'Pessoa com deficiência visual',
    rating: 5,
    accessibilityRating: 5,
    serviceRating: 4,
    date: '2026-09-30',
    comment: 'A sessão com audiodescrição foi impecável. A equipe também recebeu meu cão-guia com muito carinho e água fresca.',
    verified: true
  },
  {
    id: 'rev-4',
    establishmentId: 'est-7',
    author: 'Roberto e Lucas',
    authorRole: 'Pai de criança com TEA (Autismo)',
    rating: 5,
    accessibilityRating: 5,
    serviceRating: 5,
    date: '2026-10-02',
    comment: 'O hotel foi super sensível às necessidades sensoriais do meu filho. Acomodação silenciosa, luzes dimerizáveis e atendimento paciente. Recomendo de olhos fechados!',
    verified: true
  }
];

export const DEFAULT_USER_PROFILE = {
  name: 'Usuário Inclusivo',
  email: 'usuario@acessamais.org.br',
  city: 'São Paulo',
  activePreferences: ['rampa', 'banheiro_adaptado'],
  disabilityProfiles: ['fisica'], // fisica, visual, auditiva, neurodivergente, idoso, cao_guia
  autoFilterByProfile: false,
  notes: 'Priorizo locais sem degraus e com banheiro adaptado espaçoso.'
};

export const DISABILITY_PRESETS = {
  fisica: {
    label: 'Cadeira de Rodas / Mobilidade Reduzida',
    icon: 'accessibility',
    recommendedFeatures: ['rampa', 'sem_degraus', 'elevador', 'portas_largas', 'banheiro_adaptado', 'balcao_acessivel']
  },
  visual: {
    label: 'Deficiência Visual / Baixa Visão',
    icon: 'eye',
    recommendedFeatures: ['cardapio_acessivel', 'piso_tatil', 'sinalizacao_contraste', 'cao_guia']
  },
  auditiva: {
    label: 'Deficiência Auditiva / Surdez (Libras)',
    icon: 'hand-metal',
    recommendedFeatures: ['libras', 'atendimento_digital', 'alarme_visual']
  },
  neurodivergente: {
    label: 'Neurodivergente / TEA / Hipersensibilidade',
    icon: 'brain',
    recommendedFeatures: ['espaco_silencioso', 'atendimento_humanizado']
  },
  idoso: {
    label: 'Pessoa Idosa / Gestante',
    icon: 'heart',
    recommendedFeatures: ['sem_degraus', 'rampa', 'elevador', 'banheiro_adaptado', 'atendimento_humanizado']
  },
  cao_guia: {
    label: 'Tutor de Cão-Guia / Cão de Assistência',
    icon: 'dog',
    recommendedFeatures: ['cao_guia']
  }
};

// ======================= REPOSITÓRIO LOCALSTORAGE ======================= //

export function getEstablishments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESTABLISHMENTS);
    if (!raw) {
      // Salva inicial
      saveEstablishments(SEED_ESTABLISHMENTS);
      return enrichEstablishments(SEED_ESTABLISHMENTS);
    }
    const parsed = JSON.parse(raw);
    return enrichEstablishments(parsed);
  } catch (err) {
    console.error('Erro ao ler estabelecimentos do localStorage:', err);
    return enrichEstablishments(SEED_ESTABLISHMENTS);
  }
}

export function saveEstablishments(list) {
  try {
    localStorage.setItem(STORAGE_KEY_ESTABLISHMENTS, JSON.stringify(list));
  } catch (err) {
    console.error('Erro ao salvar estabelecimentos:', err);
  }
}

export function getEstablishmentById(id) {
  const all = getEstablishments();
  return all.find(e => e.id === id) || null;
}

export function addEstablishment(data) {
  const all = getEstablishments();
  const newId = 'est-' + Date.now();
  const newEst = {
    ...data,
    id: newId,
    reviewsCount: 0,
    rating: 5.0,
    verifiedByCommunity: false,
    partnershipPlan: data.partnershipPlan || 'Gratuito'
  };
  all.unshift(newEst);
  saveEstablishments(all);
  return newEst;
}

export function updateEstablishment(id, updatedFields) {
  const all = getEstablishments();
  const index = all.findIndex(e => e.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], ...updatedFields };
    saveEstablishments(all);
    return all[index];
  }
  return null;
}

export function deleteEstablishment(id) {
  const all = getEstablishments();
  const filtered = all.filter(e => e.id !== id);
  saveEstablishments(filtered);
  return true;
}

export function getReviews(establishmentId = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    const list = raw ? JSON.parse(raw) : SEED_REVIEWS;
    if (establishmentId) {
      return list.filter(r => r.establishmentId === establishmentId);
    }
    return list;
  } catch (err) {
    console.error('Erro ao buscar reviews:', err);
    return SEED_REVIEWS;
  }
}

export function addReview(establishmentId, reviewData) {
  const reviews = getReviews();
  const newReview = {
    id: 'rev-' + Date.now(),
    establishmentId,
    author: reviewData.author || 'Usuário Colaborador',
    authorRole: reviewData.authorRole || 'Membro da Comunidade',
    rating: Number(reviewData.rating) || 5,
    accessibilityRating: Number(reviewData.accessibilityRating) || 5,
    serviceRating: Number(reviewData.serviceRating) || 5,
    date: new Date().toISOString().split('T')[0],
    comment: reviewData.comment || '',
    verified: true
  };
  reviews.unshift(newReview);
  localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

  // Recalcula média do estabelecimento
  const estReviews = reviews.filter(r => r.establishmentId === establishmentId);
  const totalScore = estReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = (totalScore / estReviews.length).toFixed(1);

  updateEstablishment(establishmentId, {
    reviewsCount: estReviews.length,
    rating: parseFloat(avg),
    verifiedByCommunity: estReviews.length >= 3
  });

  return newReview;
}

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler perfil do usuário:', err);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Erro ao salvar perfil do usuário:', err);
  }
}

export function getBarriers(establishmentId = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BARRIERS);
    const list = raw ? JSON.parse(raw) : SEED_BARRIERS;
    if (establishmentId) {
      return list.filter(b => b.establishmentId === establishmentId);
    }
    return list;
  } catch (err) {
    console.error('Erro ao buscar barreiras:', err);
    return SEED_BARRIERS;
  }
}

export function addBarrier(establishmentId, barrierData) {
  const barriers = getBarriers();
  const newBarrier = {
    id: 'bar-' + Date.now(),
    establishmentId,
    author: barrierData.author || 'Cidadão Colaborador',
    barrierType: barrierData.barrierType || 'Barreira Arquitetônica',
    title: barrierData.title || 'Aviso de Barreira',
    description: barrierData.description || '',
    date: new Date().toISOString().split('T')[0],
    status: 'aberto' // 'aberto', 'investigando', 'resolvido'
  };
  barriers.unshift(newBarrier);
  localStorage.setItem(STORAGE_KEY_BARRIERS, JSON.stringify(barriers));
  return newBarrier;
}

export function getInclusionStatistics() {
  const all = getEstablishments();
  const total = all.length;
  if (total === 0) return null;

  const tierCounts = { diamante: 0, ouro: 0, prata: 0, bronze: 0, iniciante: 0 };
  const featureCounts = {};

  Object.keys(ACCESSIBILITY_FEATURES).forEach(fKey => {
    featureCounts[fKey] = 0;
  });

  let verifiedCount = 0;

  all.forEach(est => {
    const tierId = est.scoreData?.tier?.id || 'iniciante';
    if (tierCounts[tierId] !== undefined) tierCounts[tierId]++;
    if (est.verifiedByCommunity) verifiedCount++;

    (est.features || []).forEach(f => {
      if (featureCounts[f] !== undefined) featureCounts[f]++;
    });
  });

  const featurePercentages = {};
  Object.entries(featureCounts).forEach(([k, count]) => {
    featurePercentages[k] = Math.round((count / total) * 100);
  });

  return {
    total,
    verifiedCount,
    tierCounts,
    featureCounts,
    featurePercentages
  };
}

export function resetAllData() {
  localStorage.setItem(STORAGE_KEY_ESTABLISHMENTS, JSON.stringify(SEED_ESTABLISHMENTS));
  localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(SEED_REVIEWS));
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
  localStorage.setItem(STORAGE_KEY_BARRIERS, JSON.stringify(SEED_BARRIERS));
  return true;
}

export function exportAllData() {
  return JSON.stringify({
    establishments: getEstablishments(),
    reviews: getReviews(),
    barriers: getBarriers(),
    profile: getUserProfile(),
    exportDate: new Date().toISOString()
  }, null, 2);
}

export function importAllData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.establishments) saveEstablishments(data.establishments);
    if (data.reviews) localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(data.reviews));
    if (data.barriers) localStorage.setItem(STORAGE_KEY_BARRIERS, JSON.stringify(data.barriers));
    if (data.profile) saveUserProfile(data.profile);
    return true;
  } catch (err) {
    console.error('Falha ao importar dados:', err);
    return false;
  }
}

// Auxiliar para enriquecer os estabelecimentos com dados calculados de selo
function enrichEstablishments(list) {
  return list.map(item => {
    const scoreData = calculateAccessibilityScore(item.features || []);
    return {
      ...item,
      scoreData
    };
  });
}

