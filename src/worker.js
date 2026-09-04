// Worker do manual S.I.N — serve os assets estáticos (dist) e protege apenas a
// seção "Doc. Técnicas e Configurações" (/tecnico e /en/tecnico) com Basic Auth.
// O resto do site continua público. A senha vem do secret SITE_PASS (e o usuário,
// opcionalmente, do SITE_USER — padrão "sin"). Nunca versionar a senha aqui.

// Caminhos protegidos: /tecnico, /en/tecnico e tudo abaixo deles.
// Também protege o índice de busca, que embute o corpo das páginas técnicas.
const PROTECTED = [
  /^\/tecnico(\/|$)/,
  /^\/en\/tecnico(\/|$)/,
];

function precisaAutenticar(pathname) {
  return PROTECTED.some((re) => re.test(pathname));
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (precisaAutenticar(url.pathname)) {
      const senhaEsperada = env.SITE_PASS;
      const usuarioEsperado = env.SITE_USER || 'sin';

      // Falha fechada: sem senha configurada, não expõe a seção técnica.
      if (!senhaEsperada) {
        return new Response(
          'Proteção não configurada: defina o secret SITE_PASS no Worker.',
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        );
      }

      const header = request.headers.get('Authorization') || '';
      const [esquema, codificado] = header.split(' ');
      if (esquema !== 'Basic' || !codificado) return pedirLogin();

      let decodificado = '';
      try {
        decodificado = atob(codificado);
      } catch {
        return pedirLogin();
      }

      const sep = decodificado.indexOf(':');
      const usuario = sep >= 0 ? decodificado.slice(0, sep) : '';
      const senha = sep >= 0 ? decodificado.slice(sep + 1) : '';

      if (usuario !== usuarioEsperado || senha !== senhaEsperada) {
        return pedirLogin();
      }
    }

    // Autenticado (ou caminho público): serve o asset estático normalmente.
    return env.ASSETS.fetch(request);
  },
};
