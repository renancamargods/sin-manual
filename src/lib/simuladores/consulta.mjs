// Fábrica de spec para telas de CONSULTA / RELATÓRIO (Abrir → Filtrar → Ler resultados).
// Sem cadastro/salvar. Usada em telas cujo routineType é Consulta/Relatório/Monitoramento.
// cfg = { slug, nome:{pt,en}, modulo:{pt,en}, href:{pt,en}, permissao:{pt,en}, intro?:{pt,en},
//         filtros?: { pt:[...], en:[...] } }  // filtros reais da tela (extraídos da doc)

export function makeConsulta(cfg) {
  const etapasOrdem = ['ABERTURA', 'FILTROS', 'RESULTADOS'];
  const etapaTipo = { ABERTURA: 'ABRIR', FILTROS: 'ABRIR', RESULTADOS: 'FIM' };

  const bloco = (lang) => {
    const en = lang === 'en';
    const nome = cfg.nome[lang];
    const flt = (cfg.filtros && cfg.filtros[lang]) || [];
    const temFlt = flt.length > 0;
    const listaFlt = flt.slice(0, 7).join(', ');
    const intro = cfg.intro?.[lang] || (en
      ? `Queries ${nome} by its filters and reads the results.`
      : `Consulta ${nome} pelos filtros e lê os resultados.`);
    const permissao = cfg.permissao[lang];
    return {
      titulo: en ? `Use the ${nome} screen, step by step` : `Usar a tela ${nome}, passo a passo`,
      sub: en
        ? `A query/report screen: open, filter and read the results. Nothing is saved in the system.`
        : `Tela de consulta/relatório: abrir, filtrar e ler os resultados. Nada é salvo no sistema.`,
      campos: {},
      statusLabel: {},
      painelLabels: { status: 'Status', tela: en ? 'Screen' : 'Tela', aberta: en ? 'Open' : 'Aberta', filtrada: en ? 'Filtered' : 'Filtrada', lida: en ? '✓ Results read' : '✓ Resultados lidos' },
      trilha: { ABERTURA: en ? 'Open' : 'Abrir', FILTROS: en ? 'Filter' : 'Filtrar' },
      regras: [
        intro,
        en ? 'It is a query/report: it shows data; it does not create or change records.' : 'É consulta/relatório: mostra dados; não cria nem altera registros.',
        en ? 'Restrictive filters may hide results — review them if nothing appears.' : 'Filtros muito restritos podem esconder resultados — revise se nada aparecer.',
      ],
      quem: [permissao],
      etapas: {
        ABERTURA: {
          ic: '🔎', tit: en ? 'Open the screen' : 'Abrir a tela', quem: en ? 'User' : 'Usuário',
          tela: cfg.modulo[lang], href: cfg.href[lang],
          txt: en ? `Open ${nome} from the menu.` : `Abra ${nome} pelo menu.`,
          pratica: en ? 'You need permission for the screen.' : 'É preciso ter permissão para a tela.',
          fala: en ? `Let's look up some data! 🦷 Opening ${nome}.` : `Vamos consultar! 🦷 Abrindo ${nome}.`,
          acao: en ? 'Open screen →' : 'Abrir a tela →', permissao, parametro: null,
        },
        FILTROS: {
          ic: '🎛️', tit: en ? 'Apply the filters' : 'Aplicar os filtros', quem: en ? 'User' : 'Usuário',
          tela: cfg.modulo[lang], href: cfg.href[lang],
          txt: temFlt
            ? (en ? `Fill the screen filters — ${listaFlt} — and click "Search".` : `Preencha os filtros da tela — ${listaFlt} — e clique em "Pesquisar".`)
            : (en ? 'Fill the filters (period, status, customer, etc.) and click "Search".' : 'Preencha os filtros (período, status, cliente, etc.) e clique em "Pesquisar".'),
          pratica: en ? 'Narrow filters find faster; too narrow hides results.' : 'Filtros certeiros acham mais rápido; restritos demais escondem resultados.',
          fala: en ? "Set the filters and I'll fetch it! 🎛️" : 'Ajusta os filtros que eu busco! 🎛️',
          acao: en ? 'Search →' : 'Pesquisar →', permissao, parametro: null,
        },
        RESULTADOS: {
          ic: '📊', tit: en ? 'Read the results' : 'Ler os resultados', quem: en ? 'System' : 'Sistema',
          tela: cfg.modulo[lang], href: cfg.href[lang],
          txt: en ? `The results appear in the grid. Many report screens also export to Excel/PDF.` : `Os resultados aparecem na grade. Muitas telas de relatório também exportam em Excel/PDF.`,
          pratica: en ? 'Sort/columns help reading; export when you need to share.' : 'Ordenação/colunas ajudam a ler; exporte quando precisar compartilhar.',
          fala: en ? 'There it is! 📊 Read, sort or export. 🦷' : 'Achei! 📊 Lê, ordena ou exporta. 🦷',
          acao: null, permissao: null, parametro: null,
        },
      },
      out: { abriu: en ? 'Done.' : 'Feito.' },
    };
  };

  const textos = { pt: bloco('pt'), en: bloco('en') };

  return {
    slug: cfg.slug, exigeAnexo: false, codigoFinal: null, etapasOrdem, etapaTipo,
    variantes: null, obrigatorios: { _: [] }, pegadinha: { _: null }, alcada: null,
    painel: (s, lang) => {
      const t = textos[lang];
      const st = s.idx >= 2 ? t.painelLabels.lida : (s.idx === 1 ? t.painelLabels.filtrada : t.painelLabels.aberta);
      return [{ k: t.painelLabels.status, v: st }, { k: t.painelLabels.tela, v: cfg.nome[lang] }];
    },
    textos,
  };
}
