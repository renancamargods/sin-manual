// Minera os validadores FluentValidation do .NET (SIN-Sales). Extrai, por tela:
//   - obrigatórios (.NotNull()/.NotEmpty())            -> _validadores.json (compat: slug->[props])
//   - regra RICA por campo (limite, faixa, >0, msg)    -> _regras.json  (slug->[{campo,...}])
// A chave de mensagem (WithMessage) vira a ÂNCORA de rastreabilidade código<->doc<->simulador.
// Tira comentários antes do regex (senão regra comentada /* */ vira falso-positivo).
// Uso: node _mine-validators.cjs
const fs = require('fs');
const path = require('path');

const NET = 'C:/Users/renan.camargo/Desktop/SIN-Sales';
const DIRS = [
  path.join(NET, 'CrmSin.Domain.Entities'),
  path.join(NET, 'CrmSin.Application.Administrador'),
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('Validator.cs')) out.push(p);
  }
  return out;
}

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();

// Dicionário de termos p/ rótulo bilíngue a partir do nome da propriedade .NET.
// Token desconhecido cai no próprio token (separado por camelCase). Sufixos viram unidade.
const TERMO = {
  codigo: ['Código', 'Code'], descricao: ['Descrição', 'Description'], sku: ['SKU', 'SKU'],
  ean: ['EAN', 'EAN'], ncm: ['NCM', 'NCM'], ipi: ['IPI', 'IPI'], cfop: ['CFOP', 'CFOP'], gtin: ['GTIN', 'GTIN'],
  peso: ['Peso', 'Weight'], bruto: ['Bruto', 'Gross'], liquido: ['Líquido', 'Net'],
  aliquota: ['Alíquota', 'Rate'], porcentagem: ['(%)', '(%)'], kg: ['(kg)', '(kg)'],
  unidade: ['Unidade', 'Unit'], medida: ['Medida', 'Measure'], padrao: ['Padrão', 'Default'], basica: ['Básica', 'Basic'],
  grupo: ['Grupo', 'Group'], status: ['Status', 'Status'], serializado: ['Serializado', 'Serialized'],
  cubagem: ['Cubagem', 'Cubage'], largura: ['Largura', 'Width'], altura: ['Altura', 'Height'],
  complemento: ['Complemento', 'Complement'], barras: ['Barras', 'Bars'], de: ['de', 'of'],
  nacional: ['Nacional', 'National'], internacional: ['Internacional', 'International'],
  maximo: ['Máximo', 'Maximum'], minimo: ['Mínimo', 'Minimum'], desconto: ['Desconto', 'Discount'],
  nome: ['Nome', 'Name'], fantasia: ['Fantasia', 'Trade'], razao: ['Razão', 'Corporate'], social: ['Social', 'Name'],
  email: ['E-mail', 'Email'], telefone: ['Telefone', 'Phone'], documento: ['Documento', 'Document'],
  tipo: ['Tipo', 'Type'], data: ['Data', 'Date'], valor: ['Valor', 'Value'], quantidade: ['Quantidade', 'Quantity'],
  preco: ['Preço', 'Price'], observacao: ['Observação', 'Note'], ativo: ['Ativo', 'Active'],
  empresa: ['Empresa', 'Company'], cliente: ['Cliente', 'Customer'], produto: ['Produto', 'Product'], pedido: ['Pedido', 'Order'],
  endereco: ['Endereço', 'Address'], cidade: ['Cidade', 'City'], estado: ['Estado', 'State'], pais: ['País', 'Country'],
  credencial: ['Credencial', 'Credential'], consultor: ['Consultor', 'Consultant'], responsavel: ['Responsável', 'Owner'],
};
const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function humanoBi(prop) {
  let toks = prop.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').split(' ');
  if (toks[0] === 'Id' && toks.length > 1) toks = toks.slice(1); // "IdGrupo" -> "Grupo"
  const pick = (i) => toks.map((t) => (TERMO[semAcento(t)] ? TERMO[semAcento(t)][i] : t)).join(' ').replace(/\s+/g, ' ').trim();
  return { pt: pick(0), en: pick(1) };
}
const semComentarios = (raw) => raw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
const num = (v) => { const n = parseFloat(String(v).replace('F', '')); return Number.isFinite(n) ? n : undefined; };

const validadores = {}; // slug -> [props obrigatórias]  (compat com o gerador)
const regras = {};       // slug -> [{ prop, campo, obrigatorio?, maxLength?, min?, minInclusivo?, max?, faixa?, msgKey?, origem }]

for (const file of walk(DIRS[0]).concat(walk(DIRS[1]))) {
  const bruto = fs.readFileSync(file, 'utf8');
  const cls = bruto.match(/class\s+(\w+)Validator\s*:\s*AbstractValidator<\s*(\w+?)(?:ViewModel)?\s*>/);
  if (!cls) continue;
  const slug = kebab(cls[2] || cls[1]);
  const origem = path.basename(file);
  const raw = semComentarios(bruto);

  // Cada cadeia começa num RuleFor( e vai até o próximo RuleFor( (ou fim).
  const segs = raw.split(/RuleFor\s*\(/).slice(1);
  const porProp = {}; // prop -> regra agregada (mesma prop pode ter vários RuleFor)

  for (const seg of segs) {
    const mp = seg.match(/^\s*\w+\s*=>\s*\w+\.(\w+)\s*\)/);
    if (!mp) continue;
    const prop = mp[1];
    const r = porProp[prop] || (porProp[prop] = { prop, campo: humanoBi(prop), origem });

    if (/\.\s*(NotNull|NotEmpty)\b/.test(seg)) r.obrigatorio = true;
    const ml = seg.match(/\.\s*MaximumLength\s*\(\s*(\d+)/);         if (ml) r.maxLength = +ml[1];
    const ib = seg.match(/\.\s*InclusiveBetween\s*\(\s*([\d.]+F?)\s*,\s*([\d.]+F?)/);
    if (ib) r.faixa = [num(ib[1]), num(ib[2])];
    const gt = seg.match(/\.\s*GreaterThan\s*\(\s*([\d.]+F?)/);       if (gt) { r.min = num(gt[1]); r.minInclusivo = false; }
    const ge = seg.match(/\.\s*GreaterThanOrEqualTo\s*\(\s*([\d.]+F?)/); if (ge) { r.min = num(ge[1]); r.minInclusivo = true; }
    const le = seg.match(/\.\s*LessThanOrEqualTo\s*\(\s*([\d.]+F?)/);  if (le) r.max = num(le[1]);
    const lt = seg.match(/\.\s*LessThan\s*\(\s*([\d.]+F?)/);          if (lt) r.max = num(lt[1]);
    const wm = seg.match(/\.\s*WithMessage\s*\([^)]*GetDisplay\s*\(\s*"([^"]+)"/);
    if (wm && (/Required/.test(wm[1]) || !r.msgKey)) r.msgKey = wm[1]; // prioriza a chave de obrigatório
  }

  const lista = Object.values(porProp);
  if (!lista.length) continue;
  regras[slug] = (regras[slug] || []).concat(lista);
  const obrig = lista.filter((r) => r.obrigatorio).map((r) => r.prop);
  if (obrig.length) validadores[slug] = Array.from(new Set((validadores[slug] || []).concat(obrig)));
}

fs.writeFileSync(path.join(__dirname, '_validadores.json'), JSON.stringify(validadores, null, 0));
fs.writeFileSync(path.join(__dirname, 'src/lib/simuladores/_regras.json'), JSON.stringify(regras, null, 0));
const nRegras = Object.values(regras).reduce((a, l) => a + l.length, 0);
console.log(`Minerados: ${Object.keys(validadores).length} telas com obrigatórios, ${Object.keys(regras).length} telas com regras (${nRegras} campos).`);
