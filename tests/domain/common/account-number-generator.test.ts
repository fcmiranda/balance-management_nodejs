import { generateAccountNumber } from '../../../src/domain/common/account-number-generator';

describe('Account Number Generator', () => {
  let originalDateNow: () => number;
  let originalMathRandom: () => number;

  beforeEach(() => {
    // Salvar implementações originais
    originalDateNow = Date.now;
    originalMathRandom = Math.random;
  });

  afterEach(() => {
    // Restaurar implementações originais
    Date.now = originalDateNow;
    Math.random = originalMathRandom;
  });

  it('should generate account number with correct format', () => {
    // Mock Date.now() para retornar um timestamp fixo
    Date.now = jest.fn().mockReturnValue(1689553123456);

    // Mock Math.random() para retornar valores fixos
    let randomCallCount = 0;
    Math.random = jest.fn().mockImplementation(() => {
      randomCallCount++;
      // Primeiro Math.random é para o primeiro dígito (1-9)
      // Segundo Math.random é para os dois últimos dígitos (00-99)
      return randomCallCount === 1 ? 0.6 : 0.42; // 0.6 * 9 + 1 = 6, 0.42 * 100 = 42
    });

    const userId = 123;
    const accountNumber = generateAccountNumber(userId);

    // Validar formato geral
    expect(accountNumber).toMatch(/^[1-9]\d{9}$/);
    expect(accountNumber).toHaveLength(10);

    // Validar componentes específicos
    // Primeiro dígito deve ser 6 (0.6 * 9 + 1 = 6)
    expect(accountNumber[0]).toBe('6');

    // Próximos 2 dígitos devem ser os últimos 2 dígitos do userId (23)
    expect(accountNumber.substring(1, 3)).toBe('23');

    // Próximos 6 dígitos devem ser os últimos 6 dígitos do timestamp (553123)
    expect(accountNumber.substring(3, 9)).toBe('553123');

    // Últimos 2 dígitos devem ser o número aleatório (42)
    expect(accountNumber.substring(9)).toBe('42');
  });

  it('should generate different account numbers for same user in different timestamps', () => {
    const userId = 123;
    let timestamp = 1689553123456;

    // Mock para gerar sempre os mesmos números aleatórios
    Math.random = jest.fn().mockImplementation(() => 0.5);

    // Gerar primeiro número de conta
    Date.now = jest.fn().mockReturnValue(timestamp);
    const firstAccountNumber = generateAccountNumber(userId);

    // Avançar o timestamp e gerar segundo número de conta
    timestamp += 1000; // Avançar 1 segundo
    Date.now = jest.fn().mockReturnValue(timestamp);
    const secondAccountNumber = generateAccountNumber(userId);

    // Os números devem ser diferentes
    expect(firstAccountNumber).not.toBe(secondAccountNumber);
  });

  it('should generate different account numbers for different users at same timestamp', () => {
    const timestamp = 1689553123456;
    Date.now = jest.fn().mockReturnValue(timestamp);
    Math.random = jest.fn().mockImplementation(() => 0.5);

    const firstUserId = 123;
    const secondUserId = 456;

    const firstAccountNumber = generateAccountNumber(firstUserId);
    const secondAccountNumber = generateAccountNumber(secondUserId);

    // Os números devem ser diferentes
    expect(firstAccountNumber).not.toBe(secondAccountNumber);
  });

  it('should pad user component with zeros when user ID is less than 10', () => {
    Date.now = jest.fn().mockReturnValue(1689553123456);
    Math.random = jest.fn().mockImplementation(() => 0.5);

    const userId = 5;
    const accountNumber = generateAccountNumber(userId);

    // Dígitos do usuário devem ser "05"
    expect(accountNumber.substring(1, 3)).toBe('05');
  });

  it('should always generate account number starting with non-zero digit', () => {
    Date.now = jest.fn().mockReturnValue(1689553123456);

    // Mock Math.random para tentar gerar zero no primeiro dígito
    Math.random = jest.fn().mockImplementation(() => 0);

    const userId = 123;
    const accountNumber = generateAccountNumber(userId);

    // Primeiro dígito nunca deve ser zero
    expect(accountNumber[0]).not.toBe('0');
  });
});
