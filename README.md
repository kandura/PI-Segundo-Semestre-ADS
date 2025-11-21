README – Hamburgueria Beats

Plataforma de gerenciamento de pedidos musicais e chat em tempo real para ambientes de restaurante.

1. Visão Geral

O projeto Hamburgueria Beats é uma plataforma que permite que clientes de uma hamburgueria interajam com um sistema musical interno.

Cada mesa possui um QR Code exclusivo que redireciona o cliente para o sistema, permitindo:

informar o nome;

identificar automaticamente a mesa pelo QR Code;

navegar por gêneros musicais;

futuramente sugerir músicas e acompanhar a fila;

participar de um chat público em tempo real com outros clientes conectados.

O sistema foi pensado para funcionar apenas dentro da rede Wi-Fi local do estabelecimento, restringindo o uso ao ambiente físico da hamburgueria.

Tecnologias principais

Backend

Node.js + Express

TypeScript

Prisma ORM

SQLite

ws (WebSocket)

class-validator e class-transformer

tsx (dev server)

Frontend

HTML

CSS

JavaScript (vanilla)

2. Fluxo geral da aplicação (do ponto de vista do cliente)

O cliente lê o QR Code da mesa, que aponta para a login.html com um parâmetro de mesa.
Exemplo: http://localhost:3000/login.html?mesa=3

Na tela de login, o cliente:

vê um badge do tipo “Você entrou pela mesa X”;

informa seu nome;

clica em Entrar.

Ao clicar em Entrar:

o frontend faz um POST para http://localhost:3000/api/sessions enviando:

nome

mesaId

o backend cria uma sessão no banco vinculada à mesa;

o frontend recebe sessionId e salva no localStorage:

sessionId

mesaId

nomeCliente

Em seguida o usuário é redirecionado para inicio.html, que:

exibe um cabeçalho com avatar (iniciais), nome e mesa;

mostra os gêneros musicais disponíveis;

possui um footer com três botões:

Home (tela inicial)

Chat (abre o chat em tempo real)

Fila (reservado para futuras funcionalidades de fila de músicas)

Ao clicar no botão de chat do footer:

o usuário é levado para chat.html;

essa página recupera de localStorage:

sessionId

mesaId

nomeCliente

abre uma conexão WebSocket com o backend (ws://localhost:3000/chat?...);

entra automaticamente no chat com a identificação "Nome (mesa X)".

No chat:

mensagens são enviadas em tempo real para todos os clientes conectados;

o sistema mostra quando alguém entra ou sai do chat;

cada mensagem aparece em bolhas de chat com avatar, nome, texto e horário.

3. Arquitetura Interna

A aplicação segue uma arquitetura em camadas, organizada assim:

Rotas (routes) → recebem as URLs e métodos HTTP.

Controllers → recebem a requisição, chamam os serviços e retornam respostas.

Services → contêm as regras de negócio (ex.: criar cliente, criar sessão).

Repositories → fazem as consultas/acessos ao banco via Prisma.

Prisma → ORM que mapeia as entidades para o SQLite.

Banco de Dados (SQLite) → armazena clientes, sessões e (no futuro) músicas, fila, etc.

Fluxo típico de backend:

Request HTTP → Route → Controller → Service → Repository → Prisma → SQLite
                                                  ↓
                                              Response HTTP

WebSocket do Chat

O WebSocket é integrado ao mesmo servidor HTTP:

server.ts cria um servidor HTTP com o Express.

Um WebSocketServer (ws) é pendurado nesse servidor, no path /chat.

Ao conectar, o cliente envia na URL:

sessionId

mesaId

nome

O backend:

monta um nome de exibição: "Nome (mesa X)";

envia para todos a mensagem de sistema: Fulano (mesa X) entrou no chat;

quando o cliente manda uma mensagem, o servidor:

gera um objeto { id, user, text, ts };

faz broadcast para todos os clientes conectados;

ao desconectar, o servidor avisa: Fulano (mesa X) saiu do chat.

4. Estrutura de Pastas (versão atual)
PI-Segundo-Semestre-ADS/
│
├── prisma/
│   ├── schema.prisma        # Modelo do banco de dados
│   └── database.db          # Banco SQLite
│
├── src/
│   ├── controllers/         # Controllers (Cliente, Sessão, etc.)
│   ├── database/            # Configuração do Prisma Client
│   ├── dtos/                # DTOs e validações
│   ├── entities/            # Entidades internas
│   ├── middlewares/         # Middlewares (ex.: validações)
│   ├── public/              # Frontend (HTML/CSS/JS)
│   │   ├── login.html       # Tela de entrada (nome + mesa via QR)
│   │   ├── inicio.html      # Tela inicial pós-login
│   │   ├── genero-gospel.html
│   │   ├── genero-eletronica.html
│   │   ├── genero-rock.html
│   │   ├── genero-sertanejo.html
│   │   ├── genero-funk.html
│   │   ├── genero-rap.html
│   │   ├── chat.html        # Chat público em tempo real
│   │   └── sounds/notify.mp3 (som de nova mensagem)
│   │
│   ├── repositories/        # Acesso ao banco (via Prisma)
│   ├── routes/              # Rotas HTTP (cliente, sessão, seed, etc.)
│   └── services/            # Regras de negócio
│
├── src/server.ts            # Inicialização do servidor HTTP + WebSocket
├── package.json
├── tsconfig.json
└── README.md

5. Como Rodar o Projeto (novo usuário)
5.1. Pré-requisitos

Node.js 18+ (recomendado)

npm (vem junto com o Node)

Git

5.2. Clonar o repositório
git clone https://github.com/kandura/PI-Segundo-Semestre-ADS
cd PI-Segundo-Semestre-ADS

5.3. Instalar dependências
npm install


Isso instalará, entre outros:

express

cors

ws

prisma

@prisma/client

tsx

class-validator

class-transformer

5.4. Configurar o .env

Na raiz do projeto, crie o arquivo .env com:

DATABASE_URL="file:./database.db"


O SQLite ficará dentro da pasta prisma/ e será referenciado automaticamente.

5.5. Criar o banco e rodar migrations

Gera o banco com base no schema.prisma:

npx prisma migrate dev


Durante a primeira execução, você pode dar um nome curto para a migration (ex.: init).

5.6. Gerar o Prisma Client
npx prisma generate


Isso gera o client utilizado pelos repositories.

5.7. Rodar o servidor (HTTP + WebSocket)
npm run dev


O script usa tsx para rodar src/server.ts.

O servidor sobe na porta 3000 (padrão).

Você deve ver algo como:

Servidor HTTP/WS rodando na porta 3000
Chat WebSocket em ws://localhost:3000/chat

5.8. Seed das mesas (opcional, se estiver configurado)

O projeto possui rotas de seed que podem criar mesas iniciais (ex.: 5 mesas).
Se necessário, acesse a rota de seed via navegador ou REST Client de acordo com a configuração existente em routes/seed.routes.ts.

5.9. Acessar o sistema como cliente (simulando o QR Code)

Com o servidor rodando:

Acesse a URL de login com o parâmetro mesa:

http://localhost:3000/login.html?mesa=1

http://localhost:3000/login.html?mesa=2

etc.

Digite um nome (ex.: “Ana”, “Jorge”).

Clique em Entrar.

O fluxo será:

criação de sessão no backend;

salvamento de sessionId, mesaId e nomeCliente no localStorage;

redirecionamento para inicio.html.

5.10. Testar o chat em tempo real

Abra duas abas ou dois navegadores diferentes.

Em cada um, acesse:

http://localhost:3000/login.html?mesa=1

http://localhost:3000/login.html?mesa=3

Faça login com nomes diferentes.

Em cada aba, clique no botão de chat (balãozinho) no footer:

isso leva para /chat.html.

Envie mensagens de um lado e do outro:

as mensagens aparecem para todos conectados;

o sistema mostra:

[hh:mm] Sistema: Fulano (mesa X) entrou no chat.

bolhas de conversa tipo WhatsApp:

suas mensagens: à direita, laranja, com avatar das suas iniciais;

mensagens dos outros: à esquerda, em cinza, com avatar das iniciais deles;

mensagens do sistema: centralizadas em amarelo;

toca um som de nova mensagem quando alguém envia algo para você.

6. O que Já Está Implementado
Backend

Estrutura completa em camadas:

controllers, services, repositories, entities, dtos, middlewares.

Rotas organizadas:

Clientes

Sessões

Seed de mesas

Controllers funcionais para:

criação e gerenciamento de clientes;

criação de sessão por mesa.

Regras básicas de negócio:

uma sessão é sempre associada a uma mesa;

uso de DTOs para validação de entrada.

Banco SQLite funcional por trás do Prisma.

Seed automático ou via rota para criar mesas iniciais.

Servidor Express configurado e servindo:

API REST (/api/...)

arquivos estáticos (/login.html, /inicio.html, etc.).

Servidor WebSocket integrado (ws):

endpoint ws://localhost:3000/chat;

broadcast de mensagens para todos os conectados;

mensagens de entrada/saída geradas pelo sistema.

Frontend

Tela de login (login.html)

captura do número da mesa via query string ?mesa=X;

exibição da mesa (“Você entrou pela mesa X”);

formulário de nome do cliente;

envio dos dados para /api/sessions;

salvamento de:

sessionId

mesaId

nomeCliente
no localStorage;

redirecionamento para inicio.html.

Tela inicial (inicio.html)

avatar com iniciais do cliente;

saudação do tipo Mesa X • Bem-vindo(a), Nome!;

botões de gêneros musicais (gospel, eletrônica, rock, sertanejo, funk, rap);

footer com navegação:

Home (início)

Chat (abre chat.html)

Fila (reservado para futuras features).

Páginas de gênero (genero-*.html)

layout visual padronizado para cada estilo musical;

prontas para receber carregamento dinâmico de músicas no futuro.

Chat em tempo real (chat.html)

integração com o WebSocket /chat;

uso dos dados salvos no localStorage:

identificação do cliente e da mesa;

layout alinhado com a identidade visual da hamburgueria:

card central com fundo escuro;

cabeçalho com título e subtítulo;

botão de voltar para inicio.html;

mensagens em estilo WhatsApp:

minhas mensagens → direita, laranja, com minhas iniciais;

outras pessoas → esquerda, cinza, com iniciais delas;

sistema → centro, cor amarela;

exibição de horário da mensagem;

som de nova mensagem para mensagens recebidas de outros clientes.

7. O que Ainda Falta Implementar
Backend

Modelos Prisma adicionais:

Music

PedidoMusica

FilaReproducao

(opcional) ChatMensagem persistente

Endpoints:

listar músicas por gênero;

registrar sugestão de música;

listar fila de reprodução;

aprovar/recusar sugestões (moderação);

(opcional) salvar e listar histórico de mensagens de chat.

Funcionalidades de segurança:

validação de sessão ativa em cada requisição/rota;

expiração automática de sessão por inatividade;

validação de acesso por IP (uso apenas no Wi-Fi local);

roles/permissões para colaboradores (painel admin).

Frontend

Carregamento dinâmico das músicas via API.

Botão de sugestão de música enviando para o backend.

Tela de fila de reprodução integrada com o backend.

Tela administrativa para colaboradores (moderação de músicas/chat).

Ajustes finais de responsividade para diferentes tamanhos de tela.

Pequenos refinamentos de UX (estado de loading, mensagens de erro etc.).

8. Visão da Estrutura Final Esperada

Quando estiver completo, o sistema deve oferecer:

Autenticação por sessão de mesa via QR Code;

Listagem de músicas por gênero diretamente do backend;

Sistema de sugestões moderadas (aprovação/reprovação);

Fila de reprodução totalmente integrada;

Chat em tempo real entre clientes da casa;

Painel administrativo para funcionários;

Restrições de uso a partir da rede Wi-Fi local;

Expiração de sessões inativas;

Histórico de músicas executadas e estatísticas do uso do sistema.