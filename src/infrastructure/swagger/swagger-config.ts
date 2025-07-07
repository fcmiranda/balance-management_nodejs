import type { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Balance Management API',
      version: '1.0.0',
      description: 'API for managing client accounts and balances',
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
              minLength: 2,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
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
              pattern: '^[1-9]\\d{9}$',
              description: 'Account number (10 digits starting with 1-9)',
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
            },
            password: {
              type: 'string',
              minLength: 6,
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
              minLength: 2,
              maxLength: 100,
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            password: {
              type: 'string',
              minLength: 6,
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
          required: ['accountNumber'],
          properties: {
            accountNumber: {
              type: 'string',
              pattern: '^[1-9]\\d{9}$',
              description: 'Account number (10 digits starting with 1-9)',
            },
          },
        },
        TransactionRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              minimum: 0.01,
              description: 'Transaction amount',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
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
