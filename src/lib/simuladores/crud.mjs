// Fábrica de spec para cadastros SIMPLES (CRUD: Pesquisar → + Novo → Preencher → Salvar).
// Usada só em telas que REALMENTE são cadastro simples. Telas de processo/consulta/
// relatório têm spec próprio (não usar isto nelas).
//
// cfg = {
//   slug, nome:{pt,en}, modulo:{pt,en}, href:{pt,en},
//   permissao:{pt,en},
//   obrigatorios?: [{ key, label:{pt,en} }]   // campos reais; se omitido, usa um genérico
//   campos?: { pt:[...], en:[...] }            // nomes reais dos campos da tela (só p/ exibir no passo)
//   intro?: {pt,en}                            // 1 linha sobre o que a tela cadastra (sem inventar regra)
// }

export function makeCrud(cfg) {
  const etapasOrdem = ['ABERTURA', 'DADOS', 'SALVO'];
  const etapaTipo = { ABERTURA: 'ABRIR', DADOS: 'SALVAR', SALVO: 'FIM' };

  // campos: reais (cfg.obrigatorios) ou um placeholder honesto (não inventa nomes)
  const temReais = Array.isArray(cfg.obrigatorios) && cfg.obrigatorios.length > 0;
  const chaves = temReais ? cfg.obrigatorios.map((c) => c.key) : ['obrigatorios'];
  const pegadinha = chaves[0];

  const campos = (lang) => {
    if (temReais) return Object.fromEntries(cfg.obrigatorios.map((c) => [c.key, c.label[lang]]));
    return { obrigatorios: lang === 'en' ? "the screen's required fields" : 'os campos obrigatórios da tela' };
  };

  const bloco = (lang) => {
    const nome = cfg.nome[lang];
    const en0 = lang === 'en';
    const flist = (cfg.campos && cfg.campos[lang]) || [];
    const temF = flist.length > 0;
    const listaF = flist.slice(0, 8).join(', ');
    const intro = cfg.intro?.[lang] || (lang === 'en'
      ? `Registers ${nome} used by other screens in the system.`
      : `Cadastra ${nome} usado(a) por outras telas do sistema.`);
    const permissao = cfg.permissao[lang];
    const en = lang === 'en';
    return {
      titulo: en ? `Register ${nome}, step by step` : `Cadastrar ${nome}, passo a passo`,
      sub: en
        ? `Create a ${nome} record on the screen, from + New to Save. Nothing is saved in the system.`
        : `Crie um registro de ${nome} na tela, do + Novo ao Salvar. Nada é salvo no sistema.`,
      campos: campos(lang),
      statusLabel: {},
      painelLabels: {
        status: 'Status', nome: en ? 'Record' : 'Registro',
        novo: en ? 'New (not saved)' : 'Novo (não salvo)', salvo: en ? '✓ Saved' : '✓ Salvo',
        preenchido: en ? 'filled' : 'preenchido', vazio: en ? '— (empty)' : '— (vazio)',
      },
      trilha: { ABERTURA: en ? '+ New' : '+ Novo', DADOS: en ? 'Fill in' : 'Preencher' },
      regras: (cfg.regras && cfg.regras[lang] && cfg.regras[lang].length)
        ? [...cfg.regras[lang],
            en ? 'Required fields must be filled to save; you can Edit or Delete the record later.'
               : 'Os campos obrigatórios precisam ser preenchidos para salvar; dá para Editar ou Excluir depois.']
        : [
            intro,
            en ? 'Required fields must be filled to save.' : 'Os campos obrigatórios precisam ser preenchidos para salvar.',
            en ? 'You can Edit or Delete the record at any time (per your permission).'
               : 'Dá para Editar ou Excluir o registro a qualquer momento (conforme a sua permissão).',
          ],
      quem: [permissao],
      etapas: {
        ABERTURA: {
          ic: '🔎', tit: en ? 'Search and open the form' : 'Pesquisar e abrir o cadastro', quem: en ? 'Registrant' : 'Cadastrador',
          tela: cfg.modulo[lang], href: cfg.href[lang],
          txt: en ? `Search to check if the ${nome} already exists. To create a new one, click "+ New".`
                  : `Pesquise para ver se o(a) ${nome} já existe. Para criar, clique em "+ Novo".`,
          pratica: en ? 'Avoid duplicates: search before creating.' : 'Evite duplicidade: pesquise antes de criar.',
          fala: en ? `Let's register a ${nome}! 🦷 Click "+ New" and I'll guide you.`
                   : `Vamos cadastrar ${nome}! 🦷 Clica em "+ Novo" que eu te guio.`,
          acao: en ? '+ New →' : '+ Novo →', permissao, parametro: cfg.parametro?.[lang] || null,
        },
        DADOS: {
          ic: '📝', tit: en ? 'Fill in the record' : 'Preencher o cadastro', quem: en ? 'Registrant' : 'Cadastrador',
          tela: cfg.modulo[lang], href: cfg.href[lang],
          txt: temF
            ? (en ? `Fill the screen fields — ${listaF} — and click "Save".` : `Preencha os campos da tela — ${listaF} — e clique em "Salvar".`)
            : (en ? 'Fill the required fields and click "Save".' : 'Preencha os campos obrigatórios e clique em "Salvar".'),
          pratica: en ? 'Required fields are highlighted on the screen.' : 'Os obrigatórios aparecem destacados na tela.',
          fala: en ? "Fill it in and I'll check before saving! 😁" : 'Preenche que eu confiro antes de salvar! 😁',
          acao: en ? 'Fill fields' : 'Preencher campos', permissao, parametro: null,
        },
        SALVO: {
          ic: '✅', tit: en ? 'Record saved' : 'Registro salvo', quem: en ? 'System' : 'Sistema',
          tela: cfg.modulo[lang], href: cfg.href[lang],
          txt: en ? `Saved! The ${nome} is registered and available for the screens that use it.`
                  : `Salvou! O(a) ${nome} está cadastrado(a) e disponível para as telas que o(a) usam.`,
          pratica: en ? 'You can Edit or Delete it from the list.' : 'Dá para Editar ou Excluir pela listagem.',
          fala: en ? 'Done! ✅ Record is live. 🦷' : 'Pronto! ✅ Registro no ar. 🦷',
          acao: null, permissao: null, parametro: null,
        },
      },
      outFalta: (l) => en
        ? `Can't save: required fields are missing — ${l}. Fill them and save again.`
        : `Não dá pra salvar: faltam campos obrigatórios — ${l}. Preencha e salve de novo.`,
      out: { salvou: en ? 'Record saved.' : 'Registro salvo.' },
    };
  };

  const textos = { pt: bloco('pt'), en: bloco('en') };

  return {
    slug: cfg.slug,
    exigeAnexo: false,
    codigoFinal: null,
    etapasOrdem,
    etapaTipo,
    variantes: null,
    obrigatorios: { _: chaves },
    pegadinha: { _: pegadinha },
    alcada: null,
    painel: (s, lang) => {
      const t = textos[lang];
      return [
        { k: t.painelLabels.status, v: s.salvo ? t.painelLabels.salvo : t.painelLabels.novo },
        { k: t.painelLabels.nome, v: s.salvo ? cfg.nome[lang] : t.painelLabels.vazio },
      ];
    },
    textos,
  };
}
