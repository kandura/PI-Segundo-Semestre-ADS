# 🍔 Hamburgueria Smash Bros — Sistema Completo de Música, Fila, Player Spotify e Chat em Tempo Real

Este projeto implementa um sistema profissional para uma hamburgueria temática, onde cada mesa possui um QR Code que dá acesso ao sistema. O cliente pode pedir músicas, conversar com outros clientes e acompanhar a fila em tempo real. O moderador controla tudo através de um painel exclusivo que inclui player Spotify integrado via Web Playback SDK.

Este README apresenta o projeto em nível de documentação oficial, explicando cada parte do funcionamento.

---

# Objetivo do Projeto

Criar uma plataforma realista para restaurantes, permitindo:

- Clientes pedirem músicas por QR Code  
- Pedidos entrarem em uma fila sincronizada  
- Chat em tempo real entre os clientes  
- Player do Spotify controlando o som ambiente  
- Painel do moderador com ferramentas completas  
- Integração real com Spotify Web API + Spotify Player SDK  

---

# Sumário Completo

1. Visão Geral  
2. Arquitetura Geral  
3. Tecnologias Utilizadas  
4. Funcionamento Geral  

---

# 1. Visão Geral

O sistema funciona assim:

### Clientes fazem:
- Entram pelo QR Code da mesa  
- Digita nome  
- Acessam os gêneros musicais  
- Pesquisam músicas  
- Pedem músicas  
- Acompanham a fila em tempo real  
- Conversam no chat  

### O moderador:
- Faz login com email/senha  
- Controla player Spotify  
- Acompanha a fila oficial  
- Modera o chat  
- Move/exclui músicas da fila  

### O sistema:
- Sincroniza todos os aparelhos via WebSocket  
- Armazena tudo no banco (PostgreSQL)  
- Controla o player Spotify pela API  
- Mantém sessões ativas por mesa  

---

# 2. Arquitetura Geral

```
┌───────────────────────────┐
│          Frontend         │
│  HTML / CSS / JS puro     │
│  Layout Mobile-first      │
└─────────────┬─────────────┘
              │ HTTP/REST
              │ WebSockets
┌─────────────▼─────────────┐
│           Backend          │
│ Node.js + Express          │
│ Controllers / Services     │
│ Spotify Web API            │
│ WebSockets (Chat + Fila)   │
└─────────────┬─────────────┘
              │ Prisma ORM
┌─────────────▼─────────────┐
│         PostgreSQL         │
└────────────────────────────┘
```

### Fluxos principais:

- **REST** → criação de sessões, pedidos, buscas  
- **WebSocket (fila)** → todos recebem fila atualizada ao vivo  
- **WebSocket (chat)** → mensagens em tempo real  
- **Spotify API** → playlists, buscas, controle do player  
- **Spotify SDK** → player real rodando no painel do moderador  

---

# 3. Tecnologias Utilizadas

### Backend
- Node.js  
- Express  
- Prisma ORM  
- PostgreSQL  
- WebSockets (ws)  
- Spotify Web API  
- Spotify Web Playback SDK  
- bcrypt  

### Frontend
- HTML  
- CSS  
- JavaScript (vanilla)  
- WebSocket nativo  
- Mobile-first  

### Infra
- Render (deploy)  
- Variáveis de ambiente  
- QR Code por mesa  

---

# 4. Funcionamento Geral

### Cliente abre QR Code:
1. Entra em `/login.html?mesaId=X`
2. Digita nome  
3. Backend cria Sessão  
4. sessionStorage salva:
   - sessionId  
   - nomeCliente  
   - mesaId  

### Cliente entra nos gêneros:
- Front chama `/api/spotify/playlist/...`
- Backend baixa playlists reais da API do Spotify  
- Deduplica músicas se usar várias playlists  

### Cliente pede música:
- Envia POST `/api/pedido-musica/queue`
- Backend:
  - cria Pedido  
  - cria PlaybackQueue  
  - faz broadcast WebSocket  

### Moderador:
- Acessa `/moderador-dashboard.html`
- Painel carrega chat, player e fila  
- Pode excluir músicas  
- Pode tocar próxima  
- Pode controlar volume  

### Atualização da fila:
- Backend envia “atualizar-fila” via WebSocket  
- Todos os dispositivos recebem automaticamente  

---

## 5. Banco de Dados (Prisma + PostgreSQL)

O sistema utiliza **PostgreSQL** como banco principal, controlado pelo **Prisma ORM**.  
A modelagem foi pensada para suportar:

- Múltiplas mesas
- Clientes que entram e saem
- Sessões por dispositivo
- Pedidos de música
- Histórico de músicas
- Fila dinâmica de reprodução
- Moderadores
- Autenticação
- Integração Spotify

---

# 6. Modelos do Banco (schema.prisma)

A seguir, os modelos REAIS utilizados no projeto (com explicação detalhada):

```prisma
model Mesa {
  id        Int       @id @default(autoincrement())
  codigo    String    @unique
  sessoes   SessaoCliente[]
  pedidos   PedidoMusica[]
}
```

### Explicação:
- **Mesa** representa uma mesa física da hamburgueria.
- `codigo` é usado no QR Code.
- Cada mesa pode ter **diversos clientes ao longo do dia**, então ela possui várias sessões e vários pedidos.

---

```prisma
model Cliente {
  id        Int       @id @default(autoincrement())
  nome      String
  sessoes   SessaoCliente[]
  pedidos   PedidoMusica[]
}
```

### Explicação:
- Armazena o nome do cliente digitado no login.
- Não possui senha — identidade é temporária.
- Um cliente pode ter várias sessões se ele acessar novamente.

---

```prisma
model SessaoCliente {
  id        Int      @id @default(autoincrement())
  cliente   Cliente  @relation(fields: [clienteId], references: [id])
  clienteId Int
  mesa      Mesa     @relation(fields: [mesaId], references: [id])
  mesaId    Int
  criadoEm  DateTime @default(now())
}
```

### Explicação:
- Cada acesso pelo QR Code gera uma **Sessão**.
- Serve para identificar o cliente no chat e na fila.
- É o equivalentede um "login rápido".

---

```prisma
model Music {
  id         Int      @id @default(autoincrement())
  spotifyId  String   @unique
  spotifyUri String
  titulo     String
  artista    String
  album      String
  coverUrl   String?
  pedidos    PedidoMusica[]
}
```

### Explicação:
- Cada música só é criada **uma vez** no banco.
- Evita duplicação mesmo com diversas playlists.
- Isso acelera futuras consultas e pedidos.

---

```prisma
model PedidoMusica {
  id         Int      @id @default(autoincrement())
  cliente    Cliente  @relation(fields: [clienteId], references: [id])
  clienteId  Int
  mesa       Mesa     @relation(fields: [mesaId], references: [id])
  mesaId     Int
  music      Music    @relation(fields: [musicId], references: [id])
  musicId    Int
  criadoEm   DateTime @default(now())
  queue      PlaybackQueue?
}
```

### Explicação:
- Representa um pedido REAL de música.
- Contém quem pediu, de qual mesa, e qual música.

---

```prisma
model PlaybackQueue {
  id        Int          @id @default(autoincrement())
  pedido    PedidoMusica @relation(fields: [pedidoId], references: [id])
  pedidoId  Int
  ordem     Int
  tocado    Boolean      @default(false)
}
```

### Explicação:
- É a **fila real** usada pelo moderador.
- `ordem` mantém a posição.
- `tocado` indica se já foi executada pelo player Spotify.

---

```prisma
model Moderador {
  id       Int     @id @default(autoincrement())
  nome     String
  email    String  @unique
  senha    String  // bcrypt
}
```

### Explicação:
- Apenas moderadores têm acesso ao painel.
- Senhas são criptografadas com bcrypt.

---

# 7. Diagrama Conceitual (Explicação em Texto)

A seguir, a visão lógica do relacionamento entre entidades:

```
Mesa 1---N SessaoCliente N---1 Cliente
Mesa 1---N PedidoMusica N---1 Cliente
PedidoMusica 1---1 Music
PedidoMusica 1---1 PlaybackQueue
```

Explicando:

- **Mesa** possui várias sessões e vários pedidos.
- **Cliente** tem várias sessões e vários pedidos.
- **PedidoMusica** referencia uma música única.
- **PlaybackQueue** é exatamente 1 para cada pedido.
- O moderador não participa de nenhuma relação com pedidos; ele apenas usa o painel.

---

# 8. Fluxo Interno dos Dados

A seguir, uma explicação detalhada do funcionamento:

---

## Cliente escaneia QR Code

1. Entra em `/login.html?mesaId=3`
2. O front captura:
   - nome digitado  
   - mesaId da URL  
3. Backend cria `SessaoCliente`
4. Front salva no sessionStorage:
   - sessionId  
   - mesaId  
   - nomeCliente  

---

## Cliente pede música

1. Front envia POST `/api/pedido-musica/queue`
2. Backend verifica:
   - cliente existe? se não, cria  
   - música existe? se não, cria  
   - mesa existe? sempre existe via seed  
3. Cria `PedidoMusica`
4. Depois cria `PlaybackQueue`
5. Atualiza ordem da fila  
6. Envia WebSocket `atualizar-fila` para:
   - moderador  
   - todos os clientes  

---

## Moderador controla player

Quando carrega o painel:

1. Front pede token Spotify → backend
2. Inicializa Web Playback SDK
3. Registra o device_id no backend
4. Backend passa a enviar:
   - play
   - pause
   - next
   - volume
5. Todas as ações são refletidas no player real Spotify

---

## Chat em tempo real

1. Cliente entra no chat
2. Abre WebSocket `/chat?sessionId=...&nome=...&mesaId=...`
3. Mensagem enviada vira JSON e é broadcast
4. Moderador recebe tudo e pode:
   - excluir mensagens  
   - ver quem mandou e de qual mesa  

---


## 9. Backend — Rotas, Controllers e Services

O backend segue uma arquitetura limpa dividida em:
- **routes/**
- **controllers/**
- **services/**
- **repositories/**
- **database/**
- **middlewares/**

Tudo começa pelo **server.ts**, que registra rotas, middlewares, WebSockets e arquivos estáticos.

---

# 9.1 Arquivo server.ts — visão geral

O `server.ts`:

- inicializa o Express  
- libera CORS  
- carrega JSON  
- serve `/public`  
- monta todas as rotas  
- cria o servidor HTTP  
- inicializa WebSocket do chat  
- inicializa WebSocket da fila  
- integra com Spotify  

Principais trechos:

```ts
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "src", "public")));
```

Registro das rotas:

```ts
app.use("/api/cliente", clienteRoutes);
app.use("/api/sessoes", sessaoRoutes);
app.use("/api/musics", musicaRouter);
app.use("/api/pedido-musica", pedidoMusicaRouter);
app.use("/api/moderador", moderadorRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/fila", filaRoutes);
```

Criação do servidor + WebSocket:

```ts
const server = http.createServer(app);
const wssFila = new WebSocketServer({ server, path: "/fila-ws" });
const wssChat = new WebSocketServer({ server, path: "/chat" });
```

---

# 9.2 Rotas — visão geral

### Rotas principais:

| Módulo | Prefixo | Responsabilidade |
|--------|---------|-------------------|
| Cliente | `/api/cliente` | CRUD básico |
| Sessão | `/api/sessoes` | Criar sessão do cliente |
| Música | `/api/musics` | CRUD de músicas |
| Pedido de Música | `/api/pedido-musica` | Inserir pedidos e fila |
| Moderador | `/api/moderador` | Login/cadastro do moderador |
| Spotify | `/api/spotify` | Busca, playlists, token |
| Player | `/api/player` | Controla player do Spotify |
| Fila | `/api/fila` | Gestão da fila |

---

# 9.3 Spotify Controller

Três funções críticas:

### Buscar músicas:
```ts
const q = req.query.q as string;
const result = await spotifyService.searchTracks(q);
```

### Carregar playlists (1 ou várias):
```ts
const ids = req.params.ids.split(",");
const tracks = await spotifyService.getPlaylistTracks(ids);
```

### Gerar token para Web Playback SDK:
```ts
return res.json({ access_token: spotifyService.token });
```

---

# 9.4 PedidoMusica Controller

Fluxo ao pedir música:

1. Confirma cliente/sessão
2. Garante existência da música no BD
3. Cria PedidoMusica
4. Cria fila (PlaybackQueue)
5. Reordena fila
6. Envia WebSocket com “atualizar-fila”

Trecho importante:

```ts
const pedido = await pedidoService.criarPedido({
  mesaId,
  clienteNome,
  spotifyId,
  spotifyUri,
  titulo,
  artistas,
  album,
  coverUrl,
});
```

Após criar o pedido:

```ts
filaService.broadcastAtualizacaoFila();
```

---

# 9.5 Player Controller

Essencial para o moderador controlar o player Spotify.

### Registrar device_id:
```ts
await playerService.setDevice(device_id);
```

### Tocar música atual:
```ts
await playerService.playCurrent();
```

### Próxima da fila:
```ts
await playerService.tocarProxima();
filaService.broadcastAtualizacaoFila();
```

---

# 9.6 Fila Controller

Permite:

- obter fila atual
- atualizar fila
- excluir item
- limpar fila

Exemplo:

```ts
const fila = await filaService.getFila();
return res.json(fila);
```

---

# 9.7 Services e responsabilidades

## spotifyService.ts
- autenticação com Spotify  
- cache de token  
- busca  
- carregamento de playlists  
- normalização de dados  

## pedidoService.ts
- criação do pedido  
- evitar duplicação de músicas  
- criação de PlaybackQueue  

## filaService.ts
- listar fila  
- ordenar pela posição  
- marcar como tocado  
- redefinir ordem  
- broadcast websocket  

## playerService.ts
- comunicação com Spotify Player API  
- play / pause  
- next track  
- volume  
- device ID  

---

# 10. WebSockets — Chat e Fila

O projeto possui **dois servidores WebSocket**:

---

# 10.1 WebSocket do Chat (`/chat`)

### Cada cliente se conecta com:
```
/chat?sessionId=X&nome=Fulano&mesaId=3
```

Mensagens possuem formato:

```json
{
  "type": "message",
  "id": 123,
  "user": "Fulano (mesa 3)",
  "text": "Olá!",
  "ts": 171000000
}
```

### O moderador pode:
- receber mensagens
- apagar mensagens

Trecho do backend:

```ts
ws.send(JSON.stringify({ type: "delete-message", id }));
```

---

# 10.2 WebSocket da Fila (`/fila-ws`)

Usado por:

- todos os clientes
- painel do moderador

Quando a fila muda:

```ts
const fila = await filaService.getFila();
ws.broadcast(JSON.stringify({ tipo: "atualizar-fila", fila }));
```

---
# 11. Frontend — Telas, Fluxos e Funcionamento

O frontend foi construído inteiramente em **HTML + CSS + JavaScript puro**, com foco em **mobile-first**, já que o uso principal é via smartphone do cliente.

Há dois “perfis” principais:

- **Cliente (usando QR Code da mesa)**  
- **Moderador (usando login tradicional)**

Cada tela é um arquivo HTML independente e utiliza `sessionStorage` para manter estado (quem é o cliente, mesa, sessão etc).

---

# 11.1 Telas do Cliente

As telas do cliente foram desenvolvidas para funcionar perfeitamente em smartphones, priorizando legibilidade, botões grandes, navegação simples e animações suaves.

---

# login.html – Tela de entrada pela mesa

Fluxo:

1. O cliente escaneia o QR Code.
2. O QR aponta para:  
   ```
   /login.html?mesaId=3
   ```
3. O script valida:
   - mesaId está presente?
   - nome foi preenchido?

4. Ao confirmar:
   - chama o backend criando a sessão
   - salva no sessionStorage:
     ```
     sessionId
     nomeCliente
     mesaId
     ```
   - redireciona para inicio.html

Trecho principal:

```js
const { mesaId } = new URLSearchParams(location.search);
sessionStorage.setItem("mesaId", mesaId);
sessionStorage.setItem("nomeCliente", nome);
```

---

# inicio.html – Hub principal do cliente

Mostra:

- avatar do cliente (primeira letra do nome)
- “Mesa X • Bem-vindo(a), Fulano”
- botões para gêneros
- barra de pesquisa global
- footer fixo (Início · Chat · Fila)

Fluxo da barra de pesquisa:

```js
if (e.key === "Enter") {
  const q = input.value;
  window.location.href = `/pesquisar-musica.html?q=${encodeURIComponent(q)}`;
}
```

---

# genero-*.html – Páginas de gêneros musicais

Cada página representa um gênero:

- Rock
- Funk
- Sertanejo
- Rap
- Gospel
- Eletrônica

Carregam **uma ou várias playlists reais** do Spotify:

```js
const PLAYLIST_ID_ROCK = "id1,id2,id3";
```

Backend retorna músicas deduplicadas.

Renderização dos cards:

```js
<div class="track-card">
  <img src="capa" />
  <div class="track-info">
    <div>${m.title}</div>
    <div>${m.artists}</div>
  </div>
  <button class="btn-request">Pedir</button>
</div>
```

Ao clicar em “Pedir”:

```js
fetch("/api/pedido-musica/queue", {
  method: "POST",
  body: JSON.stringify(payload)
});
```

---

# pesquisar-musica.html – Busca global

Permite procurar qualquer música usando `/api/spotify/search`.

Fluxo:

1. Usuário digita algo
2. Pressiona “Buscar”
3. HTML mostra “⏳ Buscando…”
4. Backend retorna lista de músicas
5. Cada card tem botão “Pedir”

Código:

```js
const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
const data = await res.json();
renderResultados(data);
```

---

# fila.html – Fila visível ao cliente

Mostra:

- Música tocando agora
- Próxima da fila
- Restantes

Carrega fila inicial:

```js
const res = await fetch("/api/player/fila");
renderFila(await res.json());
```

Atualizações em tempo real:

```js
const filaWS = new WebSocket("wss://servidor/fila-ws");
filaWS.onmessage = (evt) => {
  const { fila } = JSON.parse(evt.data);
  renderFila(fila);
};
```

---

# chat.html – Chat em tempo real com moderador

O cliente se identifica via query params:

```
?sessionId=10&mesaId=3&nome=Pedro
```

Conexão:

```js
const socket = new WebSocket(
  `${ws}://${host}/chat?sessionId=${sessionId}&mesaId=${mesaId}&nome=${nome}`
);
```

Envio de mensagens:

```js
socket.send(JSON.stringify({
  type: "message",
  text: msg
}));
```

Recebimento:

```js
socket.onmessage = (evt) => {
  const data = JSON.parse(evt.data);
  addMessageBubble(data);
};
```

O cliente recebe também “delete-message”, se o moderador excluir.

---

# 11.2 Telas do Moderador

As telas de moderador têm estética similar, mas funções totalmente diferentes.

---

# moderador-login.html

Fluxo simples:

1. Usuário digita email + senha
2. Envia POST `/api/moderador/login`
3. Se login ok → salva `nomeModerador` no sessionStorage
4. Redireciona para `moderador-dashboard.html`

---

# moderador-register.html

Cadastro simples:

- nome  
- email  
- senha (bcrypt no backend)

Fluxo:

```js
await fetch("/api/moderador/register", {
  method: "POST",
  body: JSON.stringify({ nome, email, senha })
});
```

---

# moderador-dashboard.html – Painel Completo

A tela mais complexa do front. Contém:

### Player Spotify (Web Playback SDK)
- mostra música atual
- botão play/pause
- botão “Próxima”
- controle de volume

### Fila de músicas
- status (“Próxima”, “Na fila”)
- nome da música
- artista
- nome do cliente
- botão “Excluir”

### Chat em tempo real
- mostra mensagens de todos os clientes
- botão “Excluir mensagem”

---

# Player do Spotify

O player roda **no navegador do moderador**, usando:

```html
<script src="https://sdk.scdn.co/spotify-player.js"></script>
```

Quando o SDK inicializa:

```js
const player = new Spotify.Player({
  name: "SMASH-Burger Moderador",
  getOAuthToken: cb => cb(token),
  volume: 0.5
});
```

Registro do device no backend:

```js
fetch("/api/player/register-device", { method: "POST", body: JSON.stringify({ device_id }) });
```

---

# Atualização da fila no painel

```js
const filaWS = new WebSocket("wss://.../fila-ws");
filaWS.onmessage = (evt) => {
  const data = JSON.parse(evt.data);
  renderFila(data.fila);
};
```

---

# Botões importantes

### Atualizar fila manualmente:
```
/api/player/fila/refresh
```

### Sincronizar player:
```
/api/player/status-sync
```


# 12. Estrutura de Pastas

A estrutura do projeto segue um padrão organizacional limpo:

```
├── src
│   ├── controllers
│   ├── services
│   ├── repositories
│   ├── routes
│   ├── database
│   │   └── prismaClient.ts
│   ├── public
│   │   ├── login.html
│   │   ├── inicio.html
│   │   ├── genero-*.html
│   │   ├── pesquisar-musica.html
│   │   ├── fila.html
│   │   ├── chat.html
│   │   ├── moderador-login.html
│   │   ├── moderador-register.html
│   │   ├── moderador-dashboard.html
│   ├── server.ts
│   └── ...
├── prisma
│   └── schema.prisma
└── package.json
```

---

# 13. Como Executar o Projeto Localmente

## 1️Instalar dependências

```
npm install
```

## 2️Configurar o arquivo `.env`

Necessário incluir:

```
DATABASE_URL="postgresql://..."
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
SPOTIFY_REDIRECT_URI="http://localhost:3000/callback"
```

## 3 Rodar o Prisma

```
npx prisma migrate dev
```

## 4 Iniciar servidor

```
npm run dev
```

O servidor sobe em:

```
http://localhost:3000
```

---

# 14. Deploy no Render

O projeto está preparado para:

- Build automático  
- Migrações rodadas no deploy  
- Backend servindo arquivos HTML  
- WebSockets funcionando em produção  

Checklist do `.env` no Render:

```
DATABASE_URL=URL_DO_POSTGRES
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=https://seuapp.onrender.com/callback
```

E no painel:

- Ativar WebSockets  
- Timeout configurado  
- Deploy automático via GitHub  

---

# 15. Testes e Debug

Ferramentas usadas:

- Insomnia / Thunder Client  
- Testes com REST Client do VSCode  
- Console logs detalhados no backend  
- Debug do WebSocket no console do navegador  
- Verificação de ordem da fila usando logs do player  

---

# 16. Considerações Finais

Este projeto demonstra:

- Integração completa com Spotify Web API  
- Player oficial controlado pelo moderador  
- WebSockets funcionando em produção  
- Frontend mobile-first completo  
- Arquitetura modular com Express + Prisma  
- Banco de dados real PostgreSQL  
- Um sistema moderno, funcional e realista  

A aplicação entrega uma experiência fiel de uma hamburgueria moderna onde usuários podem pedir músicas diretamente das mesas, enquanto o moderador gerencia a experiência sonora.



