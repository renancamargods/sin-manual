// Worker do manual S.I.N — serve os assets estáticos (dist), protege a seção
// "Doc. Técnicas e Configurações" (/tecnico e /en/tecnico) com Basic Auth e
// atende a IA do manual ("Dentinho") em POST /api/chat.
// Senha no secret SITE_PASS (usuário opcional em SITE_USER, padrão "sin").
// A IA usa Workers AI (binding AI) — cota grátis da Cloudflare, sem chave externa.
// Nunca versionar senha/credenciais aqui.

// Caminhos protegidos: /tecnico, /en/tecnico e tudo abaixo deles.
// Também protege o índice de busca, que embute o corpo das páginas técnicas.
const PROTECTED = [
  /^\/tecnico(\/|$)/,
  /^\/en\/tecnico(\/|$)/,
];

// Modelo aberto do Workers AI (cota grátis). Grounded no manual, 8B basta.
// (llama-3.1-8b-instruct foi descontinuado em 2026-05; usar a variante fp8.)
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';
const MAX_PERGUNTA = 1000; // limita abuso/custo
const TOP_TRECHOS = 6;

function precisaAutenticar(pathname) {
  return PROTECTED.some((re) => re.test(pathname));
}

// Credenciais Basic Auth válidas? Usado pelo gate das páginas e pela IA
// (para decidir se pode consultar o índice técnico).
function credenciaisOk(request, env) {
  const senhaEsperada = env.SITE_PASS;
  const usuarioEsperado = env.SITE_USER || 'sin';
  if (!senhaEsperada) return false;

  const header = request.headers.get('Authorization') || '';
  const [esquema, codificado] = header.split(' ');
  if (esquema !== 'Basic' || !codificado) return false;

  let decodificado = '';
  try {
    decodificado = atob(codificado);
  } catch {
    return false;
  }
  const sep = decodificado.indexOf(':');
  const usuario = sep >= 0 ? decodificado.slice(0, sep) : '';
  const senha = sep >= 0 ? decodificado.slice(sep + 1) : '';
  return usuario === usuarioEsperado && senha === senhaEsperada;
}

function pedirLogin() {
  return new Response('Autenticação necessária para a Documentação Técnica.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Doc. Tecnicas - Manual SIN", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

// --- Busca por palavra (mesmo espírito do SearchBox) --------------------------
function normalizar(v) {
  return (v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function pontuar(item, termos) {
  const titulo = normalizar(item.title);
  const meta = normalizar([item.description, item.module, ...(item.keywords ?? [])].join(' '));
  const corpo = normalizar(item.content ?? '');
  let score = 0;
  for (const t of termos) {
    if (!t) continue;
    if (titulo.includes(t)) score += 4;
    if (meta.includes(t)) score += 2;
    if (corpo.includes(t)) score += 1;
  }
  return score;
}

// Carrega um índice de busca servido como asset estático (contorna o Basic Auth
// do Worker chamando ASSETS direto — o acesso é controlado aqui no código).
async function carregarIndice(env, origin, caminho) {
  try {
    const r = await env.ASSETS.fetch(new Request(new URL(caminho, origin)));
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Checador: GET /api/chat faz um "ping" no modelo e devolve o resultado/erro
// cru. Serve só para diagnosticar (binding presente? modelo responde?).
async function checarIA(env) {
  const info = { aiBinding: !!env.AI, model: AI_MODEL };
  if (!env.AI) return json({ ...info, ok: false, reason: 'env.AI ausente (binding não aplicado).' });
  try {
    const out = await env.AI.run(AI_MODEL, {
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 8,
    });
    return json({ ...info, ok: true, sample: out?.response ?? out });
  } catch (err) {
    return json({ ...info, ok: false, error: String(err?.message || err) }, 502);
  }
}

async function tratarChat(request, env, url) {
  if (request.method === 'GET') return checarIA(env);
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  if (!env.AI) return json({ error: 'IA não configurada no Worker.' }, 503);

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return json({ error: 'JSON inválido.' }, 400);
  }

  const pergunta = String(corpo?.message ?? '').trim().slice(0, MAX_PERGUNTA);
  const lang = corpo?.lang === 'en' ? 'en' : 'pt';
  if (!pergunta) return json({ error: 'Pergunta vazia.' }, 400);

  // Índice público sempre; técnico só se a requisição estiver autenticada.
  const autenticado = credenciaisOk(request, env);
  const base = lang === 'en' ? '/en' : '';
  const indices = [await carregarIndice(env, url.origin, `${base}/search-index.json`)];
  if (autenticado) {
    indices.push(await carregarIndice(env, url.origin, `/tecnico/search-index.json`));
  }
  const itens = indices.flat().filter((it) => (it.lang ?? 'pt') === lang);

  const termos = normalizar(pergunta).split(/\s+/).filter((t) => t.length > 1);
  const ranque = itens
    .map((item) => ({ item, score: pontuar(item, termos) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_TRECHOS)
    .map((r) => r.item);

  // Sem nada no manual: não chama a IA (economiza e não inventa).
  if (ranque.length === 0) {
    const semResposta =
      lang === 'en'
        ? 'I could not find this in the manual. Try rephrasing or use the search at the top.'
        : 'Não encontrei isso no manual. Tente reformular ou use a busca no topo da página.';
    return json({ answer: semResposta, sources: [] });
  }

  const contexto = ranque
    .map((it, i) => `[${i + 1}] ${it.title} (${it.href})\n${(it.content ?? it.description ?? '').slice(0, 1200)}`)
    .join('\n\n');

  const sistema =
    lang === 'en'
      ? `You are "Dentinho", the friendly assistant of the S.I.N Implant System user manual. Answer ONLY using the CONTEXT below (excerpts from the manual). If the answer is not in the context, say you did not find it in the manual and suggest using the search — never invent.
Format your answer in Markdown:
- Short paragraphs separated by a blank line.
- Use **bold** for important screen/field names and key terms.
- Use numbered or "-" lists when it helps.
- Be direct and concise. Do NOT say "see the topics above/below" or "open the manual and read" — the page links already appear automatically below your answer.
Answer in English. Do not discuss topics outside the manual.

CONTEXT:
${contexto}`
      : `Você é o "Dentinho", assistente simpático do manual do usuário do S.I.N Implant System. Responda SOMENTE com base no CONTEXTO abaixo (trechos do manual). Se a resposta não estiver no contexto, diga que não encontrou no manual e sugira usar a busca — nunca invente.
Formate a resposta em Markdown:
- Parágrafos curtos, separados por uma linha em branco.
- Use **negrito** nos nomes de tela/campo importantes e termos-chave.
- Use listas numeradas ou com "-" quando ajudar.
- Seja direto e conciso. NÃO diga "veja os tópicos acima/abaixo" nem "acesse o manual e leia" — os links das páginas já aparecem automaticamente abaixo da sua resposta.
Responda em português. Não trate de assuntos fora do manual.

CONTEXTO:
${contexto}`;

  let resposta;
  try {
    const out = await env.AI.run(AI_MODEL, {
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: pergunta },
      ],
      max_tokens: 512,
    });
    resposta = (out?.response ?? '').trim();
  } catch (err) {
    console.error('AI.run falhou:', err);
    return json(
      { error: 'A IA está indisponível no momento. Tente novamente.', detail: String(err?.message || err) },
      502,
    );
  }

  if (!resposta) {
    resposta =
      lang === 'en'
        ? 'I could not generate an answer now. Please try again.'
        : 'Não consegui gerar uma resposta agora. Tente novamente.';
  }

  const sources = ranque.map((it) => ({ title: it.title, href: it.href }));
  return json({ answer: resposta, sources });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // IA do manual.
    if (url.pathname === '/api/chat') {
      return tratarChat(request, env, url);
    }

    if (precisaAutenticar(url.pathname)) {
      // Falha fechada: sem senha configurada, não expõe a seção técnica.
      if (!env.SITE_PASS) {
        return new Response(
          'Proteção não configurada: defina o secret SITE_PASS no Worker.',
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        );
      }
      if (!credenciaisOk(request, env)) return pedirLogin();
    }

    // Autenticado (ou caminho público): serve o asset estático normalmente.
    return env.ASSETS.fetch(request);
  },
};
