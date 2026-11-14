// MOTOR genérico dos simuladores de treino (tela "burra" desenha isto).
// Cada tela é uma ESPECIFICAÇÃO (spec) em src/lib/simuladores/<slug>.mjs.
// O motor não tem texto: o texto vem do spec (bilíngue). Item 2 do pedido
// (permissão + parâmetro por passo) é campo do próprio passo no spec.
//
// Tipos de ação que um passo pode ter:
//   ABRIR     avança (concluir pré-cadastro, clicar "+ Novo", etc.)
//   SALVAR    valida obrigatórios do tipo atual; se faltar, bloqueia; senão salva e avança
//   ANEXAR    exige estar salvo; marca anexado e avança
//   ENVIAR    exige salvo (+ anexo, se a tela exigir); envia p/ alçada e avança
//   APROVAR   acontece fora da tela; marca ativo/código final e avança
//   FIM       passo terminal
// PREENCHER é sub-ação implícita de um passo SALVAR (preenche os obrigatórios).

// ---- chrome da interface (fixo, bilíngue) ----
export const UI = {
  pt: {
    tiposLabel: 'Variação', passo: (i, n) => `Etapa ${i} de ${n}`,
    quem: 'Quem', tela: 'Tela', permissao: 'Permissão', parametro: 'Parâmetro',
    voltar: '← Voltar', reiniciar: '↺ Reiniciar', ese: 'E se…?',
    painel: 'Painel', regras: '📏 Regras desta tela', quemFaz: '👥 Quem pode usar', hist: '📜 O que você fez',
    histVazio: 'Nada ainda — comece pelo botão da etapa.',
    eseSalvarSem: (c) => `Tentar salvar sem "${c}"`,
    eseEnviarAgora: 'Tentar enviar agora (sem salvar)',
    eseEnviarSemAnexo: 'Tentar enviar sem anexar',
  },
  en: {
    tiposLabel: 'Variant', passo: (i, n) => `Step ${i} of ${n}`,
    quem: 'Who', tela: 'Screen', permissao: 'Permission', parametro: 'Parameter',
    voltar: '← Back', reiniciar: '↺ Restart', ese: 'What if…?',
    painel: 'Panel', regras: '📏 Rules of this screen', quemFaz: '👥 Who can use it', hist: '📜 What you did',
    histVazio: 'Nothing yet — start with the step button.',
    eseSalvarSem: (c) => `Try to save without "${c}"`,
    eseEnviarAgora: 'Try to submit now (unsaved)',
    eseEnviarSemAnexo: 'Try to submit without attaching',
  },
};

// ---- mensagens de resultado padrão (o spec pode acrescentar via textos.out) ----
const OUT = {
  pt: {
    salve_antes: 'Esta ação só é liberada depois de salvar o cadastro com os obrigatórios.',
    anexe_antes: 'Falta anexar os documentos obrigatórios antes de enviar.',
    salvou: 'Cadastro salvo com sucesso.',
    anexou: 'Documentos anexados. Envio liberado.',
    preencheu: 'Obrigatórios preenchidos. Pode salvar.',
    abriu: 'Etapa concluída.',
    aprovou: 'Aprovado.',
    fim: 'Fim do fluxo.',
  },
  en: {
    salve_antes: 'This action is only enabled after saving the record with the required fields.',
    anexe_antes: 'You must attach the required documents before submitting.',
    salvou: 'Record saved successfully.',
    anexou: 'Documents attached. Submission enabled.',
    preencheu: 'Required fields filled. You can save.',
    abriu: 'Step completed.',
    aprovou: 'Approved.',
    fim: 'End of the flow.',
  },
};

export function variantePadrao(spec) {
  return spec.variantes ? spec.variantes[0].key : '_';
}

export function estadoInicial(spec, cenario = {}) {
  return {
    idx: 0,
    variante: spec.variantes ? cenario.variante || spec.variantes[0].key : '_',
    campos: {},
    salvo: false,
    anexado: false,
    statusKey: 'novo',
    codigo: null,
  };
}

export function etapaAtual(spec, s) {
  return spec.etapasOrdem[s.idx];
}

function obrigatoriosDe(spec, s) {
  return spec.obrigatorios?.[s.variante] ?? spec.obrigatorios?.['_'] ?? [];
}

export function faltando(spec, s) {
  return obrigatoriosDe(spec, s).filter((k) => !s.campos[k]);
}

export function pegadinhaDe(spec, s) {
  return spec.pegadinha?.[s.variante] ?? spec.pegadinha?.['_'] ?? null;
}

/** Próxima ação (tipo) do caminho feliz para o botão principal. */
export function proximaAcao(spec, s) {
  const et = etapaAtual(spec, s);
  const tipo = spec.etapaTipo[et];
  if (tipo === 'FIM') return null;
  if (tipo === 'SALVAR' && faltando(spec, s).length) return 'PREENCHER';
  return tipo;
}

/** Ação PURA: devolve { estado, outcome }. `outcome` é código, sem texto. */
export function executar(spec, s, tipo) {
  const n = structuredClone(s);
  switch (tipo) {
    case 'PREENCHER':
      for (const k of obrigatoriosDe(spec, n)) n.campos[k] = true;
      return { estado: n, outcome: 'preencheu' };

    case 'tirarPegadinha': {
      const p = pegadinhaDe(spec, n);
      if (p) n.campos[p] = false;
      return { estado: n, outcome: 'tirou' };
    }

    case 'ABRIR':
      n.idx += 1;
      return { estado: n, outcome: 'abriu' };

    case 'SALVAR': {
      const falta = faltando(spec, n);
      if (falta.length) return { estado: s, outcome: 'falta:' + falta.join(',') };
      n.salvo = true;
      n.idx += 1;
      return { estado: n, outcome: 'salvou' };
    }

    case 'ANEXAR':
      if (!n.salvo) return { estado: s, outcome: 'salve_antes' };
      n.anexado = true;
      n.idx += 1;
      return { estado: n, outcome: 'anexou' };

    case 'ENVIAR':
      if (!n.salvo) return { estado: s, outcome: 'salve_antes' };
      if (spec.exigeAnexo && !n.anexado) return { estado: s, outcome: 'anexe_antes' };
      n.idx += 1;
      n.statusKey = 'emAnalise';
      return { estado: n, outcome: 'enviou' };

    case 'APROVAR':
      n.idx += 1;
      n.statusKey = 'ativo';
      n.codigo = spec.codigoFinal ?? null;
      return { estado: n, outcome: 'aprovou' };

    case 'FIM':
      return { estado: s, outcome: 'fim' };

    default:
      return { estado: s, outcome: 'desconhecida' };
  }
}

/** "Enviar" fica desabilitado enquanto não dá para enviar (regra visível na tela). */
export function envioBloqueado(spec, s) {
  return !s.salvo || (spec.exigeAnexo && !s.anexado);
}

/** Traduz um outcome (código) para a frase final. Usa textos.out do spec e OUT padrão. */
export function mensagem(spec, lang, outcome, estado) {
  const t = spec.textos[lang];
  const out = { ...OUT[lang], ...(t.out ?? {}) };
  const negativos = ['salve_antes', 'anexe_antes'];

  if (outcome.startsWith('falta:')) {
    const labels = outcome.slice(6).split(',').map((k) => t.campos[k] || k).join(', ');
    const falta = t.outFalta || ((l) => (lang === 'en'
      ? `Can't save: required fields are missing — ${l}. Fill them and save again.`
      : `Não dá pra salvar: faltam campos obrigatórios — ${l}. Preencha e salve de novo.`));
    return { ok: false, texto: falta(labels) };
  }
  if (outcome === 'enviou') {
    const a = (spec.alcada?.[estado.variante] ?? []).map((k) => t.alcada?.[k] ?? k).join(' + ');
    const fn = t.outEnviou || ((al) => (lang === 'en'
      ? `Submitted! Approval level: ${al}.`
      : `Enviado! Alçada acionada: ${al}.`));
    return { ok: true, texto: fn(a) };
  }
  if (outcome === 'tirou') {
    const p = pegadinhaDe(spec, estado);
    const label = t.campos[p] || p;
    const fn = t.outTirou || ((c) => (lang === 'en'
      ? `Field "${c}" left empty on purpose. Try to save to see the block.`
      : `Campo "${c}" esvaziado de propósito. Tente salvar para ver o bloqueio.`));
    return { ok: false, texto: fn(label) };
  }
  const txt = out[outcome];
  if (typeof txt === 'string') return { ok: !negativos.includes(outcome), texto: txt };
  return { ok: true, texto: '' };
}
