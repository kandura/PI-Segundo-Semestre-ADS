# README – Hamburgueria Beats

Plataforma de gerenciamento de pedidos musicais e chat em tempo real para ambientes de restaurante.

---

## 1. Visão Geral

O projeto **Hamburgueria Beats** permite que clientes da hamburgueria interajam com um sistema musical interno através do QR Code da mesa.  
Os clientes podem:

- Identificar sua mesa automaticamente pelo QR Code  
- Inserir seu nome  
- Navegar por gêneros musicais  
- (Futuro) Sugerir músicas e acompanhar a fila  
- Participar de um **chat público em tempo real**

O sistema foi projetado para uso **somente dentro da rede Wi-Fi** da hamburgueria, evitando acesso externo.

### Tecnologias principais

#### **Backend**
- Node.js + Express  
- TypeScript  
- Prisma ORM  
- SQLite  
- WebSocket (`ws`)  
- class-validator + class-transformer  
- tsx (Node + TS em dev)

#### **Frontend**
- HTML  
- CSS  
- JavaScript (vanilla)

---

## 2. Fluxo da Aplicação

### **Fluxo do cliente**

1. O cliente lê o **QR Code da mesa**, que abre:  
   `login.html?mesa=3`

2. Na tela de login:
   - vê a mesa identificada automaticamente  
   - insere o nome  
   - clica em **Entrar**

3. O frontend envia:
   ```json
   POST /api/sessions
   {
     "nome": "...",
     "mesaId": ...
   }
   ```

4. O backend cria uma sessão e retorna:
   ```json
   {
     "sessionId": "..."
   }
   ```

5. O frontend salva no `localStorage`:
   - `sessionId`
   - `mesaId`
   - `nomeCliente`

6. O usuário é redirecionado para `inicio.html`

7. Métodos de navegação:
   - footer → **Home**  
   - footer → **Chat**  
   - footer → **Fila** (futuro)

8. Ao abrir `chat.html`, o frontend:
   - recupera os dados do `localStorage`
   - conecta ao WebSocket via:
     ```
     ws://localhost:3000/chat?sessionId=...&mesaId=...&nome=...
     ```
   - entra automaticamente no chat

---

## 3. Arquitetura Interna

O backend utiliza arquitetura em camadas:

```
Rotas → Controllers → Services → Repositories → Prisma → SQLite
```

### WebSocket — Chat em Tempo Real

- Cada cliente se conecta via `/chat`
- O servidor gera nome de exibição: `"Fulano (mesa X)"`
- Eventos:
  - **enter** → sistema envia: “Fulano entrou no chat”
  - **message** → broadcast para todos
  - **disconnect** → sistema envia: “Fulano saiu do chat”

---

## 4. Estrutura de Pastas (versão atual)

```
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
│   │   ├── genero-gospel.html
│   │   ├── genero-eletronica.html
│   │   ├── genero-rock.html
│   │   ├── genero-sertanejo.html
│   │   ├── genero-funk.html
│   │   ├── genero-rap.html
│   │   ├── chat.html
│   │   └── sounds/
│   │       └── notify.mp3
│   │
│   ├── repositories/
│   ├── routes/
│   └── services/
│
├── src/server.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Como Rodar o Projeto (novo usuário)

### 5.1. Pré-requisitos
- Node.js 18+  
- npm (vem junto com o Node)

---

### 5.2. Instalar dependências

```bash
npm install
```

---

### 5.3. Criar o arquivo `.env`

Dentro da raiz do projeto:

```
DATABASE_URL="file:./database.db"
```

---

### 5.4. Executar as migrations

```bash
npx prisma migrate dev
```

---

### 5.5. Gerar o Prisma Client

```bash
npx prisma generate
```

---

### 5.6. Rodar o servidor

```bash
npm run dev
```

O servidor iniciará em:

```
http://localhost:3000
```

---

### 5.7. (Opcional) Abrir Prisma Studio

```bash
npx prisma studio
```

---

## 6. O que Já Está Implementado

### Backend
- Estrutura completa em camadas  
- CRUD completo de Cliente  
- Criação de sessão vinculada à mesa  
- Seed automático das mesas  
- WebSocket totalmente funcional  
- Chat em tempo real com:
  - entrada  
  - envio de mensagens  
  - saída  
  - mensagens formatadas  
- Integração com frontend  
- Servidor estático para páginas HTML

### Frontend
- Tela de login funcional  
- Captura automática da mesa via URL  
- Armazenamento de nome/mesa/sessão no localStorage  
- Tela inicial estilizada  
- Botão de chat corrigido e estilizado  
- Chat completo com:
  - bolhas tipo WhatsApp  
  - avatar gerado automaticamente  
  - som de nova mensagem  
  - rolagem automática  
  - mensagens do sistema

---

## 7. O que Falta Implementar

### Backend
- Models adicionais:
  - Music  
  - PedidoMusica  
  - FilaReproducao  
  - ChatMensagem (persistência futura)
- Endpoints musicais
- Painel de funcionário
- Restrições por IP (Wi-Fi local)
- Expiração de sessão

### Frontend
- Páginas carregando músicas dinamicamente
- Tela de fila de reprodução
- Painel administrativo

---

## 8. Estrutura Final Esperada

Quando concluído, o sistema incluirá:

- Autenticação por sessão e mesa  
- Sugestões de música moderadas  
- Fila de reprodução  
- Chat persistente  
- Painel administrativo  
- Políticas de segurança por Wi-Fi local  
- Expiração automática de sessões

---

## 9. Créditos
Projeto desenvolvido por estudantes da FATEC Indaiatuba – ADS.
