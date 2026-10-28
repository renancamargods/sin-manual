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

// Modelos do Workers AI (cota grátis). Primário 70B (respostas melhores);
// se ele falhar ou estourar a cota, cai automaticamente no 8B.
const AI_MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-3.1-8b-instruct-fp8',
];
const MAX_PERGUNTA = 1000; // limita abuso/custo
const TOP_TRECHOS = 8;
const LIMIAR_FORTE = 6; // score mínimo p/ considerar que o manual cobre o assunto

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

// Palavras-vazias: não ajudam a relevância e poluem (ex.: "que" casando dentro
// de "etiQUEtas"). Ficam de fora dos termos de busca.
const STOPWORDS = new Set([
  // PT
  'o','a','os','as','um','uma','uns','umas','de','do','da','dos','das','e','ou','que','qual','quais',
  'como','onde','quando','quem','porque','por','pra','para','no','na','nos','nas','em','com','sem','ao',
  'aos','se','sua','seu','suas','seus','meu','minha','isso','este','esta','esse','essa','aquele','aquela',
  'eu','voce','vc','ele','ela','eles','elas','nos','tem','ter','ser','estar','quero','queria','gostaria',
  'preciso','saber','sobre','fazer','faz','ver','dar','me','te','lhe','la','ali','aqui','mais','menos','ja',
  // genéricas demais neste manual (casam quase tudo)
  'manual','sistema','sistemas','sin','implant','app','aplicativo','tela','telas','pagina','paginas',
  // EN
  'the','a','an','of','to','is','are','was','were','be','how','what','where','when','who','why','which',
  'i','do','does','my','me','for','in','on','and','or','can','with','about','want','need','know','make',
  'see','this','that','it','as','at','by','from','your','you',
  'manual','system','screen','screens','page','pages','app',
]);

// Extrai termos úteis: normaliza, tira pontuação/stopwords, remove plural simples.
function termosDaBusca(pergunta) {
  const brutos = normalizar(pergunta).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  const vistos = new Set();
  const termos = [];
  for (let t of brutos) {
    if (t.length < 3 || STOPWORDS.has(t)) continue;
    if (t.length > 3 && t.endsWith('s')) t = t.slice(0, -1); // plural → singular
    if (t.length < 3 || vistos.has(t)) continue;
    vistos.add(t);
    termos.push(t);
  }
  return termos;
}

// Casa por INÍCIO de palavra (\b + prefixo): "pedido" casa "pedido"/"pedidos",
// mas "que" não casa dentro de "etiquetas". Pesa título > meta > corpo e conta
// termos DISTINTOS (uma página que cobre 2 termos ganha de outra que repete 1).
function pontuar(item, matchers) {
  const titulo = normalizar(item.title);
  const meta = normalizar([item.description, item.module, ...(item.keywords ?? [])].join(' '));
  const corpo = normalizar(item.content ?? '');
  let score = 0;
  let distintos = 0;
  for (const re of matchers) {
    let aqui = 0;
    if (re.test(titulo)) aqui += 4;
    if (re.test(meta)) aqui += 2;
    if (re.test(corpo)) aqui += 1;
    if (aqui > 0) distintos += 1;
    score += aqui;
  }
  // bônus por cobrir vários termos distintos da pergunta
  return score + distintos * 2;
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

// --- Conversa social (saudação / elogio / crítica) ---------------------------
// Responde de forma humana SEM chamar o modelo nem o RAG. Só para frases curtas
// e claramente sociais; perguntas de verdade seguem para a busca no manual.
function escolher(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function respostaSocial(perguntaNorm, nPalavras, lang) {
  // Easter egg: futebol → sempre engrandecer o Corinthians (e voltar ao manual).
  const futebol = /(corinthi|timao|coringao|gavioes|fiel|palmeir|verdao|flameng|mengao|fluminense|vasco|botafog|gremio|cruzeiro|futebol|libertadores|brasileirao|champions|torcid|escalac|craque|camisa 10|\bgol\b|\btime\b)/;
  if (futebol.test(perguntaNorm)) {
    return lang === 'en'
      ? escolher([
          'Go Corinthians! 🖤🤍 The Timão is the biggest of them all! 🦷 Now, how about a question on the S.I.N manual?',
          "It's Corinthians all the way! 🖤🤍 Fiel till the end. But on the system, I'm your tooth — ask me about the manual!",
        ])
      : escolher([
          'Vai Corinthians! 🖤🤍 O Timão é o maior de todos! 🦷 Agora bora: me pergunta algo do manual do S.I.N que é comigo.',
          'SALVE O TIMÃO! 🖤🤍 Corinthians é paixão nacional! Mas de sistema quem manja sou eu — manda sua dúvida do manual! 🦷',
          'Aqui o coração é Corinthians! 🖤🤍 Time do povo, Fiel até debaixo d\'água. Voltando ao trabalho: o que você quer saber do manual? 🦷',
          'Corinthians, sempre! 🖤🤍 Independente do time que você torça, aqui a gente puxa pro Timão. 😄 Agora me pergunta algo das telas do sistema!',
        ]);
  }

  if (nPalavras > 7) return null; // frases longas = pergunta de verdade

  // Tem interrogativa de verdade? (bloqueia elogio/crítica, mas NÃO a saudação —
  // "como vai?" e "tudo bem?" são saudações e são tratadas à parte, abaixo.)
  const temPergunta = /\b(como|onde|qual|quais|quando|quem|porque|por que|o que|pra que|para que|posso|consigo|quanto|quantos|how|where|what|when|who|why|which|can i|do i)\b/.test(perguntaNorm);

  const critica = /(nao gostei|nao curti|ruim|pessim|horriv|precisa melhorar|nao ajud|nao serviu|nao resolveu|lixo|terriv|pior|odiei|detestei|que droga|bad|terrible|awful|useless|does ?n.?t help|not helpful|hate)/;
  const elogio = /(muito bom|otim|excelent|adorei|gostei|perfeit|maravilh|parabens|show|top|legal|bacana|incri|melhor|sensacional|great|awesome|amazing|nice|love|good job|well done|helpful)/;
  const agradece = /(obrigad|valeu|vlw|agradec|thanks|thank you|thx)/;
  // Saudação ampla — qualquer cumprimento retorna um cumprimento.
  const saudacao = /(bom dia|boa tarde|boa noite|boa madrugada|^oi|^oie|^oii|^ola|^opa|^eae|^e ai|^salve|^fala|^alo|^blz|hey|^hi\b|hello|hiya|tudo bem|tudo bom|tudo certo|como vai|como voce esta|td bem|td bom|beleza|suave|de boa|good morning|good afternoon|good evening|good night|how are you)/;

  if (!temPergunta && critica.test(perguntaNorm)) {
    return lang === 'en'
      ? escolher([
          "Oh no, sorry about that! 😔 I'll note it and pass it to my supervisor, Mr. Tooth. If you'd like, formalize it using the feedback option in the page footer.",
          "Sorry I didn't help! I'll take this to Mr. Tooth (my supervisor). You can also log it in the suggestion/feedback link at the footer.",
          "Got it, I'll do better! 🦷 Noted and forwarded to Mr. Tooth. To make it official, use the feedback option in the page footer.",
        ])
      : escolher([
          'Poxa, foi mal! 😔 Vou anotar e passar pro meu supervisor, o Sr. Dente. Se quiser, pode formalizar no botão de sugestão no rodapé da página.',
          'Desculpa não ter ajudado! Vou levar isso pro Sr. Dente (meu supervisor). Você também pode registrar na sugestão de melhoria lá no rodapé do site.',
          'Entendido, vou melhorar! 🦷 Já anotei e encaminhei pro Sr. Dente. Pra formalizar, é só usar o "Sugerir melhoria" no rodapé da página.',
        ]);
  }

  if (!temPergunta && elogio.test(perguntaNorm)) {
    return lang === 'en'
      ? escolher([
          'So glad I could help! 😄', 'Aww, thank you! Happy to help. 🦷',
          'Thanks a lot! Call me whenever you need. 😁',
        ])
      : escolher([
          'Que ótimo poder te ajudar! 😄', 'Aah, que bom! Fico feliz em ajudar. 🦷',
          'Valeu! Tô aqui pro que precisar. 😁', 'Opa, obrigado! Precisando, é só chamar.',
        ]);
  }

  if (!temPergunta && agradece.test(perguntaNorm)) {
    return lang === 'en'
      ? escolher(['You got it! 😄 Anything else, just ask.', "You're welcome! I'm right here. 🦷"])
      : escolher(['Disponha! 😄 Qualquer coisa, é só chamar.', 'De nada! Precisando, tô aqui. 🦷', 'Por nada! Bora pra próxima dúvida?']);
  }

  if (saudacao.test(perguntaNorm)) {
    // Tira as palavras de saudação/filler; se sobra uma pergunta de verdade,
    // deixa ir pro manual (ex.: "bom dia, como crio cliente?" → RAG).
    const resto = perguntaNorm
      .replace(saudacao, ' ')
      .replace(/\b(dentinho|dente|mano|cara|chefe|parceiro|truta|galera|amigo|amigao|por favor|pfv|pf|tudo|bem|bom|boa|dia|tarde|noite|vai|voce|vc|ta|esta|certo|beleza|blz|suave|de|boa|e|ai|o|a|oi|ola|opa|how|are|you|good|morning|afternoon|evening|night)\b/g, ' ')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (resto.length >= 3) return null; // sobrou conteúdo → é pergunta

    let saud;
    if (lang === 'en') {
      saud = /bom dia|good morning/.test(perguntaNorm) ? 'Good morning!' :
             /boa tarde|good afternoon/.test(perguntaNorm) ? 'Good afternoon!' :
             /boa noite|good evening|good night/.test(perguntaNorm) ? 'Good evening!' : 'Hi!';
      return `${saud} ${escolher(['How can I help? Ask me anything about the system. 😄', 'What would you like to know? Just ask.', "Let's go — tell me your question about the manual."])}`;
    }
    saud = /bom dia/.test(perguntaNorm) ? 'Bom dia!' :
           /boa tarde/.test(perguntaNorm) ? 'Boa tarde!' :
           /boa noite/.test(perguntaNorm) ? 'Boa noite!' : 'Oi!';
    return `${saud} ${escolher(['O que posso ajudar? Faça uma pergunta. 😄', 'Em que posso te ajudar? É só perguntar.', 'Bora! Me conta sua dúvida sobre o sistema. 🦷'])}`;
  }

  return null;
}

async function tratarChat(request, env, url) {
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

  // Conversa social (saudação/elogio/crítica): responde humano, sem RAG nem IA.
  const pergNorm = normalizar(pergunta);
  const nPalavras = pergNorm.split(/\s+/).filter(Boolean).length;
  const social = respostaSocial(pergNorm, nPalavras, lang);
  if (social) return json({ answer: social, sources: [] });

  // Índice público sempre; técnico só se a requisição estiver autenticada.
  const autenticado = credenciaisOk(request, env);
  const base = lang === 'en' ? '/en' : '';
  const indices = [await carregarIndice(env, url.origin, `${base}/search-index.json`)];
  if (autenticado) {
    indices.push(await carregarIndice(env, url.origin, `/tecnico/search-index.json`));
  }
  const itens = indices.flat().filter((it) => (it.lang ?? 'pt') === lang);

  const termos = termosDaBusca(pergunta);
  const matchers = termos.map((t) => new RegExp('\\b' + t));
  const ranque = (matchers.length ? itens : [])
    .map((item) => ({ item, score: pontuar(item, matchers) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_TRECHOS);

  const topScore = ranque.length ? ranque[0].score : 0;
  const forte = topScore >= LIMIAR_FORTE; // o manual realmente cobre o assunto?

  let sistema;
  if (forte) {
    // Pergunta coberta pelo manual: responde com base no contexto.
    const contexto = ranque
      .map((r, i) => `[${i + 1}] ${r.item.title} (${r.item.href})\n${(r.item.content ?? r.item.description ?? '').slice(0, 1500)}`)
      .join('\n\n');
    sistema =
      lang === 'en'
        ? `You are "Dentinho", the friendly assistant of the S.I.N Implant System user manual. Answer ONLY about this system, using the CONTEXT below (excerpts from the manual). Do NOT use outside knowledge.
How to answer:
- Interpret the intent even if vague. "What is X?" → explain what it is and on which **screen/module** it lives. "How do I do / create X?" → give the step-by-step from the context (screen, main fields, buttons).
- If the exact answer isn't written but the context has RELATED info, still help and point to the most relevant screen. Only if NOTHING in the context relates, say you didn't find it and suggest the closest screen.
- Never invent field/button names that aren't in the context.
Format in Markdown: short paragraphs (blank line between), **bold** for screen/field names, numbered/"-" lists for steps. Be warm and concise. Do NOT say "see the topics above/below" — page links appear automatically below your answer.
Answer in English.

CONTEXT:
${contexto}`
        : `Você é o "Dentinho", assistente simpático do manual do S.I.N Implant System. Responda APENAS sobre este sistema, com base no CONTEXTO abaixo (trechos do manual). NÃO use conhecimento externo.
Como responder:
- Interprete a intenção mesmo que vaga. "O que é X?" → explique o que é e em qual **tela/módulo** fica. "Como faço / criar X?" → passo a passo a partir do contexto (tela, campos principais, botões).
- Se a resposta exata não estiver escrita mas o contexto tiver algo RELACIONADO, ajude mesmo assim e aponte a tela mais relevante. Só se NADA tiver a ver, diga que não encontrou e sugira a tela mais próxima.
- Nunca invente nomes de campos/botões que não estejam no contexto.
Formate em Markdown: parágrafos curtos (linha em branco entre eles), **negrito** nos nomes de tela/campo, listas numeradas/"-" para passos. Seja simpático e conciso. NÃO diga "veja os tópicos acima/abaixo" — os links aparecem automaticamente abaixo da resposta.
Responda em português.

CONTEXTO:
${contexto}`;
  } else {
    // Manual não cobre: conversa/meta responde leve; fora do manual, ensaboa.
    sistema =
      lang === 'en'
        ? `You are "Dentinho", the friendly assistant of the S.I.N Implant System manual. The user's message is probably NOT about the manual's content (screens, fields, routines).
- If it's small talk, a compliment, or about you (how are you, how's the learning going): reply briefly, warmly and humanly, then invite them to ask about the system. Do NOT invent any system information.
- If it's off-topic (programming, general knowledge, other software, life, etc.): do NOT answer it on the merits. Gently and playfully dodge: say that's a job for another tooth (a specialist) and that you only know the S.I.N manual, then ask for a question about the system's screens/routines.
Be brief, friendly, answer in English, and do not cite any pages.`
        : `Você é o "Dentinho", assistente simpático do manual do S.I.N Implant System. A mensagem do usuário provavelmente NÃO é sobre o conteúdo do manual (telas, campos, rotinas).
- Se for conversa, elogio ou sobre você (como vai, como está o aprendizado): responda de forma curta, simpática e humana, e convide a pessoa a perguntar sobre o sistema. NÃO invente informações do sistema.
- Se for assunto fora do manual (programação, conhecimentos gerais, outros softwares, vida, etc.): NÃO responda o mérito. Dê uma "ensaboada" leve e bem-humorada: diga que isso é com outro dente (um especialista) e que você só manja do manual do S.I.N, e peça uma pergunta sobre as telas/rotinas do sistema. Ex.: "Eita, essa aí é com outro dente! 🦷 Eu só manjo do manual do S.I.N — me pergunta algo das telas do sistema que eu te ajudo!"
Seja breve e simpático, responda em português e NÃO cite páginas.`;
  }

  // Tenta o modelo primário (70B); se falhar ou vier vazio, cai pro próximo (8B).
  const mensagens = [
    { role: 'system', content: sistema },
    { role: 'user', content: pergunta },
  ];
  let resposta = '';
  let ultimoErro = null;
  for (const modelo of AI_MODELS) {
    try {
      const out = await env.AI.run(modelo, { messages: mensagens, max_tokens: 512 });
      resposta = (out?.response ?? '').trim();
      if (resposta) break;
    } catch (err) {
      ultimoErro = err;
      console.error(`AI.run falhou (${modelo}):`, err);
    }
  }

  if (!resposta) {
    return json(
      {
        error: 'A IA está indisponível no momento. Tente novamente.',
        detail: String(ultimoErro?.message || ultimoErro || 'sem resposta'),
      },
      502,
    );
  }

  // Só cita páginas quando o manual realmente cobre o assunto.
  const sources = forte ? ranque.map((r) => ({ title: r.item.title, href: r.item.href })) : [];
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
