// Minera os validadores FluentValidation do .NET (SIN-Sales) e extrai os campos
// OBRIGATÓRIOS reais (.NotNull()/.NotEmpty()) por tela. Saída: src/lib/simuladores/_validadores.mjs
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

const map = {}; // slug -> [props]
for (const file of walk(DIRS[0]).concat(walk(DIRS[1]))) {
  const raw = fs.readFileSync(file, 'utf8');
  const cls = raw.match(/class\s+(\w+)Validator\s*:\s*AbstractValidator<\s*(\w+?)(?:ViewModel)?\s*>/);
  if (!cls) continue;
  const entity = cls[2] || cls[1];
  const slug = kebab(entity);
  // RuleFor(x => x.Prop) ... .NotNull()/.NotEmpty()  (podem estar em linhas separadas)
  const props = new Set();
  const re = /RuleFor\(\s*\w+\s*=>\s*\w+\.(\w+)\s*\)\s*\.\s*(NotNull|NotEmpty)\b/g;
  let m;
  while ((m = re.exec(raw))) props.add(m[1]);
  if (props.size) {
    map[slug] = map[slug] ? Array.from(new Set(map[slug].concat([...props]))) : [...props];
  }
}

fs.writeFileSync(path.join(__dirname, '_validadores.json'), JSON.stringify(map, null, 0));
console.log(`Minerados ${Object.keys(map).length} validadores com obrigatórios.`);
