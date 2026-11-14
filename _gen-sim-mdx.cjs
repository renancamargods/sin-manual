// Gera as páginas MDX (PT+EN) das rotinas do módulo Simulador.
// Uso: node _gen-sim-mdx.cjs  (idempotente: reescreve as listadas)
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PT = path.join(ROOT, 'src/content/docs/modulos/simulador');
const EN = path.join(ROOT, 'src/content/docs/en/modulos/simulador');

// Rotinas a gerar: slug, título PT/EN, descrição curta PT/EN, keywords, order.
// Bespoke (pedido, cliente, controle-de-funcionalidade) NÃO entram aqui — já têm MDX próprio.
const ROTINAS = [
  { slug: 'aprovacao-de-pedidos', pt: 'Aprovação de Pedidos', en: 'Order Approval',
    dPt: 'Treino guiado da aprovação do pedido pelas alçadas (fila SEM Ignition), com permissão e parâmetro por etapa.',
    dEn: 'Guided training of order approval through the levels (queue WITHOUT Ignition), with permission and parameter per step.',
    kw: 'aprovação, pedido, alçada, ADM, crédito, cobrança, ignition, regra de aprovação', order: 1 },
  { slug: 'fechamento-de-consignado', pt: 'Fechamento de Consignado', en: 'Consignment Closing',
    dPt: 'Treino guiado do fechamento de consignado: selecionar itens, equalizar desconto e gerar o pedido de faturamento.',
    dEn: 'Guided training of consignment closing: select items, equalize the discount and generate the billing order.',
    kw: 'fechamento de consignado, consignação, faturamento, série, lote, desconto, pedido', order: 2 },
  { slug: 'contrato', pt: 'Contrato', en: 'Contract',
    dPt: 'Treino guiado do cadastro de Contrato, da abertura à assinatura (ZapSign), com permissão e parâmetro por etapa.',
    dEn: 'Guided training of Contract registration, from opening to signing (ZapSign), with permission and parameter per step.',
    kw: 'contrato, vigência, rebate, estrutura comercial, zapsign, assinatura, curso', order: 3 },
  { slug: 'lead', pt: 'Lead', en: 'Lead',
    dPt: 'Treino guiado do Lead, do cadastro à pipeline (Kanban) e à conversão, com permissão e parâmetro por etapa.',
    dEn: 'Guided training of the Lead, from registration to the pipeline (Kanban) and conversion, with permission and parameter per step.',
    kw: 'lead, pipeline, kanban, conversão, valor potencial, canal de entrada', order: 4 },
  { slug: 'ocorrencia-pfcq', pt: 'Ocorrência PFCQ', en: 'PFCQ Occurrence',
    dPt: 'Treino guiado da Ocorrência PFCQ, do recebimento ao encerramento, com permissão e parâmetro por etapa.',
    dEn: 'Guided training of the PFCQ Occurrence, from receipt to closing, with permission and parameter per step.',
    kw: 'ocorrência, pfcq, queixa técnica, qualidade, procedência, anvisa, fda', order: 5 },
  { slug: 'troca-devolucao-cancelamento', pt: 'Troca / Devolução (TDC)', en: 'Exchange / Return (TDC)',
    dPt: 'Treino guiado do Pedido TDC: triagem, itens, apuração de crédito/débito e geração do pedido.',
    dEn: 'Guided training of the TDC Order: triage, items, credit/debit calculation and order generation.',
    kw: 'tdc, troca, devolução, cancelamento, triagem, datamatrix, consignado', order: 6 },
  { slug: 'orcamento', pt: 'Orçamento', en: 'Quote',
    dPt: 'Treino guiado do Orçamento e da geração do pedido, com permissão e parâmetro por etapa.',
    dEn: 'Guided training of the Quote and order generation, with permission and parameter per step.',
    kw: 'orçamento, itens, desconto total, gerar pedido', order: 7 },
  { slug: 'produto', pt: 'Produto', en: 'Product',
    dPt: 'Treino guiado do cadastro de Produto (SKU, descrição, grupo, status e dimensões).',
    dEn: 'Guided training of Product registration (SKU, description, group, status and dimensions).',
    kw: 'produto, sku, descrição, grupo, dimensões, peso, ncm', order: 8 },
  { slug: 'cidade', pt: 'Cidade', en: 'City', dPt: 'Treino guiado do cadastro de Cidade.', dEn: 'Guided training of City registration.', kw: 'cidade, cadastro', order: 50 },
  { slug: 'estado', pt: 'Estado', en: 'State', dPt: 'Treino guiado do cadastro de Estado.', dEn: 'Guided training of State registration.', kw: 'estado, uf, cadastro', order: 51 },
  { slug: 'pais', pt: 'País', en: 'Country', dPt: 'Treino guiado do cadastro de País.', dEn: 'Guided training of Country registration.', kw: 'país, cadastro', order: 52 },
  { slug: 'incoterm', pt: 'Incoterm', en: 'Incoterm', dPt: 'Treino guiado do cadastro de Incoterm.', dEn: 'Guided training of Incoterm registration.', kw: 'incoterm, cadastro', order: 53 },
];

const tpl = ({ slug, title, moduleLabel, lang, desc, kw, order, comp }) =>
  `---
section: modulos
routeSlug: simulador/${slug}
pageType: routine
module: simulador
moduleLabel: ${moduleLabel}
${lang === 'en' ? 'lang: en\n' : ''}title: ${title}
description: "${String(desc).replace(/"/g, '\\"')}"
routineType: ${lang === 'en' ? 'Guided training' : 'Treino guiado'}
permission: ${lang === 'en' ? 'No' : 'Não'}
impact: ${lang === 'en' ? 'Training — nothing is saved in the system' : 'Treino — nada é salvo no sistema'}
keywords: [simulador, treino, treino guiado, ${kw}, dentinho]
tags: [modulo-simulador, treino]
order: ${order}
---

import SimuladorTela from '${comp}';

<SimuladorTela slug="${slug}" lang="${lang}" />
`;

let n = 0;
for (const r of ROTINAS) {
  fs.writeFileSync(path.join(PT, `${r.slug}.mdx`), tpl({
    slug: r.slug, title: r.pt, moduleLabel: 'Simulador', lang: 'pt', desc: r.dPt, kw: r.kw, order: r.order,
    comp: '../../../../components/SimuladorTela.astro',
  }));
  fs.writeFileSync(path.join(EN, `${r.slug}.mdx`), tpl({
    slug: r.slug, title: r.en, moduleLabel: 'Simulator', lang: 'en', desc: r.dEn, kw: r.kw, order: r.order,
    comp: '../../../../../components/SimuladorTela.astro',
  }));
  n += 2;
}
console.log(`Gerados ${n} arquivos MDX (${ROTINAS.length} rotinas PT+EN).`);
