// App 100% estático agora — a URL .m3u8 e o ID do chat são fornecidos pelo
// próprio usuário, então não precisamos mais de uma rota de API tentando
// consultar a Kick pelo servidor (isso esbarrava no bloqueio Cloudflare da
// própria Kick contra requisições fora do navegador).

export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
