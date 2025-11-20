#  Smash Brothers – Sistema de Música & Mesas via QR Code  
Documentação oficial do backend + frontend inicial do Projeto Integrador

---

##  Visão Geral do Projeto

Este repositório contém o código do sistema da **Hamburgueria Smash Brothers**, responsável por:

- Identificação de mesas via QR Code  
- Registro do nome do cliente ao entrar no sistema  
- Criação automática de sessões (SessaoCliente)  
- Cadastro fixo de mesas (M01–M10) via seed  
- Backend em **Node.js + Express + Prisma + TypeScript**  
- Frontend simples em HTML/CSS para a tela de entrada

O sistema está **funcionando** para registrar o cliente e vinculá-lo à mesa correspondente.

---

#  O que já está 100% pronto

### 🔹 1. Banco de dados (Prisma)
Models finalizados:

- **Mesa**
- **Cliente** (não está em uso, mas já existe)
- **SessaoCliente**
- **Session** (não está sendo usado – será removido depois)

### 🔹 2. Backend funcionando
- Express configurado  
- Rotas organizadas  
- Controllers + Services + Repositories  
- Criação de sessão funcionando  
- Seed das mesas funcionando  
- Servidor servindo a página `/login.html`

###  3. Frontend inicial
Arquivo: `public/login.html`

Funções implementadas:
- Detecta mesa pela URL
- Exibe número da mesa
- Registra nome do cliente
- Envia requisição para o backend

### 🔹 4. Seed com as mesas fixas
Endpoint funcionando:

```
POST /seed/mesas
```

Cria as mesas:
- M01…M10

---

#  O que falta fazer (Próximas Etapas)

## ETAPA 1 — Melhorias no fluxo do cliente
- Criar página **pós-login** do cliente
- Mostrar para qual mesa ele entrou
- Criar tela de seleção de gêneros musicais
- Criar tela de busca de música
- Criar lista de solicitações enviadas

---

## ETAPA 2 — Sistema de moderação (funcionário)
Criar páginas e rotas para moderadores:

- Tela para ver músicas sugeridas
- Aprovar / Rejeitar sugestão
- Ver fila atual
- Marcar música como tocada

---

## ETAPA 3 — Integração com Spotify
- Autenticação no Spotify
- Buscar músicas
- Enviar música para playlist real
- Controlar playback

> Obs.: O backend está pronto para integrar esse módulo sem refatoração pesada.

---

## ETAPA 4 — Segurança & UX
- Proibir acesso fora do Wi‑Fi local  
- Implementar sistema de expiração da sessão  
- Registrar IP, user-agent  
- Impedir abuso (spam de sugestões)

---

## ETAPA 5 — Organização final do projeto
Criar estrutura final como:

```
src/
 ├─ controllers/
 ├─ services/
 ├─ repositories/
 ├─ routes/
 ├─ config/
 ├─ middlewares/
 ├─ database/
 ├─ public/
```

---

#  Como rodar o projeto

### Instalar dependências
```
npm install
```

### Rodar o servidor
```
npm run dev
```

### Abrir o Prisma Studio
```
npx prisma studio
```

---

#  Como acessar o site pelo QR Code

Se o QR code apontar para:

```
http://192.168.0.50:3000/login.html?mesaId=3
```

O cliente será identificado automaticamente como **Mesa 3**.

---

#  Testando rotas pelo request.http

O arquivo `request.http` já contém:

- Criar sessão
- Criar cliente
- Listar clientes
- Criar mesas via seed

---

#  Estrutura atual do repositório

```
src/
 ├─ controllers/
 │   ├─ cliente.controller.ts
 │   ├─ sessao.controller.ts
 ├─ repositories/
 ├─ services/
 │   ├─ cliente.service.ts
 │   ├─ sessao.service.ts
 ├─ routes/
 │   ├─ cliente.routes.ts
 │   ├─ sessao.routes.ts
 ├─ database/
 │   ├─ prismaClient.ts
 ├─ public/
 │   ├─ login.html
server.ts
schema.prisma
```

---

#  Contribuição

Todos os membros podem:

1. Criar novas rotas  
2. Criar novas páginas HTML  
3. Adicionar lógica no backend  
4. Melhorar o visual do frontend  
5. Integrar o módulo Spotify  


