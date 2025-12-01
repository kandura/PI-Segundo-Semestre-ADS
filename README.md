# README – Sistema Hamburgueria Smash Bros 


##  SUMÁRIO GERAL
- [1. Visão Geral do Sistema](#1-visão-geral-do-sistema)
- [2. Arquitetura Completa](#2-arquitetura-completa)
- [3. Banco de Dados (Prisma + PostgreSQL)](#3-banco-de-dados-prisma--postgresql)
- [4. Módulo de Sessão e Mesas](#4-módulo-de-sessão-e-mesas)
- [5. Módulo de Músicas (Clientes)](#5-módulo-de-músicas-clientes)
- [6. Sistema de Fila e Pedidos](#6-sistema-de-fila-e-pedidos)
- [7. WebSockets: Chat + Fila em Tempo Real](#7-websockets-chat--fila-em-tempo-real)
- [8. Integração Spotify – Player + Autenticação + Tokens](#8-integração-spotify--player--autenticação--tokens)
- [9. Moderador Dashboard (Player + Fila + Chat)](#9-moderador-dashboard-player--fila--chat)
- [10. Rotas da API (Explicação Completa)](#10-rotas-da-api-explicação-completa)
- [11. Estrutura do Front-End](#11-estrutura-do-front-end)
- [12. Deploy no Render](#12-deploy-no-render)
- [13. Roadmap do que foi feito e o que falta](#13-roadmap-do-que-foi-feito-e-o-que-falta)

---

# 1. Visão Geral do Sistema

O sistema transforma a hamburgueria **Smash Bros Burger** em um ambiente moderno onde:

###  Clientes:
- entram via QR Code único por mesa;
- criam uma sessão vinculada ao IP + mesa;
- podem pesquisar músicas;
- podem pedir músicas para tocar;
- interagem via chat global.

###  Moderador:
- acessa o painel especial;
- controla a fila de músicas;
- controla o player do Spotify;
- vê o chat em tempo real e apaga mensagens.

### Integração Spotify:
- Player oficial Web Playback SDK;
- Autenticação via OAuth;
- Tokens armazenados e renovados automaticamente;
- Backend com controle total do player em um único device.

---

# 2. Arquitetura Completa

```
src/
 ├── controllers/
 │    ├── cliente.controller.ts
 │    ├── sessao.controller.ts
 │    ├── musica.controller.ts
 │    ├── pedidoMusica.controller.ts
 │    ├── player.controller.ts
 │    ├── spotify.controller.ts
 │    └── moderador.controller.ts
 │
 ├── routes/
 │    ├── cliente.routes.ts
 │    ├── sessao.routes.ts
 │    ├── musica.routes.ts
 │    ├── pedidoMusica.routes.ts
 │    ├── player.routes.ts
 │    ├── spotify.routes.ts
 │    └── moderador.routes.ts
 │
 ├── services/
 │    ├── spotify.service.ts
 │    └── fila.repository.ts
 │
 ├── database/
 │    ├── prismaClient.ts
 │    └── schema.prisma
 │
 ├── public/
 │    ├── inicio.html
 │    ├── pesquisar-musica.html
 │    ├── genero-*.html
 │    ├── chat.html
 │    ├── moderador-dashboard.html
 │    ├── login.html
 │    └── assets/
 │
 ├── server.ts
 └── websocket.ts
```

---

# 3. Banco de Dados (Prisma + PostgreSQL)

### Principais modelos:

### **Cliente**
- id
- nome
- mesaId
- criadoEm

### **Mesa**
- id
- identificador
- ativa

### **SessaoCliente**
- id
- clienteId
- mesaId
- ip
- expiraEm

### **Music** *(catálogo interno simplificado + uso do Spotify)*
- id
- titulo
- artista
- spotifyId
- coverUrl

### **PedidoMusica**
- id
- clienteId
- musicId
- mesaId
- status (PENDENTE, ACEITO, REJEITADO)
- queueId (liga ao playback)

### **PlaybackQueue**
- id
- musicId
- pedidoId
- status (NA_FILA, TOCANDO, TOCADA)
- order

### **PlayerState**
- id
- currentQueueId
- isPlaying

### **SpotifyAuth**
- id
- accessToken
- refreshToken
- expiresAt
- tokenObtainedAt

---

# 4. Módulo de Sessão e Mesas

Fluxo:

1. Cliente entra via QR Code  
2. QR Code contém:  
   `https://sistema.com/login.html?mesa=4`
3. Cliente coloca o nome → cria Cliente + Sessão
4. Sessão é salva com:
   - mesaId
   - ip público
   - validade: 20–30min

### Proteções:
- apenas permite navegação se sessão ativa existir;
- sessão expira por inatividade;
- cliente é sempre vinculado à mesa específica.

---

# 5. Módulo de Músicas (Clientes)

Clientes podem:

- abrir a tela de busca;
- pesquisar por palavra-chave (Spotify Search API);
- visualizar detalhes de cada faixa;
- pedir música (salva no DB);
- aguardar aprovação / ordem do moderador.

---

# 6. Sistema de Fila e Pedidos

### Fluxo:

```
Cliente → PedidoMusica → PlaybackQueue → Moderador → Player → Spotify
```

### Lógica:

1. Cliente envia POST `/pedido-musica/queue`
2. API:
   - registra Pedido
   - cria item na PlaybackQueue (status: NA_FILA)
   - define ordem incremental
3. WebSocket atualiza a fila para todos os moderadores conectados

---

# 7. WebSockets: Chat + Fila em Tempo Real

### Chat

Eventos:
- `message` → nova mensagem no chat
- `delete-message` → mensagem excluída por moderador
- `system-message` → entradas/saídas de usuário

### Fila

Eventos:
- `atualizar-fila` → sempre que:
  - pedido é criado
  - música toca
  - música é removida
  - próxima música é chamada

---

# 8. Integração Spotify – Player + Autenticação + Tokens

### Fluxo OAuth Completo:

1. Moderador acessa `/spotify/login`
2. Redireciona para a página oficial do Spotify
3. Usuário concede permissão
4. Spotify redireciona para `/spotify/callback?code=...`
5. Backend recebe o `code`, troca por:
   - access_token
   - refresh_token
   - expires_in

### Tokens são salvos no DB:
- utilizados por **SpotifyService**
- renovados automaticamente

### Player (Web Playback SDK)

1. Dashboard abre o SDK
2. SDK gera um device virtual
3. Backend registra esse device via:
   `/api/player/register-device`
4. Todas as chamadas:
   - tocar música
   - pular
   - próxima
   usam:
   PUT `https://api.spotify.com/v1/me/player/play?device_id=<id>`

---

# 9. Moderador Dashboard (Player + Fila + Chat)

### O moderador pode:
- ver fila atualizada;
- ver quem pediu cada música;
- tocar a próxima música;
- pular;
- ajustar volume;
- apagar mensagens do chat;
- ver mensagens novas;
- carregar automaticamente a próxima música.

---

# 10. Rotas da API (Explicação Completa)

(Documento inclui explicação rota por rota, omitida aqui por tamanho.)

---

# 11. Estrutura do Front-End

Responsável por:

- interface do cliente (músicas)
- interface do moderador (player)
- chat
- navegação
- busca
- confirmação de pedido
- feedback visual

---

# 12. Deploy no Render

Fluxo:

- push no GitHub → render ativa deploy
- roda:
  `npm install`
  `npx prisma generate`
  `npx prisma db push`
  `npm run build`
- inicia o server

Requer:

- variáveis SPOTIFY
- DATABASE_URL
- ORIGIN

---

# 13. Roadmap do que foi feito e o que falta

###  Concluído
- Sessão por mesa
- Música → Pedido → Fila
- WebSockets (chat + fila)
- Player no dashboard
- Integração Spotify completa
- Busca dinâmica
- Exibição por gênero
- Deploy no Render

###  Em aberto 
- filtro por playlists reais do Spotify por gênero
- permitir tocar playlists completas
- reforçar exclusão do chat para todos os clientes
- logs administrativos
- estatísticas de pedidos por mesa
- sala de chat por mesa

---

