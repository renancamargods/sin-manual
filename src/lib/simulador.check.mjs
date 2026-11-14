// Check do motor de simuladores + specs. Roda: node src/lib/simulador.check.mjs
import assert from 'node:assert/strict';
import { estadoInicial, executar, proximaAcao, faltando, envioBloqueado, mensagem } from './simulador.mjs';
import { spec as cliente } from './simuladores/cliente.mjs';
import { spec as controle } from './simuladores/controle-de-funcionalidade.mjs';
import { spec as pedido } from './simuladores/pedido.mjs';
import { spec as aprovacao } from './simuladores/aprovacao-de-pedidos.mjs';
import { spec as consignado } from './simuladores/fechamento-de-consignado.mjs';
import { spec as contrato } from './simuladores/contrato.mjs';
import { spec as lead } from './simuladores/lead.mjs';
import { spec as ocorrencia } from './simuladores/ocorrencia-pfcq.mjs';
import { spec as tdc } from './simuladores/troca-devolucao-cancelamento.mjs';
import { spec as orcamento } from './simuladores/orcamento.mjs';
import { getSpec } from './simuladores/index.mjs';

function roda(spec, cenario, tipos) {
  let s = estadoInicial(spec, cenario);
  for (const [tipo, esperado] of tipos) {
    const r = executar(spec, s, tipo);
    assert.equal(r.outcome, esperado, `${spec.slug} ${tipo}: esperava ${esperado}, veio ${r.outcome}`);
    s = r.estado;
  }
  return s;
}

// --- CLIENTE ---
// 1) caminho feliz PF → ATIVO + código
let pf = roda(cliente, { variante: 'PF' }, [
  ['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'],
  ['ANEXAR', 'anexou'], ['ENVIAR', 'enviou'], ['APROVAR', 'aprovou'],
]);
assert.equal(pf.statusKey, 'ativo');
assert.equal(pf.codigo, '0001004523');

// 2) PJ sem Inscrição Estadual bloqueia salvar
let pj = estadoInicial(cliente, { variante: 'PJ' });
pj = executar(cliente, pj, 'ABRIR').estado;
pj = executar(cliente, pj, 'PREENCHER').estado;
pj = executar(cliente, pj, 'tirarPegadinha').estado;
assert.deepEqual(faltando(cliente, pj), ['inscricaoEstadual']);
assert.equal(executar(cliente, pj, 'SALVAR').outcome, 'falta:inscricaoEstadual');

// 3) enviar antes de salvar e antes de anexar
let c = estadoInicial(cliente, { variante: 'PF' });
c = executar(cliente, c, 'ABRIR').estado;
assert.equal(executar(cliente, c, 'ENVIAR').outcome, 'salve_antes');
c = executar(cliente, c, 'PREENCHER').estado;
c = executar(cliente, c, 'SALVAR').estado;
assert.equal(executar(cliente, c, 'ENVIAR').outcome, 'anexe_antes');
assert.equal(envioBloqueado(cliente, c), true);

// 4) EST não exige e-mail; alçada correta
let est = estadoInicial(cliente, { variante: 'EST' });
est = executar(cliente, est, 'ABRIR').estado;
est = executar(cliente, est, 'PREENCHER').estado;
assert.equal(faltando(cliente, est).length, 0);
assert.ok(!est.campos.email);
assert.deepEqual(cliente.alcada.EST, ['creditoInternacional', 'fiscal']);

// 5) mensagens PT/EN
assert.ok(mensagem(cliente, 'en', 'falta:inscricaoEstadual', pj).texto.includes('State Registration'));
assert.equal(mensagem(cliente, 'pt', 'salve_antes', c).ok, false);

// --- CONTROLE DE FUNCIONALIDADE (CRUD) ---
// 6) caminho feliz → salvo
let cf = roda(controle, {}, [['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou']]);
assert.equal(cf.salvo, true);
assert.equal(proximaAcao(controle, cf), null); // terminal

// 7) salvar sem Chave bloqueia
let cf2 = estadoInicial(controle, {});
cf2 = executar(controle, cf2, 'ABRIR').estado;
cf2 = executar(controle, cf2, 'PREENCHER').estado;
cf2 = executar(controle, cf2, 'tirarPegadinha').estado;
assert.deepEqual(faltando(controle, cf2), ['chave']);
assert.equal(executar(controle, cf2, 'SALVAR').outcome, 'falta:chave');

// 8) controle não tem anexo nem envio
assert.equal(controle.exigeAnexo, false);
assert.equal(Object.values(controle.etapaTipo).includes('ENVIAR'), false);

// --- PEDIDO ---
// 9) caminho feliz nacional (PF) → liberado + código
let ped = roda(pedido, { variante: 'PF' }, [
  ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['ABRIR', 'abriu'],
  ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'], ['ENVIAR', 'enviou'], ['APROVAR', 'aprovou'],
]);
assert.equal(ped.statusKey, 'ativo');
assert.equal(ped.codigo, 'PED-0012345');

// 10) montar sem Previsão de Entrega (pegadinha) bloqueia
let p2 = estadoInicial(pedido, { variante: 'PJ' });
for (let i = 0; i < 3; i++) p2 = executar(pedido, p2, 'ABRIR').estado; // CLIENTE/ESTRUTURA/ITENS
p2 = executar(pedido, p2, 'PREENCHER').estado;
p2 = executar(pedido, p2, 'tirarPegadinha').estado;
assert.deepEqual(faltando(pedido, p2), ['previsaoEntrega']);
assert.equal(executar(pedido, p2, 'SALVAR').outcome, 'falta:previsaoEntrega');

// 11) enviar antes de montar bloqueia
let p3 = estadoInicial(pedido, { variante: 'PF' });
p3 = executar(pedido, p3, 'ABRIR').estado;
assert.equal(executar(pedido, p3, 'ENVIAR').outcome, 'salve_antes');

// 12) comex (Estrangeiro) roteia alçada Comex
let est2 = roda(pedido, { variante: 'EST' }, [
  ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'],
]);
const msgEnv = mensagem(pedido, 'pt', executar(pedido, est2, 'ENVIAR').outcome, executar(pedido, est2, 'ENVIAR').estado);
assert.ok(msgEnv.texto.includes('Comex'), 'Estrangeiro deve rotear Comex');

// --- APROVAÇÃO DE PEDIDOS ---
// 13) walkthrough PIX/Cartão → liberado
let ap = roda(aprovacao, { variante: 'PIXCARD' }, [
  ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['APROVAR', 'aprovou'],
]);
assert.equal(ap.statusKey, 'ativo');
assert.equal(proximaAcao(aprovacao, ap), null);

// --- CRUD (molde) ---
// 14) um cadastro simples gerado pelo molde funciona (cidade)
const cidade = getSpec('cidade');
assert.ok(cidade, 'cidade deve existir no registro');
let cid = roda(cidade, {}, [['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou']]);
assert.equal(cid.salvo, true);
// bloqueio ao salvar sem o obrigatório
let cid2 = estadoInicial(cidade, {});
cid2 = executar(cidade, cid2, 'ABRIR').estado;
assert.ok(executar(cidade, cid2, 'SALVAR').outcome.startsWith('falta:'));

// --- FECHAMENTO DE CONSIGNADO ---
// 15) caminho feliz → faturado + nº pedido
let cg = roda(consignado, { variante: 'CLIENTE' }, [
  ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['ABRIR', 'abriu'],
  ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'], ['APROVAR', 'aprovou'],
]);
assert.equal(cg.statusKey, 'ativo');
assert.equal(cg.codigo, 'PED-CSG-0098');
// 16) salvar sem itens bloqueia
let cg2 = estadoInicial(consignado, { variante: 'NF' });
for (let i = 0; i < 3; i++) cg2 = executar(consignado, cg2, 'ABRIR').estado;
assert.equal(executar(consignado, cg2, 'SALVAR').outcome, 'falta:itens');

// --- CONTRATO ---
// 17) COMZAP exige CPF de assinatura; happy path SEMZAP → assinado/ativo
let ct = estadoInicial(contrato, { variante: 'COMZAP' });
ct = executar(contrato, ct, 'ABRIR').estado;
ct = executar(contrato, ct, 'PREENCHER').estado;
ct = executar(contrato, ct, 'tirarPegadinha').estado; // tira cpfAssinatura
assert.deepEqual(faltando(contrato, ct), ['cpfAssinatura']);
assert.equal(executar(contrato, ct, 'SALVAR').outcome, 'falta:cpfAssinatura');
let ct2 = roda(contrato, { variante: 'SEMZAP' }, [
  ['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'], ['APROVAR', 'aprovou'],
]);
assert.equal(ct2.statusKey, 'ativo');
assert.equal(ct2.codigo, 'CTR-004521');

// --- ONDA 2 ---
// 18) Lead: BASE exige cliente; NOVO converte
let ld = estadoInicial(lead, { variante: 'BASE' });
ld = executar(lead, ld, 'ABRIR').estado;
ld = executar(lead, ld, 'PREENCHER').estado;
ld = executar(lead, ld, 'tirarPegadinha').estado;
assert.deepEqual(faltando(lead, ld), ['cliente']);
let ld2 = roda(lead, { variante: 'NOVO' }, [['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'], ['APROVAR', 'aprovou']]);
assert.equal(ld2.statusKey, 'ativo');

// 19) Ocorrência: walkthrough → encerrado
let oc = roda(ocorrencia, { variante: 'PROC' }, [['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['APROVAR', 'aprovou']]);
assert.equal(oc.statusKey, 'ativo');

// 20) TDC: happy → finalizada; salvar sem itens bloqueia
let td = roda(tdc, { variante: 'DEV' }, [['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'], ['APROVAR', 'aprovou']]);
assert.equal(td.statusKey, 'ativo');
let td2 = executar(tdc, estadoInicial(tdc, { variante: 'TROCA' }), 'ABRIR').estado;
assert.equal(executar(tdc, td2, 'SALVAR').outcome, 'falta:itensDevolucao');

// 21) Orçamento: happy → pedido; salvar sem itens bloqueia
let orc = roda(orcamento, {}, [['ABRIR', 'abriu'], ['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou'], ['APROVAR', 'aprovou']]);
assert.equal(orc.statusKey, 'ativo');
assert.equal(orc.codigo, 'PED-00789');
let orc2 = executar(orcamento, executar(orcamento, estadoInicial(orcamento, {}), 'ABRIR').estado, 'ABRIR').estado;
assert.ok(executar(orcamento, orc2, 'SALVAR').outcome.startsWith('falta:'));

// 22) Produto (molde com campos reais): happy + bloqueio sem SKU
const produto = getSpec('produto');
let pr = roda(produto, {}, [['ABRIR', 'abriu'], ['PREENCHER', 'preencheu'], ['SALVAR', 'salvou']]);
assert.equal(pr.salvo, true);
let pr2 = executar(produto, estadoInicial(produto, {}), 'ABRIR').estado;
assert.equal(executar(produto, pr2, 'SALVAR').outcome, 'falta:sku,descricao,grupo,status');

console.log('OK — motor + 15 specs (Onda 1 + Onda 2 + CRUD): 22 blocos de asserts passaram.');
