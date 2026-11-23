const PLANS = {
  apoio: {
    name: 'Apoio', price: 10,
    benefits: ['Selo digital de empresa apoiadora', 'Nome na lista de parceiros AcessaAqui']
  },
  comunidade: {
    name: 'Comunidade', price: 20,
    benefits: ['Tudo do plano Apoio', 'Destaque na página de parceiros', 'Divulgação de 1 iniciativa inclusiva']
  },
  inclusao: {
    name: 'Inclusão', price: 30,
    benefits: ['Tudo do plano Comunidade', 'Destaque de até 3 unidades', 'Divulgação de 1 ação de acessibilidade']
  }
};

function openSimulation(plan) {
  const modal = document.createElement('div');
  const previousFocus = document.activeElement;
  modal.className = 'fixed inset-0 z-[100000] flex items-center justify-center p-4';
  modal.setAttribute('role', 'presentation');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" data-close-simulation></div>
    <section class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="simulation-title" aria-describedby="simulation-description">
      <button type="button" class="absolute right-4 top-4 rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar" data-close-simulation>✕</button>
      <span class="text-xs font-bold uppercase tracking-wide text-indigo-700">Parceria AcessaAqui</span>
      <h2 id="simulation-title" class="mt-2 text-xl font-black text-slate-900">Simular contratação</h2>
      <p class="mt-3 text-sm text-slate-700">Plano <strong>${plan.name}</strong> — <strong>R$ ${plan.price},00 por mês</strong>.</p>
      <p class="mt-3 text-xs font-bold text-slate-700">Benefícios propostos</p>
      <ul class="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}</ul>
      <p id="simulation-description" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">Esta é uma simulação. Não haverá cobrança, assinatura de contrato nem ativação de benefícios. O cadastro de estabelecimentos continua gratuito.</p>
      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" data-close-simulation>Voltar</button>
        <button type="button" class="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800" data-confirm-simulation>Confirmar simulação</button>
      </div>
    </section>
  `;

  document.body.append(modal);
  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    modal.remove();
    previousFocus?.focus?.();
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeyDown);
  modal.querySelectorAll('[data-close-simulation]').forEach((button) => button.addEventListener('click', close));
  modal.querySelector('[data-confirm-simulation]').addEventListener('click', () => {
    const panel = modal.querySelector('[role="dialog"]');
    panel.innerHTML = `
      <span class="text-3xl" aria-hidden="true">✓</span>
      <h2 id="simulation-title" class="mt-2 text-xl font-black text-slate-900">Simulação concluída</h2>
      <p class="mt-3 text-sm text-slate-700">Você simulou a adesão ao plano <strong>${plan.name}</strong>, no valor de <strong>R$ ${plan.price},00 por mês</strong>.</p>
      <p class="mt-3 text-xs font-bold text-slate-700">Benefícios propostos para este plano</p>
      <ul class="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}</ul>
      <p id="simulation-description" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">Nenhuma cobrança foi feita e nenhum contrato ou benefício foi ativado. A conta continua no cadastro gratuito.</p>
      <div class="mt-5 flex justify-end"><button type="button" class="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800" data-close-simulation>Fechar</button></div>
    `;
    panel.querySelector('[data-close-simulation]').addEventListener('click', close);
    panel.querySelector('[data-close-simulation]').focus();
  });
  modal.querySelector('[data-close-simulation]').focus();
}

document.querySelectorAll('[data-contract-plan]').forEach((button) => {
  button.addEventListener('click', () => {
    const plan = PLANS[button.dataset.contractPlan];
    if (plan) openSimulation(plan);
  });
});
