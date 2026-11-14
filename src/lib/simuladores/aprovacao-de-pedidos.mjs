// Spec do simulador APROVAÇÃO DE PEDIDOS (fila SEM Ignition). Fiel a:
//   tecnico/fluxos/aprovacao-de-pedidos-sem-ignition.mdx
// Walkthrough das etapas de alçada. Variação = cenário (boleto / PIX-cartão / comex),
// que muda se a Cobrança Nacional entra e se o caminho é Nacional ou Comex.

const etapasOrdem = ['AGUARDANDO', 'ADM', 'CREDITO', 'COBRANCA', 'LIBERADO'];
const etapaTipo = { AGUARDANDO: 'ABRIR', ADM: 'ABRIR', CREDITO: 'ABRIR', COBRANCA: 'APROVAR', LIBERADO: 'FIM' };

export const spec = {
  slug: 'aprovacao-de-pedidos',
  exigeAnexo: false,
  codigoFinal: null,
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'BOLETO', label: { pt: 'Boleto (nacional)', en: 'Boleto (domestic)' } },
    { key: 'PIXCARD', label: { pt: 'PIX/Cartão (nacional)', en: 'PIX/Card (domestic)' } },
    { key: 'COMEX', label: { pt: 'Estrangeiro (comex)', en: 'Foreign (comex)' } },
  ],
  obrigatorios: { _: [] },
  pegadinha: { _: null },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const caminho = s.variante === 'COMEX' ? t.painelLabels.comex : t.painelLabels.nacional;
    const cobranca = s.variante === 'PIXCARD' ? t.painelLabels.sim : t.painelLabels.nao;
    return [
      { k: t.painelLabels.status, v: s.statusKey === 'ativo' ? t.statusLabel.ativo : t.statusLabel.aguardando },
      { k: t.painelLabels.cenario, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.caminho, v: caminho },
      { k: t.painelLabels.cobranca, v: cobranca },
      { k: t.painelLabels.modo, v: t.painelLabels.sequencial },
    ];
  },

  textos: {
    pt: {
      titulo: 'Aprovar um Pedido pelas alçadas (fila SEM Ignition)',
      sub: 'Acompanhe o pedido pelas etapas de aprovação até ser liberado; cada etapa mostra quem aprova e o parâmetro em jogo.',
      campos: {},
      statusLabel: { aguardando: 'Aguardando aprovações', ativo: 'Liberado' },
      painelLabels: {
        status: 'Status', cenario: 'Cenário', caminho: 'Caminho', cobranca: 'Entra Cobrança?', modo: 'Modo', sequencial: 'Sequencial',
        nacional: 'Nacional', comex: 'Comex', sim: 'Sim (PIX/Cartão)', nao: 'Não',
      },
      trilha: { AGUARDANDO: 'Enviado', ADM: 'ADM', CREDITO: 'Crédito', COBRANCA: 'Cobrança' },
      regras: [
        'A fila SEM Ignition é usada quando a chave Fila.Pedidos.SemIgnition está Habilitada (Controle de Funcionalidade).',
        'O caminho de aprovação vem da Regra de Aprovação (módulo Aprovações): etapas ativas, ordem e modo (Paralelo/Sequencial).',
        'Física e Jurídica seguem o caminho Nacional (ADM Vendas, Crédito e Cobrança); Estrangeiro segue o Comex (ADM Comex e Crédito Comex).',
        'A etapa Cobrança – Nacional só entra quando a forma de pagamento é PIX ou Cartão; ela verifica se o cliente tem CAR (contas a receber) vencido.',
        'Antes das filas, o Motor de Crédito pode liberar o pedido na hora ou pará-lo com um motivo de bloqueio.',
      ],
      quem: [
        'O aprovador de cada etapa vem da Regra de Aprovação (grupo responsável) — não é permissão fixa.',
        'ADM de Vendas aprova a etapa ADM; Crédito aprova a de Crédito; Cobrança trata a Cobrança Nacional (PIX/Cartão).',
        'O administrador prepara a fila (sem Ignition), a Regra de Aprovação e as etapas — uma vez.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Pedido enviado — Aguardando aprovações', quem: 'Sistema',
          tela: 'Pedidos → Pedido (lista)', href: '/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'Enviado, o pedido aparece como "Aguardando aprovações" e entra na rota da Regra de Aprovação.',
          pratica: 'A fila usada (sem Ignition) depende da chave Fila.Pedidos.SemIgnition. O Motor de Crédito pode ter liberado ou travado antes daqui.',
          fala: 'Pedido na fila! 🦷 Vou te levar etapa por etapa até liberar.',
          acao: 'Iniciar aprovações →',
          permissao: 'Enviar o pedido: permissão de pedido (Autenticador). As etapas seguintes são das alçadas.',
          parametro: { chave: 'Fila.Pedidos.SemIgnition', efeito: 'Habilitada → fila SEM Ignition (este caminho); desabilitada → fila COM Ignition.' },
        },
        ADM: {
          ic: '🗂️', tit: 'Etapa 1 — Aprovação ADM', quem: 'ADM de Vendas',
          tela: 'Aprovações → Fila de Aprovação', href: '/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'Primeira etapa: a aprovação administrativa, feita pelo grupo ADM de Vendas (ou ADM Comex, para estrangeiro). Entra sempre.',
          pratica: 'O grupo que aprova vem da Regra de Aprovação — não é uma permissão fixa no usuário.',
          fala: 'Primeira alçada: o ADM. ✅ Bora aprovar?',
          acao: 'Aprovar ADM →',
          permissao: 'Grupo "ADM de Vendas" (ou "ADM Comex"), definido na Regra de Aprovação.',
          parametro: { chave: 'Regra de Aprovação (modo + etapas)', efeito: 'define a ordem e o modo (Sequencial/Paralelo) das etapas.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Etapa 2 — Aprovação Crédito', quem: 'Crédito',
          tela: 'Aprovações → Fila de Aprovação', href: '/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'Segunda etapa: a análise de Crédito (Crédito Nacional ou Crédito Comex). Entra sempre.',
          pratica: 'O Motor de Crédito pode ter avaliado o pedido automaticamente (e consultado o Serasa) antes desta etapa.',
          fala: 'Agora o Crédito. 💳 Seguindo!',
          acao: 'Aprovar Crédito →',
          permissao: 'Grupo "Crédito" (ou "Crédito Comex"), definido na Regra de Aprovação.',
          parametro: { chave: 'PerfilCredito · Motor de Crédito · Serasa', efeito: 'perfis e regras da análise de crédito do pedido.' },
        },
        COBRANCA: {
          ic: '🧾', tit: 'Etapa 3 — Cobrança Nacional', quem: 'Cobrança',
          tela: 'Aprovações → Fila de Aprovação', href: '/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'A Cobrança – Nacional só entra quando o pagamento é PIX ou Cartão, e verifica se o cliente tem CAR (contas a receber) vencido. Para boleto e comex, esta etapa é pulada.',
          pratica: 'Se houver CAR vencido, o pedido fica retido para a Cobrança avaliar; senão, segue para liberação.',
          fala: 'Pagamento é PIX/Cartão? Então passa pela Cobrança. 🧾 (Boleto/comex pulam.)',
          acao: 'Avaliar Cobrança →',
          permissao: 'Grupo "Cobrança", definido na Regra de Aprovação (etapa condicional).',
          parametro: { chave: 'Forma de pagamento (PIX/Cartão) · CAR', efeito: 'a etapa só entra para PIX/Cartão e checa contas a receber vencidas.' },
        },
        LIBERADO: {
          ic: '✅', tit: 'Pedido LIBERADO', quem: 'Sistema',
          tela: 'Pedidos → Pedido / Integração SAP', href: '/tecnico/fluxos/integracao-sap-visao-geral',
          txt: 'Passadas as etapas aplicáveis, o pedido fica Liberado e segue para a integração com o SAP (faturamento e separação).',
          pratica: 'Para boleto/comex, após ADM e Crédito o pedido já é liberado (sem Cobrança).',
          fala: 'Liberado! ✅ Pedido a caminho do faturamento. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Integração SAP', efeito: 'o pedido liberado é integrado ao SAP.' },
        },
      },
      out: {
        abriu: 'Etapa aprovada. Próxima etapa da regra.',
        aprovou: 'Pedido liberado.',
      },
    },
    en: {
      titulo: 'Approve an Order through the levels (queue WITHOUT Ignition)',
      sub: 'Follow the order through the approval steps until it is released; each step shows who approves and the parameter in play.',
      campos: {},
      statusLabel: { aguardando: 'Awaiting approvals', ativo: 'Released' },
      painelLabels: {
        status: 'Status', cenario: 'Scenario', caminho: 'Path', cobranca: 'Billing step?', modo: 'Mode', sequencial: 'Sequential',
        nacional: 'Domestic', comex: 'Comex', sim: 'Yes (PIX/Card)', nao: 'No',
      },
      trilha: { AGUARDANDO: 'Submitted', ADM: 'ADM', CREDITO: 'Credit', COBRANCA: 'Billing' },
      regras: [
        'The queue WITHOUT Ignition is used when the Fila.Pedidos.SemIgnition key is Enabled (Feature Control).',
        'The approval path comes from the Approval Rule (Approvals module): active steps, order and mode (Parallel/Sequential).',
        'Individual and Company follow the Domestic path (Sales ADM, Credit and Billing); Foreign follows Comex (ADM Comex and Credit Comex).',
        'The Domestic Billing step only enters when the payment is PIX or Card; it checks whether the customer has overdue receivables (CAR).',
        'Before the queues, the Credit Engine may release the order right away or stop it with a block reason.',
      ],
      quem: [
        'Each step\'s approver comes from the Approval Rule (responsible group) — not a fixed permission.',
        'Sales ADM approves the ADM step; Credit approves Credit; Billing handles Domestic Billing (PIX/Card).',
        'The administrator prepares the queue (without Ignition), the Approval Rule and the steps — once.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Order submitted — Awaiting approvals', quem: 'System',
          tela: 'Orders → Order (list)', href: '/en/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'Once submitted, the order shows as "Awaiting approvals" and enters the Approval Rule route.',
          pratica: 'The queue used (without Ignition) depends on the Fila.Pedidos.SemIgnition key. The Credit Engine may have released or blocked it before this.',
          fala: 'Order in the queue! 🦷 I\'ll take you step by step until release.',
          acao: 'Start approvals →',
          permissao: 'Submitting the order: order permission (Authenticator). The next steps belong to the levels.',
          parametro: { chave: 'Fila.Pedidos.SemIgnition', efeito: 'Enabled → queue WITHOUT Ignition (this path); disabled → queue WITH Ignition.' },
        },
        ADM: {
          ic: '🗂️', tit: 'Step 1 — ADM approval', quem: 'Sales ADM',
          tela: 'Approvals → Approval Queue', href: '/en/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'First step: administrative approval, by the Sales ADM group (or ADM Comex, for foreign). Always enters.',
          pratica: 'The approving group comes from the Approval Rule — not a fixed user permission.',
          fala: 'First level: ADM. ✅ Shall we approve?',
          acao: 'Approve ADM →',
          permissao: 'Group "Sales ADM" (or "ADM Comex"), defined in the Approval Rule.',
          parametro: { chave: 'Approval Rule (mode + steps)', efeito: 'defines the order and mode (Sequential/Parallel) of the steps.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Step 2 — Credit approval', quem: 'Credit',
          tela: 'Approvals → Approval Queue', href: '/en/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'Second step: Credit review (Domestic Credit or Credit Comex). Always enters.',
          pratica: 'The Credit Engine may have evaluated the order automatically (and queried Serasa) before this step.',
          fala: 'Now Credit. 💳 Moving on!',
          acao: 'Approve Credit →',
          permissao: 'Group "Credit" (or "Credit Comex"), defined in the Approval Rule.',
          parametro: { chave: 'PerfilCredito · Credit Engine · Serasa', efeito: 'profiles and rules of the order credit review.' },
        },
        COBRANCA: {
          ic: '🧾', tit: 'Step 3 — Domestic Billing', quem: 'Billing',
          tela: 'Approvals → Approval Queue', href: '/en/tecnico/fluxos/aprovacao-de-pedidos-sem-ignition',
          txt: 'Domestic Billing only enters when the payment is PIX or Card, and checks whether the customer has overdue receivables (CAR). For boleto and comex, this step is skipped.',
          pratica: 'If there are overdue receivables, the order is held for Billing to review; otherwise it proceeds to release.',
          fala: 'Payment is PIX/Card? Then it goes through Billing. 🧾 (Boleto/comex skip it.)',
          acao: 'Review Billing →',
          permissao: 'Group "Billing", defined in the Approval Rule (conditional step).',
          parametro: { chave: 'Payment method (PIX/Card) · CAR', efeito: 'the step only enters for PIX/Card and checks overdue receivables.' },
        },
        LIBERADO: {
          ic: '✅', tit: 'Order RELEASED', quem: 'System',
          tela: 'Orders → Order / SAP Integration', href: '/en/tecnico/fluxos/integracao-sap-visao-geral',
          txt: 'Once the applicable steps are done, the order is Released and moves on to SAP integration (invoicing and picking).',
          pratica: 'For boleto/comex, after ADM and Credit the order is already released (no Billing).',
          fala: 'Released! ✅ Order on its way to invoicing. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'SAP integration', efeito: 'the released order is integrated with SAP.' },
        },
      },
      out: {
        abriu: 'Step approved. Next step of the rule.',
        aprovou: 'Order released.',
      },
    },
  },
};
