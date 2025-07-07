import { beforeEach, describe, expect, it } from '@jest/globals';
import { config } from '../../../src/infrastructure/config/config';

describe('Configuration Management', () => {
  describe('Configuration Loading', () => {
    it('should load all configuration values', () => {
      expect(config).toBeDefined();
      expect(config.port).toBeDefined();
      expect(config.nodeEnv).toBeDefined();
      expect(config.jwtSecret).toBeDefined();
      expect(config.jwtExpiresIn).toBeDefined();
      expect(config.bcryptRounds).toBeDefined();
      expect(config.validation).toBeDefined();
      expect(config.rateLimitWindowMs).toBeDefined();
      expect(config.rateLimitMaxRequests).toBeDefined();
      expect(config.swaggerUrl).toBeDefined();
      expect(config.logging).toBeDefined();
      expect(config.limits).toBeDefined();

      // Optional properties may be undefined - check they exist on the config object
      expect('allowedOrigins' in config).toBe(true);
    });

    it('should have valid validation configuration', () => {
      const validation = config.validation;

      expect(validation.nameMinLength).toBeGreaterThan(0);
      expect(validation.nameMaxLength).toBeGreaterThan(validation.nameMinLength);
      expect(validation.passwordMinLength).toBeGreaterThan(0);
      expect(validation.passwordMaxLength).toBeGreaterThan(validation.passwordMinLength);
      expect(validation.accountNumberMinLength).toBeGreaterThan(0);
      expect(validation.accountNumberMaxLength).toBeGreaterThan(validation.accountNumberMinLength);
      expect(validation.minTransactionAmount).toBeGreaterThan(0);
      expect(validation.maxTransactionAmount).toBeGreaterThan(validation.minTransactionAmount);
      expect(validation.minPositiveInteger).toBeGreaterThan(0);
      expect(validation.maxBalanceValue).toBeGreaterThan(0);
    });

    it('should have valid regex patterns', () => {
      const validation = config.validation;

      expect(() => new RegExp(validation.accountNumberPattern)).not.toThrow();
      expect(() => new RegExp(validation.emailPattern)).not.toThrow();

      // Test account number pattern
      const accountNumberRegex = new RegExp(validation.accountNumberPattern);
      expect(accountNumberRegex.test('1234567890')).toBe(true);
      expect(accountNumberRegex.test('0123456789')).toBe(false);
      expect(accountNumberRegex.test('123456789')).toBe(false);
      expect(accountNumberRegex.test('12345678901')).toBe(false);

      // Test email pattern
      const emailRegex = new RegExp(validation.emailPattern);
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('test@')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
    });

    it('should have valid auth configuration', () => {
      expect(config.jwtSecret).toBeDefined();
      expect(config.jwtExpiresIn).toBeDefined();
      expect(config.bcryptRounds).toBeGreaterThan(0);
      expect(config.bcryptRounds).toBeLessThan(20); // Reasonable upper bound
    });

    it('should have valid rate limit configuration', () => {
      expect(config.rateLimitWindowMs).toBeGreaterThan(0);
      expect(config.rateLimitMaxRequests).toBeGreaterThan(0);
      expect(config.rateLimitAuthWindowMs).toBeGreaterThan(0);
      expect(config.rateLimitAuthMaxRequests).toBeGreaterThan(0);
      expect(config.rateLimitAuthMaxRequests).toBeLessThanOrEqual(config.rateLimitMaxRequests);
    });

    it('should have valid server configuration', () => {
      expect(config.port).toBeGreaterThan(0);
      expect(config.port).toBeLessThan(65536);
      expect(['development', 'production', 'test']).toContain(config.nodeEnv);
    });

    it('should have valid application limits', () => {
      const limits = config.limits;

      expect(limits.maxAccountsPerUser).toBeGreaterThan(0);
      expect(limits.maxUsersTotal).toBeGreaterThan(0);
      expect(limits.requestTimeoutMs).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate that min values are less than max values', () => {
      const validation = config.validation;

      expect(validation.nameMinLength).toBeLessThan(validation.nameMaxLength);
      expect(validation.passwordMinLength).toBeLessThan(validation.passwordMaxLength);
      expect(validation.accountNumberMinLength).toBeLessThan(validation.accountNumberMaxLength);
      expect(validation.minTransactionAmount).toBeLessThan(validation.maxTransactionAmount);
    });

    it('should validate that positive integers are actually positive', () => {
      const validation = config.validation;

      expect(validation.minPositiveInteger).toBeGreaterThan(0);
      expect(validation.maxBalanceValue).toBeGreaterThan(0);
    });
  });
});
