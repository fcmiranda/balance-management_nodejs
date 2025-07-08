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

### Funcionalidades Principais:
- **Autenticação JWT** com controle de acesso baseado em roles (client/admin)
- **Gerenciamento de Usuários** (Admin) - CRUD completo com validações
- **Gerenciamento de Contas Bancárias** - Criação, listagem e exclusão
- **Operações Bancárias** - Depósito e saque com validações de saldo
- **Segurança Robusta** - Rate limiting, validação de dados e middleware de autenticação
- **Documentação Interativa** - Swagger UI com exemplos e schemas completos

### Como usar a API:
1. **Registre-se** usando \`POST /auth/register\` ou faça login com \`POST /auth/login\`
2. **Use o token** retornado no header Authorization como \`Bearer {token}\`
3. **Gerencie contas** e realize operações bancárias conforme suas permissões

### Roles e Permissões:
- **client**: Pode gerenciar suas próprias contas e realizar operações bancárias
- **admin**: Pode gerenciar usuários além das funcionalidades de cliente

### Endpoints Disponíveis:
- **Autenticação**: /auth/* (registro, login, perfil)
- **Usuários**: /users/* (CRUD - apenas admins)
- **Contas**: /accounts/* (CRUD e operações bancárias)
- **Sistema**: /health (verificação de saúde)
      `,
      contact: {
        name: '',
        email: '',
      },
      license: {
        name: '',
        url: '',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: 'Development server',
      },
      {
        url: 'https://client-balance-api.itau.com.br/api',
        description: 'Production server',
      },
      {
        url: 'https://staging-client-balance-api.itau.com.br/api',
        description: 'Staging server',
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
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
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
              example: '2025-07-08T12:00:00.000Z',
            },
            path: {
              type: 'string',
              description: 'API endpoint path where error occurred',
              example: '/api/users/123',
            },
          },
          required: ['error', 'message', 'timestamp', 'path'],
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the operation was completed',
              example: '2025-07-08T12:00:00.000Z',
            },
          },
          required: ['message', 'timestamp'],
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['OK', 'ERROR'],
              description: 'Application health status',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp',
              example: '2025-07-08T12:00:00.000Z',
            },
            uptime: {
              type: 'number',
              description: 'Application uptime in seconds',
              example: 3600,
            },
            memory: {
              type: 'object',
              description: 'Memory usage information',
              properties: {
                rss: {
                  type: 'number',
                  description: 'Resident Set Size (total memory allocated)',
                },
                heapTotal: {
                  type: 'number',
                  description: 'Total heap allocated',
                },
                heapUsed: {
                  type: 'number',
                  description: 'Heap actually used',
                },
                external: {
                  type: 'number',
                  description: 'External memory usage',
                },
                arrayBuffers: {
                  type: 'number',
                  description: 'Memory allocated for ArrayBuffers',
                },
              },
            },
            environment: {
              type: 'string',
              description: 'Environment name',
              example: 'development',
            },
          },
          required: ['status', 'timestamp', 'uptime', 'memory', 'environment'],
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/app.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info hgroup.main h2 { color: #ff6900 }
        .swagger-ui .info .title { color: #ff6900 }
        .swagger-ui .scheme-container { background: #fafafa }
      `,
      customSiteTitle: 'Itaú - Client Balance Management API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        tryItOutEnabled: true,
      },
    }),
  );

  // Redirect root API docs path to Swagger UI
  app.get('/api-docs', (_req, res) => {
    res.redirect('/api-docs/');
  });
};

export { specs };
