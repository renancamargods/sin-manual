// Spec do simulador da tela CONTROLE DE FUNCIONALIDADE (CRUD simples, sem aprovação).
// Regras reais de modulos/administrador/controle-de-funcionalidade.mdx (catálogo das 8 flags).

const etapasOrdem = ['ABERTURA', 'DADOS', 'SALVO'];
const etapaTipo = { ABERTURA: 'ABRIR', DADOS: 'SALVAR', SALVO: 'FIM' };

const PERM_PT = 'Perfil com permissão de acesso à tela Controle de Funcionalidade (Administrador).';
const PERM_EN = 'Profile with permission to access the Feature Control screen (Administrator).';

export const spec = {
  slug: 'controle-de-funcionalidade',
  exigeAnexo: false,
  codigoFinal: null,
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'BOOL', label: { pt: 'Booleano', en: 'Boolean' } },
    { key: 'TEXTO', label: { pt: 'Texto', en: 'Text' } },
    { key: 'NUMERO', label: { pt: 'Número', en: 'Number' } },
    { key: 'JSON', label: { pt: 'Json', en: 'Json' } },
  ],
  obrigatorios: { _: ['chave', 'nome', 'habilitada', 'valor'] },
  pegadinha: { _: 'chave' },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    return [
      { k: t.painelLabels.status, v: s.salvo ? t.painelLabels.salvo : t.painelLabels.novo },
      { k: t.painelLabels.tipoValor, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.chave, v: s.campos.chave ? 'Gateway.Pagamento.PayGo' : t.painelLabels.vazio },
      { k: t.painelLabels.habilitada, v: s.campos.habilitada ? t.painelLabels.sim : t.painelLabels.nao },
    ];
  },

  textos: {
    pt: {
      titulo: 'Cadastrar uma funcionalidade (feature flag), passo a passo',
      sub: 'Ligue/desligue um comportamento do sistema por chave. Nada é salvo de verdade.',
      campos: { chave: 'Chave Identificadora', nome: 'Nome', habilitada: 'Habilitada', valor: 'Valor', descricao: 'Descrição' },
      statusLabel: {},
      painelLabels: { status: 'Status', tipoValor: 'Tipo do Valor', chave: 'Chave', habilitada: 'Habilitada', novo: 'Novo (não salvo)', salvo: '✓ Salvo', sim: 'Sim', nao: 'Não', vazio: '— (vazio)' },
      trilha: { ABERTURA: '+ Novo', DADOS: 'Preencher' },
      regras: [
        'Obrigatórios ao salvar: Chave Identificadora, Nome, Habilitada e Valor (quando há Tipo do Valor).',
        'Nome: até 200 caracteres. Descrição: até 500 caracteres.',
        'Valor por tipo: Booleano = "true"/"false"; Número = numérico válido; Json = JSON válido (começa com "{" ou "[").',
        'A chave só muda comportamento se o sistema a consulta (ver o catálogo das 8 funcionalidades na página da tela).',
        'O que liga/desliga é a coluna Habilitada; algumas chaves usam também o campo Valor (ex.: JSON de configuração).',
      ],
      quem: [
        'Usuário com permissão de acesso à tela Controle de Funcionalidade (perfil Administrador).',
        'Alterar uma funcionalidade muda o comportamento do sistema — faça com conhecimento do efeito.',
      ],
      etapas: {
        ABERTURA: {
          ic: '🔎', tit: 'Pesquisar e abrir o cadastro', quem: 'Administrador',
          tela: 'Administrador → Controle de Funcionalidade', href: '/modulos/administrador/controle-de-funcionalidade',
          txt: 'Pesquise pela "Chave Identificadora" para ver se já existe. Para criar uma nova, clique em "+ Novo".',
          pratica: 'Dica: antes de criar, confira se a chave que você precisa já está no catálogo das funcionalidades que o sistema lê.',
          fala: 'Vamos ligar uma funcionalidade! 🦷 Clica em "+ Novo" que eu te guio.',
          acao: '+ Novo →', permissao: PERM_PT,
          parametro: { chave: 'Catálogo de funcionalidades', efeito: 'só as chaves que o sistema consulta mudam comportamento (ver a página da tela).' },
        },
        DADOS: {
          ic: '📝', tit: 'Preencher a funcionalidade', quem: 'Administrador',
          tela: 'Controle de Funcionalidade → aba de cadastro', href: '/modulos/administrador/controle-de-funcionalidade',
          txt: 'Informe a Chave, o Nome, a Descrição, o Tipo do Valor e o Valor, e defina Habilitada. Clique em "Salvar".',
          pratica: 'O Valor precisa casar com o Tipo: Booleano = true/false; Número = número; Json = JSON válido.',
          fala: 'Preenche a Chave e o resto que eu confiro antes de salvar! 😁',
          acao: 'Preencher campos', permissao: PERM_PT,
          parametro: { chave: 'Tipo do Valor + Valor', efeito: 'o Valor é validado conforme o Tipo (booleano/número/JSON).' },
        },
        SALVO: {
          ic: '✅', tit: 'Funcionalidade salva', quem: 'Sistema',
          tela: 'Controle de Funcionalidade', href: '/modulos/administrador/controle-de-funcionalidade',
          txt: 'Salvou! A funcionalidade está cadastrada. Se Habilitada = Sim e a chave for consultada pelo sistema, o comportamento muda na hora.',
          pratica: 'Dá para Editar (habilitar/desabilitar ou mudar o Valor) ou Excluir a qualquer momento.',
          fala: 'Pronto! ✅ Funcionalidade no ar. Lembra: só vale se o sistema ler essa chave. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Habilitada', efeito: 'Sim liga o comportamento; Não desliga.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: faltam campos obrigatórios — ${l}. Preencha e salve de novo.`,
      out: { salvou: 'Funcionalidade salva. Se Habilitada = Sim e a chave for lida pelo sistema, o efeito vale na hora.' },
    },
    en: {
      titulo: 'Register a feature (feature flag), step by step',
      sub: 'Turn a system behavior on/off by key. Nothing is actually saved.',
      campos: { chave: 'Identifier Key', nome: 'Name', habilitada: 'Enabled', valor: 'Value', descricao: 'Description' },
      statusLabel: {},
      painelLabels: { status: 'Status', tipoValor: 'Value Type', chave: 'Key', habilitada: 'Enabled', novo: 'New (not saved)', salvo: '✓ Saved', sim: 'Yes', nao: 'No', vazio: '— (empty)' },
      trilha: { ABERTURA: '+ New', DADOS: 'Fill in' },
      regras: [
        'Required to save: Identifier Key, Name, Enabled and Value (when there is a Value Type).',
        'Name: up to 200 characters. Description: up to 500 characters.',
        'Value by type: Boolean = "true"/"false"; Number = valid number; Json = valid JSON (starts with "{" or "[").',
        'A key only changes behavior if the system reads it (see the catalog of the 8 features on the screen page).',
        'What turns it on/off is the Enabled column; some keys also use the Value field (e.g., a configuration JSON).',
      ],
      quem: [
        'User with permission to access the Feature Control screen (Administrator profile).',
        'Changing a feature changes system behavior — do it knowing the effect.',
      ],
      etapas: {
        ABERTURA: {
          ic: '🔎', tit: 'Search and open the form', quem: 'Administrator',
          tela: 'Administrator → Feature Control', href: '/en/modulos/administrador/controle-de-funcionalidade',
          txt: 'Search by the "Identifier Key" to check if it already exists. To create a new one, click "+ New".',
          pratica: 'Tip: before creating, check if the key you need is already in the catalog of features the system reads.',
          fala: "Let's turn a feature on! 🦷 Click \"+ New\" and I'll guide you.",
          acao: '+ New →', permissao: PERM_EN,
          parametro: { chave: 'Feature catalog', efeito: 'only the keys the system reads change behavior (see the screen page).' },
        },
        DADOS: {
          ic: '📝', tit: 'Fill in the feature', quem: 'Administrator',
          tela: 'Feature Control → form tab', href: '/en/modulos/administrador/controle-de-funcionalidade',
          txt: 'Enter the Key, Name, Description, Value Type and Value, and set Enabled. Click "Save".',
          pratica: 'The Value must match the Type: Boolean = true/false; Number = number; Json = valid JSON.',
          fala: 'Fill the Key and the rest and I\'ll check before saving! 😁',
          acao: 'Fill fields', permissao: PERM_EN,
          parametro: { chave: 'Value Type + Value', efeito: 'the Value is validated according to the Type (boolean/number/JSON).' },
        },
        SALVO: {
          ic: '✅', tit: 'Feature saved', quem: 'System',
          tela: 'Feature Control', href: '/en/modulos/administrador/controle-de-funcionalidade',
          txt: 'Saved! The feature is registered. If Enabled = Yes and the key is read by the system, the behavior changes right away.',
          pratica: 'You can Edit (enable/disable or change the Value) or Delete at any time.',
          fala: 'Done! ✅ Feature is live. Remember: it only counts if the system reads this key. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Enabled', efeito: 'Yes turns the behavior on; No turns it off.' },
        },
      },
      outFalta: (l) => `Can't save: required fields are missing — ${l}. Fill them and save again.`,
      out: { salvou: 'Feature saved. If Enabled = Yes and the key is read by the system, the effect applies right away.' },
    },
  },
};
