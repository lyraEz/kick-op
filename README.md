# sinal — player Kick sem enrolação

Player próprio pra streams da Kick: player HLS custom (qualidade, zoom, fit e
saturação de verdade) + chat lateral, mobile-first.

## Por que colar a URL .m3u8 manualmente

A Kick fica atrás de proteção Cloudflare bem agressiva (fingerprint de TLS,
desafio JS) que bloqueia qualquer requisição de servidor tentando puxar os
dados do canal automaticamente — só passa quem "parece" um navegador real
executando JavaScript. Isso derruba qualquer backend simples (Vercel Function,
Cloudflare Worker, etc). Por isso o app pede a URL do stream direto: você
mesmo pega ela do seu navegador, que já passou por esse desafio.

## Como pegar a URL do stream

1. Abra a live da Kick no navegador (onde ela carrega normalmente) e dê play.
2. Abra as ferramentas de desenvolvedor (no Chrome/Android: menu → mais
   ferramentas → ferramentas do desenvolvedor; no computador, F12).
3. Vá na aba **Rede/Network** e filtre por `m3u8`.
4. Copie a URL que termina em `master.m3u8`.
5. (Opcional, pro chat) Filtre por `chatroom` na mesma aba — o número na URL
   da chamada é o ID do chat.

O app tem esse passo a passo embutido na tela inicial também.

## Rodando localmente

```bash
npm install
npm run dev
```

## Deploy no Cloudflare Workers

O projeto já vem configurado pro modelo atual da Cloudflare (Worker servindo
os assets estáticos via `wrangler.jsonc`):

```bash
npm install -g wrangler
npm run deploy
```

Isso builda o frontend e sobe tudo (`worker.js` + `dist/`) num único deploy.
Pra testar localmente com o Worker real antes de publicar:

```bash
npm run worker:dev
```

## Limitações conhecidas

- A URL `.m3u8` expira depois de um tempo (é assinada com token) — se o
  player parar de carregar depois de um tempo, é só pegar o link de novo.
- No Safari/iOS, a reprodução usa o player HLS nativo do navegador (sem
  `hls.js`), então a troca manual de qualidade não fica disponível — o
  Safari escolhe automaticamente.
- O chat depende da chave pública do Pusher usada pelo site da Kick; se eles
  trocarem, o hook `useKickChat` precisa da chave nova.
