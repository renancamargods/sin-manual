// Spec do simulador APROVAÇÃO DE CLIENTE — COM Ignition (fila ANTERIOR/legada).
// Contraste com aprovacao-de-cliente-sem-ignition. Fiel a:
//   tecnico/fluxos/criacao-de-cliente (Com Ignition) + modulos/clientes/fila-de-aprovacoes-de-cadastros.
// Chave Fila.Clientes.SemIgnition DESABILITADA → cadastro usa a fila antiga
//   (Clientes → Fila de Aprovações de Cadastros, /Web/Clientes/FilaDeAprovacaoCadastro),
//   orquestrada pelo Ignition (ticket).
// Caminho por tipo de pessoa (doc Com Ignition):
//   Física    → Crédito
//   Jurídica  → Crédito + Fiscal
//   Estrangeiro → Crédito Internacional (Comex) + Fiscal
// O motor anda toda a etapasOrdem; a variante muda o painel e o texto reconhece quando a etapa pula.

const etapasOrdem = ['AGUARDANDO', 'CREDITO', 'FISCAL', 'ATIVO'];
const etapaTipo = { AGUARDANDO: 'ABRIR', CREDITO: 'ABRIR', FISCAL: 'APROVAR', ATIVO: 'FIM' };

export const spec = {
  slug: 'aprovacao-de-cliente-com-ignition',
  exigeAnexo: false,
  codigoFinal: null,
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'PF', label: { pt: 'Pessoa Física', en: 'Individual' } },
    { key: 'PJ', label: { pt: 'Pessoa Jurídica', en: 'Company' } },
    { key: 'PE', label: { pt: 'Estrangeiro', en: 'Foreign' } },
  ],
  obrigatorios: { _: [] },
  pegadinha: { _: null },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const comex = s.variante === 'PE';
    const temFiscal = s.variante !== 'PF';
    return [
      { k: t.painelLabels.status, v: s.statusKey === 'ativo' ? t.statusLabel.ativo : t.statusLabel.aguardando },
      { k: t.painelLabels.cenario, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.caminho, v: comex ? t.painelLabels.comex : t.painelLabels.nacional },
      { k: t.painelLabels.fiscal, v: temFiscal ? t.painelLabels.sim : t.painelLabels.nao },
      { k: t.painelLabels.orquestra, v: t.painelLabels.ticket },
    ];
  },

  textos: {
    pt: {
      titulo: 'Aprovar um Cliente pelas alçadas (fila COM Ignition)',
      sub: 'Acompanhe o cadastro do cliente pela fila anterior (COM Ignition), orquestrada por ticket, até ficar Ativo; cada etapa mostra quem aprova, o parâmetro e a permissão.',
      campos: {},
      statusLabel: { aguardando: 'Em Análise pela Área de Cadastro/Crédito', ativo: 'Ativo + Código SAP' },
      painelLabels: {
        status: 'Status', cenario: 'Tipo de pessoa', caminho: 'Caminho', fiscal: 'Passa no Fiscal?', orquestra: 'Orquestração',
        nacional: 'Nacional', comex: 'Internacional', sim: 'Sim', nao: 'Não (Física)', ticket: 'Ignition · Ticket',
      },
      trilha: { AGUARDANDO: 'Enviado', CREDITO: 'Crédito', FISCAL: 'Fiscal' },
      regras: [
        'A fila COM Ignition é usada quando a chave Fila.Clientes.SemIgnition está DESABILITADA (Controle de Funcionalidade) — é o caminho anterior.',
        'O cliente enviado ("Enviar Cliente" → "SIM") é orquestrado pelo Ignition (ticket) e aparece em Clientes → Fila de Aprovações de Cadastros (/Web/Clientes/FilaDeAprovacaoCadastro).',
        'Após o envio, o status na tela de clientes é "Em Análise pela Área de Cadastro/Crédito".',
        'O caminho vem da alçada por tipo de pessoa: Física → Crédito; Jurídica → Crédito + Fiscal; Estrangeiro → Crédito Internacional (Comex) + Fiscal.',
        'Na fila, cada linha permite Aprovar, Reprovar, Analisar Cliente, Enviar para Avaliação e Adicionar Observação. Reprovar deixa o cadastro como "Negado Análise de Crédito".',
        'Aprovado, o cliente passa a ATIVO e o sistema gera o Código SAP automaticamente (integração com o SAP).',
        'Hoje, em Homologação, a chave está Habilitada — ou seja, o ambiente usa a fila SEM Ignition; este simulador mostra o caminho anterior (COM Ignition), para comparação.',
      ],
      quem: [
        'Quem cria o cliente é o perfil Master ou Comum (ex.: Consultor), conforme a permissão.',
        'Quem aprova são as alçadas: Crédito (PF e PJ), Fiscal (PJ e Estrangeiro) e Crédito Internacional/Comex (Estrangeiro).',
        'O administrador define a chave (COM Ignition) e as alçadas — credenciais de alçada não devem ser compartilhadas.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Cliente enviado — Em Análise (Cadastro/Crédito)', quem: 'Sistema',
          tela: 'Clientes → Cliente (envio)', href: '/tecnico/fluxos/criacao-de-cliente',
          txt: 'Após "Salvar / Salvar e Continuar", o botão "Enviar Cliente" habilita. Ao enviar (e confirmar "SIM"), o Ignition cria o TICKET e o cadastro fica "Em Análise pela Área de Cadastro/Crédito".',
          pratica: 'A fila usada (COM Ignition) depende da chave Fila.Clientes.SemIgnition DESABILITADA. O "Enviar Cliente" só aparece depois de salvar com os obrigatórios.',
          fala: 'Cliente na fila do Ignition! 🦷 Vira um ticket e segue pras alçadas.',
          acao: 'Iniciar aprovações →',
          permissao: 'Cadastrar e enviar: perfil Master ou Comum com acesso à tela Cliente.',
          parametro: { chave: 'Fila.Clientes.SemIgnition', efeito: 'Desabilitada → fila COM Ignition (este caminho, por ticket); habilitada → fila SEM Ignition.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Etapa 1 — Aprovação Crédito', quem: 'Alçada de Crédito',
          tela: 'Clientes → Fila de Aprovações de Cadastros', href: '/modulos/clientes/fila-de-aprovacoes-de-cadastros',
          txt: 'Primeira (e, para Física, única) alçada: o Crédito. Para Estrangeiro, é o Crédito Internacional (Comex). Na fila, busque o cliente e use "Aprovar" (ou Analisar/Enviar para Avaliação).',
          pratica: 'O cliente só aparece para a alçada correspondente ao tipo de pessoa. Reprovar deixa o cadastro como "Negado Análise de Crédito".',
          fala: 'Começa pelo Crédito. 💳 Pra Física, aprovou aqui já quase ativa!',
          acao: 'Aprovar Crédito →',
          permissao: 'Alçada de Crédito (ou Crédito Internacional/Comex para Estrangeiro) + acesso à Fila de Aprovações de Cadastros.',
          parametro: { chave: 'Alçada por Tipo de Pessoa · Ticket Ignition', efeito: 'a alçada muda por tipo; o Ignition carrega a tarefa pelo ticket.' },
        },
        FISCAL: {
          ic: '🧾', tit: 'Etapa 2 — Aprovação Fiscal', quem: 'Alçada Fiscal',
          tela: 'Clientes → Fila de Aprovações de Cadastros', href: '/modulos/clientes/fila-de-aprovacoes-de-cadastros',
          txt: 'A etapa Fiscal entra para Jurídica e Estrangeiro. Pessoa Física NÃO passa pelo Fiscal — nesse caso, após o Crédito o cliente já segue para a ativação.',
          pratica: 'Enviar para Avaliação move o cadastro para a aba "Clientes em Avaliação" antes da decisão.',
          fala: 'Jurídica e Estrangeiro ainda têm o Fiscal. 🧾 (Física pula esta etapa.)',
          acao: 'Aprovar Fiscal →',
          permissao: 'Alçada Fiscal (PJ e Estrangeiro) + acesso à Fila de Aprovações de Cadastros.',
          parametro: { chave: 'Tipo de Pessoa', efeito: 'o Fiscal só entra para Jurídica/Estrangeiro; Física nunca passa pelo Fiscal.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Cliente ATIVO — Código SAP gerado', quem: 'Sistema',
          tela: 'Clientes → Cliente / Integração SAP', href: '/tecnico/referencia-status-cliente',
          txt: 'Aprovadas as alçadas aplicáveis, o cliente passa a ATIVO e o sistema integra automaticamente com o SAP, gerando o Código SAP. Confira na atualização mais recente do cadastro.',
          pratica: 'O Código SAP só é gerado na aprovação (status ATIVO).',
          fala: 'Ativo! ✅ Código SAP gerado — cliente pronto pra comprar. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Integração SAP', efeito: 'o cadastro aprovado é integrado ao SAP e recebe o código.' },
        },
      },
      out: {
        abriu: 'Etapa aprovada. Próxima alçada.',
        aprovou: 'Cliente ativado.',
      },
    },
    en: {
      titulo: 'Approve a Customer through the levels (queue WITH Ignition)',
      sub: 'Follow the customer record through the previous queue (WITH Ignition), orchestrated by ticket, until it is Active; each step shows who approves, the parameter and the permission.',
      campos: {},
      statusLabel: { aguardando: 'Under Registration/Credit Review', ativo: 'Active + SAP code' },
      painelLabels: {
        status: 'Status', cenario: 'Person type', caminho: 'Path', fiscal: 'Goes through Tax?', orquestra: 'Orchestration',
        nacional: 'Domestic', comex: 'International', sim: 'Yes', nao: 'No (Individual)', ticket: 'Ignition · Ticket',
      },
      trilha: { AGUARDANDO: 'Submitted', CREDITO: 'Credit', FISCAL: 'Tax' },
      regras: [
        'The queue WITH Ignition is used when the Fila.Clientes.SemIgnition key is DISABLED (Feature Control) — it is the previous path.',
        'The submitted customer ("Submit Customer" → "YES") is orchestrated by Ignition (ticket) and appears in Customers → Registration Approval Queue (/Web/Clientes/FilaDeAprovacaoCadastro).',
        'After submission, the status on the customers screen is "Under Registration/Credit Review".',
        'The path comes from the level by person type: Individual → Credit; Company → Credit + Tax; Foreign → International Credit (Comex) + Tax.',
        'In the queue, each row allows Approve, Reject, Analyze Customer, Send for Evaluation and Add Note. Rejecting leaves the record as "Credit Review Denied".',
        'Once approved, the customer becomes ACTIVE and the system generates the SAP code automatically (SAP integration).',
        'Today, in Homologation, the key is Enabled — so the environment uses the queue WITHOUT Ignition; this simulator shows the previous path (WITH Ignition), for comparison.',
      ],
      quem: [
        'Whoever creates the customer is the Master or Common profile (e.g., Consultant), per permission.',
        'Approvers are the levels: Credit (Individual and Company), Tax (Company and Foreign) and International/Comex Credit (Foreign).',
        'The administrator sets the key (WITH Ignition) and the levels — level credentials must not be shared.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Customer submitted — Under Review (Registration/Credit)', quem: 'System',
          tela: 'Customers → Customer (submit)', href: '/en/tecnico/fluxos/criacao-de-cliente',
          txt: 'After "Save / Save and Continue", the "Submit Customer" button enables. On submit (confirming "YES"), Ignition creates the TICKET and the record becomes "Under Registration/Credit Review".',
          pratica: 'The queue used (WITH Ignition) depends on the Fila.Clientes.SemIgnition key being DISABLED. "Submit Customer" only appears after saving with the required fields.',
          fala: 'Customer in the Ignition queue! 🦷 It becomes a ticket and moves to the levels.',
          acao: 'Start approvals →',
          permissao: 'Register and submit: Master or Common profile with access to the Customer screen.',
          parametro: { chave: 'Fila.Clientes.SemIgnition', efeito: 'Disabled → queue WITH Ignition (this path, by ticket); enabled → queue WITHOUT Ignition.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Step 1 — Credit approval', quem: 'Credit level',
          tela: 'Customers → Registration Approval Queue', href: '/en/modulos/clientes/fila-de-aprovacoes-de-cadastros',
          txt: 'First (and, for Individual, only) level: Credit. For Foreign, it is International Credit (Comex). In the queue, find the customer and use "Approve" (or Analyze/Send for Evaluation).',
          pratica: 'The customer only appears to the level matching the person type. Rejecting leaves the record as "Credit Review Denied".',
          fala: 'Start with Credit. 💳 For Individual, approving here almost activates it!',
          acao: 'Approve Credit →',
          permissao: 'Credit level (or International/Comex Credit for Foreign) + access to the Registration Approval Queue.',
          parametro: { chave: 'Level by Person Type · Ignition Ticket', efeito: 'the level changes by type; Ignition carries the task by ticket.' },
        },
        FISCAL: {
          ic: '🧾', tit: 'Step 2 — Tax approval', quem: 'Tax level',
          tela: 'Customers → Registration Approval Queue', href: '/en/modulos/clientes/fila-de-aprovacoes-de-cadastros',
          txt: 'The Tax step enters for Company and Foreign. Individual does NOT go through Tax — in that case, after Credit the customer moves straight to activation.',
          pratica: 'Send for Evaluation moves the record to the "Customers in Evaluation" tab before the decision.',
          fala: 'Company and Foreign still have Tax. 🧾 (Individual skips this step.)',
          acao: 'Approve Tax →',
          permissao: 'Tax level (Company and Foreign) + access to the Registration Approval Queue.',
          parametro: { chave: 'Person Type', efeito: 'Tax only enters for Company/Foreign; Individual never goes through Tax.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Customer ACTIVE — SAP code generated', quem: 'System',
          tela: 'Customers → Customer / SAP Integration', href: '/en/tecnico/referencia-status-cliente',
          txt: 'Once the applicable levels approve, the customer becomes ACTIVE and the system integrates automatically with SAP, generating the SAP code. Check the most recent update of the record.',
          pratica: 'The SAP code is only generated on approval (ACTIVE status).',
          fala: 'Active! ✅ SAP code generated — customer ready to buy. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'SAP integration', efeito: 'the approved record is integrated with SAP and receives the code.' },
        },
      },
      out: {
        abriu: 'Step approved. Next level.',
        aprovou: 'Customer activated.',
      },
    },
  },
};
