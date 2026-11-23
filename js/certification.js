// certification.js - Cálculo e Metodologia dos Selos de Acessibilidade

export const ACCESSIBILITY_FEATURES = {
  // Arquitetônica / Mobilidade
  rampa: {
    id: 'rampa',
    label: 'Rampa de Acesso Adequada',
    category: 'fisica',
    icon: 'activity',
    description: 'Inclinação suave conforme norma ABNT NBR 9050 e corrimão duplo bilateral.',
    points: 15
  },
  sem_degraus: {
    id: 'sem_degraus',
    label: 'Entrada sem Degraus (Nível da Calçada)',
    category: 'fisica',
    icon: 'door-open',
    description: 'Acesso direto do piso sem desníveis ou com guia rebaixada.',
    points: 15
  },
  elevador: {
    id: 'elevador',
    label: 'Elevador ou Plataforma Acessível',
    category: 'fisica',
    icon: 'chevrons-up',
    description: 'Cabine com dimensões adequadas, botoeira em Braille e aviso sonoro.',
    points: 15
  },
  portas_largas: {
    id: 'portas_largas',
    label: 'Portas e Corredores Largos (≥ 80cm)',
    category: 'fisica',
    icon: 'maximize-2',
    description: 'Circulação livre para cadeira de rodas ou andador sem obstáculos.',
    points: 10
  },
  estacionamento_pcd: {
    id: 'estacionamento_pcd',
    label: 'Vaga Reservada para PCD',
    category: 'fisica',
    icon: 'car',
    description: 'Vaga próxima à entrada com faixa adicional de desembarque sinalizada.',
    points: 10
  },
  
  // Sanitários e Mobiliário
  banheiro_adaptado: {
    id: 'banheiro_adaptado',
    label: 'Banheiro Adaptado (Norma ABNT)',
    category: 'sanitario',
    icon: 'bath',
    description: 'Espaço para giro de cadeira, barras de apoio, vaso com altura correta e alarme.',
    points: 20
  },
  balcao_acessivel: {
    id: 'balcao_acessivel',
    label: 'Balcão / Mesa com Altura Acessível',
    category: 'sanitario',
    icon: 'utensils',
    description: 'Superfícies de atendimento rebaixadas para uso por cadeirantes.',
    points: 10
  },

  // Visual
  cardapio_acessivel: {
    id: 'cardapio_acessivel',
    label: 'Cardápio / Material em Braille e Digital',
    category: 'visual',
    icon: 'file-text',
    description: 'Opção impressa em Braille ou digital com leitor de tela (QR Code acessível).',
    points: 15
  },
  piso_tatil: {
    id: 'piso_tatil',
    label: 'Piso Tátil (Direcional e Alerta)',
    category: 'visual',
    icon: 'footprints',
    description: 'Sinalização tátil no chão orientando caminhos e alertando sobre obstáculos.',
    points: 15
  },
  sinalizacao_contraste: {
    id: 'sinalizacao_contraste',
    label: 'Sinalização Visual Contrastante e Ampliada',
    category: 'visual',
    icon: 'eye',
    description: 'Placas com letras legíveis, alto contraste cromático e boa iluminação.',
    points: 10
  },
  cao_guia: {
    id: 'cao_guia',
    label: 'Permitido Cão-Guia com Acolhimento',
    category: 'visual',
    icon: 'dog',
    description: 'Entrada garantida por lei com pote de água e área confortável para o cão.',
    points: 10
  },

  // Auditiva e Comunicação
  libras: {
    id: 'libras',
    label: 'Equipe Capacitada em Libras',
    category: 'auditiva',
    icon: 'hand-metal',
    description: 'Atendentes preparados para se comunicar na Língua Brasileira de Sinais.',
    points: 25
  },
  atendimento_digital: {
    id: 'atendimento_digital',
    label: 'Atendimento Alternativo por Texto / WhatsApp',
    category: 'auditiva',
    icon: 'message-square',
    description: 'Comunicação facilitada por canais digitais ou tablet no balcão.',
    points: 10
  },
  alarme_visual: {
    id: 'alarme_visual',
    label: 'Alarme e Sinalização de Emergência Visual',
    category: 'auditiva',
    icon: 'bell',
    description: 'Flashes luminosos e avisos em tela para situações de evacuação.',
    points: 10
  },

  // Neurodivergência / Cognitivo
  espaco_silencioso: {
    id: 'espaco_silencioso',
    label: 'Espaço de Descompressão / Baixo Estímulo',
    category: 'cognitiva',
    icon: 'volume-x',
    description: 'Área com luz suave e baixo ruído para acolhimento de pessoas no espectro autista.',
    points: 20
  },
  atendimento_humanizado: {
    id: 'atendimento_humanizado',
    label: 'Equipe Treinada em Acolhimento Neurodivergente',
    category: 'cognitiva',
    icon: 'heart-handshake',
    description: 'Paciência, atendimento sem pressão e respeito a crises sensoriais.',
    points: 15
  }
};

export const BADGE_TIERS = {
  DIAMANTE: {
    id: 'diamante',
    name: 'Selo Diamante - Excelência Universal',
    badgeClass: 'badge-diamante',
    color: '#0284c7',
    icon: 'gem',
    minScore: 120,
    minCategories: 4,
    description: 'Acessibilidade universal exemplar abrangendo física, visual, auditiva e cognitiva.'
  },
  OURO: {
    id: 'ouro',
    name: 'Selo Ouro - Inclusão Plena',
    badgeClass: 'badge-ouro',
    color: '#d97706',
    icon: 'award',
    minScore: 80,
    minCategories: 3,
    description: 'Excelente conjunto de recursos físicos e comunicação inclusiva multissensorial.'
  },
  PRATA: {
    id: 'prata',
    name: 'Selo Prata - Acesso Amplo',
    badgeClass: 'badge-prata',
    color: '#64748b',
    icon: 'shield-check',
    minScore: 50,
    minCategories: 2,
    description: 'Acessibilidade arquitetônica e sanitária assegurada com bom atendimento.'
  },
  BRONZE: {
    id: 'bronze',
    name: 'Selo Bronze - Acesso Básico',
    badgeClass: 'badge-bronze',
    color: '#b45309',
    icon: 'check-circle-2',
    minScore: 25,
    minCategories: 1,
    description: 'Atende aos requisitos mínimos de entrada e circulação básica.'
  },
  INICIANTE: {
    id: 'iniciante',
    name: 'Em Adaptação',
    badgeClass: 'badge-iniciante',
    color: '#9ca3af',
    icon: 'clock',
    minScore: 0,
    minCategories: 0,
    description: 'Estabelecimento em processo de implementação de melhorias de acessibilidade.'
  }
};

/**
 * Calcula a pontuação e determina o selo correspondente
 * @param {Array<string>} featureIds - Lista de IDs das características marcadas
 * @returns {Object} { score, maxScore, tier, categoryCounts }
 */
export function calculateAccessibilityScore(featureIds = []) {
  let score = 0;
  let maxScore = 0;
  const categoriesPresent = new Set();
  const categoryCounts = {
    fisica: 0,
    sanitario: 0,
    visual: 0,
    auditiva: 0,
    cognitiva: 0
  };

  Object.values(ACCESSIBILITY_FEATURES).forEach(feat => {
    maxScore += feat.points;
    if (featureIds.includes(feat.id)) {
      score += feat.points;
      categoriesPresent.add(feat.category);
      if (categoryCounts[feat.category] !== undefined) {
        categoryCounts[feat.category]++;
      }
    }
  });

  const numCategories = categoriesPresent.size;
  let tier = BADGE_TIERS.INICIANTE;

  if (score >= BADGE_TIERS.DIAMANTE.minScore && numCategories >= BADGE_TIERS.DIAMANTE.minCategories) {
    tier = BADGE_TIERS.DIAMANTE;
  } else if (score >= BADGE_TIERS.OURO.minScore && numCategories >= BADGE_TIERS.OURO.minCategories) {
    tier = BADGE_TIERS.OURO;
  } else if (score >= BADGE_TIERS.PRATA.minScore && numCategories >= BADGE_TIERS.PRATA.minCategories) {
    tier = BADGE_TIERS.PRATA;
  } else if (score >= BADGE_TIERS.BRONZE.minScore) {
    tier = BADGE_TIERS.BRONZE;
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    tier,
    numCategories,
    categoryCounts
  };
}

