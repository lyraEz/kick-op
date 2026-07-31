# sinal — player Kick sem enrolação

Player próprio para streams da Kick: player HLS custom (controle real de qualidade,
zoom, fit e saturação) + chat lateral, pensado pra mobile primeiro.

## Como funciona

- Você cola o link do canal (`kick.com/nome`).
- Uma função serverless (`/api/resolve`) busca no servidor os dados públicos do
  canal na Kick — incluindo a URL real do stream (.m3u8) — e devolve pro app.
  Isso roda no servidor porque o navegador sozinho esbarra em bloqueio de
  CORS/Cloudflare da Kick.
- O player usa `hls.js` pra tocar o .m3u8 direto, com controle total sobre
  qualidade, imagem e chat.
- O chat conecta via WebSocket (Pusher) direto do navegador — não passa pelo
  backend.

## Rodando localmente

```bash
npm install
npm run dev
```

**Importante:** localmente, `npm run dev` (só Vite) não sobe a função
`/api/resolve` — ela só existe rodando via Vercel. Pra testar local com a API
funcionando, use a Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## Deploy

Projeto pronto pro Vercel (a pasta `api/` já segue a convenção deles):

```bash
vercel deploy
```

Ou conecte o repositório do GitHub direto no painel da Vercel — nenhuma
configuração extra é necessária, o `api/resolve.js` é detectado
automaticamente como função serverless.

## Limitações conhecidas

- A Kick pode mudar a estrutura da API pública a qualquer momento (não é uma
  API oficial documentada) — se o resolve parar de funcionar, é o primeiro
  lugar pra checar.
- No Safari/iOS, a reprodução usa o player HLS nativo do navegador (sem
  `hls.js`), então a troca manual de qualidade não fica disponível — o
  Safari escolhe automaticamente.
- O chat depende da chave pública do Pusher usada pelo site da Kick; se eles
  trocarem, o hook `useKickChat` precisa da chave nova.
