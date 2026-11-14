// Treino guiado da tela Cliente — LÓGICA PURA (sem DOM, sem framework).
// Espelha as regras REAIS do manual:
//   - modulos/clientes/cliente.mdx
//   - tecnico/regras-de-validacao/cliente.mdx
// A tela (TreinoCliente.astro) só desenha o estado que sai daqui.
// Mudou a regra no manual? Atualize este arquivo E o treinoCliente.check.mjs.

/** Campos obrigatórios ao salvar, por tipo de pessoa (tabela real da tela). */
export const OBRIGATORIOS = {
  PF: ['nome', 'nomeFantasia', 'consultor', 'endereco', 'telefone', 'email', 'dataNasc', 'credencial'],
  PJ: ['nome', 'nomeFantasia', 'consultor', 'endereco', 'telefone', 'email', 'dataNasc', 'credencial', 'inscricaoEstadual'],
  EST: ['nome', 'nomeFantasia', 'consultor', 'endereco', 'telefone', 'moeda', 'listaPreco'],
};

/** Campo "pegadinha" de cada tipo (o que o botão "E se faltar?" deixa de fora). */
export const PEGADINHA = { PF: 'email', PJ: 'inscricaoEstadual', EST: 'moeda' };

/** Alçada de aprovação por tipo (comportamento real da tela ao enviar). */
export const ALCADA = {
  PF: ['credito'],
  PJ: ['credito', 'fiscal'],
  EST: ['creditoInternacional', 'fiscal'],
};

/** Documento exibido no painel conforme o tipo. */
function docDoTipo(tipo) {
  if (tipo === 'PF') return '123.456.789-09';
  if (tipo === 'PJ') return '12.345.678/0001-95';
  return '— (dispensado)';
}

/** Estado inicial do simulador. `cenario` = { tipo, verifyId }. */
export function estadoInicial(cenario = {}) {
  const tipo = cenario.tipo || 'PF';
  return {
    etapa: 'PRE', // PRE → DADOS → SALVO → ANEXADO → ENVIADO → ATIVO
    tipo,
    campos: {}, // fieldKey -> true quando preenchido
    anexado: false,
    documento: docDoTipo(tipo),
    statusKey: 'novo', // novo | emAnalise | ativo
    codigoSap: null,
  };
}

/** Quais obrigatórios ainda faltam neste estado. */
export function faltando(s) {
  return OBRIGATORIOS[s.tipo].filter((k) => !s.campos[k]);
}

/**
 * Executa uma ação. Função PURA: devolve { estado, outcome } sem mutar `s`.
 * `outcome` é um CÓDIGO (sem texto) — a tela traduz para a língua.
 */
export function executar(s, acao) {
  const n = structuredClone(s);
  switch (acao) {
    case 'avancar': // conclui o pré-cadastro
      if (n.etapa !== 'PRE') return { estado: s, outcome: 'ja_avancou' };
      n.etapa = 'DADOS';
      n.documento = docDoTipo(n.tipo);
      return { estado: n, outcome: 'avancou' };

    case 'preencher': // preenche todos os obrigatórios do tipo
      if (n.etapa !== 'DADOS') return { estado: s, outcome: 'fora_de_ordem' };
      for (const k of OBRIGATORIOS[n.tipo]) n.campos[k] = true;
      return { estado: n, outcome: 'preencheu' };

    case 'tirarPegadinha': // deixa o campo-pegadinha em branco (desvio didático)
      n.campos[PEGADINHA[n.tipo]] = false;
      return { estado: n, outcome: 'tirou' };

    case 'salvar': {
      if (n.etapa !== 'DADOS') return { estado: s, outcome: 'fora_de_ordem' };
      const falta = faltando(n);
      if (falta.length) return { estado: s, outcome: 'falta:' + falta.join(',') };
      n.etapa = 'SALVO';
      return { estado: n, outcome: 'salvou' };
    }

    case 'anexar':
      if (n.etapa !== 'SALVO') return { estado: s, outcome: 'salve_antes' };
      n.anexado = true;
      n.etapa = 'ANEXADO';
      return { estado: n, outcome: 'anexou' };

    case 'enviar': {
      if (n.etapa === 'PRE' || n.etapa === 'DADOS') return { estado: s, outcome: 'salve_antes' };
      if (!n.anexado) return { estado: s, outcome: 'anexe_antes' };
      if (n.etapa !== 'ANEXADO') return { estado: s, outcome: 'ja_enviou' };
      n.etapa = 'ENVIADO';
      n.statusKey = 'emAnalise';
      return { estado: n, outcome: 'enviou' };
    }

    case 'aprovar': // acontece FORA da tela (Fila de Aprovações) — só para fechar o ciclo
      if (n.etapa !== 'ENVIADO') return { estado: s, outcome: 'fora_de_ordem' };
      n.etapa = 'ATIVO';
      n.statusKey = 'ativo';
      n.codigoSap = '0001004523';
      return { estado: n, outcome: 'aprovou' };

    default:
      return { estado: s, outcome: 'desconhecida' };
  }
}

/** Próxima ação do "caminho feliz" para o botão principal. */
export function proximaAcao(s) {
  switch (s.etapa) {
    case 'PRE': return 'avancar';
    case 'DADOS': return faltando(s).length ? 'preencher' : 'salvar';
    case 'SALVO': return 'anexar';
    case 'ANEXADO': return 'enviar';
    case 'ENVIADO': return 'aprovar';
    default: return null;
  }
}

/** "Enviar Cliente" só habilita depois de salvar (regra real da tela). */
export function podeEnviar(s) {
  return s.etapa === 'ANEXADO';
}

/** Ordem das etapas na trilha (status internos do simulador). */
export const TRILHA = ['PRE', 'DADOS', 'SALVO', 'ANEXADO', 'ENVIADO'];

// ───────────────────────────── conteúdo bilíngue (texto da tela) ─────────────

const PT = {
  tipos: { PF: 'Pessoa Física', PJ: 'Pessoa Jurídica', EST: 'Estrangeiro' },
  statusLabel: { novo: 'Novo (não enviado)', emAnalise: 'Em Análise pela Área de Cadastro/Crédito', ativo: 'ATIVO' },
  alcada: { credito: 'Crédito', fiscal: 'Fiscal', creditoInternacional: 'Crédito Internacional' },
  campos: {
    nome: 'Nome', nomeFantasia: 'Nome Fantasia', consultor: 'Consultor FVE', endereco: 'Endereço principal',
    telefone: 'Telefone principal', email: 'E-mail', dataNasc: 'Data Nascimento/Abertura',
    credencial: 'Credencial (UF, número, tipo e responsável)', inscricaoEstadual: 'Inscrição Estadual',
    moeda: 'Moeda', listaPreco: 'Lista de Preço',
  },
  etapas: {
    PRE: {
      ic: '🧾', tit: 'Pré-cadastro (Pulse Credit)',
      quem: 'Cadastro/Consultor', tela: 'Tela de Cliente → Pré-cadastro', href: '/modulos/clientes/cliente',
      txt: 'Tudo começa pelo pré-cadastro: escolha o Tipo de Pessoa, o Tipo de Cadastro e informe o documento (CPF/CNPJ). Estrangeiro dispensa o documento.',
      pratica: 'O documento define as regras seguintes. Clique em "Avançar" para liberar a aba Dados Cadastrais.',
      fala: 'Bora começar! 🦷 Me diz: esse cliente é Física, Jurídica ou Estrangeiro?',
      acao: 'Avançar →',
    },
    DADOS: {
      ic: '📝', tit: 'Dados Cadastrais',
      quem: 'Cadastro/Consultor', tela: 'Tela de Cliente → aba Dados Cadastrais', href: '/modulos/clientes/cliente',
      txt: 'Antes de salvar aparecem só 4 abas. Preencha os obrigatórios — eles mudam conforme o tipo de pessoa.',
      pratica: 'Se o documento for localizado no VerifyID, nome e endereço vêm preenchidos. O que faltar, você completa.',
      fala: 'Agora os dados! Preenche os obrigatórios que eu confiro pra você antes de salvar. 😁',
      acao: 'Preencher obrigatórios',
    },
    SALVO: {
      ic: '💾', tit: 'Salvo — abas liberadas',
      quem: 'Sistema', tela: 'Tela de Cliente (após Salvar)', href: '/modulos/clientes/cliente',
      txt: 'Salvou! As demais abas liberaram e o topo passou a mostrar o resumo do cliente. O botão "Enviar Cliente" agora pode habilitar.',
      pratica: 'Falta um passo antes de enviar: anexar os documentos obrigatórios.',
      fala: 'Mandou bem! 💾 Guardei tudo. Agora vamos nos anexos.',
      acao: 'Anexar documentos',
    },
    ANEXADO: {
      ic: '📎', tit: 'Anexos obrigatórios',
      quem: 'Cadastro/Consultor', tela: 'Tela de Cliente → aba Anexos', href: '/modulos/clientes/cliente',
      txt: 'O anexo de documentos é obrigatório para enviar. Com os documentos anexados, "Enviar Cliente" está liberado.',
      pratica: 'Clique em "Enviar Cliente" e confirme o popup com "SIM".',
      fala: 'Documentos anexados! 📎 Pronto pra enviar pra alçada. Confirma no "SIM"?',
      acao: 'Enviar Cliente →',
    },
    ENVIADO: {
      ic: '📤', tit: 'Enviado para aprovação',
      quem: 'Sistema', tela: 'Fila de Aprovações de Cadastro', href: '/tecnico/fluxos/criacao-de-cliente',
      txt: 'O cliente saiu da tela e entrou na fila da alçada. A decisão (aprovar/reprovar) é na Fila de Aprovações — não nesta tela.',
      pratica: 'Quando a alçada aprova, o cliente vira ATIVO e o código SAP é gerado automaticamente.',
      fala: 'Enviado! 📤 Agora é com a alçada. Eu te mostro o que acontece quando aprovam.',
      acao: 'Aprovar (fora da tela) →',
    },
    ATIVO: {
      ic: '✅', tit: 'Aprovado — ATIVO + código SAP',
      quem: 'Alçada + SAP', tela: 'Fila de Aprovações de Cadastro', href: '/tecnico/fluxos/criacao-de-cliente',
      txt: 'A alçada aprovou. O cliente ficou ATIVO e recebeu o código SAP automaticamente. Ciclo completo!',
      pratica: 'Pronto: cliente ativo, com crédito liberado e integrado ao SAP.',
      fala: 'Aprovado! ✅ Cliente ATIVO e com código SAP. Fim do ciclo — manda ver! 🦷',
      acao: null,
    },
  },
  out: {
    'falta': (labels) => `Não dá pra salvar: faltam campos obrigatórios — ${labels}. Preencha e salve de novo.`,
    'salve_antes': 'O botão "Enviar Cliente" só habilita depois de salvar o cadastro com os obrigatórios.',
    'anexe_antes': 'Falta anexar os documentos obrigatórios antes de enviar.',
    'enviou': (a) => `Cliente enviado! Alçada acionada: ${a}. Status: "Em Análise pela Área de Cadastro/Crédito".`,
    'salvou': 'Cadastro salvo. Abas complementares liberadas e "Enviar Cliente" habilitado.',
    'anexou': 'Documentos anexados. Agora o envio está liberado.',
    'preencheu': 'Obrigatórios preenchidos. Pode salvar.',
    'avancou': 'Pré-cadastro concluído. Aba Dados Cadastrais liberada.',
    'aprovou': 'Aprovado pela alçada: cliente ATIVO e código SAP gerado.',
    'tirou': (label) => `Campo "${label}" esvaziado de propósito. Tente salvar para ver o bloqueio.`,
  },
};

const EN = {
  tipos: { PF: 'Individual', PJ: 'Company', EST: 'Foreign' },
  statusLabel: { novo: 'New (not submitted)', emAnalise: 'Under review by Registration/Credit', ativo: 'ACTIVE' },
  alcada: { credito: 'Credit', fiscal: 'Tax', creditoInternacional: 'International Credit' },
  campos: {
    nome: 'Name', nomeFantasia: 'Trade Name', consultor: 'FVE Consultant', endereco: 'Primary address',
    telefone: 'Primary phone', email: 'E-mail', dataNasc: 'Birth/Incorporation date',
    credencial: 'Credential (state, number, type and holder)', inscricaoEstadual: 'State Registration',
    moeda: 'Currency', listaPreco: 'Price List',
  },
  etapas: {
    PRE: {
      ic: '🧾', tit: 'Pre-registration (Pulse Credit)',
      quem: 'Registration/Consultant', tela: 'Customer screen → Pre-registration', href: '/en/modulos/clientes/cliente',
      txt: 'It all starts with pre-registration: choose the Person Type, the Registration Type and enter the document (CPF/CNPJ). Foreign customers skip the document.',
      pratica: 'The document drives the next rules. Click "Next" to unlock the Registration Data tab.',
      fala: "Let's start! 🦷 Tell me: is this customer Individual, Company or Foreign?",
      acao: 'Next →',
    },
    DADOS: {
      ic: '📝', tit: 'Registration Data',
      quem: 'Registration/Consultant', tela: 'Customer screen → Registration Data tab', href: '/en/modulos/clientes/cliente',
      txt: 'Before saving, only 4 tabs show. Fill the required fields — they change with the person type.',
      pratica: 'If the document is found in VerifyID, name and address come pre-filled. Fill in the rest.',
      fala: "Now the data! Fill the required fields and I'll check them before you save. 😁",
      acao: 'Fill required fields',
    },
    SALVO: {
      ic: '💾', tit: 'Saved — tabs unlocked',
      quem: 'System', tela: 'Customer screen (after Save)', href: '/en/modulos/clientes/cliente',
      txt: 'Saved! The other tabs unlocked and the header now shows the customer summary. "Submit Customer" can now enable.',
      pratica: 'One step before submitting: attach the required documents.',
      fala: 'Nicely done! 💾 Everything saved. Now the attachments.',
      acao: 'Attach documents',
    },
    ANEXADO: {
      ic: '📎', tit: 'Required attachments',
      quem: 'Registration/Consultant', tela: 'Customer screen → Attachments tab', href: '/en/modulos/clientes/cliente',
      txt: 'Attaching documents is required to submit. With documents attached, "Submit Customer" is enabled.',
      pratica: 'Click "Submit Customer" and confirm the popup with "YES".',
      fala: 'Documents attached! 📎 Ready to send to the approval level. Confirm with "YES"?',
      acao: 'Submit Customer →',
    },
    ENVIADO: {
      ic: '📤', tit: 'Submitted for approval',
      quem: 'System', tela: 'Registration Approval Queue', href: '/en/tecnico/fluxos/criacao-de-cliente',
      txt: 'The customer left the screen and entered the approval queue. The decision (approve/reject) happens in the Approval Queue — not on this screen.',
      pratica: 'When the level approves, the customer becomes ACTIVE and the SAP code is generated automatically.',
      fala: "Submitted! 📤 It's with the approval level now. I'll show you what happens when they approve.",
      acao: 'Approve (off-screen) →',
    },
    ATIVO: {
      ic: '✅', tit: 'Approved — ACTIVE + SAP code',
      quem: 'Approval level + SAP', tela: 'Registration Approval Queue', href: '/en/tecnico/fluxos/criacao-de-cliente',
      txt: 'The level approved. The customer is ACTIVE and received the SAP code automatically. Full cycle done!',
      pratica: 'Done: active customer, credit released and integrated with SAP.',
      fala: 'Approved! ✅ Customer ACTIVE with a SAP code. End of the cycle — well done! 🦷',
      acao: null,
    },
  },
  out: {
    'falta': (labels) => `Can't save: required fields are missing — ${labels}. Fill them and save again.`,
    'salve_antes': '"Submit Customer" only enables after you save the registration with the required fields.',
    'anexe_antes': 'You must attach the required documents before submitting.',
    'enviou': (a) => `Customer submitted! Approval level triggered: ${a}. Status: "Under review by Registration/Credit".`,
    'salvou': 'Registration saved. Extra tabs unlocked and "Submit Customer" enabled.',
    'anexou': 'Documents attached. Submission is now enabled.',
    'preencheu': 'Required fields filled. You can save.',
    'avancou': 'Pre-registration done. Registration Data tab unlocked.',
    'aprovou': 'Approved by the level: customer ACTIVE and SAP code generated.',
    'tirou': (label) => `Field "${label}" left empty on purpose. Try to save to see the block.`,
  },
};

export function modelo(lang) {
  return lang === 'en' ? EN : PT;
}

/** Traduz um outcome (código) para a frase final mostrada ao usuário. */
export function mensagem(lang, outcome, estado) {
  const m = modelo(lang);
  if (outcome.startsWith('falta:')) {
    const labels = outcome.slice(6).split(',').map((k) => m.campos[k] || k).join(', ');
    return { ok: false, texto: m.out.falta(labels) };
  }
  if (outcome === 'enviou') {
    const a = ALCADA[estado.tipo].map((k) => m.alcada[k]).join(' + ');
    return { ok: true, texto: m.out.enviou(a) };
  }
  if (outcome === 'tirou') {
    const label = m.campos[PEGADINHA[estado.tipo]];
    return { ok: false, texto: m.out.tirou(label) };
  }
  const fn = m.out[outcome];
  const negativos = ['salve_antes', 'anexe_antes'];
  if (typeof fn === 'string') return { ok: !negativos.includes(outcome), texto: fn };
  return { ok: true, texto: '' };
}
