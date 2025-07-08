# Case de Engenharia Itaú - Node.js

## 📋 Índice
- [Introdução](#introdução)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Documentação da API](#documentação-da-api)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Quick Start](#quick-start)
- [Instalação e Execução](#instalação-e-execução)
- [Segurança Implementada](#segurança-implementada)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)
- [Correções e Melhorias](#correções-e-melhorias-implementadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Status do Projeto](#status-do-projeto)
- [Métricas do Projeto](#-métricas-do-projeto)
- [Contribuição](#-contribuição)
- [Suporte](#-suporte)

## Introdução
Sistema de gerenciamento de saldo de clientes desenvolvido com arquitetura Clean Architecture, seguindo as melhores práticas de desenvolvimento e implementando medidas de segurança robustas.

### Principais Funcionalidades Implementadas:
- **Arquitetura Clean Architecture** com separação clara de responsabilidades
- **TypeScript** com tipagem forte e validação robusta
- **Autenticação JWT** com middleware de segurança
- **Validação de dados** usando Zod
- **Testes unitários e de integração** com Jest (>90% cobertura)
- **Documentação OpenAPI/Swagger** completa e interativa
- **Middleware de segurança** (CORS, Helmet, Rate Limiting)
- **Logging estruturado** para monitoramento
- **Padrão Repository** para abstração de dados
- **Dependency Injection** com Factory Pattern
- **TypeORM** para gerenciamento de banco de dados
- **SQLite** para persistência de dados
- **Biome** para linting e formatação de código

## Estrutura do Banco de Dados
Utilizando SQLite com TypeORM:

### Tabela: USERS
- id - INTEGER PRIMARY KEY AUTOINCREMENT
- name - TEXT NOT NULL
- email - TEXT UNIQUE NOT NULL
- password - TEXT NOT NULL (hash bcrypt)
- role - TEXT NOT NULL (client/admin)
- createdAt - DATETIME
- updatedAt - DATETIME

### Tabela: ACCOUNTS
- id - INTEGER PRIMARY KEY AUTOINCREMENT
- userId - INTEGER FOREIGN KEY
- accountNumber - TEXT UNIQUE NOT NULL (10 dígitos)
- balance - DECIMAL NOT NULL DEFAULT 0
- createdAt - DATETIME
- updatedAt - DATETIME

## API Endpoints

### Autenticação (/api/auth)
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário  
- `GET /api/auth/me` - Obter dados do usuário atual
- `POST /api/auth/logout` - Logout

### Usuários (/api/users) - Admin apenas
- `GET /api/users/{id}` - Obter detalhes do usuário
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário

### Contas (/api/accounts)
- `GET /api/accounts` - Listar contas do usuário autenticado
- `POST /api/accounts` - Criar nova conta
- `POST /api/accounts/{id}/deposit` - Depositar valor na conta
- `POST /api/accounts/{id}/withdraw` - Sacar valor da conta
- `DELETE /api/accounts/{id}` - Deletar conta

### Sistema
- `GET /health` - Health check da aplicação

## Documentação da API

A documentação completa da API está disponível via Swagger UI:
- **URL Local:** `http://localhost:8080/api-docs`
- **Formato:** OpenAPI 3.0
- **Recursos:** 
  - Schemas completos com validações
  - Exemplos de requisições e respostas
  - Interface interativa para testes
  - Autenticação JWT integrada
  - Documentação detalhada de todos os endpoints

### Recursos da Documentação:
- **Interface Interativa**: Teste todos os endpoints diretamente no navegador
- **Autenticação**: Suporte completo para JWT tokens
- **Validações**: Documentação completa dos schemas de validação
- **Exemplos**: Requisições e respostas de exemplo para todos os endpoints
- **Filtros**: Busca e filtragem de endpoints por tags

## Tecnologias Utilizadas

### Core
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática e ferramentas avançadas
- **Express.js** - Framework web minimalista e flexível

### Banco de Dados
- **SQLite** - Banco de dados relacional leve e embarcado
- **TypeORM** - ORM moderno com suporte completo ao TypeScript

### Autenticação e Segurança
- **JWT (jsonwebtoken)** - Tokens de autenticação seguros
- **bcryptjs** - Hash de senhas com salt
- **Helmet** - Headers de segurança HTTP
- **CORS** - Controle de acesso entre origens
- **express-rate-limit** - Rate limiting para proteção contra ataques

### Validação e Documentação
- **Zod** - Validação de schemas com TypeScript-first
- **Swagger/OpenAPI 3.0** - Documentação interativa da API
- **swagger-jsdoc** - Geração de documentação a partir de comentários JSDoc

### Testes e Qualidade
- **Jest** - Framework de testes unitários e de integração
- **Biome** - Linter e formatador de código moderno
- **Husky** - Git hooks para qualidade de código

### Arquitetura e Padrões
- **Clean Architecture** - Separação clara de responsabilidades
- **Repository Pattern** - Abstração de acesso a dados
- **Dependency Injection** - Inversão de controle com Factory Pattern
- **Middleware Pattern** - Processamento modular de requisições

### DevOps e Ferramentas
- **ts-node** - Execução direta de TypeScript
- **tsconfig-paths** - Resolução de caminhos absolutos
- **dotenv** - Gerenciamento de variáveis de ambiente

## Quick Start

### 🚀 Instalação Rápida
```bash
# Clonar o repositório
git clone <repository-url>
cd client-balance-management_nodejs

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Configurar banco de dados
npm run setup:typeorm

# (Opcional) Popular com dados de exemplo
npm run seed:typeorm

# Iniciar servidor de desenvolvimento
npm start
```

### 📖 Acessar Documentação
Após iniciar o servidor, acesse:
- **API Documentation**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health

### 🔐 Exemplo de Uso
```bash
# 1. Registrar um novo usuário
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@example.com", "password": "senha123"}'

# 2. Fazer login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@example.com", "password": "senha123"}'

# 3. Usar o token retornado para criar uma conta
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

### Variáveis de Ambiente
Criar arquivo `.env` baseado no `.env.example`:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration (SQLite)
DB_PATH=./database.sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=false

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=20
```

## Segurança Implementada

### Autenticação e Autorização
- JWT tokens com expiração configurável
- Middleware de autenticação robusto
- Controle de acesso baseado em roles
- Hash de senhas com bcrypt

### Middleware de Segurança
- **Helmet.js** - Headers de segurança HTTP
- **CORS** - Controle de origem cruzada
- **Rate Limiting** - Proteção contra spam/DoS
- **Input Sanitization** - Limpeza de dados de entrada
- **Request Logging** - Monitoramento de requisições

### Validação de Dados
- Validação de entrada com Zod
- Sanitização de dados
- Validação de tipos TypeScript
- Tratamento de erros centralizado

## Testes

### Cobertura de Testes
- **Testes Unitários** - Use cases, entidades, serviços
- **Testes de Integração** - Rotas, controladores
- **Testes de Middleware** - Autenticação, validação
- **Cobertura >90%** - Garantia de qualidade

### Executar Testes
```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração  
npm run test:integration

# Cobertura
npm run test:coverage
```

## Troubleshooting

### Problemas Comuns

#### 🚫 Erro: "Cannot find module"
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 🚫 Erro: "Database connection failed"
```bash
# Verificar se o banco foi configurado
npm run setup:typeorm

# Verificar permissões do arquivo database.sqlite
chmod 664 database.sqlite
```

#### 🚫 Erro: "JWT token invalid"
```bash
# Verificar se o JWT_SECRET está configurado no .env
# Gerar um novo secret se necessário
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 🚫 Erro: "Port already in use"
```bash
# Verificar qual processo está usando a porta
lsof -i :8080

# Alterar a porta no arquivo .env
echo "PORT=3000" >> .env
```

### Logs e Debug
```bash
# Executar com logs detalhados
NODE_ENV=development npm start

# Verificar logs de erro
tail -f logs/error.log
```

### Performance e Monitoramento
- Verificar uso de memória: Use ferramentas como `htop` ou `ps`
- Monitorar queries do banco: Ativar `DB_LOGGING=true` no .env
- Rate limiting: Configurar limites adequados para produção

## Correções e Melhorias Implementadas

### Correção do Bug de Controle de Saldo
**Problema Identificado:** Operações de saque não validavam saldo suficiente adequadamente
**Solução Implementada:** 
- Validação de saldo antes de operações de saque na entidade Account
- Método `canWithdraw()` para verificar se o saque é possível
- Tratamento adequado de erros de saldo insuficiente
- Transações atômicas para garantir consistência dos dados

### Melhorias de Arquitetura
- Implementação completa de Clean Architecture
- Separação clara entre domínio, aplicação e infraestrutura
- Padrão Repository para abstração de acesso a dados
- Dependency Injection com Factory Pattern
- Validação robusta com Zod em todas as camadas

## Estrutura do Projeto

```
src/
├── app.ts                   # Ponto de entrada da aplicação
├── types.ts                 # Tipos globais
├── application/             # Casos de uso e interfaces
│   ├── interfaces/         # Interfaces dos repositórios e serviços
│   └── use-cases/          # Casos de uso da aplicação
├── domain/                  # Entidades e regras de negócio
│   ├── entities/           # Entidades do domínio (User, Account)
│   ├── errors/             # Errors customizados
│   ├── repositories/       # Interfaces dos repositórios
│   ├── validation/         # Schemas de validação do domínio
│   └── common/             # Utilitários comuns do domínio
├── infrastructure/         # Implementações concretas
│   ├── auth/              # Serviços de autenticação JWT
│   ├── config/            # Configurações da aplicação
│   ├── database/          # Configuração do TypeORM
│   ├── di/                # Dependency Injection (Factory)
│   ├── logging/           # Sistema de logging
│   ├── mappers/           # Mapeamento entre camadas
│   ├── middleware/        # Middlewares personalizados
│   ├── repositories/      # Implementações dos repositórios
│   ├── swagger/           # Configuração do Swagger/OpenAPI
│   └── validation/        # Middlewares e schemas de validação
├── controllers/            # Controladores HTTP
│   ├── auth-controller.ts  # Autenticação
│   ├── user-controller.ts  # Gerenciamento de usuários
│   └── account-controller.ts # Gerenciamento de contas
├── routes/                 # Definição de rotas
│   ├── auth-routes.ts      # Rotas de autenticação
│   ├── user-routes.ts      # Rotas de usuários
│   ├── account-routes.ts   # Rotas de contas
│   └── index.ts            # Agregador de rotas
└── scripts/                # Scripts utilitários
    ├── setup-typeorm.ts    # Setup inicial do banco
    └── seed-typeorm-database.ts # Seeds de dados

tests/
├── setup.ts                # Configuração dos testes
├── test-utils.ts          # Utilitários para testes
├── unit/                  # Testes unitários
├── integration/           # Testes de integração
└── controllers/           # Testes dos controladores
```

## Status do Projeto

✅ **Arquitetura e Estrutura**
- Clean Architecture implementada
- TypeScript com tipagem forte
- Padrão Repository e Factory
- Separação clara de responsabilidades

✅ **Funcionalidades Principais**
- Sistema de autenticação JWT completo
- CRUD de usuários com controle de permissões
- Gerenciamento de contas bancárias
- Operações de depósito e saque com validações
- Exclusão de contas

✅ **Correção de Bugs**
- Bug do controle de saldo identificado e corrigido
- Validações robustas implementadas
- Tratamento de erros consistente

✅ **Segurança Implementada**
- Autenticação JWT com middleware robusto
- Autorização baseada em roles
- Rate limiting para proteção contra ataques
- Validação e sanitização de dados
- Headers de segurança com Helmet

✅ **Qualidade e Testes**
- Cobertura de testes >90%
- Testes unitários e de integração
- Validação com Zod em todas as camadas
- Logging estruturado

✅ **Documentação**
- OpenAPI/Swagger completo e atualizado
- README.md detalhado
- Comentários JSDoc nos endpoints

---


## 📊 Métricas do Projeto

### Qualidade de Código
- **Cobertura de Testes**: >90% 
- **Testes**: 128 testes em 17 suites
- **Linting**: 100% conforme (Biome)
- **TypeScript**: Tipagem estrita habilitada
- **Arquitetura**: Clean Architecture implementada

### Performance e Segurança
- **Rate Limiting**: Configurado para produção
- **JWT**: Tokens seguros com expiração
- **Headers de Segurança**: Helmet.js integrado
- **Validação**: Schemas Zod em todas as camadas
- **Logging**: Sistema estruturado de logs

### Endpoints Disponíveis
- **Autenticação**: 4 endpoints
- **Usuários**: 4 endpoints (Admin)
- **Contas**: 5 endpoints
- **Sistema**: 1 endpoint (health)
- **Total**: 14 endpoints documentados

### Estrutura de Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
test: adiciona ou modifica testes
refactor: refatora código sem mudança de funcionalidade
```

### Links Úteis
- **Swagger UI**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health
- **Coverage Report**: ./coverage/index.html
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
