# 🍔 Hamburgueria Smash Bros

Plataforma integrada de **música + chat em tempo real** para uma hamburgueria moderna, desenvolvida como Projeto Integrador do 2º semestre de ADS (FATEC Indaiatuba).

O sistema foi pensado para funcionar **principalmente em dispositivos móveis**, simulando a experiência de um **aplicativo de chat e pedidos musicais** dentro da hamburgueria.

---

## 🧠 Visão Geral do Sistema

O **Hamburgueria Smash Bros** permite que o cliente:

1. Acesse o sistema via **QR Code da mesa** (ex: `...?mesa=3`)  
2. Informe o **seu nome** na tela de login  
3. Tenha criada uma **sessão única** vinculada à mesa  
4. Navegue por **gêneros musicais** (gospel, rock, funk, sertanejo, etc.)  
5. Entre em um **chat público em tempo real**, com:
   - balões estilo app (WhatsApp-like)
   - avatares automáticos com iniciais
   - som de notificação
   - scroll automático

Em versões futuras, o mesmo fluxo será expandido para:

- **sugestão de músicas**, com moderação do atendente  
- **fila de reprodução**, possivelmente integrada ao Spotify  
- **painel administrativo** (atendente/moderador) para aprovar músicas, moderar chat e visualizar sessões ativas  

---

## 🏗️ Tecnologias Utilizadas

### Backend

- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM**
- **SQLite** (banco de dados em arquivo, simples e portátil)
- **WebSocket** (`ws`) para o chat em tempo real
- **class-validator** + **class-transformer** (validação de DTOs)
- **tsx** (para rodar TypeScript em ambiente de desenvolvimento)

### Frontend

- **HTML5** (páginas estáticas servidas pelo backend)
- **CSS3** (layout responsivo, mobile-first, estilo app)
- **JavaScript (vanilla)** para:
  - chamadas HTTP (`fetch`)
  - WebSocket no navegador
  - gerenciamento de sessão via `sessionStorage`

### Deploy / Nuvem

- **Render.com**
  - Backend rodando como **Web Service**
  - Páginas HTML servidas pelo próprio backend (pasta `public/`)
  - Banco **SQLite** dentro do container
  - Deploy integrado com **GitHub** (build a partir da branch principal)

---

## 🧬 Arquitetura do Backend

O backend segue uma arquitetura em camadas, organizada da seguinte forma:

```text
Rotas (routes) 
  → Controllers 
    → Services 
      → Repositories 
        → Prisma 
          → SQLite (database.db)
```

### Camadas

- **Routes**  
  Recebem as requisições HTTP e direcionam para os controllers:
  - ex: `/api/clients`, `/api/sessions`, etc.

- **Controllers**  
  Fazem a ponte entre o mundo HTTP e as regras de negócio:
  - leem `req.body`, `req.params`, `req.query`
  - chamam o service correto
  - tratam erros e retornam `res.status(...).json(...)`

- **Services**  
  Camada onde ficam as **regras de negócio**:
  - validações adicionais
  - orquestração de múltiplos repositórios
  - lógica de criação de sessão, etc.

- **Repositories**  
  Responsáveis por conversar com o banco via **Prisma**:
  - `createCliente(...)`
  - `findClientes(...)`
  - `createSessao(...)`
  - etc.

- **Prisma / SQLite**  
  O Prisma gera um client para acesso ao banco SQLite (`database.db`), que fica na pasta `prisma/`.

---

## 💬 Arquitetura do Chat em Tempo Real (WebSocket)

O chat é implementado com **WebSocket** usando a biblioteca `ws`.  
O servidor WebSocket é exposto na rota:

```text
/ws ou /chat  (conforme configuração no server.ts)
```

> No projeto atual, o cliente se conecta usando uma URL do tipo:  
> `wss://SEU_BACKEND.onrender.com/chat?sessionId=...&mesaId=...&nome=...`

### Fluxo WebSocket (lado do cliente)

1. O frontend monta a URL do WebSocket com:
   - `sessionId`
   - `mesaId`
   - `nome`
2. Abre a conexão:
   ```ts
   const socket = new WebSocket(wsUrl);
   ```
3. Quando o usuário envia uma mensagem:
   ```ts
   socket.send(JSON.stringify({ text: "Olá" }));
   ```
4. Quando o servidor envia uma mensagem, o cliente recebe em:
   ```ts
   socket.onmessage = (event) => {
     const data = JSON.parse(event.data);
     // data.user, data.text, data.ts, ...
   };
   ```

### Formato típico das mensagens

As mensagens trafegadas no chat (simplificação) seguem um formato como:

```json
{
  "user": "Fulano (mesa 3)",
  "text": "Boa noite!",
  "ts": "2025-11-23T17:10:00.000Z",
  "type": "message" // ou "system" para mensagens de entrada/saída
}
```

### Lado do servidor (WebSocket)

No `server.ts` (ou arquivo equivalente):

- Ao conectar:
  - o servidor lê os parâmetros de query (`sessionId`, `mesaId`, `nome`)
  - valida a sessão (futuro: checar se a sessão é válida no banco)
  - cria um objeto de cliente conectado

- Ao receber mensagem de um cliente:
  - transforma o texto em um objeto:
    ```ts
    {
      user: "Fulano (mesa 3)",
      text: "...",
      ts: new Date().toISOString(),
      type: "message"
    }
    ```
  - faz broadcast para todos os sockets conectados

- Ao desconectar:
  - pode enviar uma mensagem de `type: "system"` informando que o usuário saiu

Esse desenho permite que qualquer IA ou desenvolvedor estenda a lógica, por exemplo, para:

- diferenciar **cliente** de **moderador**
- incluir `type: "delete-message"` para remoção de mensagens
- persistir histórico em tabela `ChatMensagem`

---

## 📱 Arquitetura do Frontend

As páginas HTML ficam em `src/public/` (serving estático via Express). Exemplo:

```text
src/public/
├── login.html
├── inicio.html
├── genero-gospel.html
├── genero-eletronica.html
├── genero-rock.html
├── genero-sertanejo.html
├── genero-funk.html
├── genero-rap.html
├── chat.html
└── sons/
    └── notificacao.mp3
```

### Páginas principais

- **login.html**
  - Lê o parâmetro `mesa` da URL (ex: `?mesa=3`)
  - Exibe o número da mesa para o cliente
  - Coleta o `nome`
  - Faz `POST /api/sessions`
  - Salva:
    - `sessionId`
    - `mesaId`
    - `nomeCliente`
    no `sessionStorage`
  - Redireciona para `inicio.html`

- **inicio.html**
  - Tela de boas-vindas
  - Botões para:
    - gêneros musicais
    - chat
    - (futuro) fila de músicas

- **genero-*.html**
  - Telas separadas por gênero (gospel, rock, etc.)
  - Hoje estruturadas estaticamente, mas prontas para receber dados dinâmicos no futuro.

- **chat.html**
  - Layout estilo aplicativo:
    - header fixo com botão de voltar
    - área de mensagens que ocupa quase toda a tela
    - campo de digitação mais alto e confortável
    - balões largos (até ~95% na tela do celular)
  - Usa:
    - `sessionStorage` para recuperar `sessionId`, `nomeCliente`, `mesaId`
    - WebSocket para enviar/receber mensagens
    - som de notificação (`notificacao.mp3`)
    - avatares com iniciais do nome

---

## 🌐 Comunicação com a Nuvem (Render)

### Deploy do Backend (Web Service)

1. Criar um serviço **Web Service** no Render, apontando para o repositório GitHub do projeto.
2. Configurar:
   - **Branch:** ex: `main`
   - **Build command:**
     ```bash
     npm install
     npx prisma generate
     ```
     (ou incluir `npx prisma migrate deploy` se quiser rodar migrations a cada deploy de produção)
   - **Start command:**
     ```bash
     npm run dev
     ```
     ou, para produção:
     ```bash
     npm run start
     ```
     (depende dos scripts definidos no `package.json`).
3. Variáveis de ambiente:
   - `DATABASE_URL="file:./database.db"`


### Servindo o Frontend

No projeto atual, o próprio backend expõe a pasta `public/` como estática, algo como:

```ts
app.use(express.static(path.join(__dirname, "public")));
```

Isso significa que o **mesmo domínio** do backend serve as páginas HTML:

- `https://seu-backend.onrender.com/login.html`
- `https://seu-backend.onrender.com/inicio.html`
- `https://seu-backend.onrender.com/chat.html`

Isso é ideal para o PI porque simplifica bastante:

- mesmo host para HTTP e WebSocket
- facilitando a configuração do QR Code e do fluxo do cliente

---

## 🖥️ Como Rodar o Projeto Localmente

### 1. Pré-requisitos

- **Node.js 18+**
- **npm** (vem junto com o Node)

### 2. Clonar o projeto

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPO.git
cd SEU-REPO
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Criar o arquivo `.env`

Na raiz do projeto, crie um arquivo `.env` com:

```bash
DATABASE_URL="file:./database.db"
```

### 5. Rodar migrations (desenvolvimento)

```bash
npx prisma migrate dev
```

### 6. Gerar o Prisma Client

```bash
npx prisma generate
```

### 7. Iniciar o servidor

```bash
npm run dev
```

O servidor será iniciado em:

```text
http://localhost:3000
```

A partir daí você pode acessar:

- `http://localhost:3000/login.html?mesa=1`
- `http://localhost:3000/inicio.html`
- `http://localhost:3000/chat.html`

---

## ✅ O que Já Está Implementado

### Backend

- Arquitetura em camadas (controllers, services, repositories)
- **CRUD de Cliente**
- **Seed de mesas** iniciais no banco
- **Criação de sessão** vinculada à mesa
- Validação de dados (DTOs)
- WebSocket para **chat em tempo real**
- Broadcast de mensagens para todos os clientes conectados
- Mensagens de sistema (entradas/saídas)
- Servir arquivos estáticos (páginas HTML, CSS, JS e sons)

### Frontend

- **Tela de login** funcional com:
  - leitura da mesa via query string
  - envio de nome e mesa para o backend
  - armazenamento de `sessionId`, `mesaId`, `nomeCliente`
- **Tela inicial (inicio.html)** estilizada
- Páginas de **gêneros musicais** com layout padrão
- **Chat responsivo estilo app**:
  - layout mobile-first
  - balões de conversa largos
  - avatares com iniciais do cliente
  - som de notificação
  - scroll automático
  - botão de voltar para a tela inicial

### Deploy / Nuvem

- Backend funcionando no Render
- Páginas HTML servidas pelo mesmo domínio do backend
- GitHub integrado com Render (deploy via push + botão “Deploy latest commit”)

---

## 📌 Roadmap – O que Falta Implementar

### 1. Sistema de Músicas

- [ ] Criar modelos `Music` e `PedidoMusica` no Prisma
- [ ] Criar endpoints REST:
  - `GET /api/musics`
  - `POST /api/musics`
  - `POST /api/music-requests` (pedidos do cliente)
- [ ] Integrar as telas de gêneros com o backend (listar músicas por gênero)
- [ ] Permitir que o cliente **solicite** uma música a partir da lista
- [ ] Enviar pedidos para a fila de moderação do atendente

### 2. Fila de Reprodução

- [ ] Criar modelo `FilaReproducao`
- [ ] Criar endpoints:
  - `GET /api/queue`
  - `POST /api/queue`
  - (futuro) `DELETE /api/queue/:id`
- [ ] Tela “Fila de Reprodução” para o cliente acompanhar o que está tocando

### 3. Painel Administrativo / Moderador

- [ ] Criar rota ou tela específica para **atendente/moderador**
  - ex: `admin-chat.html` ou uma rota admin no frontend
- [ ] Diferenciar sessão de **cliente** e **moderador**:
  - campo `tipoUsuario` na sessão (`"cliente" | "moderador"`)
- [ ] No WebSocket:
  - se `tipoUsuario === "moderador"`, exibir interface com:
    - botão para **deletar mensagem**
    - opção para **silenciar usuário** (futuro)
- [ ] (Opcional) Persistir mensagens do chat em uma tabela `ChatMensagem`

### 4. Segurança e Restrições

- [ ] Restringir acesso ao sistema apenas a clientes no **Wi-Fi local**
  - validar IP de origem
  - configurar faixa de IPs da rede da hamburgueria
- [ ] Implementar **expiração de sessão**:
  - ex: sessão expira após X minutos de inatividade
- [ ] Limitar spam no chat:
  - intervalo mínimo entre mensagens
  - limite de caracteres

### 5. Persistência Completa do Chat

- [ ] Criar tabela `ChatMensagem` no Prisma
- [ ] Salvar cada mensagem enviada
- [ ] Ao entrar no chat, carregar histórico recente (ex: últimas 50 mensagens)
- [ ] Permitir que o moderador remova mensagens do histórico (soft delete)

### 6. Integração com Spotify 

- [ ] Configurar app no Spotify Developer
- [ ] Criar endpoint/callback para OAuth (ex: `/api/spotify/callback`)
- [ ] Vincular fila de reprodução com playlists no Spotify
- [ ] Mostrar status da música atual na hamburgueria

---

## 👨‍💻 Créditos

Projeto desenvolvido por estudantes da **FATEC Indaiatuba – Análise e Desenvolvimento de Sistemas**, 2º semestre.

Hamburgueria Smash Bros – música, interação e tecnologia na mesa do cliente. 🎶🍔
