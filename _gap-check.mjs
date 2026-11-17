// Varredura: todo simulador tem página PT+EN, spec no registro e rota na navegação.
import fs from 'node:fs';
import { SPECS, getSpec } from './src/lib/simuladores/index.mjs';
import { CONFIGS } from './src/lib/simuladores/_gerados.mjs';

const PT = 'src/content/docs/modulos/simulador';
const EN = 'src/content/docs/en/modulos/simulador';
const slugsDe = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx').map((f) => f.replace(/\.mdx$/, ''));

const pt = new Set(slugsDe(PT));
const en = new Set(slugsDe(EN));
const HAND = ['pedido', 'aprovacao-de-pedidos', 'aprovacao-de-pedidos-com-ignition', 'aprovacao-de-cliente-sem-ignition', 'aprovacao-de-cliente-com-ignition', 'fechamento-de-consignado', 'contrato', 'lead', 'ocorrencia-pfcq', 'troca-devolucao-cancelamento', 'orcamento', 'cliente', 'controle-de-funcionalidade', 'produto', 'cidade', 'estado', 'pais', 'incoterm'];
const nav = new Set([...HAND, ...CONFIGS.map((c) => c.slug)]);
const gen = new Set(CONFIGS.map((c) => c.slug));

let gaps = 0;
const fail = (msg) => { console.log('  ✗ ' + msg); gaps++; };

// 1) paridade PT/EN
for (const s of pt) if (!en.has(s)) fail(`sem gêmea EN: ${s}`);
for (const s of en) if (!pt.has(s)) fail(`EN sem PT: ${s}`);

// 2) toda página tem spec
for (const s of pt) if (!getSpec(s)) fail(`página sem spec no registro: ${s}`);

// 3) toda página está na navegação (hand ou gerada)
for (const s of pt) if (!nav.has(s)) fail(`página fora da navegação: ${s}`);

// 4) todo config gerado tem página
for (const s of gen) if (!pt.has(s)) fail(`config sem página PT: ${s}`);

// 5) todo spec tem etapas e textos PT/EN coerentes
for (const s of pt) {
  const sp = getSpec(s);
  if (!sp) continue;
  // etapasOrdem pode ser array OU função (variante)=>array (ramificação). Checa a união.
  const ordens = typeof sp.etapasOrdem === 'function'
    ? (sp.variantes || [{ key: '_' }]).map((v) => sp.etapasOrdem(v.key))
    : [sp.etapasOrdem || []];
  const ids = [...new Set(ordens.flat())];
  if (!ids.length) fail(`spec sem etapas: ${s}`);
  if (!sp.textos || !sp.textos.pt || !sp.textos.en) fail(`spec sem textos PT/EN: ${s}`);
  for (const id of ids) {
    if (!sp.textos.pt.etapas[id] || !sp.textos.en.etapas[id]) fail(`etapa ${id} sem texto PT/EN em ${s}`);
  }
}

console.log(`\nPáginas PT: ${pt.size} · EN: ${en.size} · specs no registro: ${Object.keys(SPECS).length} · configs gerados: ${gen.size}`);
console.log(gaps === 0 ? '✅ SEM GAPS — tudo coberto.' : `❌ ${gaps} gap(s) encontrados.`);
