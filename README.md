# Case de engenharia Itau - .NodeJS

## Introdução
Este projeto foi completamente refatorado seguindo as melhores práticas de desenvolvimento, implementando arquitetura Clean Architecture, padrões de design modernos e medidas de segurança robustas.

### Principais Melhorias Implementadas:
- **Arquitetura Clean Architecture** com separação clara de responsabilidades
- **TypeScript** com tipagem forte e validação robusta
- **Autenticação JWT** com middleware de segurança
- **Validação de dados** usando Zod
- **Testes unitários e de integração** com Jest
- **Documentação OpenAPI/Swagger** completa
- **Middleware de segurança** (CORS, Helmet, Rate Limiting)
- **Logging estruturado** para monitoramento
- **Padrão Repository** para abstração de dados
- **Dependency Injection** com container IoC

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

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter dados do usuário atual
- `POST /api/auth/logout` - Logout

### Usuários (Admin apenas)
- `GET /api/users/{id}` - Obter detalhes do usuário
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário

### Contas
- `GET /api/accounts` - Listar contas do usuário
- `POST /api/accounts` - Criar nova conta
- `POST /api/accounts/{id}/deposit` - Depositar valor
- `POST /api/accounts/{id}/withdraw` - Sacar valor

## Documentação da API

A documentação completa da API está disponível via Swagger UI:
- **URL:** `http://localhost:8080/api-docs`
- **Formato:** OpenAPI 3.0
- **Recursos:** Schemas, exemplos, autenticação JWT

## Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run setup:typeorm

# Executar seeds (opcional)
npm run seed:typeorm
```

### Execução
```bash
# Desenvolvimento
npm start

# Build
npm run build

# Testes
npm test
npm run test:coverage
```

### Variáveis de Ambiente
Criar arquivo `.env` baseado no `.env.example`:
```
NODE_ENV=development
PORT=8080
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
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

## Correção de Bugs

### Bug do Controle de Saldo
**Problema Identificado:** Operações de saque não validavam saldo suficiente
**Solução Implementada:** 
- Validação de saldo antes de operações de saque
- Transações atômicas para garantir consistência
- Tratamento adequado de erros de saldo insuficiente

## Estrutura do Projeto

```
src/
├── application/          # Casos de uso e interfaces
├── domain/              # Entidades e regras de negócio
├── infrastructure/      # Implementações concretas
├── controllers/         # Controladores HTTP
├── routes/             # Definição de rotas
└── types.ts            # Tipos globais

tests/
├── unit/               # Testes unitários
├── integration/        # Testes de integração
└── setup.ts           # Configuração de testes
```

## Ações Realizadas

✅ **Refatoração Completa**
- Implementação de Clean Architecture
- Uso de melhores práticas e padrões
- Qualidade de código garantida

✅ **Correção de Bugs**
- Bug do controle de saldo identificado e corrigido
- Validações robustas implementadas

✅ **Segurança Implementada**
- Autenticação JWT
- Middleware de segurança
- Validação e sanitização de dados
- Rate limiting e proteções

✅ **Documentação OpenAPI**
- Swagger UI disponível
- Documentação completa da API
- Exemplos e schemas detalhados

## Próximos Passos

Para completar o case, falta apenas:
5. **Aplicação Angular** - Interface web consumindo a API

---

*Este projeto demonstra as melhores práticas de desenvolvimento backend com Node.js, TypeScript e arquitetura limpa.*
