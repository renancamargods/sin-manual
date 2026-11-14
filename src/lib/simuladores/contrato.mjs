// Spec do simulador CONTRATO. Fiel a:
//   modulos/contratos/contrato.mdx + tecnico/regras-de-validacao/contrato.mdx
//   politica-de-contrato.mdx
// Variação = assinatura (sem ZapSign / com ZapSign), que muda os obrigatórios da assinatura.

const etapasOrdem = ['ABERTURA', 'DADOS', 'ASSINATURA', 'ATIVO'];
const etapaTipo = { ABERTURA: 'ABRIR', DADOS: 'SALVAR', ASSINATURA: 'APROVAR', ATIVO: 'FIM' };

const PERM_PT = 'Perfil com acesso ao cadastro de Contrato (módulo Contratos).';
const PERM_EN = 'Profile with access to Contract registration (Contracts module).';

export const spec = {
  slug: 'contrato',
  exigeAnexo: false,
  codigoFinal: 'CTR-004521',
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'SEMZAP', label: { pt: 'Sem ZapSign', en: 'Without ZapSign' } },
    { key: 'COMZAP', label: { pt: 'Com ZapSign (assinatura digital)', en: 'With ZapSign (digital signature)' } },
  ],
  obrigatorios: {
    SEMZAP: ['titulo', 'tipoParceiro', 'tipoContrato', 'classificacao', 'cliente', 'estrutura', 'mesesVigencia'],
    COMZAP: ['titulo', 'tipoParceiro', 'tipoContrato', 'classificacao', 'cliente', 'estrutura', 'mesesVigencia', 'cpfAssinatura', 'nomeAssinante', 'emailAssinante'],
  },
  pegadinha: { SEMZAP: 'mesesVigencia', COMZAP: 'cpfAssinatura' },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const status = s.statusKey === 'ativo' ? t.painelLabels.ativo : (s.salvo ? t.painelLabels.salvo : t.painelLabels.novo);
    const assin = s.variante === 'COMZAP' ? t.painelLabels.zap : t.painelLabels.manual;
    return [
      { k: t.painelLabels.status, v: status },
      { k: t.painelLabels.assinatura, v: assin },
      { k: t.painelLabels.cliente, v: s.salvo ? t.painelLabels.selecionado : t.painelLabels.vazio },
      { k: t.painelLabels.codigo, v: s.codigo || t.painelLabels.semCodigo },
    ];
  },

  textos: {
    pt: {
      titulo: 'Cadastrar um Contrato, passo a passo',
      sub: 'Do novo contrato à assinatura, com a estrutura comercial e a vigência. Cada etapa mostra a permissão e o parâmetro.',
      campos: {
        titulo: 'Título', tipoParceiro: 'Tipo do Parceiro', tipoContrato: 'Tipo do Contrato', classificacao: 'Classificação',
        cliente: 'Cliente', estrutura: 'Estrutura comercial (Diretor, GNV, GR, GD, Consultor)', mesesVigencia: 'Quantidade de Meses de Vigência (maior que 0)',
        cpfAssinatura: 'CPF de assinatura do contrato', nomeAssinante: 'Nome do responsável pela assinatura', emailAssinante: 'E-mail do responsável pela assinatura',
      },
      statusLabel: {},
      painelLabels: {
        status: 'Status', assinatura: 'Assinatura', cliente: 'Cliente', codigo: 'Nº Contrato',
        novo: 'Em edição', salvo: '✓ Salvo', ativo: '✓ Assinado / Ativo', zap: 'ZapSign (digital)', manual: 'Manual',
        selecionado: '✓ definido', vazio: '—', semCodigo: '— (após salvar)',
      },
      trilha: { ABERTURA: 'Novo', DADOS: 'Dados', ASSINATURA: 'Assinatura' },
      regras: [
        'Obrigatórios: Título, Assinado, Tipo do Parceiro, Tipo do Contrato, Classificação, Possui Parceiros, Fresas Bonificadas, Status, Cliente e Quantidade de Meses de Vigência (> 0).',
        'Estrutura comercial toda obrigatória: Diretor, GNV, GR, GD e Consultor.',
        'Vigência Término deve ser maior que a Vigência Início; % Rebate entre 0 e 100.',
        'Contrato de Curso: Quantidade de Palestrantes e de Kits de Boas-Vindas são obrigatórias (> 0) quando o contrato os possui.',
        'Com a integração ZapSign habilitada, exige CPF (válido), Nome e E-mail (válido) do responsável pela assinatura.',
      ],
      quem: [
        'Perfil com acesso ao cadastro de Contrato (módulo Contratos).',
        'Permissões extras de contrato (cancelar, gerar renovações/aditivos, integração ZapSign) são controladas à parte.',
      ],
      etapas: {
        ABERTURA: {
          ic: '📄', tit: 'Novo contrato', quem: 'Comercial / Contratos',
          tela: 'Contratos → Contrato', href: '/modulos/contratos/contrato',
          txt: 'Clique em "+ Novo", selecione o Cliente e defina o Tipo do Parceiro e o Tipo do Contrato. Isso define as regras seguintes (ex.: Curso tem campos próprios).',
          pratica: 'O Tipo do Parceiro (ex.: Curso) muda os campos exigidos mais adiante.',
          fala: 'Bora montar um contrato! 🦷 Pra qual cliente e que tipo de parceiro?',
          acao: 'Novo contrato →', permissao: PERM_PT,
          parametro: { chave: 'Tipo do Parceiro', efeito: 'define condicionais (ex.: Curso exige palestrantes/kits).' },
        },
        DADOS: {
          ic: '📝', tit: 'Dados, estrutura e vigência', quem: 'Comercial / Contratos',
          tela: 'Contratos → Contrato', href: '/modulos/contratos/contrato',
          txt: 'Preencha Título, Classificação, Status, a estrutura comercial (Diretor, GNV, GR, GD, Consultor), a vigência (Início/Término e Meses) e o % Rebate. Clique em "Salvar".',
          pratica: 'Meses de Vigência precisa ser maior que 0; Vigência Término maior que a Início; % Rebate entre 0 e 100.',
          fala: 'Agora os dados e a vigência! Preenche que eu confiro antes de salvar. 😁',
          acao: 'Preencher e salvar', permissao: PERM_PT,
          parametro: { chave: 'Contratos.Vigencia.Bloqueio.Manual', efeito: 'Habilitada → bloqueia o preenchimento manual das vigências (vêm calculadas).' },
        },
        ASSINATURA: {
          ic: '✍️', tit: 'Assinatura', quem: 'Contratos / Responsável',
          tela: 'Contratos → Contrato (ZapSign)', href: '/modulos/contratos/contrato',
          txt: 'Com ZapSign habilitado, o contrato é enviado para assinatura digital (CPF, Nome e E-mail do responsável). Sem ZapSign, o controle de "Assinado" é manual.',
          pratica: 'No ZapSign, o CPF precisa ser válido e o e-mail bem formado; o responsável recebe o documento para assinar.',
          fala: 'Hora da assinatura! ✍️ Com ZapSign é digital; sem, é no campo "Assinado".',
          acao: 'Enviar / registrar assinatura →', permissao: 'Permissão de integração ZapSign (quando aplicável), controlada à parte.',
          parametro: { chave: 'Integração ZapSign', efeito: 'habilita a assinatura digital e exige os dados do responsável.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Contrato assinado / ativo', quem: 'Sistema',
          tela: 'Contratos → Contrato', href: '/modulos/contratos/contrato',
          txt: 'Assinado! O contrato fica ativo e vale pela vigência definida. A partir dele saem políticas de contrato, metas e parcerias.',
          pratica: 'Dá para gerar renovações/aditivos depois (permissão à parte).',
          fala: 'Contrato assinado! ✅ Valendo pela vigência. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Vigência (Início/Término)', efeito: 'período em que o contrato vale.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: faltam campos obrigatórios — ${l}. Preencha e salve de novo.`,
      out: {
        salvou: 'Contrato salvo. Pronto para a assinatura.',
        aprovou: 'Contrato assinado e ativo.',
      },
    },
    en: {
      titulo: 'Register a Contract, step by step',
      sub: 'From the new contract to signing, with the commercial structure and term. Each step shows the permission and parameter.',
      campos: {
        titulo: 'Title', tipoParceiro: 'Partner Type', tipoContrato: 'Contract Type', classificacao: 'Classification',
        cliente: 'Customer', estrutura: 'Commercial structure (Director, GNV, GR, GD, Consultant)', mesesVigencia: 'Number of Term Months (greater than 0)',
        cpfAssinatura: 'Signing CPF', nomeAssinante: 'Signer\'s name', emailAssinante: 'Signer\'s e-mail',
      },
      statusLabel: {},
      painelLabels: {
        status: 'Status', assinatura: 'Signature', cliente: 'Customer', codigo: 'Contract No.',
        novo: 'Editing', salvo: '✓ Saved', ativo: '✓ Signed / Active', zap: 'ZapSign (digital)', manual: 'Manual',
        selecionado: '✓ set', vazio: '—', semCodigo: '— (after saving)',
      },
      trilha: { ABERTURA: 'New', DADOS: 'Data', ASSINATURA: 'Signature' },
      regras: [
        'Required: Title, Signed, Partner Type, Contract Type, Classification, Has Partners, Bonus Milling, Status, Customer and Number of Term Months (> 0).',
        'Entire commercial structure required: Director, GNV, GR, GD and Consultant.',
        'Term End must be greater than Term Start; % Rebate between 0 and 100.',
        'Course contract: Number of Speakers and of Welcome Kits are required (> 0) when the contract has them.',
        'With the ZapSign integration enabled, it requires the signer\'s CPF (valid), Name and E-mail (valid).',
      ],
      quem: [
        'Profile with access to Contract registration (Contracts module).',
        'Extra contract permissions (cancel, generate renewals/addenda, ZapSign integration) are controlled separately.',
      ],
      etapas: {
        ABERTURA: {
          ic: '📄', tit: 'New contract', quem: 'Sales / Contracts',
          tela: 'Contracts → Contract', href: '/en/modulos/contratos/contrato',
          txt: 'Click "+ New", select the Customer and set the Partner Type and Contract Type. This defines the next rules (e.g., Course has its own fields).',
          pratica: 'The Partner Type (e.g., Course) changes the fields required later.',
          fala: "Let's build a contract! 🦷 For which customer and partner type?",
          acao: 'New contract →', permissao: PERM_EN,
          parametro: { chave: 'Partner Type', efeito: 'defines conditionals (e.g., Course requires speakers/kits).' },
        },
        DADOS: {
          ic: '📝', tit: 'Data, structure and term', quem: 'Sales / Contracts',
          tela: 'Contracts → Contract', href: '/en/modulos/contratos/contrato',
          txt: 'Fill Title, Classification, Status, the commercial structure (Director, GNV, GR, GD, Consultant), the term (Start/End and Months) and the % Rebate. Click "Save".',
          pratica: 'Term Months must be greater than 0; Term End greater than Start; % Rebate between 0 and 100.',
          fala: "Now the data and term! Fill it and I'll check before saving. 😁",
          acao: 'Fill and save', permissao: PERM_EN,
          parametro: { chave: 'Contratos.Vigencia.Bloqueio.Manual', efeito: 'Enabled → blocks manual entry of the term dates (they come calculated).' },
        },
        ASSINATURA: {
          ic: '✍️', tit: 'Signature', quem: 'Contracts / Signer',
          tela: 'Contracts → Contract (ZapSign)', href: '/en/modulos/contratos/contrato',
          txt: 'With ZapSign enabled, the contract is sent for digital signature (signer\'s CPF, Name and E-mail). Without ZapSign, the "Signed" control is manual.',
          pratica: 'In ZapSign, the CPF must be valid and the e-mail well-formed; the signer receives the document to sign.',
          fala: 'Signing time! ✍️ With ZapSign it\'s digital; without, it\'s the "Signed" field.',
          acao: 'Send / record signature →', permissao: 'ZapSign integration permission (when applicable), controlled separately.',
          parametro: { chave: 'ZapSign integration', efeito: 'enables the digital signature and requires the signer\'s data.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Contract signed / active', quem: 'System',
          tela: 'Contracts → Contract', href: '/en/modulos/contratos/contrato',
          txt: 'Signed! The contract is active and valid for the defined term. From it come contract policies, targets and partnerships.',
          pratica: 'You can generate renewals/addenda later (separate permission).',
          fala: 'Contract signed! ✅ Valid for the term. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Term (Start/End)', efeito: 'period the contract is valid.' },
        },
      },
      outFalta: (l) => `Can't save: required fields are missing — ${l}. Fill them and save again.`,
      out: {
        salvou: 'Contract saved. Ready for signing.',
        aprovou: 'Contract signed and active.',
      },
    },
  },
};
