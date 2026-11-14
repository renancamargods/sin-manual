// Gera simuladores para TODAS as telas de módulo (cadastro → CRUD; consulta/relatório → walkthrough).
// Campos reais onde conhecidos (REAIS); genérico no resto (sem inventar nomes).
// Saídas: src/lib/simuladores/_gerados.mjs (CONFIGS), src/data/_simuladorGerados.ts (nav),
//         e as páginas MDX PT+EN. Idempotente. Uso: node _gen-sim-all.cjs
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const DOCS = path.join(ROOT, 'src/content/docs/modulos');
const DOCS_EN = path.join(ROOT, 'src/content/docs/en/modulos');
const SIM_PT = path.join(ROOT, 'src/content/docs/modulos/simulador');
const SIM_EN = path.join(ROOT, 'src/content/docs/en/modulos/simulador');

// Telas já cobertas por spec sob medida (não gerar).
const SKIP = new Set([
  'pedido', 'aprovacao-de-pedidos', 'fechamento-de-consignado', 'contrato', 'lead',
  'ocorrencia-pfcq', 'troca-devolucao-cancelamento', 'orcamento', 'cliente',
  'controle-de-funcionalidade', 'produto', 'cidade', 'estado', 'pais', 'incoterm',
]);

// Campos obrigatórios reais (dos validadores) p/ cadastros da Onda 3.
const L = (pt, en) => ({ pt, en });
const REAIS = {
  empresa: [['codigo', L('Código da Empresa (até 4)', 'Company Code (up to 4)')], ['nome', L('Nome (até 150)', 'Name (up to 150)')], ['nomeFantasia', L('Nome Fantasia (até 150)', 'Trade Name (up to 150)')], ['status', L('Status', 'Status')]],
  lounge: [['codigo', L('Código', 'Code')], ['nome', L('Nome (até 150)', 'Name (up to 150)')], ['razaoSocial', L('Razão Social (até 150)', 'Legal Name (up to 150)')], ['cnpj', L('CNPJ (válido)', 'CNPJ (valid)')], ['codigoErp', L('Código ERP (até 6)', 'ERP Code (up to 6)')], ['empresa', L('Empresa', 'Company')]],
  'condicao-de-pagamento': [['descricao', L('Descrição (até 150)', 'Description (up to 150)')], ['formaPagamento', L('Forma de Pagamento', 'Payment Method')], ['prazoMedio', L('Prazo Médio (0–999)', 'Average Term (0–999)')], ['parcelas', L('Número de Parcelas (0–99)', 'Number of Installments (0–99)')], ['codigoErp', L('Código da Condição ERP (até 4)', 'ERP Condition Code (up to 4)')], ['status', L('Status', 'Status')]],
  usuario: [['nome', L('Nome (até 150)', 'Name (up to 150)')], ['email', L('E-mail (login)', 'E-mail (login)')], ['ativo', L('Ativo', 'Active')], ['formaAuth', L('Forma de Autenticação', 'Authentication Method')], ['usuarioSistema', L('Usuário do Sistema', 'System User')]],
  'mensagem-personalizada': [['mensagem', L('Mensagem', 'Message')], ['tipoMensagem', L('Tipo de Mensagem', 'Message Type')]],
  'regra-de-aprovacao': [['nomeRegra', L('Nome da Regra', 'Rule Name')], ['entidade', L('Entidade de Aprovação', 'Approval Entity')], ['modoExecucao', L('Modo de Execução (Paralelo/Sequencial)', 'Execution Mode (Parallel/Sequential)')], ['status', L('Status', 'Status')]],
  'entidade-de-aprovacao': [['nome', L('Nome', 'Name')], ['status', L('Status', 'Status')]],
  refugo: [['produto', L('Produto', 'Product')], ['lote', L('Lote', 'Batch')], ['status', L('Status', 'Status')]],
  'politica-comercial': [['descricao', L('Descrição (até 150)', 'Description (up to 150)')], ['tipo', L('Tipo', 'Type')], ['vigenciaInicio', L('Vigência Início', 'Term Start')], ['vigenciaTermino', L('Vigência Término (> Início)', 'Term End (> Start)')], ['valorConsiderar', L('Valor a Considerar', 'Value to Consider')], ['status', L('Status', 'Status')]],
};

function fm(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const o = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (mm) o[mm[1]] = mm[2].replace(/^["']|["']$/g, '').trim();
  }
  return o;
}
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const escQ = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Obrigatórios reais dos validadores .NET (prop por tela). Rode _mine-validators.cjs antes.
const VALID = fs.existsSync(path.join(ROOT, '_validadores.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, '_validadores.json'), 'utf8')) : {};
const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'of', 'the', 'a', 'o']);
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).join('');
const normProp = (p) => p.replace(/^Id/, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const ACENTO = { Codigo: 'Código', Descricao: 'Descrição', RazaoSocial: 'Razão Social', Cnpj: 'CNPJ', Pais: 'País', Numero: 'Número', Endereco: 'Endereço', Beneficiario: 'Beneficiário', CodigoEmpresa: 'Código da Empresa', NomeFantasia: 'Nome Fantasia', InscricaoEstadual: 'Inscrição Estadual' };
function humano(prop, lang) {
  const base = prop.replace(/^Id/, '');
  if (lang !== 'en') { if (ACENTO[prop]) return ACENTO[prop]; if (ACENTO[base]) return ACENTO[base]; }
  return base.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}
// Casa um prop do validador com o rótulo real de UI (tabela de campos da tela); senão humaniza.
function rotulo(prop, campos, lang) {
  if (campos && campos.length) {
    const np = normProp(prop);
    const hit = campos.find((c) => { const nc = norm(c); return nc === np || nc.includes(np) || np.includes(nc); });
    if (hit) return hit;
  }
  return humano(prop, lang);
}

function primeiraColDe(bloco) {
  const out = [];
  const re = /\[\s*['"]([^'"]+)['"]/g;
  let mm;
  while ((mm = re.exec(bloco)) && out.length < 8) out.push(mm[1].trim());
  return out;
}
// Extrai a 1ª coluna da 1ª <DocTable> (nomes de filtros/campos da tela).
function primeiraColuna(file) {
  if (!fs.existsSync(file)) return [];
  const m = fs.readFileSync(file, 'utf8').match(/rows=\{\[([\s\S]*?)\]\}/);
  return m ? primeiraColDe(m[1]) : [];
}
// Extrai a 1ª coluna da DocTable cujo cabeçalho começa por "Campo"/"Field"/"Filtro"/"Filter".
function tabelaCampo(file) {
  if (!fs.existsSync(file)) return [];
  const m = fs.readFileSync(file, 'utf8').match(/headers=\{\[\s*['"](?:Campo|Field|Filtro|Filter)['"][\s\S]*?rows=\{\[([\s\S]*?)\]\}/);
  return m ? primeiraColDe(m[1]) : [];
}
const limpa = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[(.+?)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, '').replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
// Extrai o 1º parágrafo da seção "Visão geral"/"Overview" (descrição real da tela).
function visaoGeral(file) {
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/##\s+(?:Vis[aã]o geral|Overview)\s*\r?\n\r?\n([^\n]+)/);
  return m ? limpa(m[1]) : null;
}
// Extrai os bullets "- ..." de uma seção (por título).
function secaoBullets(file, titulos) {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(new RegExp(`##\\s+(?:${titulos})\\s*\\r?\\n([\\s\\S]*?)(?:\\r?\\n##\\s|\\r?\\n<[A-Z])`));
  if (!m) return [];
  const out = [];
  for (const line of m[1].split(/\r?\n/)) {
    const b = line.match(/^\s*[-*]\s+(.+)$/);
    if (b) out.push(limpa(b[1]));
  }
  return out;
}
// Monta regras ricas da tela (descrição + quando usar + o que não faz).
function regrasRicas(file, lang) {
  const en = lang === 'en';
  const vg = visaoGeral(file);
  const quando = secaoBullets(file, en ? 'When to use this screen' : 'Quando usar esta tela');
  const naoFaz = secaoBullets(file, en ? 'What this screen does not do' : 'O que (?:a|esta) tela não faz');
  const r = [];
  if (vg) r.push(vg);
  if (quando.length) r.push((en ? 'When to use: ' : 'Quando usar: ') + quando.slice(0, 5).join('; '));
  for (const nf of naoFaz.slice(0, 4)) r.push(nf);
  return r;
}

const configs = [];
const seen = new Set(SKIP);
for (const modId of fs.readdirSync(DOCS)) {
  if (modId === 'simulador') continue;
  const dir = path.join(DOCS, modId);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.mdx') || f === 'index.mdx') continue;
    const slug = f.replace(/\.mdx$/, '');
    if (seen.has(slug)) continue;
    seen.add(slug);
    const pt = fm(path.join(dir, f));
    const enPath = path.join(DOCS_EN, modId, f);
    const en = fs.existsSync(enPath) ? fm(enPath) : {};
    const rt = (pt.routineType || '').toLowerCase();
    const tipo = rt.includes('cadastro') ? 'crud' : 'consulta';
    // filtros reais (consulta) ou campos reais (cadastro): extraídos da própria página PT/EN
    let filtros = null;
    let campos = null;
    if (tipo === 'consulta') {
      const fpt = tabelaCampo(path.join(dir, f)); // só tabela com cabeçalho Campo/Filtro
      const fen = tabelaCampo(enPath);
      if (fpt.length) filtros = { pt: fpt, en: fen.length === fpt.length ? fen : fpt };
    } else {
      const cpt = tabelaCampo(path.join(dir, f));
      const cen = tabelaCampo(enPath);
      if (cpt.length) campos = { pt: cpt, en: cen.length === cpt.length ? cen : cpt };
    }
    // Obrigatório do bloqueio didático, em ordem de confiança:
    //   1) REAIS (curado dos docs de validação) 2) validador .NET (NotNull/NotEmpty)
    //   3) campo principal da tela (pequenas) 4) genérico.
    let reais = REAIS[slug] || null;
    if (!reais && tipo === 'crud' && VALID[slug] && VALID[slug].length) {
      reais = VALID[slug].map((prop) => [prop.toLowerCase(), {
        pt: rotulo(prop, campos && campos.pt, 'pt'),
        en: rotulo(prop, campos && campos.en, 'en'),
      }]);
    }
    if (!reais && campos && /^(Nome|Códig|Codig|Descriç|Descric|Razã|Razao|SKU|Chave|Mensage|Títul|Titul|Sigla|Identific)/i.test(campos.pt[0])) {
      reais = [['principal', { pt: campos.pt[0], en: (campos.en[0] || campos.pt[0]) }]];
    }
    // regras ricas reais da própria tela (descrição + quando usar + o que não faz)
    const rPt = regrasRicas(path.join(dir, f), 'pt');
    const rEn = regrasRicas(enPath, 'en');
    const regras = rPt.length ? { pt: rPt, en: rEn.length ? rEn : rPt } : null;
    const intro = rPt.length ? { pt: rPt[0], en: (rEn[0] || rPt[0]) } : null;
    configs.push({
      slug, tipo, modId,
      nomePt: pt.title || slug, nomeEn: en.title || pt.title || slug,
      modPt: pt.moduleLabel || modId, modEn: en.moduleLabel || pt.moduleLabel || modId,
      href: `/modulos/${modId}/${slug}`,
      reais,
      filtros, campos, intro, regras,
    });
  }
}
configs.sort((a, b) => a.slug.localeCompare(b.slug));

// _gerados.mjs (dados para o index.mjs montar os specs)
const mjs = 'export const CONFIGS = [\n' + configs.map((c) => {
  const reais = c.reais ? '[' + c.reais.map(([k, l]) => `['${k}',{pt:'${esc(l.pt)}',en:'${esc(l.en)}'}]`).join(',') + ']' : 'null';
  const pack = (o) => o ? `{pt:[${o.pt.map((x) => `'${esc(x)}'`).join(',')}],en:[${o.en.map((x) => `'${esc(x)}'`).join(',')}]}` : 'null';
  const intro = c.intro ? `{pt:'${esc(c.intro.pt)}',en:'${esc(c.intro.en)}'}` : 'null';
  return `  { slug: '${c.slug}', tipo: '${c.tipo}', nomePt: '${esc(c.nomePt)}', nomeEn: '${esc(c.nomeEn)}', modPt: '${esc(c.modPt)}', modEn: '${esc(c.modEn)}', href: '${c.href}', reais: ${reais}, filtros: ${pack(c.filtros)}, campos: ${pack(c.campos)}, intro: ${intro}, regras: ${pack(c.regras)} },`;
}).join('\n') + '\n];\n';
fs.writeFileSync(path.join(ROOT, 'src/lib/simuladores/_gerados.mjs'), mjs);

// _simuladorGerados.ts (navegação: routines + títulos EN)
const rota = configs.map((c) => `  { title: '${esc(c.nomePt)}', slug: '${c.slug}', description: 'Treino guiado da tela ${esc(c.nomePt)} (${esc(c.modPt)}).' },`).join('\n');
const titles = configs.map((c) => `  'simulador/${c.slug}': '${esc(c.nomeEn)}',`).join('\n');
const ts = `// GERADO por _gen-sim-all.cjs — não editar à mão.\nexport interface GenRoutine { title: string; slug: string; description?: string; }\nexport const generatedRoutines: GenRoutine[] = [\n${rota}\n];\nexport const generatedTitlesEn: Record<string, string> = {\n${titles}\n};\n`;
fs.writeFileSync(path.join(ROOT, 'src/data/_simuladorGerados.ts'), ts);

// MDX PT+EN
const mdx = (c, lang) => `---
section: modulos
routeSlug: simulador/${c.slug}
pageType: routine
module: simulador
moduleLabel: ${lang === 'en' ? 'Simulator' : 'Simulador'}
${lang === 'en' ? 'lang: en\n' : ''}title: ${lang === 'en' ? escQ(c.nomeEn) : escQ(c.nomePt)}
description: "Treino guiado da tela ${lang === 'en' ? escQ(c.nomeEn) : escQ(c.nomePt)}."
routineType: ${lang === 'en' ? 'Guided training' : 'Treino guiado'}
permission: ${lang === 'en' ? 'No' : 'Não'}
impact: ${lang === 'en' ? 'Training — nothing is saved in the system' : 'Treino — nada é salvo no sistema'}
keywords: [simulador, treino, treino guiado, ${escQ(c.nomePt)}, ${escQ(c.nomeEn)}, dentinho]
tags: [modulo-simulador, treino]
order: ${100 + configs.indexOf(c)}
---

import SimuladorTela from '${lang === 'en' ? '../../../../../components/SimuladorTela.astro' : '../../../../components/SimuladorTela.astro'}';

<SimuladorTela slug="${c.slug}" lang="${lang}" />
`;
let n = 0;
for (const c of configs) {
  fs.writeFileSync(path.join(SIM_PT, `${c.slug}.mdx`), mdx(c, 'pt'));
  fs.writeFileSync(path.join(SIM_EN, `${c.slug}.mdx`), mdx(c, 'en'));
  n += 2;
}
const crud = configs.filter((c) => c.tipo === 'crud').length;
console.log(`Gerados ${configs.length} simuladores (${crud} CRUD, ${configs.length - crud} consulta) · ${n} MDX · reais: ${configs.filter((c) => c.reais).length}`);
