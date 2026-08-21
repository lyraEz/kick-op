# Brief — Klarity (ex-"sinal"): estado atual e próximos passos

Atualizado após uma sessão de correção de bugs + piloto de refração real +
extensão v2. Documento para retomar sem reabrir decisões já tomadas.

## Decisões fechadas — não reabrir

- **Automação total via backend próprio: NÃO.** Kick bloqueia por TLS
  fingerprint (Cloudflare anti-bot), confirmado empiricamente (403 direto
  do Worker) e por fontes externas (yt-dlp documentou o mesmo). Usuário já
  recusou explicitamente manter servidor pago à parte. Caminho definitivo
  é extensão de navegador (roda com o fingerprint real do usuário).
- **Multistream: 2 streams, não mais.** Celular médio não aguenta 3-4 HLS
  simultâneos.
- **Nome do projeto: "Klarity".** Ainda não aplicado em todo lugar (ver
  pendências).
- **APK: adiado de propósito.** Usuário decidiu terminar o site completo
  (com FAQ/Sobre/Como usar) antes de empacotar. Quando chegar a hora:
  Capacitor + GitHub Actions é o caminho (usuário não tem PC, precisa que
  o CI faça o build). Documentado meio de campo abaixo pra quando for a
  hora — não iniciar antes do usuário pedir.
- **APK não resolve o bloqueio da API da Kick** — importante não deixar o
  usuário achar que resolve. WebView usa o mesmo motor Chromium, mesmo
  fingerprint. A extensão continua sendo a peça que resolve captura, e ela
  roda no navegador do celular, não dentro do APK.

## Estado técnico atual

Projeto React + Vite em `/home/claude/kick-viewer`, deploy via Cloudflare
Workers. Design tokens em `src/styles/tokens.css` + `src/styles/glass.css`
(sistema `.glass` tradicional, blur 24-48px conforme camada). Player HLS
completo com qualidade, fit, zoom, saturação/brilho/contraste + presets,
volume, velocidade, espelhar, modo economia, ir-pro-ao-vivo, auto-sync,
estatísticas técnicas, PiP, tela cheia com auto-hide. Multistream de 2
(`MultiStream.jsx` + `MiniPlayer.jsx`) com tela cheia própria, áudio
mutuamente exclusivo, chat compartilhado com seletor de canal.

### Bugs corrigidos nesta sessão (não reabrir como suspeita)

- **Extensão não capturava**: causa era timing — `content.js` injetava
  `injected.js` via `<script src>` assíncrono, perdendo a primeira (às
  vezes única) chamada do `.m3u8`. Corrigido declarando `injected.js`
  como content script próprio com `"world": "MAIN"` no manifest.
- **Multistream piscando**: `backdrop-filter` com blur pesado sobre vídeo
  HLS em movimento causa flicker de compositing — problema documentado do
  Chrome, não bug de lógica. Corrigido com variante `.glass--light` (blur
  6px, mais opacidade sólida) nos elementos do MiniPlayer sobre vídeo.
- **Chat travava em página branca/robô**: `iframe.onload` dispara mesmo
  em página de erro — limitação da web, não detectável 100% via JS.
  Mitigado com botão de recarregar sempre visível no header do chat.
- **Botão de nova aba sobreposto ao toggle do chat**: confirmado por
  screenshot. Corrigido deslocando o toggle para fora da faixa do painel
  quando aberto.
- **Estatísticas "0x0"**: fallback para `video.videoWidth/videoHeight`
  quando o manifest HLS não preenche width/height do nível ativo.

### Piloto de refração real (Liquid Glass de verdade) — feito, resultado modesto

Implementado `feDisplacementMap` real (não blur fake) em
`utils/liquidGlass.js` + `LiquidGlassFilterDefs.jsx` +
`LiquidGlassSurface.jsx`, aplicado nos chips de canal e botão de
favoritar da Home. Confirmado tecnicamente funcionando: screenshot com
zoom contra padrão listrado mostra as listras visivelmente curvadas
dentro do botão — é deslocamento físico de pixel, não blur.

**Limitação física, não bug**: contra o fundo padrão do app (escuro, sem
muita textura), o efeito é sutil a ponto do usuário achar "não mudou
nada" — ele reportou isso. É esperado: refração só fica dramaticamente
visível com contraste/padrão rico atrás pra distorcer. **Não é um bug a
caçar de novo** — se for revisitar, a via de melhoria é usar em
elementos sobre conteúdo mais rico visualmente (ex: sobre o vídeo do
player), ou aceitar que o efeito é mais "toque fino de perto" que "uau
imediato à distância". **Suporte só Chrome/Chromium** — fallback
automático pro `.glass` tradicional já implementado, não precisa mexer.
Não expandido para Player/Multistream ainda (decisão consciente, não
testado sobre vídeo ativo).

### Extensão — reescrita nesta sessão, incorporando ideias boas de uma v2 do usuário

`/home/claude/klarity-grabber/` é a versão corrigida e atual (não usar a
pasta antiga `live-stream-grabber-src` nem `new-extension-check/
live-stream-grabber` — essa última tinha o MESMO bug de timing da
original; usuário reenviou por engano a versão sem a correção de
`world: "MAIN"`, mas trouxe uma ideia boa: parser de qualidades).

Incorporado nesta sessão: parser de `#EXT-X-STREAM-INF` no
`background.js` (`parseM3u8Qualities`) que baixa o manifest master e
extrai cada variante (resolução, bitrate, fps, codec) — mostrado no popup
com botão de copiar por qualidade. Também `webRequest` como segunda
camada de captura (observador passivo, redundante com `injected.js`).

**Não testei a extensão num Chrome real** (sandbox não permite carregar
extensões) — só validado sintaticamente. Se o usuário reportar que ainda
não captura, checar: (1) se carregou a pasta certa (`klarity-grabber`,
não uma das antigas), (2) suporte a `world: "MAIN"` (Chrome 111+, deve
estar OK), (3) se a Kick mudou como o player carrega o manifest.

## Pendente — páginas do site (autorizado a começar quando o usuário pedir)

Usuário quer: **Sobre, FAQ, Como usar, Suporte** antes do APK. Não feito
ainda. Quando for implementar:
- Créditos para LyraEz (github.com/lyraEz) devem aparecer visivelmente —
  pedido explícito e repetido, não esquecer.
- FAQ deve conter o que já foi pesquisado sobre extensões mobile (Firefox
  Android = recomendação primária; Yandex = alternativa B; Kiwi saiu da
  Play Store; Chrome mobile nativo não suporta extensão).
- "Como usar" deve explicar o fluxo com e sem extensão.
- Trocar nome "sinal" → "Klarity" em todo lugar nessa rodada
  (`package.json`, `wrangler.jsonc`, título da página, `.home__mark`).

## Referência técnica para quando for a hora do APK (não iniciar sem pedido explícito)

Caminho confirmado por pesquisa: **Capacitor + GitHub Actions** (usuário
não tem PC, build precisa rodar 100% no CI).
- `npx cap add android` gera a pasta `android/`, versionada no repo.
- Workflow: checkout → setup Node → `npm run build` (dist do Vite) →
  `npx cap sync` → `cd android && ./gradlew assembleDebug` (apk direto,
  sem keystore) ou `bundleRelease` (.aab assinado, exige keystore em
  secret do GitHub, mais complexo).
- Reforçar de novo nessa hora: o WebView é o mesmo Chromium, não muda
  nada sobre o bloqueio da Kick.

## Entregáveis mais recentes

- `sinal-kick-player.zip` — projeto completo (site).
- `klarity-grabber-extension.zip` — extensão corrigida com parser de
  qualidades, pronta pra carregar via modo desenvolvedor.
