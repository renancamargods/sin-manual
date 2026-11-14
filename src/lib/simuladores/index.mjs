// Registro dos simuladores: slug → spec. Nova tela = novo arquivo + 1 linha aqui.
import { spec as cliente } from './cliente.mjs';
import { spec as controleDeFuncionalidade } from './controle-de-funcionalidade.mjs';
import { spec as pedido } from './pedido.mjs';
import { spec as aprovacaoDePedidos } from './aprovacao-de-pedidos.mjs';
import { spec as fechamentoDeConsignado } from './fechamento-de-consignado.mjs';
import { spec as contrato } from './contrato.mjs';
import { spec as lead } from './lead.mjs';
import { spec as ocorrenciaPfcq } from './ocorrencia-pfcq.mjs';
import { spec as tdc } from './troca-devolucao-cancelamento.mjs';
import { spec as orcamento } from './orcamento.mjs';
import { makeCrud } from './crud.mjs';
import { makeConsulta } from './consulta.mjs';
import { CONFIGS } from './_gerados.mjs';

const produto = makeCrud({
  slug: 'produto',
  nome: { pt: 'Produto', en: 'Product' },
  modulo: { pt: 'Produtos → Produto', en: 'Products → Product' },
  href: { pt: '/modulos/produtos/produto', en: '/en/modulos/produtos/produto' },
  permissao: { pt: 'Perfil com acesso ao cadastro de Produto (módulo Produtos).', en: 'Profile with access to Product registration (Products module).' },
  intro: {
    pt: 'Cadastra o produto (SKU até 25, Descrição até 150, Grupo e Status); dimensões e pesos devem ser maiores que 0.',
    en: 'Registers the product (SKU up to 25, Description up to 150, Group and Status); dimensions and weights must be greater than 0.',
  },
  obrigatorios: [
    { key: 'sku', label: { pt: 'Código SKU (até 25)', en: 'SKU code (up to 25)' } },
    { key: 'descricao', label: { pt: 'Descrição (até 150)', en: 'Description (up to 150)' } },
    { key: 'grupo', label: { pt: 'Grupo', en: 'Group' } },
    { key: 'status', label: { pt: 'Status', en: 'Status' } },
  ],
});

// Cadastros simples (CRUD) — telas de referência. Campos reais quando documentados;
// senão, o molde usa "campos obrigatórios da tela" (sem inventar nomes).
const crud = (slug, nomePt, nomeEn, modPt, modEn, hrefBase) =>
  makeCrud({
    slug,
    nome: { pt: nomePt, en: nomeEn },
    modulo: { pt: `${modPt} → ${nomePt}`, en: `${modEn} → ${nomeEn}` },
    href: { pt: hrefBase, en: `/en${hrefBase}` },
    permissao: {
      pt: `Perfil com acesso à tela ${nomePt} (${modPt}), liberado no Autenticador.`,
      en: `Profile with access to the ${nomeEn} screen (${modEn}), granted in the Authenticator.`,
    },
  });

export const SPECS = {
  // processo (sob medida)
  pedido,
  'aprovacao-de-pedidos': aprovacaoDePedidos,
  'fechamento-de-consignado': fechamentoDeConsignado,
  contrato,
  lead,
  'ocorrencia-pfcq': ocorrenciaPfcq,
  'troca-devolucao-cancelamento': tdc,
  orcamento,
  cliente,
  'controle-de-funcionalidade': controleDeFuncionalidade,
  produto,
  // cadastros simples (molde CRUD)
  cidade: crud('cidade', 'Cidade', 'City', 'Administrador', 'Administrator', '/modulos/administrador/cidade'),
  estado: crud('estado', 'Estado', 'State', 'Administrador', 'Administrator', '/modulos/administrador/estado'),
  pais: crud('pais', 'País', 'Country', 'Administrador', 'Administrator', '/modulos/administrador/pais'),
  incoterm: crud('incoterm', 'Incoterm', 'Incoterm', 'Administrador', 'Administrator', '/modulos/administrador/incoterm'),
};

// Simuladores GERADOS (todas as demais telas): cadastro → CRUD; consulta/relatório → walkthrough.
// Campos reais onde conhecidos; senão, "campos obrigatórios da tela" (sem inventar nomes).
for (const c of CONFIGS) {
  if (SPECS[c.slug]) continue; // sob medida tem prioridade
  const cfg = {
    slug: c.slug,
    nome: { pt: c.nomePt, en: c.nomeEn },
    modulo: { pt: `${c.modPt} → ${c.nomePt}`, en: `${c.modEn} → ${c.nomeEn}` },
    href: { pt: c.href, en: `/en${c.href}` },
    permissao: {
      pt: `Perfil com acesso à tela ${c.nomePt} (${c.modPt}), liberado no Autenticador.`,
      en: `Profile with access to the ${c.nomeEn} screen (${c.modEn}), granted in the Authenticator.`,
    },
    obrigatorios: c.reais ? c.reais.map(([key, label]) => ({ key, label })) : undefined,
    filtros: c.filtros || undefined,
    campos: c.campos || undefined,
    intro: c.intro || undefined,
    regras: c.regras || undefined,
  };
  SPECS[c.slug] = c.tipo === 'consulta' ? makeConsulta(cfg) : makeCrud(cfg);
}

export function getSpec(slug) {
  return SPECS[slug] ?? null;
}
