# README -- Hamburgueria Beats

Plataforma integrada de **música + chat em tempo real** para uma
hamburgueria moderna.

------------------------------------------------------------------------

## 1. Visão Geral do Projeto

O **Hamburgueria Beats** é um sistema web onde o cliente acessa via QR
Code da mesa, informa seu nome e:

-   entra automaticamente no sistema da mesa\
-   participa de um **chat em tempo real**\
-   navega por **gêneros musicais**\
-   (futuro) sugere músicas\
-   (futuro) acompanha a fila de reprodução\
-   (futuro) painel do atendente

O foco é criar uma experiência divertida dentro da hamburgueria,
totalmente digital e responsiva.

------------------------------------------------------------------------

## 2. Tecnologias Utilizadas

### Backend

-   Node.js + Express\
-   TypeScript\
-   Prisma ORM\
-   SQLite\
-   WebSocket (ws)\
-   class-validator / class-transformer\
-   tsx

### Frontend

-   HTML, CSS, JavaScript\
-   Interface responsiva estilo aplicativo\
-   Chat totalmente estilizado (WhatsApp-like)

### Deploy

-   Backend hospedado no **Render (Web Service)**\
-   Frontend hospedado no **Render (Static Site)**

------------------------------------------------------------------------

## 3. Arquitetura do Sistema

O backend segue uma arquitetura limpa:

    Routes → Controllers → Services → Repositories → Prisma → SQLite

### Fluxo completo do cliente

1.  Cliente lê QR Code da mesa → `login.html?mesa=3`

2.  Cliente informa nome → envia para backend via:

        POST /api/sessions

3.  Backend cria sessão vinculada à mesa.

4.  Front salva:

    -   sessionId\
    -   mesaId\
    -   nomeCliente\

5.  Redireciona para `inicio.html`

6.  Navegação:

    -   Home\
    -   Gêneros musicais\
    -   Chat\

7.  No chat, o frontend abre um WebSocket:

        wss://backend.onrender.com/chat?sessionId=...&mesaId=...&nome=...

8.  Eventos:

    -   entrar no chat\
    -   enviar mensagem\
    -   receber mensagens\
    -   sair do chat

------------------------------------------------------------------------

## 4. Comunicação com a Nuvem (Render)

### Como funciona o Render

-   Hospeda o backend como **Web Service**\
-   Hospeda o frontend como **Static Site**\
-   Cada push no GitHub → Render faz novo deploy

### Sobre o backend gratuito

-   Fica "adormecido" após \~15 min sem acesso\
-   Acorda automaticamente ao ser acessado\
-   Durante a apresentação, basta: **acessar qualquer rota 10 min antes
    OU apertar Deploy Latest Commit**

### Banco SQLite

-   Armazenado dentro do container\
-   Reinicia a cada deploy\
-   Ideal para PI porque não precisa guardar dados permanentes

------------------------------------------------------------------------

## 5. Estrutura de Pastas Atual

    PI-Segundo-Semestre-ADS/
    ├── prisma/
    │   ├── schema.prisma
    │   └── database.db
    │
    ├── src/
    │   ├── controllers/
    │   ├── database/
    │   ├── dtos/
    │   ├── entities/
    │   ├── middlewares/
    │   ├── public/
    │   │   ├── login.html
    │   │   ├── inicio.html
    │   │   ├── genero-*.html
    │   │   ├── chat.html
    │   │   └── sons/
    │   ├── repositories/
    │   ├── routes/
    │   └── services/
    │
    ├── src/server.ts
    ├── package.json
    ├── tsconfig.json
    └── README.md

------------------------------------------------------------------------

## 6. Como Rodar o Projeto

### Pré-requisitos

-   Node.js 18+
-   npm

### Instalar dependências

``` bash
npm install
```

### Criar `.env`

    DATABASE_URL="file:./database.db"

### Rodar migrations

``` bash
npx prisma migrate dev
```

### Gerar Prisma Client

``` bash
npx prisma generate
```

### Iniciar o servidor

``` bash
npm run dev
```

Servidor local em:

    http://localhost:3000

------------------------------------------------------------------------

## 7. O que Já Está Implementado

### Backend

-   Estrutura completa em camadas\
-   CRUD de Cliente\
-   Seed de mesas\
-   Criação de sessão\
-   Validação de dados (DTOs)\
-   WebSocket funcional\
-   Chat em tempo real completo\
-   Servidor estático para o frontend

### Frontend

-   Telas de login, início e gêneros\
-   Captura automática da mesa\
-   Armazenamento local da sessão\
-   Chat responsivo estilo aplicativo\
-   Som de mensagem\
-   Avatares automáticos\
-   Scroll automático\
-   Interface refinada para desktop e celular

------------------------------------------------------------------------

## 8. O que Falta Implementar (Roadmap Oficial)

### 1. Sistema de Músicas

-   [ ] Modelos Music e PedidoMusica\
-   [ ] CRUD de músicas\
-   [ ] Sugestão de faixas pelo cliente\
-   [ ] Moderação de solicitações

### 2. Fila de Reprodução

-   [ ] Model FilaReproducao\
-   [ ] Endpoint GET/POST da fila\
-   [ ] Tela da fila no frontend

### 3. Painel Administrativo

-   [ ] Login de atendente\
-   [ ] Moderação do chat\
-   [ ] Aprovar / rejeitar músicas\
-   [ ] Visualização de sessões ativas

### 4. Segurança e Restrições

-   [ ] Restringir acesso ao Wi-Fi local\
-   [ ] Verificar IP do cliente\
-   [ ] Sessões com expiração automática

### 5. Persistência de Chat (upgrade futuro)

-   [ ] Salvar histórico\
-   [ ] Buscar mensagens anteriores

### 6. Spotify Integration (extra)

-   [ ] Callback estático\
-   [ ] Autenticação Spotify\
-   [ ] Link com fila de reprodução

------------------------------------------------------------------------

## 9. Estrutura Final Esperada

Quando completo, o sistema terá:

-   Acesso por QR Code autenticado\
-   Sessões por mesa\
-   Chat em tempo real estável\
-   Fila de músicas moderada\
-   Integração com Spotify\
-   Painel administrativo completo\
-   Segurança via rede Wi-Fi\
-   Deploy contínuo na nuvem

------------------------------------------------------------------------

## 10. Créditos

Projeto desenvolvido por estudantes da **FATEC Indaiatuba -- ADS**,
Segundo Semestre.
