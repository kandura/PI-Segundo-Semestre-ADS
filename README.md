README – Hamburgueria Smash Bros

Plataforma de gerenciamento de pedidos musicais para ambientes de restaurante

1. Visão Geral

O projeto Hamburgueria Smash Bros é uma plataforma que permite que clientes de uma hamburgueria interajam com um sistema musical interno. Cada mesa possui um QR Code exclusivo que redireciona o cliente para o sistema, permitindo que ele informe seu nome, escolha gêneros musicais, sugira músicas, acompanhe a fila de reprodução e participe de um bate-papo com outras mesas.

O sistema foi projetado para funcionar exclusivamente dentro da rede Wi-Fi local do estabelecimento, garantindo controle de acesso e evitando uso indevido por pessoas de fora.

A solução é composta por um backend em Node.js com Express e Prisma (utilizando SQLite) e um frontend em HTML/CSS/JS. O backend implementa lógica de sessão por mesa, registro de clientes, seed automático das mesas e fornecerá futuramente funcionalidades relacionadas à fila musical, chat e administração.

2. Tecnologias Utilizadas

Backend

Node.js + Express

TypeScript

Prisma ORM

SQLite como banco de dados

class-validator e class-transformer

tsx para desenvolvimento

Frontend

HTML

CSS

JavaScript

3. Arquitetura da Aplicação

A aplicação segue uma arquitetura em camadas, separando responsabilidades e facilitando manutenção e escalabilidade.

Fluxo interno:

O cliente acessa via QR Code, que identifica mesa.

O frontend captura nome e mesa e envia ao backend.

O backend cria uma sessão vinculada a uma mesa.

O frontend acessa páginas que carregam conteúdo dinâmico (em versões futuras).

O backend fornecerá listas de músicas, fila, chat e painel de funcionário.

Fluxo das camadas internas:

Rotas → Controllers → Services → Repositories → Prisma → Banco de dados

Services validam regras de negócio

Repositories abstraem consultas ao banco

Controllers retornam respostas HTTP ao frontend

### 4. Estrutura de Pastas (Versão Atual do Projeto)

```
PI-Segundo-Semestre-ADS/
│
├── prisma/
│   ├── schema.prisma        Modelo do banco
│   └── database.db          Banco SQLite
│
├── src/
│   ├── controllers/         Camada de controle (recebe as requisições)
│   ├── database/            Conexão inicial / Prisma Client
│   ├── dtos/                Objetos de validação
│   ├── entities/            Estruturas internas
│   ├── middlewares/         Middlewares de validação
│   ├── public/              Arquivos HTML/CSS/JS servidos ao cliente
│   │   ├── login.html
│   │   ├── inicio.html
│   │   ├── genero-gospel.html
│   │   ├── genero-eletronica.html
│   │   ├── genero-rock.html
│   │   ├── genero-sertanejo.html
│   │   ├── genero-funk.html
│   │   └── genero-rap.html
│   │
│   ├── repositories/        Consultas ao banco
│   ├── routes/              Definição das rotas
│   └── services/            Regras de negócio
│
├── server.ts                Inicialização do servidor Express
├── package.json
├── tsconfig.json
└── README.md
```

5. Como Rodar o Projeto
5.1. Clonar o repositório
git clone https://github.com/kandura/PI-Segundo-Semestre-ADS

5.2. Entrar na pasta do projeto
cd PI-Segundo-Semestre-ADS

5.3. Instalar dependências
npm install

5.4. Criar o arquivo .env

Dentro da raiz do projeto, crie um arquivo .env:

DATABASE_URL="file:./database.db"

5.5. Executar as migrations

Para gerar o banco SQLite baseado no schema:

npx prisma migrate dev

5.6. Gerar o Prisma Client
npx prisma generate

5.7. Rodar o servidor
npm run dev


O servidor será iniciado em:

http://localhost:3000

5.8. Acessar o Prisma Studio (opcional)
npx prisma studio

6. O que Já Está Implementado
Backend

Estrutura completa do projeto em camadas

Rotas organizadas para clientes e sessões

Controllers funcionais para Cliente e Sessão

Services com regras básicas para criação de sessão e CRUD de cliente

Repositórios operacionais

Middlewares de validação

Banco SQLite funcional

Seed automático de mesas (5 mesas pré-cadastradas)

Servidor Express configurado

Rotas estáticas servindo arquivos do frontend

Frontend

Tela de login totalmente funcional

Integração com backend para criação de sessão

Armazenamento de dados no localStorage

Tela inicial completa seguindo o novo layout

Páginas de gêneros musicais estruturadas visualmente

Navegação entre páginas já configurada

Identidade visual consistente com padronização definida

7. O que Falta Implementar
Backend

Modelos adicionais no Prisma:

Music

PedidoMusica

FilaReproducao

ChatMensagem

Endpoints necessários:

Listar músicas por gênero

Registrar sugestão de música

Listar fila de reprodução

Registrar mensagens de chat

Listar mensagens do chat

Painel administrativo para moderação

Middlewares adicionais:

Validação de sessão ativa

Expiração automática de sessões

Validação de acesso por IP (Wi-Fi interno)

Validação de permissões de funcionário (painel admin)

Frontend

Carregamento dinâmico de músicas por gênero (requisição ao backend)

Botão de envio de música funcional

Tela de bate-papo operando em tempo real

Tela de fila de reprodução totalmente integrada

Página administrativa para colaboradores

Otimização para telas de celular (responsividade final)

8. Estrutura Final Esperada

Quando completo, o sistema deverá incluir:

Autenticação via sessão por mesa

Listagem de músicas integradas ao backend

Sistema de sugestões moderadas

Fila de reprodução completa

Bate-papo entre mesas

Painel administrativo

Restrições por Wi-Fi local

Expiração automática de sessão por inatividade

Histórico de músicas executadas


