// Spec do simulador da tela CLIENTE. Regras reais de:
//   modulos/clientes/cliente.mdx + tecnico/regras-de-validacao/cliente.mdx
// Parâmetro do envio (Fila.Clientes.SemIgnition): ver Controle de Funcionalidade.

const etapasOrdem = ['PRE', 'DADOS', 'SALVO', 'ANEXADO', 'ENVIADO', 'ATIVO'];
const etapaTipo = { PRE: 'ABRIR', DADOS: 'SALVAR', SALVO: 'ANEXAR', ANEXADO: 'ENVIAR', ENVIADO: 'APROVAR', ATIVO: 'FIM' };

const PERM_PT = 'Perfil com acesso ao cadastro de Cliente (Master ou Comum/Consultor).';
const PERM_EN = 'Profile with access to Customer registration (Master or Common/Consultant).';

export const spec = {
  slug: 'cliente',
  exigeAnexo: true,
  codigoFinal: '0001004523',
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'PF', label: { pt: 'Pessoa Física', en: 'Individual' } },
    { key: 'PJ', label: { pt: 'Pessoa Jurídica', en: 'Company' } },
    { key: 'EST', label: { pt: 'Estrangeiro', en: 'Foreign' } },
  ],
  obrigatorios: {
    PF: ['nome', 'nomeFantasia', 'consultor', 'endereco', 'telefone', 'email', 'dataNasc', 'credencial'],
    PJ: ['nome', 'nomeFantasia', 'consultor', 'endereco', 'telefone', 'email', 'dataNasc', 'credencial', 'inscricaoEstadual'],
    EST: ['nome', 'nomeFantasia', 'consultor', 'endereco', 'telefone', 'moeda', 'listaPreco'],
  },
  pegadinha: { PF: 'email', PJ: 'inscricaoEstadual', EST: 'moeda' },
  alcada: { PF: ['credito'], PJ: ['credito', 'fiscal'], EST: ['creditoInternacional', 'fiscal'] },
  documento: (s) => (s.variante === 'PF' ? '123.456.789-09' : s.variante === 'PJ' ? '12.345.678/0001-95' : '— (dispensado)'),

  painel: (s, lang) => {
    const t = spec.textos[lang];
    return [
      { k: t.painelLabels.status, v: t.statusLabel[s.statusKey] },
      { k: t.painelLabels.tipo, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.doc, v: spec.documento(s) },
      { k: t.painelLabels.anexos, v: s.anexado ? t.painelLabels.anexSim : t.painelLabels.anexNao },
      { k: t.painelLabels.sap, v: s.codigo || t.painelLabels.semSap },
    ];
  },

  textos: {
    pt: {
      titulo: 'Cadastrar um Cliente, passo a passo',
      sub: 'Siga o cliente do pré-cadastro até a ativação; cada recusa explica o porquê.',
      campos: {
        nome: 'Nome', nomeFantasia: 'Nome Fantasia', consultor: 'Consultor FVE', endereco: 'Endereço principal',
        telefone: 'Telefone principal', email: 'E-mail', dataNasc: 'Data Nascimento/Abertura',
        credencial: 'Credencial (UF, número, tipo e responsável)', inscricaoEstadual: 'Inscrição Estadual',
        moeda: 'Moeda', listaPreco: 'Lista de Preço',
      },
      statusLabel: { novo: 'Novo (não enviado)', emAnalise: 'Em Análise pela Área de Cadastro/Crédito', ativo: 'ATIVO' },
      alcada: { credito: 'Crédito', fiscal: 'Fiscal', creditoInternacional: 'Crédito Internacional' },
      painelLabels: { status: 'Status', tipo: 'Tipo', doc: 'Documento', anexos: 'Anexos', sap: 'Código SAP', anexSim: '✓ anexados', anexNao: '⏳ pendentes', semSap: '— (só após aprovação)' },
      trilha: { PRE: 'Pré-cadastro', DADOS: 'Dados', SALVO: 'Salvar', ANEXADO: 'Anexos', ENVIADO: 'Enviar' },
      regras: [
        'Documento: PF e PJ obrigatório; Estrangeiro dispensa. PF usa CPF válido; PJ usa CNPJ válido.',
        'Obrigatórios mudam por tipo: PJ exige Inscrição Estadual; Estrangeiro exige Moeda e Lista de Preço (e dispensa e-mail/credencial).',
        'Antes do 1º Salvar aparecem só 4 abas; depois de salvar liberam as demais e o cabeçalho do cliente.',
        '"Enviar Cliente" só habilita depois de salvar — e os anexos obrigatórios são exigidos no envio.',
        'Alçada por tipo: PF → Crédito; PJ → Crédito + Fiscal; Estrangeiro → Crédito Internacional + Fiscal.',
        'Código SAP é gerado automaticamente só quando a alçada aprova (status ATIVO).',
      ],
      quem: [
        'Usuário Master (Administrador): acesso total — cria clientes e acessa as configurações gerais.',
        'Usuário Comum (ex.: Consultor): cria clientes vinculados ao seu perfil.',
        'A decisão de aprovar/reprovar não é feita aqui — é na Fila de Aprovações de Cadastro.',
      ],
      etapas: {
        PRE: {
          ic: '🧾', tit: 'Pré-cadastro (Pulse Credit)', quem: 'Cadastro/Consultor',
          tela: 'Tela de Cliente → Pré-cadastro', href: '/modulos/clientes/cliente',
          txt: 'Tudo começa pelo pré-cadastro: escolha o Tipo de Pessoa, o Tipo de Cadastro e informe o documento (CPF/CNPJ). Estrangeiro dispensa o documento.',
          pratica: 'O documento define as regras seguintes. Clique em "Avançar" para liberar a aba Dados Cadastrais.',
          fala: 'Bora começar! 🦷 Me diz: esse cliente é Física, Jurídica ou Estrangeiro?',
          acao: 'Avançar →', permissao: PERM_PT, parametro: null,
        },
        DADOS: {
          ic: '📝', tit: 'Dados Cadastrais', quem: 'Cadastro/Consultor',
          tela: 'Tela de Cliente → aba Dados Cadastrais', href: '/modulos/clientes/cliente',
          txt: 'Antes de salvar aparecem só 4 abas. Preencha os obrigatórios — eles mudam conforme o tipo de pessoa.',
          pratica: 'Se o documento for localizado no VerifyID, nome e endereço vêm preenchidos. O que faltar, você completa.',
          fala: 'Agora os dados! Preenche os obrigatórios que eu confiro pra você antes de salvar. 😁',
          acao: 'Preencher obrigatórios', permissao: PERM_PT,
          parametro: { chave: 'VerifyID (consulta externa)', efeito: 'se o documento é localizado, nome e endereço vêm preenchidos automaticamente.' },
        },
        SALVO: {
          ic: '💾', tit: 'Salvo — abas liberadas', quem: 'Sistema',
          tela: 'Tela de Cliente (após Salvar)', href: '/modulos/clientes/cliente',
          txt: 'Salvou! As demais abas liberaram e o topo passou a mostrar o resumo do cliente. O botão "Enviar Cliente" agora pode habilitar.',
          pratica: 'Falta um passo antes de enviar: anexar os documentos obrigatórios.',
          fala: 'Mandou bem! 💾 Guardei tudo. Agora vamos nos anexos.',
          acao: 'Anexar documentos', permissao: PERM_PT, parametro: null,
        },
        ANEXADO: {
          ic: '📎', tit: 'Anexos obrigatórios', quem: 'Cadastro/Consultor',
          tela: 'Tela de Cliente → aba Anexos', href: '/modulos/clientes/cliente',
          txt: 'O anexo de documentos é obrigatório para enviar. Com os documentos anexados, "Enviar Cliente" está liberado.',
          pratica: 'Clique em "Enviar Cliente" e confirme o popup com "SIM".',
          fala: 'Documentos anexados! 📎 Pronto pra enviar pra alçada. Confirma no "SIM"?',
          acao: 'Enviar Cliente →', permissao: PERM_PT,
          parametro: { chave: 'Anexos obrigatórios por tipo de pessoa', efeito: 'os anexos marcados como obrigatórios são exigidos no envio.' },
        },
        ENVIADO: {
          ic: '📤', tit: 'Enviado para aprovação', quem: 'Sistema',
          tela: 'Fila de Aprovações de Cadastro', href: '/tecnico/fluxos/criacao-de-cliente',
          txt: 'O cliente saiu da tela e entrou na fila da alçada. A decisão (aprovar/reprovar) é na Fila de Aprovações — não nesta tela.',
          pratica: 'Quando a alçada aprova, o cliente vira ATIVO e o código SAP é gerado automaticamente.',
          fala: 'Enviado! 📤 Agora é com a alçada. Eu te mostro o que acontece quando aprovam.',
          acao: 'Aprovar (fora da tela) →', permissao: 'Alçada responsável (Crédito / Fiscal / Crédito Internacional), na Fila de Aprovações.',
          parametro: { chave: 'Fila.Clientes.SemIgnition', efeito: 'Habilitada → nova fila de aprovação SEM Ignition; desabilitada → fila COM Ignition.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Aprovado — ATIVO + código SAP', quem: 'Alçada + SAP',
          tela: 'Fila de Aprovações de Cadastro', href: '/tecnico/fluxos/criacao-de-cliente',
          txt: 'A alçada aprovou. O cliente ficou ATIVO e recebeu o código SAP automaticamente. Ciclo completo!',
          pratica: 'Pronto: cliente ativo, com crédito liberado e integrado ao SAP.',
          fala: 'Aprovado! ✅ Cliente ATIVO e com código SAP. Fim do ciclo — manda ver! 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Integração SAP', efeito: 'gera o código SAP automaticamente quando o cliente é aprovado.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: faltam campos obrigatórios — ${l}. Preencha e salve de novo.`,
      outEnviou: (a) => `Cliente enviado! Alçada acionada: ${a}. Status: "Em Análise pela Área de Cadastro/Crédito".`,
      out: { salvou: 'Cadastro salvo. Abas complementares liberadas e "Enviar Cliente" habilitado.', aprovou: 'Aprovado pela alçada: cliente ATIVO e código SAP gerado.' },
    },
    en: {
      titulo: 'Register a Customer, step by step',
      sub: 'Follow the customer from pre-registration to activation; every refusal explains why.',
      campos: {
        nome: 'Name', nomeFantasia: 'Trade Name', consultor: 'FVE Consultant', endereco: 'Primary address',
        telefone: 'Primary phone', email: 'E-mail', dataNasc: 'Birth/Incorporation date',
        credencial: 'Credential (state, number, type and holder)', inscricaoEstadual: 'State Registration',
        moeda: 'Currency', listaPreco: 'Price List',
      },
      statusLabel: { novo: 'New (not submitted)', emAnalise: 'Under review by Registration/Credit', ativo: 'ACTIVE' },
      alcada: { credito: 'Credit', fiscal: 'Tax', creditoInternacional: 'International Credit' },
      painelLabels: { status: 'Status', tipo: 'Type', doc: 'Document', anexos: 'Attachments', sap: 'SAP code', anexSim: '✓ attached', anexNao: '⏳ pending', semSap: '— (only after approval)' },
      trilha: { PRE: 'Pre-reg.', DADOS: 'Data', SALVO: 'Save', ANEXADO: 'Attach', ENVIADO: 'Submit' },
      regras: [
        'Document: required for Individual and Company; Foreign is exempt. Individual uses a valid CPF; Company a valid CNPJ.',
        'Required fields change by type: Company needs State Registration; Foreign needs Currency and Price List (and skips e-mail/credential).',
        'Before the first Save only 4 tabs appear; after saving the others unlock along with the customer header.',
        '"Submit Customer" only enables after saving — and required attachments are enforced at submission.',
        'Approval level by type: Individual → Credit; Company → Credit + Tax; Foreign → International Credit + Tax.',
        'The SAP code is generated automatically only when the level approves (ACTIVE status).',
      ],
      quem: [
        'Master user (Administrator): full access — creates customers and reaches general settings.',
        'Common user (e.g. Consultant): creates customers tied to their profile.',
        'The approve/reject decision is not made here — it happens in the Registration Approval Queue.',
      ],
      etapas: {
        PRE: {
          ic: '🧾', tit: 'Pre-registration (Pulse Credit)', quem: 'Registration/Consultant',
          tela: 'Customer screen → Pre-registration', href: '/en/modulos/clientes/cliente',
          txt: 'It all starts with pre-registration: choose the Person Type, the Registration Type and enter the document (CPF/CNPJ). Foreign customers skip the document.',
          pratica: 'The document drives the next rules. Click "Next" to unlock the Registration Data tab.',
          fala: "Let's start! 🦷 Tell me: is this customer Individual, Company or Foreign?",
          acao: 'Next →', permissao: PERM_EN, parametro: null,
        },
        DADOS: {
          ic: '📝', tit: 'Registration Data', quem: 'Registration/Consultant',
          tela: 'Customer screen → Registration Data tab', href: '/en/modulos/clientes/cliente',
          txt: 'Before saving, only 4 tabs show. Fill the required fields — they change with the person type.',
          pratica: 'If the document is found in VerifyID, name and address come pre-filled. Fill in the rest.',
          fala: "Now the data! Fill the required fields and I'll check them before you save. 😁",
          acao: 'Fill required fields', permissao: PERM_EN,
          parametro: { chave: 'VerifyID (external lookup)', efeito: 'if the document is found, name and address come pre-filled automatically.' },
        },
        SALVO: {
          ic: '💾', tit: 'Saved — tabs unlocked', quem: 'System',
          tela: 'Customer screen (after Save)', href: '/en/modulos/clientes/cliente',
          txt: 'Saved! The other tabs unlocked and the header now shows the customer summary. "Submit Customer" can now enable.',
          pratica: 'One step before submitting: attach the required documents.',
          fala: 'Nicely done! 💾 Everything saved. Now the attachments.',
          acao: 'Attach documents', permissao: PERM_EN, parametro: null,
        },
        ANEXADO: {
          ic: '📎', tit: 'Required attachments', quem: 'Registration/Consultant',
          tela: 'Customer screen → Attachments tab', href: '/en/modulos/clientes/cliente',
          txt: 'Attaching documents is required to submit. With documents attached, "Submit Customer" is enabled.',
          pratica: 'Click "Submit Customer" and confirm the popup with "YES".',
          fala: 'Documents attached! 📎 Ready to send to the approval level. Confirm with "YES"?',
          acao: 'Submit Customer →', permissao: PERM_EN,
          parametro: { chave: 'Required attachments by person type', efeito: 'attachments marked as required are enforced at submission.' },
        },
        ENVIADO: {
          ic: '📤', tit: 'Submitted for approval', quem: 'System',
          tela: 'Registration Approval Queue', href: '/en/tecnico/fluxos/criacao-de-cliente',
          txt: 'The customer left the screen and entered the approval queue. The decision (approve/reject) happens in the Approval Queue — not on this screen.',
          pratica: 'When the level approves, the customer becomes ACTIVE and the SAP code is generated automatically.',
          fala: "Submitted! 📤 It's with the approval level now. I'll show you what happens when they approve.",
          acao: 'Approve (off-screen) →', permissao: 'Responsible approval level (Credit / Tax / International Credit), in the Approval Queue.',
          parametro: { chave: 'Fila.Clientes.SemIgnition', efeito: 'Enabled → new approval queue WITHOUT Ignition; disabled → queue WITH Ignition.' },
        },
        ATIVO: {
          ic: '✅', tit: 'Approved — ACTIVE + SAP code', quem: 'Approval level + SAP',
          tela: 'Registration Approval Queue', href: '/en/tecnico/fluxos/criacao-de-cliente',
          txt: 'The level approved. The customer is ACTIVE and received the SAP code automatically. Full cycle done!',
          pratica: 'Done: active customer, credit released and integrated with SAP.',
          fala: 'Approved! ✅ Customer ACTIVE with a SAP code. End of the cycle — well done! 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'SAP integration', efeito: 'generates the SAP code automatically when the customer is approved.' },
        },
      },
      outFalta: (l) => `Can't save: required fields are missing — ${l}. Fill them and save again.`,
      outEnviou: (a) => `Customer submitted! Approval level triggered: ${a}. Status: "Under review by Registration/Credit".`,
      out: { salvou: 'Registration saved. Extra tabs unlocked and "Submit Customer" enabled.', aprovou: 'Approved by the level: customer ACTIVE and SAP code generated.' },
    },
  },
};
