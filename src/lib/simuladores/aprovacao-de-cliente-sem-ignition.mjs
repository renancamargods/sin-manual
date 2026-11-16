// Spec do simulador APROVAÇÃO DE CLIENTE — SEM Ignition (fila NOVA / ciclo de aprovação).
// Fiel a: tecnico/fluxos/cadastro-clientes-sem-ignition + regra AJUSTADA 06/11/2026 (sem a etapa ADM).
// Chave Fila.Clientes.SemIgnition HABILITADA → cadastro usa a fila nova
//   (Aprovações → Fila de Aprovações - Clientes, /Web/Aprovacoes/FilaDeAprovacaoCliente),
//   dirigida pelo CICLO de aprovação (Regra de Aprovação), sem Ignition.
// Caminho por tipo de pessoa (regra 06/11):
//   Física    → Crédito
//   Jurídica  → Crédito → Fiscal
//   Estrangeiro → Crédito Comex → Fiscal Comex
// O motor anda toda a etapasOrdem; a variante muda o painel e o texto reconhece quando a etapa pula.

const etapasOrdem = ['AGUARDANDO', 'CREDITO', 'FISCAL', 'ATIVO'];
const etapaTipo = { AGUARDANDO: 'ABRIR', CREDITO: 'ABRIR', FISCAL: 'APROVAR', ATIVO: 'FIM' };

export const spec = {
  slug: 'aprovacao-de-cliente-sem-ignition',
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
      { k: t.painelLabels.fila, v: t.painelLabels.semIgnition },
    ];
  },

  textos: {
    pt: {
      titulo: 'Aprovar um Cliente pelas alçadas (fila SEM Ignition)',
      sub: 'Acompanhe o cadastro do cliente pelo ciclo de aprovação até ficar Ativo; cada etapa mostra quem aprova, o parâmetro e a permissão.',
      campos: {},
      statusLabel: { aguardando: 'Aguardando aprovações', ativo: 'Ativo + Código SAP' },
      painelLabels: {
        status: 'Status', cenario: 'Tipo de pessoa', caminho: 'Caminho', fiscal: 'Passa no Fiscal?', fila: 'Fila',
        nacional: 'Nacional', comex: 'Comex', sim: 'Sim', nao: 'Não (Física)', semIgnition: 'SEM Ignition (ciclo)',
      },
      trilha: { AGUARDANDO: 'Enviado', CREDITO: 'Crédito', FISCAL: 'Fiscal' },
      regras: [
        'A fila SEM Ignition é usada quando a chave Fila.Clientes.SemIgnition está HABILITADA (Controle de Funcionalidade) — hoje, em Homologação, ela já está habilitada.',
        'O cliente enviado entra no CICLO de aprovação e aparece em Aprovações → Fila de Aprovações - Clientes (/Web/Aprovacoes/FilaDeAprovacaoCliente), sem Ignition/ticket.',
        'O caminho vem da Regra de Aprovação, por tipo de pessoa: Física passa só pelo Crédito; Jurídica passa por Crédito e Fiscal; Estrangeiro passa por Crédito Comex e Fiscal Comex.',
        'Na regra ajustada em 06/11/2026, a etapa de ADM Vendas não entra mais no cadastro de cliente — a primeira alçada é o próprio Crédito (análise cadastral + crédito no mesmo grupo).',
        'Pessoa Física nunca passa pelo Fiscal; após o Crédito, já é ativada.',
        'Ao final, o sistema ativa o cadastro automaticamente e gera o Código SAP. Editar um campo relevante (Campo Validação) reabre a alçada correspondente.',
      ],
      quem: [
        'O aprovador de cada etapa vem da Regra de Aprovação (grupo responsável) — não é permissão fixa no usuário.',
        'Crédito (grupo 51) aprova a etapa de Crédito; Fiscal (grupo 53) aprova a etapa de Fiscal; o Estrangeiro usa Crédito Comex (grupo 71) e Fiscal Comex.',
        'O administrador define a chave (SEM Ignition) e a Regra de Aprovação (entidade, etapas, ordem e tipos de pessoa) — uma vez.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Cliente enviado — Aguardando aprovações', quem: 'Sistema',
          tela: 'Clientes → Cliente (envio)', href: '/tecnico/fluxos/cadastro-clientes-sem-ignition',
          txt: 'Após "Salvar e continuar" e "Enviar cliente", o cadastro entra no ciclo de aprovação com status "Aguardando aprovações" e aparece na Fila de Aprovações - Clientes.',
          pratica: 'A fila usada (SEM Ignition) depende da chave Fila.Clientes.SemIgnition HABILITADA. O documento (CPF/CNPJ) é obrigatório no início do cadastro.',
          fala: 'Cliente na fila nova! 🦷 Sem ticket, direto pelo ciclo. Vamos pelas alçadas!',
          acao: 'Iniciar aprovações →',
          permissao: 'Cadastrar e enviar: perfil com acesso à tela Cliente (módulo Clientes).',
          parametro: { chave: 'Fila.Clientes.SemIgnition', efeito: 'Habilitada → fila SEM Ignition (ciclo, este caminho); desabilitada → fila COM Ignition.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Etapa 1 — Aprovação Crédito', quem: 'Crédito',
          tela: 'Aprovações → Fila de Aprovações - Clientes', href: '/tecnico/fluxos/cadastro-clientes-sem-ignition',
          txt: 'Primeira (e, para Física, única) alçada: a análise de Crédito — que já inclui a análise cadastral. Para Estrangeiro, é o Crédito Comex. Esta etapa sempre entra.',
          pratica: 'Não existe etapa "ADM" nem "Cadastro" separada: a análise cadastral acontece no próprio grupo de Crédito.',
          fala: 'Começa pelo Crédito. 💳 Pra Física, aprovou aqui já quase ativa!',
          acao: 'Aprovar Crédito →',
          permissao: 'Grupo "Crédito" (ou "Crédito Comex" para Estrangeiro), definido na Regra de Aprovação.',
          parametro: { chave: 'Regra de Aprovação (etapas por tipo de pessoa)', efeito: 'define a ordem e quais alçadas entram por tipo (PF só Crédito).' },
        },
        FISCAL: {
          ic: '🧾', tit: 'Etapa 2 — Aprovação Fiscal', quem: 'Fiscal',
          tela: 'Aprovações → Fila de Aprovações - Clientes', href: '/tecnico/fluxos/cadastro-clientes-sem-ignition',
          txt: 'A etapa Fiscal (ou Fiscal Comex, para Estrangeiro) entra para Jurídica e Estrangeiro. Pessoa Física NÃO passa pelo Fiscal — nesse caso, após o Crédito o cliente já é ativado.',
          pratica: 'Se um campo marcado como Fiscal (Campo Validação) for alterado num cliente já ativo, só a alçada Fiscal reabre.',
          fala: 'Jurídica e Estrangeiro ainda têm o Fiscal. 🧾 (Física pula esta etapa.)',
          acao: 'Aprovar Fiscal →',
          permissao: 'Grupo "Fiscal" (ou "Fiscal Comex" para Estrangeiro), definido na Regra de Aprovação.',
          parametro: { chave: 'Tipo de Pessoa · Campo Validação', efeito: 'o Fiscal só entra para Jurídica/Estrangeiro; o Campo Validação decide o que reabre numa edição.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Cliente ATIVO — Código SAP gerado', quem: 'Sistema',
          tela: 'Clientes → Cliente / Integração SAP', href: '/tecnico/referencia-status-cliente',
          txt: 'Concluídas as alçadas aplicáveis, o sistema ativa o cadastro automaticamente e gera o Código SAP. A partir daí o cliente está pronto para uso.',
          pratica: 'O Código SAP só é gerado na ativação. Veja a lista de status em Referência - Status do Cliente.',
          fala: 'Ativo! ✅ Código SAP gerado — cliente pronto pra comprar. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Integração SAP', efeito: 'o cadastro ativado é integrado ao SAP e recebe o código.' },
        },
      },
      out: {
        abriu: 'Etapa aprovada. Próxima alçada do ciclo.',
        aprovou: 'Cliente ativado.',
      },
    },
    en: {
      titulo: 'Approve a Customer through the levels (queue WITHOUT Ignition)',
      sub: 'Follow the customer record through the approval cycle until it is Active; each step shows who approves, the parameter and the permission.',
      campos: {},
      statusLabel: { aguardando: 'Awaiting approvals', ativo: 'Active + SAP code' },
      painelLabels: {
        status: 'Status', cenario: 'Person type', caminho: 'Path', fiscal: 'Goes through Tax?', fila: 'Queue',
        nacional: 'Domestic', comex: 'Comex', sim: 'Yes', nao: 'No (Individual)', semIgnition: 'WITHOUT Ignition (cycle)',
      },
      trilha: { AGUARDANDO: 'Submitted', CREDITO: 'Credit', FISCAL: 'Tax' },
      regras: [
        'The queue WITHOUT Ignition is used when the Fila.Clientes.SemIgnition key is ENABLED (Feature Control) — today, in Homologation, it is already enabled.',
        'The submitted customer enters the approval CYCLE and appears in Approvals → Approval Queue - Customers (/Web/Aprovacoes/FilaDeAprovacaoCliente), with no Ignition/ticket.',
        'The path comes from the Approval Rule, by person type: Individual goes through Credit only; Company goes through Credit and Tax; Foreign goes through Credit Comex and Tax Comex.',
        'In the rule adjusted on 06/11/2026, the Sales ADM step no longer applies to customer registration — the first level is Credit itself (registration + credit review in the same group).',
        'Individual never goes through Tax; after Credit, it is already activated.',
        'At the end, the system activates the record automatically and generates the SAP code. Editing a relevant field (Field Validation) reopens the matching level.',
      ],
      quem: [
        "Each step's approver comes from the Approval Rule (responsible group) — not a fixed user permission.",
        'Credit (group 51) approves the Credit step; Tax (group 53) approves the Tax step; Foreign uses Credit Comex (group 71) and Tax Comex.',
        'The administrator sets the key (WITHOUT Ignition) and the Approval Rule (entity, steps, order and person types) — once.',
      ],
      etapas: {
        AGUARDANDO: {
          ic: '📤', tit: 'Customer submitted — Awaiting approvals', quem: 'System',
          tela: 'Customers → Customer (submit)', href: '/en/tecnico/fluxos/cadastro-clientes-sem-ignition',
          txt: 'After "Save and continue" and "Submit customer", the record enters the approval cycle with status "Awaiting approvals" and appears in the Approval Queue - Customers.',
          pratica: 'The queue used (WITHOUT Ignition) depends on the Fila.Clientes.SemIgnition key being ENABLED. The document (CPF/CNPJ) is required at the start of registration.',
          fala: 'Customer in the new queue! 🦷 No ticket, straight through the cycle. On to the levels!',
          acao: 'Start approvals →',
          permissao: 'Register and submit: profile with access to the Customer screen (Customers module).',
          parametro: { chave: 'Fila.Clientes.SemIgnition', efeito: 'Enabled → queue WITHOUT Ignition (cycle, this path); disabled → queue WITH Ignition.' },
        },
        CREDITO: {
          ic: '💳', tit: 'Step 1 — Credit approval', quem: 'Credit',
          tela: 'Approvals → Approval Queue - Customers', href: '/en/tecnico/fluxos/cadastro-clientes-sem-ignition',
          txt: 'First (and, for Individual, only) level: the Credit review — which already includes the registration review. For Foreign, it is Credit Comex. This step always enters.',
          pratica: 'There is no separate "ADM" or "Registration" step: the registration review happens within the Credit group itself.',
          fala: 'Start with Credit. 💳 For Individual, approving here almost activates it!',
          acao: 'Approve Credit →',
          permissao: 'Group "Credit" (or "Credit Comex" for Foreign), defined in the Approval Rule.',
          parametro: { chave: 'Approval Rule (steps by person type)', efeito: 'defines the order and which levels enter per type (Individual = Credit only).' },
        },
        FISCAL: {
          ic: '🧾', tit: 'Step 2 — Tax approval', quem: 'Tax',
          tela: 'Approvals → Approval Queue - Customers', href: '/en/tecnico/fluxos/cadastro-clientes-sem-ignition',
          txt: 'The Tax step (or Tax Comex, for Foreign) enters for Company and Foreign. Individual does NOT go through Tax — in that case, after Credit the customer is already activated.',
          pratica: 'If a field marked as Tax (Field Validation) is changed on an already-active customer, only the Tax level reopens.',
          fala: 'Company and Foreign still have Tax. 🧾 (Individual skips this step.)',
          acao: 'Approve Tax →',
          permissao: 'Group "Tax" (or "Tax Comex" for Foreign), defined in the Approval Rule.',
          parametro: { chave: 'Person Type · Field Validation', efeito: 'Tax only enters for Company/Foreign; Field Validation decides what reopens on an edit.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Customer ACTIVE — SAP code generated', quem: 'System',
          tela: 'Customers → Customer / SAP Integration', href: '/en/tecnico/referencia-status-cliente',
          txt: 'Once the applicable levels are done, the system activates the record automatically and generates the SAP code. From then on the customer is ready to use.',
          pratica: 'The SAP code is only generated on activation. See the status list in Reference - Customer Status.',
          fala: 'Active! ✅ SAP code generated — customer ready to buy. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'SAP integration', efeito: 'the activated record is integrated with SAP and receives the code.' },
        },
      },
      out: {
        abriu: 'Step approved. Next level of the cycle.',
        aprovou: 'Customer activated.',
      },
    },
  },
};
