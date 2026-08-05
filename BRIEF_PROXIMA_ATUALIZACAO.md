# Brief — Próxima mega atualização do "sinal" (a virar "Klarity")

**STATUS: Tarefas 1, 2 e 4 concluídas e validadas com screenshot real
(Puppeteer + Chrome disponível no ambiente desta sessão — algo que não
era possível nas sessões anteriores). Detalhes de cada uma no final deste
documento, antes da seção "Tarefa 5".**

Consolidado ao final de uma sessão longa de desenvolvimento, para retomar
diretamente na implementação assim que o limite de uso resetar. Tudo aqui
já foi discutido e está em consenso com o usuário (LyraEz,
github.com/lyraEz) — não é uma proposta em aberto, é a fila de trabalho
combinada.

## Estado atual do projeto

Projeto React + Vite em `/home/claude/kick-viewer`, deploy via Cloudflare
Workers (`worker.js` servindo os assets estáticos do build, `wrangler.jsonc`
configurado). Zero backend de verdade — tudo client-side. Sistema de design
tokens em `src/styles/tokens.css` e `src/styles/glass.css`, aplicado via
classes `.glass`, `.glass--raised`, `.glass--overlay`, `.glass-btn`.

Fluxo atual: usuário cola manualmente a URL `.m3u8` (extraída via DevTools)
+ nome do canal (usado só pro chat, via iframe de
`kick.com/popout/{slug}/chat`). Player usa `hls.js`. Já tem: qualidade
manual/auto, fit contain/fill, zoom, saturação/brilho/contraste com
presets, volume, velocidade, espelhar, modo economia (força qualidade
mínima), botão de ir pro ao vivo (detecção de drift do live edge),
auto-sincronizar, painel de estatísticas técnicas, PiP, tela cheia com
auto-hide de controles, favoritos/recentes de canal salvos em
localStorage, título/categoria manual opcional.

**Bug fantasma**: resolvido de forma definitiva nesta sessão. Causa raiz
era conflito de especificidade CSS entre `.player-chrome > * { pointer-events: auto }`
e `.settings-panel { pointer-events: none }` — mesma especificidade,
resultado dependia da ordem de import do bundler. Corrigido trocando para
`.player-chrome > *:not(.settings-panel)`. Não reabrir isso como suspeita
se algo parecido aparecer — a causa já está documentada e fixada.

## Tarefa 1 — Glass "sólido com blur dinâmico" (prioridade imediata)

O usuário testou o sistema de glass atual e reportou que os componentes
estão "só transparentes, sem nenhum blur dinâmico visível" — não é o
efeito pretendido. Objetivo: os botões e TODOS os componentes (home,
player, chat, configurações) devem parecer vidro fosco sólido que
borra/refrata o conteúdo real atrás deles em tempo real (a live rodando,
o gradiente da home), não apenas uma camada semi-transparente.

Hipóteses técnicas a investigar nessa reimplementação:
- `backdrop-filter` pode não estar aplicando de fato em alguns contextos —
  checar se algum ancestral tem `transform`, `filter`, ou `will-change`
  criando um novo "containing block" que impede o backdrop-filter de
  enxergar o conteúdo correto atrás (isso é uma causa clássica do efeito
  "sumir" do backdrop-filter).
- Testar valores de blur ainda maiores (a última mudança foi de 20px→28px
  no padrão; pode precisar de bem mais, tipo 40-60px, para o efeito ficar
  óbvio em fundo de vídeo com movimento).
- Considerar aumentar um pouco a opacidade do tint de volta (foi reduzida
  de 0.32→0.18 nesta sessão para "deixar ver mais o vídeo atrás" — pode
  ter ido longe demais e ficado transparente demais em vez de "vidro
  fosco"). O equilíbrio certo é: sólido o bastante pra não parecer só
  transparência, mas com o blur claramente pegando o conteúdo de trás.
- Verificar se `-webkit-backdrop-filter` está de fato sendo aplicado em
  todos os elementos com `.glass` (Safari precisa do prefixo).
- Considerar testar em navegador real (o sandbox de desenvolvimento não
  tem browser disponível para screenshot — só build/lint validados, nunca
  visualmente confirmados). Se possível nesta próxima sessão, tirar
  screenshot real do resultado antes de declarar concluído.

## Tarefa 2 — Automação do m3u8: decisão final tomada, NÃO reabrir

Discussão extensa concluiu que:
- A Kick bloqueia por TLS fingerprint (Cloudflare anti-bot), não por
  headers HTTP. Isso é confirmado empiricamente (testamos `fetch()` direto
  do Worker e recebeu 403) e por fontes externas (yt-dlp já documentou o
  mesmo bloqueio).
- Nenhuma configuração dentro do Cloudflare Workers resolve isso — não é
  falta de headers certos, é a camada de transporte (TLS handshake) sendo
  diferente da de um Chrome real. Rotacionar IP não ajuda (bloqueio não é
  por IP).
- A única forma real de contornar seria um backend fora do Workers (VM/
  container com `curl_cffi` ou equivalente), com custo de hospedagem e
  manutenção contínua, risco de banimento do IP do servidor, e
  fragilidade (quebra a cada mudança do Chrome/Cloudflare).
- **Usuário decidiu explicitamente: não quer pagar/manter servidor à
  parte. Prefere manter tudo grátis/estático.** Isso fecha a porta do
  backend próprio de forma definitiva, não temporária.

**Direção aprovada em consenso**: automação via extensão de navegador
(o usuário já tem uma extensão própria, `live-stream-grabber`, enviada
anteriormente — está em `/home/claude/live-stream-grabber-src/` se ainda
presente no ambiente, senão pedir de novo ao usuário) evoluída para:

1. A extensão injeta um botão flutuante na página da Kick (ex: "Abrir no
   Klarity") — precisa ser clique explícito do usuário, NUNCA abrir aba
   sozinha automaticamente (isso é bloqueado por pop-up blocker em quase
   todo navegador, e é ruim de UX mesmo se funcionasse).
2. Ao clicar, a extensão já tem o `.m3u8` capturado (ela intercepta
   requisições de rede da própria página, rodando com o fingerprint TLS
   real do navegador do usuário — por isso funciona onde nosso servidor
   não funciona) e abre o site com os dados na URL via query string:
   `klarity.../?stream=<m3u8 encodado>&channel=<slug>`.
3. O site lê esses parâmetros na carga da página (`URLSearchParams`) e
   preenche/inicia automaticamente — sem precisar que o usuário cole nada
   manualmente.
4. O formulário manual atual (colar link + nome do canal) **permanece
   como estava, não como fallback secundário, mas como caminho principal
   para quem não tem a extensão** — grande parte do público mobile vai
   continuar usando esse caminho, porque extensões em mobile exigem
   trocar de navegador (ver Tarefa 3).

Não é pra desenhar isso do zero — é pra pegar a extensão existente do
usuário e adaptar: em vez de só listar links pra copiar manualmente,
adicionar a lógica de montar a URL do Klarity com os parâmetros e abrir
num clique.

## Tarefa 3 — Mobile e extensões: contexto para o FAQ futuro

Pesquisa confirmou: Kiwi Browser saiu da Play Store (não recomendar mais).
Firefox para Android tem suporte oficial e estável a extensões — é a
recomendação primária a documentar depois no site. Yandex Browser é
alternativa B (suporte amplo, mas navegador russo, menos previsível a
longo prazo). Chrome mobile nativo não suporta extensões e não há sinal
de que vá suportar em celulares tão cedo (só testes "desktop-style" para
Chromebook/tablet, não phones).

Isso é conteúdo para uma futura página de FAQ/Suporte — não é uma tarefa
de código agora, só contexto a manter para quando essas páginas forem
escritas (ver Tarefa 5).

## Tarefa 4 — Multistream (2 lados, mobile-first)

Aprovado em consenso: multistream simples de **2 streams lado a lado**,
não 4 (celulares médios não aguentam 4 decodificações HLS simultâneas
sem travar/esquentar/gastar bateria demais). Decisões já tomadas:

- Layout: empilha verticalmente em modo retrato (cada player ocupa metade
  da altura), lado a lado em paisagem/desktop. Não precisa de grade
  configurável — é sempre metade/metade.
- Áudio: só um dos dois toca som por vez. Botão de alto-falante em cada
  player; ativar um desativa o outro automaticamente (mutuamente
  exclusivo).
- Chat: painel único compartilhado entre os dois (não duplicar o painel),
  com um seletor simples de qual dos dois canais mostrar no chat.
- Reaproveitar o máximo possível do que já existe: `useHlsPlayer` já é
  uma unidade independente por instância — a tela nova é composição de
  dois `<Player>` reduzidos (provavelmente uma versão simplificada sem
  todos os controles avançados individuais, focada em qualidade/mute)
  lado a lado, não uma reescrita do player.
- Cada stream individual continua exigindo `.m3u8` colado manualmente
  (ou, depois da Tarefa 2, via extensão) — essa limitação não muda pra
  multistream.
- Rota nova sugerida: `/multi` ou tela alternável a partir da Home.

Prioridade: depois da Tarefa 1 (glass) e Tarefa 2 (extensão), não antes.

## Conclusão das Tarefas 1, 2 e 4 (feito nesta sessão)

**Tarefa 1 — Glass sólido**: causa raiz era tint fraco demais (0.18-0.4)
e blur baixo demais (18-28px). Corrigido para tint 0.55-0.72 e blur
24-48px conforme a camada, em `src/styles/tokens.css`. Validado com
screenshot real (Home e Player simulados) — efeito de vidro fosco nítido,
pegando cor/movimento de trás, confirmado visualmente, não só por leitura
de CSS.

**Tarefa 2 — Extensão + auto-preenchimento**: extensão nova em
`/home/claude/klarity-grabber/` (README próprio lá dentro), focada em
`kick.com`, com botão flutuante que só habilita quando o `.m3u8` real é
capturado via interceptação de fetch/XHR/`<video>` no contexto da página
(mesma técnica da extensão original do usuário, só que sem WebSocket
genérico — não precisa mais, chat é iframe). Popup com estado e campo
para configurar a URL do Klarity (importante para quando migrar de
Workers para Pages). No site, `App.jsx` lê `?stream=` e `?channel=` da
query string e auto-inicia o player, limpando a URL depois. Testado de
ponta a ponta com screenshot: URL de teste com parâmetros → player entra
direto em "Conectando à transmissão" sem passar pela Home.

**Tarefa 4 — Multistream de 2**: já estava praticamente pronta ao
retomar esta sessão (não está claro se foi implementada antes de uma
interrupção de ferramentas ou nesta mesma sessão — o histórico da
conversa não deixa isso explícito, então não assumir automaticamente
"trabalho ainda em andamento" da próxima vez, ela JÁ EXISTE). Componentes:
`MultiStream.jsx` (2 slots, modal de adicionar canal, áudio mutuamente
exclusivo), `MiniPlayer.jsx` + `useMiniHlsPlayer.js` (versão enxuta do
player, `capLevelToPlayerSize: true` para economizar recursos
automaticamente numa tela menor), `ChatPanel.jsx` já estendido com
`channelOptions`/`onChangeChannel` para o seletor de canal do chat
compartilhado. Empilha vertical em retrato, lado a lado via
`@media (orientation: landscape)`. Acesso pela Home via botão "Assistir 2
lives juntas". Validado com screenshot: tela vazia com 2 slots e modal de
adicionar, ambos com glass renderizando corretamente.

Build e lint (`npm run build`, `npm run lint`) limpos em zero warnings
para todas as três tarefas. Worker testado localmente com
`wrangler dev`, respondendo 200.

Entregáveis desta sessão: `sinal-kick-player.zip` (projeto completo) e
`klarity-grabber-extension.zip` (extensão pronta para carregar via modo
desenvolvedor).



O usuário foi claro que estas ficam para quando o site estiver "quase
pronto pra deploy ao público" — não fazer agora, só manter registrado:

- 3-6 páginas/abas de suporte: Sobre, FAQ, Suporte, Descrição etc.
- Créditos visíveis no site para LyraEz (github.com/lyraEz) — o brief
  original do usuário pediu isso explicitamente ("por fim de todos os
  créditos a mim").
- Nome do projeto: **decidido — "Klarity"**. Trocar o nome internamente
  (`package.json`, `wrangler.jsonc` nome do worker, título da página,
  `.home__mark` que hoje diz "sinal") quando for feita essa rodada. Não
  precisa ser a primeira coisa da mega atualização, mas é bom já aplicar
  se for mexer nesses arquivos por outro motivo mesmo.
- Migração de Cloudflare Workers para Cloudflare Pages: o usuário
  mencionou que pode pedir ajuda com isso depois, quando ele mesmo
  entender o fluxo de deploy da interface nova do Pages. Não iniciar essa
  migração sem o usuário pedir explicitamente na hora — o painel da
  Cloudflare mudou de layout e ele ainda está se situando nele.

## Ordem sugerida de execução na próxima sessão

1. Glass sólido com blur dinâmico de verdade (Tarefa 1) — é o pendente
   mais imediato e o usuário já testou e sinalizou que não está certo.
2. Extensão + query string para preencher automático (Tarefa 2) — maior
   ganho de UX combinado nesta conversa.
3. Multistream de 2 (Tarefa 4).
4. Tarefa 5 só se o usuário sinalizar que quer avançar para lançamento
   público nessa mesma sessão.

Ao retomar, ler este brief primeiro, depois reconferir o estado real do
código (pode ter mudado se o usuário mexeu em algo entre sessões), e
então seguir a ordem acima sem precisar reabrir as discussões já
resolvidas (especialmente a Tarefa 2 — a decisão de não usar servidor
próprio é final, não é pra sugerir de novo).
