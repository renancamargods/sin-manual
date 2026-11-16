// Spec do simulador APROVAÇÃO DE PEDIDOS — COM Ignition (fila ANTERIOR/legada).
// Contraste com aprovacao-de-pedidos (SEM Ignition). Fiel a:
//   tecnico/fluxos/aprovacao-de-pedidos-sem-ignition (parâmetro), modulos/ignition/dashboard,
//   modulos/aprovacoes/fila-de-aprovacoes-pedidos.
// Diferença central: a chave Fila.Pedidos.SemIgnition DESABILITADA → os pedidos usam a fila
// COM Ignition (Pedidos → Fila de Aprovação), orquestrada por TICKET.
// Variação = caminho Nacional (ADM Vendas → Crédito) ou Comex (ADM Comex → Crédito Comex).

const etapasOrdem = ['AGUARDANDO', 'ADM', 'CREDITO', 'INTEGRADO'];
const etapaTipo = { AGUARDANDO: 'ABRIR', ADM: 'ABRIR', CREDITO: 'APROVAR', INTEGRADO: 'FIM' };

export const spec = {
  slug: 'aprovacao-de-pedidos-com-ignition',
  exigeAnexo: false,
  codigoFinal: null,
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'NACIONAL', label: { pt: 'Nacional (Física/Jurídica)', en: 'Domestic (Individual/Company)' } },
    { key: 'COMEX', label: { pt: 'Estrangeiro (Comex)', en: 'Foreign (Comex)' } },
  ],
  obrigatorios: { _: [] },
  pegadinha: { _: null },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const comex = s.variante === 'COMEX';
    return [
      { k: t.painelLabels.status, v: s.statusKey === 'ativo' ? t.statusLabel.ativo : t.statusLabel.aguardando },
      { k: t.painelLabels.cenario, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.caminho, v: comex ? t.painelLabels.comex : t.painelLabels.nacional },
      { k: t.painelLabels.fila, v: t.painelLabels.comIgnition },
      { k: t.painelLabels.orquestra, v: t.painelLabels.ticket },
    ];
  },

  textos: {
    pt: {
      titulo: 'Aprovar um Pedido pelas alçadas (fila COM Ignition)',
      sub: 'Acompanhe o pedido pela fila anterior (COM Ignition), orquestrada por ticket; cada etapa mostra quem aprova e o parâmetro em jogo.',
      campos: {},
      statusLabel: { aguardando: 'Aguardando aprovações', ativo: 'Integrado' },
      painelLabels: {
        status: 'Status', cenario: 'Cenário', caminho: 'Caminho', fila: 'Fila', orquestra: 'Orquestração',
        nacional: 'Nacional', comex: 'Comex', comIgnition: 'COM Ignition (anterior)', ticket: 'Ignition · Ticket',
      },
      trilha: { AGUARDANDO: 'Enviado', ADM: 'ADM', CREDITO: 'Crédito' },
      regras: [
        'A fila COM Ignition é usada quando a chave Fila.Pedidos.SemIgnition está DESABILITADA (Controle de Funcionalidade) — é o caminho anterior.',
        'Nesta fila, o Ignition orquestra a aprovação por TICKET: cada pedido vira uma tarefa, acompanhada no Dashboard do Ignition (a fila mostra a coluna "Ticket").',
        'A tela de trabalho é Pedidos → Fila de Aprovação (/Web/Pedidos/FilaDeAprovacao), diferente da fila nova (Aprovações → Fila de Aprovações - Pedidos).',
        'O caminho de aprovação segue a Regra de Aprovação: Física e Jurídica vão pelo Nacional (ADM Vendas e Crédito); Estrangeiro vai pelo Comex (ADM Comex e Crédito Comex).',
        'Antes das alçadas, o Motor de Crédito pode liberar o pedido na hora ou pará-lo com um motivo de bloqueio.',
        'Hoje, em Homologação, a chave está Habilitada — ou seja, o ambiente usa a fila SEM Ignition; este simulador mostra o caminho anterior (COM Ignition), para comparação.',
      ],
      quem: [
        'O aprovador de cada etapa vem da Regra de Aprovação (grupo responsável) — não é permissão fixa no usuário.',
        'ADM de Vendas (ou ADM Comex) aprova a etapa ADM; Crédito (ou Crédito Comex) aprova a de Crédito.',
        'O administrador define a chave (COM Ignition) e a Regra de Aprovação — uma vez.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Pedido enviado — Aguardando aprovações', quem: 'Sistema',
          tela: 'Pedidos → Fila de Aprovação', href: '/modulos/ignition/dashboard',
          txt: 'Enviado, o pedido aparece como "Aguardando aprovações". Como a fila é COM Ignition, o Ignition cria um TICKET e orquestra a tarefa (acompanhada no Dashboard do Ignition).',
          pratica: 'A fila usada (COM Ignition) depende da chave Fila.Pedidos.SemIgnition DESABILITADA. A coluna "Ticket" na fila é a marca do Ignition.',
          fala: 'Pedido na fila do Ignition! 🦷 Ele vira um ticket e eu te levo etapa por etapa.',
          acao: 'Iniciar aprovações →',
          permissao: 'Enviar o pedido: permissão de pedido (Autenticador). As etapas seguintes são das alçadas.',
          parametro: { chave: 'Fila.Pedidos.SemIgnition', efeito: 'Desabilitada → fila COM Ignition (este caminho, por ticket); habilitada → fila SEM Ignition.' },
        },
        ADM: {
          ic: '🗂️', tit: 'Etapa 1 — Aprovação ADM', quem: 'ADM de Vendas',
          tela: 'Pedidos → Fila de Aprovação', href: '/tecnico/fluxos/processo-do-pedido',
          txt: 'Primeira etapa: a aprovação administrativa, pelo grupo ADM de Vendas (ou ADM Comex, para estrangeiro). Na fila antiga, aprova-se no ícone "Aprovar" → informar o motivo → "Sim".',
          pratica: 'O grupo que aprova vem da Regra de Aprovação. O pedido só aparece para quem é a alçada daquela etapa.',
          fala: 'Primeira alçada: o ADM. ✅ Bora aprovar?',
          acao: 'Aprovar ADM →',
          permissao: 'Grupo "ADM de Vendas" (ou "ADM Comex"), definido na Regra de Aprovação + acesso à tela Fila de Aprovação.',
          parametro: { chave: 'Regra de Aprovação · Ticket Ignition', efeito: 'a regra define as etapas e a ordem; o Ignition carrega a tarefa pelo ticket.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Etapa 2 — Aprovação Crédito', quem: 'Crédito',
          tela: 'Pedidos → Fila de Aprovação', href: '/tecnico/fluxos/verificar-decisao-motor-de-credito',
          txt: 'Segunda etapa: a análise de Crédito (Crédito Nacional ou Crédito Comex). O Motor de Crédito pode ter avaliado o pedido automaticamente (e consultado o Serasa) antes desta etapa.',
          pratica: 'Aprovada a última alçada, o Ignition encerra o ticket e encaminha o pedido para integração.',
          fala: 'Agora o Crédito. 💳 Última alçada!',
          acao: 'Aprovar Crédito →',
          permissao: 'Grupo "Crédito" (ou "Crédito Comex"), definido na Regra de Aprovação + acesso à tela Fila de Aprovação.',
          parametro: { chave: 'PerfilCredito · Motor de Crédito · Serasa', efeito: 'perfis e regras da análise de crédito do pedido.' },
        },
        INTEGRADO: {
          ic: '✅', tit: 'Pedido LIBERADO — integrado ao SAP', quem: 'Sistema',
          tela: 'Pedidos → Pedido / Integração SAP', href: '/tecnico/fluxos/integracao-sap-visao-geral',
          txt: 'Passadas as alçadas, o Ignition conclui o ticket e o pedido fica Liberado, seguindo para a integração com o SAP (faturamento e separação).',
          pratica: 'O Dashboard do Ignition registra a tarefa como executada.',
          fala: 'Liberado! ✅ Ticket concluído e pedido a caminho do faturamento. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Integração SAP', efeito: 'o pedido liberado é integrado ao SAP.' },
        },
      },
      out: {
        abriu: 'Etapa aprovada. Próxima etapa da regra.',
        aprovou: 'Pedido liberado e integrado.',
      },
    },
    en: {
      titulo: 'Approve an Order through the levels (queue WITH Ignition)',
      sub: 'Follow the order through the previous queue (WITH Ignition), orchestrated by ticket; each step shows who approves and the parameter in play.',
      campos: {},
      statusLabel: { aguardando: 'Awaiting approvals', ativo: 'Integrated' },
      painelLabels: {
        status: 'Status', cenario: 'Scenario', caminho: 'Path', fila: 'Queue', orquestra: 'Orchestration',
        nacional: 'Domestic', comex: 'Comex', comIgnition: 'WITH Ignition (previous)', ticket: 'Ignition · Ticket',
      },
      trilha: { AGUARDANDO: 'Submitted', ADM: 'ADM', CREDITO: 'Credit' },
      regras: [
        'The queue WITH Ignition is used when the Fila.Pedidos.SemIgnition key is DISABLED (Feature Control) — it is the previous path.',
        'In this queue, Ignition orchestrates the approval by TICKET: each order becomes a task, tracked in the Ignition Dashboard (the queue shows a "Ticket" column).',
        'The working screen is Orders → Approval Queue (/Web/Pedidos/FilaDeAprovacao), different from the new queue (Approvals → Approval Queue - Orders).',
        'The approval path comes from the Approval Rule: Individual and Company go Domestic (Sales ADM and Credit); Foreign goes Comex (ADM Comex and Credit Comex).',
        'Before the levels, the Credit Engine may release the order right away or stop it with a block reason.',
        'Today, in Homologation, the key is Enabled — so the environment uses the queue WITHOUT Ignition; this simulator shows the previous path (WITH Ignition), for comparison.',
      ],
      quem: [
        "Each step's approver comes from the Approval Rule (responsible group) — not a fixed user permission.",
        'Sales ADM (or ADM Comex) approves the ADM step; Credit (or Credit Comex) approves Credit.',
        'The administrator sets the key (WITH Ignition) and the Approval Rule — once.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Order submitted — Awaiting approvals', quem: 'System',
          tela: 'Orders → Approval Queue', href: '/en/modulos/ignition/dashboard',
          txt: 'Once submitted, the order shows as "Awaiting approvals". As the queue is WITH Ignition, Ignition creates a TICKET and orchestrates the task (tracked in the Ignition Dashboard).',
          pratica: 'The queue used (WITH Ignition) depends on the Fila.Pedidos.SemIgnition key being DISABLED. The "Ticket" column in the queue is the Ignition hallmark.',
          fala: "Order in the Ignition queue! 🦷 It becomes a ticket and I'll take you step by step.",
          acao: 'Start approvals →',
          permissao: 'Submitting the order: order permission (Authenticator). The next steps belong to the levels.',
          parametro: { chave: 'Fila.Pedidos.SemIgnition', efeito: 'Disabled → queue WITH Ignition (this path, by ticket); enabled → queue WITHOUT Ignition.' },
        },
        ADM: {
          ic: '🗂️', tit: 'Step 1 — ADM approval', quem: 'Sales ADM',
          tela: 'Orders → Approval Queue', href: '/en/tecnico/fluxos/processo-do-pedido',
          txt: 'First step: administrative approval, by the Sales ADM group (or ADM Comex, for foreign). In the old queue, you approve via the "Approve" icon → enter the reason → "Yes".',
          pratica: 'The approving group comes from the Approval Rule. The order only appears to whoever is the level of that step.',
          fala: 'First level: ADM. ✅ Shall we approve?',
          acao: 'Approve ADM →',
          permissao: 'Group "Sales ADM" (or "ADM Comex"), defined in the Approval Rule + access to the Approval Queue screen.',
          parametro: { chave: 'Approval Rule · Ignition Ticket', efeito: 'the rule defines the steps and order; Ignition carries the task by ticket.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Step 2 — Credit approval', quem: 'Credit',
          tela: 'Orders → Approval Queue', href: '/en/tecnico/fluxos/verificar-decisao-motor-de-credito',
          txt: 'Second step: Credit review (Domestic Credit or Credit Comex). The Credit Engine may have evaluated the order automatically (and queried Serasa) before this step.',
          pratica: 'Once the last level approves, Ignition closes the ticket and forwards the order to integration.',
          fala: 'Now Credit. 💳 Last level!',
          acao: 'Approve Credit →',
          permissao: 'Group "Credit" (or "Credit Comex"), defined in the Approval Rule + access to the Approval Queue screen.',
          parametro: { chave: 'PerfilCredito · Credit Engine · Serasa', efeito: 'profiles and rules of the order credit review.' },
        },
        INTEGRADO: {
          ic: '✅', tit: 'Order RELEASED — integrated with SAP', quem: 'System',
          tela: 'Orders → Order / SAP Integration', href: '/en/tecnico/fluxos/integracao-sap-visao-geral',
          txt: 'Once the levels are done, Ignition completes the ticket and the order is Released, moving on to SAP integration (invoicing and picking).',
          pratica: 'The Ignition Dashboard records the task as executed.',
          fala: 'Released! ✅ Ticket completed and order on its way to invoicing. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'SAP integration', efeito: 'the released order is integrated with SAP.' },
        },
      },
      out: {
        abriu: 'Step approved. Next step of the rule.',
        aprovou: 'Order released and integrated.',
      },
    },
  },
};
