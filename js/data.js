// data.js - Camada de acesso a dados: consome a API REST (server/) e guarda só o perfil de preferências no navegador.
import { calculateAccessibilityScore, ACCESSIBILITY_FEATURES } from './certification.js';

const STORAGE_KEY_PROFILE = 'acessa_usuario_perfil_v1';

// ---------- HTTP ----------
const esc = (v) => typeof v === 'string'
  ? v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  : Array.isArray(v) ? v.map(esc) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, esc(x)])) : v;

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(json?.error || 'Não foi possível concluir a operação.');
    e.status = res.status;
    throw e;
  }
  return json;
}

// Conteúdo digitado por usuários é escapado aqui, antes de chegar aos templates com innerHTML.
const enrich = (list) => esc(list).map(e => ({ ...e, scoreData: calculateAccessibilityScore(e.features || []) }));

window.addEventListener('unhandledrejection', (ev) => {
  const err = ev.reason;
  if (!(err instanceof Error) || !err.status) return;
  ev.preventDefault();
  alert(err.message);
  if (err.status === 401) location.href = (location.pathname.includes('/view/') ? '../' : '') + 'index.html?entrar=1';
});

// ---------- Estabelecimentos ----------
export const getEstablishments = async () => enrich(await api('/establishments'));
export const getMyEstablishments = async () => enrich(await api('/me/establishments'));
export const getEstablishmentById = async (id) => { try { return enrich([await api(`/establishments/${id}`)])[0]; } catch { return null; } };
export const addEstablishment = async (data) => enrich([await api('/establishments', { method: 'POST', body: data })])[0];
export const deleteEstablishment = (id) => api(`/establishments/${id}`, { method: 'DELETE' });

// ---------- Avaliações e barreiras ----------
export const getReviews = async (estId) => esc(await api(`/establishments/${estId}/reviews`));
export const addReview = async (estId, data) => esc(await api(`/establishments/${estId}/reviews`, { method: 'POST', body: data }));
export const getBarriers = async (estId) => esc(await api(`/establishments/${estId}/barriers`));
export const addBarrier = async (estId, data) => esc(await api(`/establishments/${estId}/barriers`, { method: 'POST', body: data }));
export const getMyFeedback = async () => esc(await api('/me/feedback'));

// ---------- Autenticação da empresa ----------
export const registerCompany = (data) => api('/auth/register', { method: 'POST', body: data });
export const loginCompany = (data) => api('/auth/login', { method: 'POST', body: data });
export const logoutCompany = () => api('/auth/logout', { method: 'POST' });
export const getCurrentCompany = async () => esc(await api('/auth/me'));

// ---------- Perfil de preferências (fica só no navegador do usuário) ----------
export const DEFAULT_USER_PROFILE = {
  name: '', notes: '', activePreferences: [], disabilityProfiles: [], autoFilterByProfile: false
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

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    return raw ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_USER_PROFILE };
  } catch { return { ...DEFAULT_USER_PROFILE }; }
}

export function saveUserProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile)); } catch (e) { console.error(e); }
}
