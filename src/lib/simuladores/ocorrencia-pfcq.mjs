// Spec do simulador OCORRÊNCIA PFCQ. Fiel a:
//   tecnico/fluxos/ocorrencia-pfcq.mdx
// Walkthrough do ciclo de status. Variação = procedência (procedente / não procedente).

const etapasOrdem = ['RECEBIMENTO', 'VERIFICAR', 'ANALISE', 'DESFECHO', 'ENCERRADO'];
const etapaTipo = { RECEBIMENTO: 'ABRIR', VERIFICAR: 'ABRIR', ANALISE: 'ABRIR', DESFECHO: 'APROVAR', ENCERRADO: 'FIM' };

const PERM_PT = 'Perfil da Qualidade (PFCQ) com acesso às Ocorrências.';
const PERM_EN = 'Quality (PFCQ) profile with access to Occurrences.';

export const spec = {
  slug: 'ocorrencia-pfcq',
  exigeAnexo: false,
  codigoFinal: null,
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'PROC', label: { pt: 'Procedente', en: 'Valid' } },
    { key: 'NAOPROC', label: { pt: 'Não procedente', en: 'Not valid' } },
  ],
  obrigatorios: { _: [] },
  pegadinha: { _: null },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const status = s.statusKey === 'ativo' ? t.painelLabels.encerrado : (s.idx >= 2 ? t.painelLabels.analise : t.painelLabels.recebida);
    const proc = s.variante === 'PROC' ? t.painelLabels.procedente : t.painelLabels.naoProcedente;
    return [
      { k: t.painelLabels.status, v: status },
      { k: t.painelLabels.tipo, v: 'PFCQ' },
      { k: t.painelLabels.procedencia, v: s.idx >= 3 ? proc : t.painelLabels.aAnalisar },
    ];
  },

  textos: {
    pt: {
      titulo: 'Conduzir uma Ocorrência PFCQ, passo a passo',
      sub: 'Do recebimento ao encerramento de uma queixa técnica/não conformidade. Cada etapa mostra a permissão e o parâmetro.',
      campos: {},
      statusLabel: {},
      painelLabels: {
        status: 'Status', tipo: 'Tipo', procedencia: 'Procedência',
        recebida: 'Recebimento', analise: 'Análise técnica', encerrado: '✓ Encerrado',
        procedente: 'Procedente', naoProcedente: 'Não procedente', aAnalisar: '— (a analisar)',
      },
      trilha: { RECEBIMENTO: 'Recebimento', VERIFICAR: 'Verificar', ANALISE: 'Análise', DESFECHO: 'Desfecho' },
      regras: [
        'A ocorrência pode ser aberta manualmente ou a partir de uma Pesquisa (botão "Gerar Ocorrência PFCQ").',
        'O tipo pode ser PFCQ, Lead ou Atendimento — este fluxo trata a PFCQ.',
        'As abas são Ocorrência, Produtos, Anexos e Atividades; as atividades (aguardando documentação/informações, aprovação, encerramento…) movem o fluxo.',
        'A análise técnica decide a procedência (Procedente / Não procedente); isso sustenta o embasamento e a notificação Anvisa/FDA.',
        'Ciclo: Recebimento → Verificar informações → Análise técnica → (Faturamento, quando aplicável) → Encerrado (ou Cancelado / Reanálise).',
      ],
      quem: [
        'Equipe de Qualidade (PFCQ) conduz a ocorrência pelo ciclo de status.',
        'A notificação regulatória (Anvisa/FDA) é registrada na análise quando aplicável.',
      ],
      etapas: {
        RECEBIMENTO: {
          ic: '📥', tit: 'Recebimento', quem: 'Qualidade (PFCQ)',
          tela: 'Ocorrências → Ocorrência (PFCQ)', href: '/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'A ocorrência é recebida (manualmente ou gerada de uma pesquisa). Registra-se data, cliente, SAC/ticket e os produtos envolvidos.',
          pratica: 'Pode nascer do botão "Gerar Ocorrência PFCQ" no construtor de pesquisas.',
          fala: 'Chegou uma queixa! 🦷 Vamos receber e organizar.',
          acao: 'Receber ocorrência →', permissao: PERM_PT,
          parametro: { chave: 'TipoOcorrencia (PFCQ)', efeito: 'define que é uma queixa técnica/não conformidade de produto.' },
        },
        VERIFICAR: {
          ic: '🔎', tit: 'Verificar informações', quem: 'Qualidade (PFCQ)',
          tela: 'Ocorrência → aba Atividades', href: '/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Conferência e coleta das informações necessárias (produto, lote, UDI, dados do paciente). Atividades de "aguardando documentação/informações" controlam a espera.',
          pratica: 'A ocorrência fica parada aqui enquanto houver atividade aguardando documentação/informações.',
          fala: 'Faltou algum documento? 🔎 A gente junta tudo antes de analisar.',
          acao: 'Verificar informações →', permissao: PERM_PT,
          parametro: { chave: 'TipoAtividade (aguardando doc/informações)', efeito: 'segura o fluxo até as informações chegarem.' },
        },
        ANALISE: {
          ic: '🧪', tit: 'Análise técnica', quem: 'Qualidade (PFCQ)',
          tela: 'Ocorrência → aba Análise', href: '/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'A Qualidade analisa a queixa e decide a procedência. Registra o embasamento e, quando aplicável, o número de notificação Anvisa/FDA.',
          pratica: 'A decisão (Procedente / Não procedente) muda o desfecho: procedente pode ir a Faturamento; não procedente fecha com embasamento.',
          fala: 'Hora da análise! 🧪 É procedente ou não?',
          acao: 'Concluir análise →', permissao: PERM_PT,
          parametro: { chave: 'TipoProcedencia · Notificação Anvisa/FDA', efeito: 'procedência e a eventual notificação regulatória.' },
        },
        DESFECHO: {
          ic: '📑', tit: 'Desfecho', quem: 'Qualidade (PFCQ)',
          tela: 'Ocorrência → aba Atividades', href: '/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Procedente: segue para Faturamento (quando aplicável) e notificação. Não procedente: encerra com o embasamento. A atividade de Encerramento conclui a ocorrência.',
          pratica: 'Se precisar, a Reanálise devolve a ocorrência para nova avaliação antes de encerrar.',
          fala: 'Vamos ao desfecho! 📑 Procedente fatura/notifica; não procedente fecha com embasamento.',
          acao: 'Encerrar ocorrência →', permissao: PERM_PT,
          parametro: { chave: 'StatusOcorrencia (Faturamento / Encerrado)', efeito: 'o desfecho conforme a procedência.' },
        },
        ENCERRADO: {
          ic: '✅', tit: 'Ocorrência encerrada', quem: 'Sistema',
          tela: 'Ocorrências → Ocorrência', href: '/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Encerrada! A queixa foi tratada com rastreabilidade do produto, do paciente e da análise, e a notificação registrada quando aplicável.',
          pratica: 'O histórico fica em "Informações Detalhadas do Status".',
          fala: 'Encerrada! ✅ Queixa tratada e rastreada. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Rastreabilidade (produto/paciente/análise)', efeito: 'registro completo do caso.' },
        },
      },
      out: { abriu: 'Etapa concluída.', aprovou: 'Ocorrência encerrada.' },
    },
    en: {
      titulo: 'Handle a PFCQ Occurrence, step by step',
      sub: 'From receipt to closing of a technical complaint/nonconformity. Each step shows the permission and parameter.',
      campos: {},
      statusLabel: {},
      painelLabels: {
        status: 'Status', tipo: 'Type', procedencia: 'Validity',
        recebida: 'Receipt', analise: 'Technical review', encerrado: '✓ Closed',
        procedente: 'Valid', naoProcedente: 'Not valid', aAnalisar: '— (to review)',
      },
      trilha: { RECEBIMENTO: 'Receipt', VERIFICAR: 'Verify', ANALISE: 'Review', DESFECHO: 'Outcome' },
      regras: [
        'The occurrence can be opened manually or from a Survey ("Generate PFCQ Occurrence" button).',
        'The type can be PFCQ, Lead or Service — this flow handles PFCQ.',
        'The tabs are Occurrence, Products, Attachments and Activities; activities (awaiting documentation/information, approval, closing…) move the flow.',
        'The technical review decides validity (Valid / Not valid); it supports the rationale and the Anvisa/FDA notification.',
        'Cycle: Receipt → Verify information → Technical review → (Invoicing, when applicable) → Closed (or Cancelled / Re-review).',
      ],
      quem: [
        'The Quality (PFCQ) team drives the occurrence through the status cycle.',
        'Regulatory notification (Anvisa/FDA) is recorded in the review when applicable.',
      ],
      etapas: {
        RECEBIMENTO: {
          ic: '📥', tit: 'Receipt', quem: 'Quality (PFCQ)',
          tela: 'Occurrences → Occurrence (PFCQ)', href: '/en/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'The occurrence is received (manually or generated from a survey). Date, customer, SAC/ticket and the involved products are recorded.',
          pratica: 'It can start from the "Generate PFCQ Occurrence" button in the survey builder.',
          fala: 'A complaint arrived! 🦷 Let\'s receive and organize it.',
          acao: 'Receive occurrence →', permissao: PERM_EN,
          parametro: { chave: 'TipoOcorrencia (PFCQ)', efeito: 'marks it as a product technical complaint/nonconformity.' },
        },
        VERIFICAR: {
          ic: '🔎', tit: 'Verify information', quem: 'Quality (PFCQ)',
          tela: 'Occurrence → Activities tab', href: '/en/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Check and collect the needed information (product, batch, UDI, patient data). "Awaiting documentation/information" activities control the wait.',
          pratica: 'The occurrence stays here while there is an activity awaiting documentation/information.',
          fala: 'Missing a document? 🔎 We gather everything before reviewing.',
          acao: 'Verify information →', permissao: PERM_EN,
          parametro: { chave: 'TipoAtividade (awaiting doc/info)', efeito: 'holds the flow until the information arrives.' },
        },
        ANALISE: {
          ic: '🧪', tit: 'Technical review', quem: 'Quality (PFCQ)',
          tela: 'Occurrence → Review tab', href: '/en/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Quality reviews the complaint and decides validity. Records the rationale and, when applicable, the Anvisa/FDA notification number.',
          pratica: 'The decision (Valid / Not valid) changes the outcome: valid may go to Invoicing; not valid closes with rationale.',
          fala: 'Review time! 🧪 Is it valid or not?',
          acao: 'Finish review →', permissao: PERM_EN,
          parametro: { chave: 'TipoProcedencia · Anvisa/FDA notification', efeito: 'validity and the possible regulatory notification.' },
        },
        DESFECHO: {
          ic: '📑', tit: 'Outcome', quem: 'Quality (PFCQ)',
          tela: 'Occurrence → Activities tab', href: '/en/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Valid: goes to Invoicing (when applicable) and notification. Not valid: closes with the rationale. The Closing activity completes the occurrence.',
          pratica: 'If needed, Re-review sends the occurrence back for another assessment before closing.',
          fala: "Let's wrap it up! 📑 Valid invoices/notifies; not valid closes with rationale.",
          acao: 'Close occurrence →', permissao: PERM_EN,
          parametro: { chave: 'StatusOcorrencia (Invoicing / Closed)', efeito: 'the outcome per validity.' },
        },
        ENCERRADO: {
          ic: '✅', tit: 'Occurrence closed', quem: 'System',
          tela: 'Occurrences → Occurrence', href: '/en/tecnico/fluxos/ocorrencia-pfcq',
          txt: 'Closed! The complaint was handled with traceability of product, patient and review, and the notification recorded when applicable.',
          pratica: 'The history is in "Detailed Status Information".',
          fala: 'Closed! ✅ Complaint handled and traced. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Traceability (product/patient/review)', efeito: 'complete record of the case.' },
        },
      },
      out: { abriu: 'Step completed.', aprovou: 'Occurrence closed.' },
    },
  },
};
