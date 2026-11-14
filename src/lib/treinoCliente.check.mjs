// Check da lógica do treino Cliente. Roda: node src/lib/treinoCliente.check.mjs
import assert from 'node:assert/strict';
import {
  estadoInicial, executar, proximaAcao, podeEnviar, faltando, mensagem, ALCADA, PEGADINHA,
} from './treinoCliente.mjs';

// corre a sequência de ações, afirmando o outcome de cada uma
function roda(cenario, passos) {
  let s = estadoInicial(cenario);
  for (const [acao, esperado] of passos) {
    const r = executar(s, acao);
    assert.equal(r.outcome, esperado, `${cenario.tipo} ${acao}: esperava ${esperado}, veio ${r.outcome}`);
    s = r.estado;
  }
  return s;
}

// 1) caminho feliz PF → termina ATIVO com SAP
let pf = roda({ tipo: 'PF' }, [
  ['avancar', 'avancou'], ['preencher', 'preencheu'], ['salvar', 'salvou'],
  ['anexar', 'anexou'], ['enviar', 'enviou'], ['aprovar', 'aprovou'],
]);
assert.equal(pf.etapa, 'ATIVO');
assert.ok(pf.codigoSap, 'PF aprovado deve ter código SAP');
assert.equal(pf.statusKey, 'ativo');

// 2) não dá pra enviar antes de salvar (regra central da tela)
let s = estadoInicial({ tipo: 'PF' });
s = executar(s, 'avancar').estado;
assert.equal(executar(s, 'enviar').outcome, 'salve_antes');
assert.equal(podeEnviar(s), false);

// 3) PJ sem Inscrição Estadual bloqueia o salvar
let pj = estadoInicial({ tipo: 'PJ' });
pj = executar(pj, 'avancar').estado;
pj = executar(pj, 'preencher').estado;
pj = executar(pj, 'tirarPegadinha').estado; // tira inscricaoEstadual
assert.deepEqual(faltando(pj), ['inscricaoEstadual']);
const rpj = executar(pj, 'salvar');
assert.equal(rpj.outcome, 'falta:inscricaoEstadual');
assert.equal(rpj.estado.etapa, 'DADOS', 'salvar com falta não avança');

// 4) Estrangeiro: pegadinha é Moeda, e NÃO exige e-mail/credencial
assert.equal(PEGADINHA.EST, 'moeda');
let est = estadoInicial({ tipo: 'EST' });
est = executar(est, 'avancar').estado;
est = executar(est, 'preencher').estado;
assert.equal(faltando(est).length, 0, 'EST preenchido não tem faltas');
assert.ok(!est.campos.email, 'EST não preenche e-mail');

// 5) enviar sem anexar bloqueia
let semAnexo = estadoInicial({ tipo: 'PF' });
semAnexo = executar(semAnexo, 'avancar').estado;
semAnexo = executar(semAnexo, 'preencher').estado;
semAnexo = executar(semAnexo, 'salvar').estado;
assert.equal(executar(semAnexo, 'enviar').outcome, 'anexe_antes');

// 6) alçada por tipo
assert.deepEqual(ALCADA.PF, ['credito']);
assert.deepEqual(ALCADA.PJ, ['credito', 'fiscal']);
assert.deepEqual(ALCADA.EST, ['creditoInternacional', 'fiscal']);

// 7) próxima ação do caminho feliz
assert.equal(proximaAcao(estadoInicial({ tipo: 'PF' })), 'avancar');

// 8) mensagens traduzem outcome (PT e EN)
assert.equal(mensagem('pt', 'enviou', pf).ok, true);
assert.ok(mensagem('en', 'falta:inscricaoEstadual', pj).texto.includes('State Registration'));
assert.equal(mensagem('pt', 'salve_antes', s).ok, false);

console.log('OK — treinoCliente: 8 blocos de asserts passaram.');
