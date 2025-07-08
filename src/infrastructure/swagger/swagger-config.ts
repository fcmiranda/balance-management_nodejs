import type { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config/config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Balance Management API',
      version: '1.0.0',
      description: `
## Sistema de Gerenciamento de Saldo de Clientes

### Funcionalidades:
- **Autenticação JWT** com controle de acesso baseado em roles
- **Gerenciamento de Usuários** (Admin) - CRUD completo
- **Gerenciamento de Contas** - Criação, listagem e exclusão
- **Operações Bancárias** - Depósito e saque com validações
- **Segurança** - Rate limiting, validação robusta e middleware de autenticação

### Autenticação:
Para usar os endpoints protegidos, primeiro faça login em \`/auth/login\` e use o token retornado no header Authorization como \`Bearer {token}\`.

### Roles:
- **client**: Pode gerenciar suas próprias contas e realizar operações bancárias
- **admin**: Pode gerenciar usuários além das funcionalidades de cliente
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
              minLength: config.validation.nameMinLength,
              maxLength: config.validation.nameMaxLength,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              pattern: config.validation.emailPattern,
            },
            role: {
              type: 'string',
              enum: ['client', 'admin'],
              description: 'User role',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date',
            },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Account ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID who owns the account',
            },
            accountNumber: {
              type: 'string',
              pattern: config.validation.accountNumberPattern,
              description: `Account number (${config.validation.accountNumberLength} digits starting with 1-9)`,
            },
            balance: {
              type: 'number',
              minimum: 0,
              description: 'Account balance',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account last update date',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              pattern: config.validation.emailPattern,
            },
            password: {
              type: 'string',
              minLength: config.validation.passwordMinLength,
              description: 'User password',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: config.validation.nameMinLength,
              maxLength: config.validation.nameMaxLength,
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              pattern: config.validation.emailPattern,
            },
            password: {
              type: 'string',
              minLength: config.validation.passwordMinLength,
              description: 'User password',
            },
            role: {
              type: 'string',
              enum: ['client', 'admin'],
              description: 'User role',
              default: 'client',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT token',
            },
          },
        },
        CreateAccountRequest: {
          type: 'object',
          properties: {},
          description: 'Empty object - account is created automatically for the authenticated user',
        },
        TransactionRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              minimum: config.validation.minTransactionAmount,
              maximum: config.validation.maxTransactionAmount,
              description: 'Transaction amount',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: config.validation.nameMinLength,
              maxLength: config.validation.nameMaxLength,
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              pattern: config.validation.emailPattern,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type or category',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
              example: 'The request validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Optional detailed error information',
              example: ['name: String must contain at least 1 character(s)'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the error occurred',
              example: '2025-07-07T12:00:00.000Z',
            },
            path: {
              type: 'string',
              description: 'API endpoint path where error occurred',
              example: '/api/users/123',
            },
          },
          required: ['error', 'message', 'timestamp', 'path'],
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Client Balance Management API',
    }),
  );
};

export { specs };
