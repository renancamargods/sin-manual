// Spec do simulador LEAD. Fiel a:
//   modulos/leads/lead.mdx + tecnico/regras-de-validacao/lead.mdx
//   tecnico/fluxos/leads-pipeline-e-conversao.mdx
// Variação = Tipo do Lead (Base SIN exige Cliente / Novo).

const etapasOrdem = ['ABERTURA', 'DADOS', 'PIPELINE', 'CONVERTIDO'];
const etapaTipo = { ABERTURA: 'ABRIR', DADOS: 'SALVAR', PIPELINE: 'APROVAR', CONVERTIDO: 'FIM' };

const PERM_PT = 'Perfil comercial com acesso ao módulo Leads.';
const PERM_EN = 'Sales profile with access to the Leads module.';

export const spec = {
  slug: 'lead',
  exigeAnexo: false,
  codigoFinal: 'Cliente/Pedido gerado',
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'BASE', label: { pt: 'Base SIN (cliente existente)', en: 'SIN Base (existing customer)' } },
    { key: 'NOVO', label: { pt: 'Novo (sem cliente)', en: 'New (no customer)' } },
  ],
  obrigatorios: {
    BASE: ['nome', 'telefone', 'pipeline', 'tipoLead', 'origem', 'estruturaSol', 'estruturaExec', 'valorPotencial', 'politica', 'cliente'],
    NOVO: ['nome', 'telefone', 'pipeline', 'tipoLead', 'origem', 'estruturaSol', 'estruturaExec', 'valorPotencial', 'politica'],
  },
  pegadinha: { BASE: 'cliente', NOVO: 'politica' },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const status = s.statusKey === 'ativo' ? t.painelLabels.convertido : (s.salvo ? t.painelLabels.pipeline : t.painelLabels.novo);
    return [
      { k: t.painelLabels.status, v: status },
      { k: t.painelLabels.tipo, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.resultado, v: s.codigo && s.statusKey === 'ativo' ? t.painelLabels.ganho : t.painelLabels.aberto },
    ];
  },

  textos: {
    pt: {
      titulo: 'Cadastrar e converter um Lead, passo a passo',
      sub: 'Do cadastro à pipeline (Kanban) e à conversão. Cada etapa mostra a permissão e o parâmetro.',
      campos: {
        nome: 'Nome', telefone: 'Telefone / Celular', pipeline: 'Pipeline de Venda', tipoLead: 'Tipo do Lead',
        origem: 'Origem do Lead (Canal de Entrada)', estruturaSol: 'Estrutura Comercial do Solicitante',
        estruturaExec: 'Estrutura Comercial do Executivo responsável', valorPotencial: 'Valor Potencial do Lead (≥ 0)',
        politica: 'Aceite da política de Indicação de Leads', cliente: 'Cliente (Base SIN)',
      },
      statusLabel: {},
      painelLabels: {
        status: 'Status', tipo: 'Tipo do Lead', resultado: 'Resultado',
        novo: 'Novo', pipeline: 'Em pipeline', convertido: '✓ Convertido', ganho: 'Ganho', aberto: '— (em aberto)',
      },
      trilha: { ABERTURA: 'Novo', DADOS: 'Dados', PIPELINE: 'Pipeline' },
      regras: [
        'Obrigatórios: Nome, Telefone/Celular, Pipeline de Venda, Tipo do Lead, Origem (Canal de Entrada), Estrutura Comercial (Solicitante e Executivo), Valor Potencial (≥ 0) e o aceite da política de Indicação de Leads.',
        'Quando o Tipo do Lead é "Base SIN", o Cliente é obrigatório (selecionar o cliente já cadastrado).',
        'Documento (CPF/CNPJ) e E-mail são opcionais; quando informados, precisam ser válidos.',
        'Na pipeline (Kanban), o lead é movido pelas etapas com histórico de interação e alertas de SLA até o fechamento (ganho ou perda).',
      ],
      quem: [
        'Perfil comercial com acesso ao módulo Leads.',
        'A conversão (ganho) transforma o lead em cliente/pedido conforme o processo.',
      ],
      etapas: {
        ABERTURA: {
          ic: '🌱', tit: 'Novo lead', quem: 'Comercial',
          tela: 'Leads → Lead', href: '/modulos/leads/lead',
          txt: 'Clique em "+ Novo" e escolha o Tipo do Lead. "Base SIN" parte de um cliente já cadastrado; "Novo" é um lead sem cliente ainda.',
          pratica: 'O Tipo do Lead decide se o Cliente é obrigatório.',
          fala: 'Novo lead! 🦷 É de um cliente da Base SIN ou um lead novo?',
          acao: 'Novo lead →', permissao: PERM_PT,
          parametro: { chave: 'Tipo do Lead', efeito: '"Base SIN" torna o Cliente obrigatório.' },
        },
        DADOS: {
          ic: '📝', tit: 'Dados do lead', quem: 'Comercial',
          tela: 'Leads → Lead', href: '/modulos/leads/lead',
          txt: 'Preencha Nome, Telefone, Pipeline, Origem (Canal de Entrada), a Estrutura Comercial (Solicitante e Executivo), o Valor Potencial e aceite a política de Indicação. Clique em "Salvar".',
          pratica: 'Valor Potencial ≥ 0; o aceite da política de Indicação de Leads é obrigatório.',
          fala: 'Preenche os dados que eu confiro antes de salvar! 😁',
          acao: 'Preencher e salvar', permissao: PERM_PT,
          parametro: { chave: 'Canal de Entrada (Origem)', efeito: 'classifica de onde o lead veio.' },
        },
        PIPELINE: {
          ic: '📋', tit: 'Pipeline (Kanban) e conversão', quem: 'Comercial',
          tela: 'Leads → Pipeline (Kanban)', href: '/tecnico/fluxos/leads-pipeline-e-conversao',
          txt: 'Mova o lead pelas etapas da pipeline no Kanban (com histórico e SLA) até o fechamento. Levando até "Ganho", o lead é convertido.',
          pratica: 'O fechamento pode ser Ganho (converte) ou Perda. Os alertas de SLA avisam quando uma etapa está parada.',
          fala: 'Agora é mover no Kanban! 📋 Vamos levar até Ganho?',
          acao: 'Converter (Ganho) →', permissao: PERM_PT,
          parametro: { chave: 'Pipeline de Venda · SLA', efeito: 'etapas do Kanban e alertas de tempo em cada etapa.' },
        },
        CONVERTIDO: {
          ic: '✅', tit: 'Lead convertido (Ganho)', quem: 'Sistema',
          tela: 'Leads → Lead', href: '/modulos/leads/lead',
          txt: 'Ganho! O lead foi convertido e segue para o processo comercial (cliente/pedido). Ciclo do lead concluído.',
          pratica: 'Um lead perdido é fechado como Perda, com o motivo registrado.',
          fala: 'Convertido! ✅ Lead virou oportunidade real. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Conversão', efeito: 'gera o cliente/pedido a partir do lead ganho.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: faltam campos obrigatórios — ${l}. Preencha e salve de novo.`,
      out: { salvou: 'Lead salvo. Pronto para entrar na pipeline.', aprovou: 'Lead convertido (Ganho).' },
    },
    en: {
      titulo: 'Register and convert a Lead, step by step',
      sub: 'From registration to the pipeline (Kanban) and conversion. Each step shows the permission and parameter.',
      campos: {
        nome: 'Name', telefone: 'Phone / Mobile', pipeline: 'Sales Pipeline', tipoLead: 'Lead Type',
        origem: 'Lead Origin (Entry Channel)', estruturaSol: 'Requester\'s commercial structure',
        estruturaExec: 'Responsible Executive\'s commercial structure', valorPotencial: 'Lead Potential Value (≥ 0)',
        politica: 'Lead Referral policy acceptance', cliente: 'Customer (SIN Base)',
      },
      statusLabel: {},
      painelLabels: {
        status: 'Status', tipo: 'Lead Type', resultado: 'Result',
        novo: 'New', pipeline: 'In pipeline', convertido: '✓ Converted', ganho: 'Won', aberto: '— (open)',
      },
      trilha: { ABERTURA: 'New', DADOS: 'Data', PIPELINE: 'Pipeline' },
      regras: [
        'Required: Name, Phone/Mobile, Sales Pipeline, Lead Type, Origin (Entry Channel), commercial structure (Requester and Executive), Potential Value (≥ 0) and accepting the Lead Referral policy.',
        'When the Lead Type is "SIN Base", the Customer is required (select the existing customer).',
        'Document (CPF/CNPJ) and E-mail are optional; when provided, they must be valid.',
        'In the pipeline (Kanban), the lead is moved through stages with interaction history and SLA alerts until closing (won or lost).',
      ],
      quem: [
        'Sales profile with access to the Leads module.',
        'Conversion (won) turns the lead into a customer/order per the process.',
      ],
      etapas: {
        ABERTURA: {
          ic: '🌱', tit: 'New lead', quem: 'Sales',
          tela: 'Leads → Lead', href: '/en/modulos/leads/lead',
          txt: 'Click "+ New" and choose the Lead Type. "SIN Base" starts from an existing customer; "New" is a lead with no customer yet.',
          pratica: 'The Lead Type decides whether the Customer is required.',
          fala: 'New lead! 🦷 Is it from a SIN Base customer or a brand-new lead?',
          acao: 'New lead →', permissao: PERM_EN,
          parametro: { chave: 'Lead Type', efeito: '"SIN Base" makes the Customer required.' },
        },
        DADOS: {
          ic: '📝', tit: 'Lead data', quem: 'Sales',
          tela: 'Leads → Lead', href: '/en/modulos/leads/lead',
          txt: 'Fill Name, Phone, Pipeline, Origin (Entry Channel), the commercial structure (Requester and Executive), the Potential Value and accept the Referral policy. Click "Save".',
          pratica: 'Potential Value ≥ 0; accepting the Lead Referral policy is required.',
          fala: "Fill in the data and I'll check before saving! 😁",
          acao: 'Fill and save', permissao: PERM_EN,
          parametro: { chave: 'Entry Channel (Origin)', efeito: 'classifies where the lead came from.' },
        },
        PIPELINE: {
          ic: '📋', tit: 'Pipeline (Kanban) and conversion', quem: 'Sales',
          tela: 'Leads → Pipeline (Kanban)', href: '/en/tecnico/fluxos/leads-pipeline-e-conversao',
          txt: 'Move the lead through the pipeline stages in the Kanban (with history and SLA) until closing. Taking it to "Won" converts the lead.',
          pratica: 'Closing can be Won (converts) or Lost. SLA alerts warn when a stage is stalled.',
          fala: "Now move it on the Kanban! 📋 Shall we take it to Won?",
          acao: 'Convert (Won) →', permissao: PERM_EN,
          parametro: { chave: 'Sales Pipeline · SLA', efeito: 'Kanban stages and time alerts per stage.' },
        },
        CONVERTIDO: {
          ic: '✅', tit: 'Lead converted (Won)', quem: 'System',
          tela: 'Leads → Lead', href: '/en/modulos/leads/lead',
          txt: 'Won! The lead was converted and proceeds to the commercial process (customer/order). Lead cycle complete.',
          pratica: 'A lost lead is closed as Lost, with the reason recorded.',
          fala: 'Converted! ✅ The lead became a real opportunity. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Conversion', efeito: 'generates the customer/order from the won lead.' },
        },
      },
      outFalta: (l) => `Can't save: required fields are missing — ${l}. Fill them and save again.`,
      out: { salvou: 'Lead saved. Ready to enter the pipeline.', aprovou: 'Lead converted (Won).' },
    },
  },
};
