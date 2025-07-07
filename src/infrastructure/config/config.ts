import { z } from 'zod';

/**
 * Configuration validation schema
 * Ensures all required environment variables are present and valid
 */
const configSchema = z.object({
  // Server Configuration
  port: z.coerce.number().int().positive().default(8080),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),

  // JWT Configuration
  jwtSecret: z.string().min(1, 'JWT_SECRET is required'),
  jwtExpiresIn: z.string().default('24h'),

  // Database Configuration
  dbPath: z.string().default('./database.sqlite'),
  dbSynchronize: z.boolean().default(true),
  dbLogging: z.boolean().default(false),

  // Security Configuration
  bcryptRounds: z.coerce.number().int().min(8).max(15).default(12),

  // Rate Limiting Configuration
  rateLimitWindowMs: z.coerce.number().int().positive().default(900000), // 15 minutes
  rateLimitMaxRequests: z.coerce.number().int().positive().default(100),
  rateLimitAuthWindowMs: z.coerce.number().int().positive().default(900000), // 15 minutes
  rateLimitAuthMaxRequests: z.coerce.number().int().positive().default(5),

  // CORS Configuration
  allowedOrigins: z.string().optional(),

  // Swagger Configuration
  swaggerUrl: z.string().url().default('http://localhost:8080/api'),

  // Business Rules Configuration
  validation: z
    .object({
      // User validation rules
      nameMinLength: z.coerce.number().int().positive().default(2),
      nameMaxLength: z.coerce.number().int().positive().default(100),
      passwordMinLength: z.coerce.number().int().positive().default(6),
      passwordMaxLength: z.coerce.number().int().positive().default(100),

      // Account validation rules
      accountNumberPattern: z.string().default('^[1-9]\\d{9}$'),
      accountNumberLength: z.coerce.number().int().positive().default(10),
      accountNumberMinLength: z.coerce.number().int().positive().default(5),
      accountNumberMaxLength: z.coerce.number().int().positive().default(20),

      // Email validation pattern
      emailPattern: z.string().default('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),

      // Amount validation
      minTransactionAmount: z.coerce.number().positive().default(0.01),
      maxTransactionAmount: z.coerce.number().positive().default(1000000),

      // General validation rules
      minPositiveInteger: z.coerce.number().int().positive().default(1),
      maxBalanceValue: z.coerce.number().positive().default(Number.MAX_SAFE_INTEGER),
    })
    .default({}),

  // Logging Configuration
  logging: z
    .object({
      level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
      enableConsole: z.boolean().default(true),
      enableFile: z.boolean().default(false),
      logFilePath: z.string().default('./logs/app.log'),
    })
    .default({}),

  // Application Limits
  limits: z
    .object({
      requestBodySizeLimit: z.string().default('10mb'),
      requestTimeoutMs: z.coerce.number().int().positive().default(30000),
      maxAccountsPerUser: z.coerce.number().int().positive().default(10),
      maxUsersTotal: z.coerce.number().int().positive().default(10000),
    })
    .default({}),
});

/**
 * Load and validate configuration from environment variables
 */
function loadConfig() {
  const rawConfig = {
    // Server
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,

    // Database
    dbPath: process.env.DB_PATH,
    dbSynchronize: process.env.DB_SYNCHRONIZE !== 'false' && process.env.NODE_ENV !== 'production',
    dbLogging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',

    // Security
    bcryptRounds: process.env.BCRYPT_ROUNDS,

    // Rate Limiting
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    rateLimitAuthWindowMs: process.env.RATE_LIMIT_AUTH_WINDOW_MS,
    rateLimitAuthMaxRequests: process.env.RATE_LIMIT_AUTH_MAX_REQUESTS,

    // CORS
    allowedOrigins: process.env.ALLOWED_ORIGINS,

    // Swagger
    swaggerUrl: process.env.SWAGGER_URL || `http://localhost:${process.env.PORT || 8080}/api`,

    // Business Rules
    validation: {
      nameMinLength: process.env.VALIDATION_NAME_MIN_LENGTH,
      nameMaxLength: process.env.VALIDATION_NAME_MAX_LENGTH,
      passwordMinLength: process.env.VALIDATION_PASSWORD_MIN_LENGTH,
      passwordMaxLength: process.env.VALIDATION_PASSWORD_MAX_LENGTH,
      accountNumberPattern: process.env.VALIDATION_ACCOUNT_NUMBER_PATTERN,
      accountNumberLength: process.env.VALIDATION_ACCOUNT_NUMBER_LENGTH,
      accountNumberMinLength: process.env.VALIDATION_ACCOUNT_NUMBER_MIN_LENGTH,
      accountNumberMaxLength: process.env.VALIDATION_ACCOUNT_NUMBER_MAX_LENGTH,
      emailPattern: process.env.VALIDATION_EMAIL_PATTERN,
      minTransactionAmount: process.env.VALIDATION_MIN_TRANSACTION_AMOUNT,
      maxTransactionAmount: process.env.VALIDATION_MAX_TRANSACTION_AMOUNT,
      minPositiveInteger: process.env.VALIDATION_MIN_POSITIVE_INTEGER,
      maxBalanceValue: process.env.VALIDATION_MAX_BALANCE_VALUE,
    },

    // Logging
    logging: {
      level: process.env.LOG_LEVEL,
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      enableFile: process.env.LOG_ENABLE_FILE === 'true',
      logFilePath: process.env.LOG_FILE_PATH,
    },

    // Application Limits
    limits: {
      requestBodySizeLimit: process.env.REQUEST_BODY_SIZE_LIMIT,
      requestTimeoutMs: process.env.REQUEST_TIMEOUT_MS,
      maxAccountsPerUser: process.env.MAX_ACCOUNTS_PER_USER,
      maxUsersTotal: process.env.MAX_USERS_TOTAL,
    },
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingOrInvalid = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new Error(`Configuration validation failed:\n${missingOrInvalid}`);
    }
    throw error;
  }
}

/**
 * Configuration object - singleton instance
 */
export const config = loadConfig();

/**
 * Configuration type for TypeScript usage
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Helper functions for common configuration access patterns
 */
export const configHelpers = {
  isProduction: () => config.nodeEnv === 'production',
  isDevelopment: () => config.nodeEnv === 'development',
  isTest: () => config.nodeEnv === 'test',

  getServerUrl: () => `http://localhost:${config.port}`,
  getApiUrl: () => `http://localhost:${config.port}/api`,

  getDatabaseConfig: () => ({
    database: config.dbPath,
    synchronize: config.dbSynchronize,
    logging: config.dbLogging,
  }),

  getJwtConfig: () => ({
    secret: config.jwtSecret,
    expiresIn: config.jwtExpiresIn,
  }),

  getRateLimitConfig: () => ({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
  }),

  getAuthRateLimitConfig: () => ({
    windowMs: config.rateLimitAuthWindowMs,
    max: config.rateLimitAuthMaxRequests,
  }),

  getValidationRules: () => config.validation,

  getCorsOrigins: () =>
    config.allowedOrigins?.split(',') ||
    (config.nodeEnv === 'production' ? ['https://yourdomain.com'] : ['http://localhost:3000']),
};

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  try {
    if (!config.jwtSecret || config.jwtSecret === 'fallback-secret') {
      console.warn(
        '⚠️  Using fallback JWT secret. Set JWT_SECRET environment variable for production!',
      );
    }

    if (config.nodeEnv === 'production') {
      if (config.dbSynchronize) {
        throw new Error('Database synchronization should be disabled in production');
      }
      if (config.bcryptRounds < 12) {
        console.warn('⚠️  Consider using higher bcrypt rounds (12+) in production');
      }
    }

    console.log('✅ Configuration validated successfully');
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🚀 Server will run on port: ${config.port}`);
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
  }
}
