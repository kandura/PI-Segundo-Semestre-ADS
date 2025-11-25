# 🍔 Hamburgueria Smash Bros

Plataforma integrada de **música + chat em tempo real** para uma hamburgueria, desenvolvida como Projeto Integrador do 2º semestre de ADS (FATEC Indaiatuba).

O sistema foi pensado para funcionar principalmente em **dispositivos móveis**, simulando a experiência de um **aplicativo de chat e pedidos musicais** dentro da hamburgueria, acessado por **QR Code na mesa**.

---

## 1. Visão Geral

Fluxo básico do cliente:

1. O cliente lê o **QR Code da mesa**, que abre o sistema com o parâmetro `?mesa=Mxx`.
2. Na **tela de login**, informa seu nome.
3. O backend cria uma **Sessão do Cliente**, vinculada à mesa.
4. Após o login, o cliente é redirecionado para a tela **Início**, onde pode:
   - acessar as telas de **gêneros musicais**;
   - entrar no **chat em tempo real** com o atendente;
   - futuramente, **enviar pedidos de músicas** para uma fila moderada.

Além da visão do cliente, o sistema também prevê:

- um **painel de moderador**, responsável por gerenciar a fila de músicas;
- futura integração com **Spotify** para reprodução automatizada.

---

## 2. Tecnologias Utilizadas

### Backend

- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Render PostgreSQL como banco principal)
- **WebSocket** (biblioteca `ws`) para chat em tempo real
- **tsx** para desenvolvimento com TypeScript
- Organização em camadas: **routes → controllers → repositories → prismaClient**

### Frontend

- **HTML5** (páginas estáticas servidas pelo backend)
- **CSS3**, layout responsivo mobile-first
- **JavaScript (vanilla)** para:
  - chamadas HTTP via `fetch`
  - conexão WebSocket com o chat
  - gerenciamento de sessão via `sessionStorage`

### Deploy / Nuvem

- **Render.com**
  - Backend publicado como **Web Service**.
  - Banco de dados como **Render PostgreSQL**.
  - Deploy automático a cada commit na branch configurada.
  - Build executa (conforme configuração atual):
    ```bash
    npm install && npx prisma db push && npx prisma generate && npm run build
    ```

---

## 3. Arquitetura do Backend

A estrutura do backend segue uma arquitetura em camadas simples, focada em clareza para o time:

```text
src/
├── controllers/
├── routes/
├── repositories/
├── database/
│   └── prismaClient.ts
├── public/         (HTML, CSS, JS)
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### 3.1. Camadas principais

- **Routes**
  - Definem os endpoints HTTP e apontam para os controllers.
  - Exemplos:
    - `/clientes`, `/mesas`, `/sessoes`
    - `/api/musics`
    - `/moderador/*`

- **Controllers**
  - Fazem a ponte entre HTTP e a regra de negócio.
  - Interpretam `req.body`, `req.params`, `req.query`.
  - Chamam os repositórios.
  - Tratam erros e retornam `res.status(...).json(...)`.

- **Repositories**
  - Acessam diretamente o banco via Prisma.
  - Encapsulam consultas e comandos (`findMany`, `create`, etc.).
  - Exemplos: `MusicRepository`, `ClienteRepository`, etc.

- **Prisma / Banco**
  - `prismaClient.ts` cria e exporta uma instância do `PrismaClient`.
  - O provider do banco está configurado como `postgresql`.
  - A conexão é feita via variável de ambiente `DATABASE_URL`.

---

## 4. Modelagem do Banco (Prisma)

Resumo dos modelos existentes:

- **Cliente** — cadastro simples (nome, criado em, pedidos).
- **Mesa** — código, status, sessões vinculadas.
- **SessaoCliente** — sessão ativa (nome, mesa, ip, userAgent, timestamps).
- **SpotifyAuth** — autenticação e refresh automático.
- **Music** — catálogo: id, título, artista, gênero, criado em.
- **PedidoMusica** — referência ao cliente, música, mesa e status (enum).

Os modelos são gerenciados pelo Prisma, e migrations são aplicadas automaticamente no Render via `db push`.

---

## 5. Funcionalidades Implementadas

### 5.1. Gestão de Clientes e Mesas

- CRUD completo de clientes.
- Seed e listagem de mesas.

### 5.2. Sessão do Cliente (Login QR Code)

Fluxo operacional:

1. `login.html?mesa=Mxx`
2. Cliente preenche nome
3. Front chama `POST /sessoes/entrar`
4. Backend valida mesa
5. Cria sessão
6. Redireciona para início

### 5.3. Chat em Tempo Real

- WebSocket com `ws`
- Chat estilo aplicativo
- Avatar automático
- Notificação sonora
- Registro de entrada no chat

---

## 6. Módulo de Músicas

### 6.1. Endpoints

- `GET /api/musics` — lista tudo (com filtro opcional `?genero=`)
- `POST /api/musics` — cria música com validação

### 6.2. Repositório (MusicRepository)

- Monta dinamicamente o `where`
- Ordena por título ascendente
- Usa Prisma ORM

### 6.3. Controller

- `listar` → recebe query, chama repositório e retorna JSON
- `criar` → valida e cria via repositório

---

## 7. Módulo Moderador

Rotas:

- `GET /moderador/fila`
- `PUT /moderador/fila/:id/frente`
- `DELETE /moderador/fila/:id`

Estas rotas já estão integradas ao `server.ts` e operam sobre o modelo PedidoMusica.

---

## 8. Frontend

- `login.html`
- `inicio.html`
- `genero-*.html`
- `chat.html`

Todas páginas responsivas, mobile-first, integradas com backend via fetch + WebSocket.

---

## 9. Como rodar localmente

1. Clone o repo  
2. Crie `.env` com sua `DATABASE_URL`  
3. Instale dependências:

```bash
npm install
```

4. Rode migrations:

```bash
npx prisma migrate dev
```

5. Inicie o servidor:

```bash
npm run dev
```

---

## 10. Testes via request.http

Inclui testes de:

- clientes
- mesas
- sessões
- seed
- músicas
- moderador

---

## 11. Roadmap

- Listar músicas nas telas de gênero
- Criar pedido de música pelo cliente
- Painel gráfico do moderador
- Regras avançadas de sessão (IP/Wi-Fi)
- Integração real com Spotify
- Histórico completo de chat
