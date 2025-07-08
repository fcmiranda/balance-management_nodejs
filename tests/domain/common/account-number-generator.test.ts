import { generateAccountNumber } from '../../../src/domain/common/account-number-generator';

describe('Account Number Generator', () => {
  let originalDateNow: () => number;
  let originalMathRandom: () => number;

  beforeEach(() => {
    originalDateNow = Date.now;
    originalMathRandom = Math.random;
  });

  afterEach(() => {
    Date.now = originalDateNow;
    Math.random = originalMathRandom;
  });
  it('should generate account number with correct format', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1689553123456);

    jest.spyOn(Math, 'random').mockReturnValueOnce(0.4).mockReturnValueOnce(0.6);

    const userId = 123;
    const accountNumber = generateAccountNumber(userId);

    expect(accountNumber).toMatch(/^[1-9]\d{9}$/);
    expect(accountNumber).toHaveLength(10);

    expect(accountNumber[0]).toBe('6');

    expect(accountNumber.substring(1, 3)).toBe('23');

    expect(accountNumber.substring(3, 9)).toBe('123456');

    expect(accountNumber.substring(9)).toBe('4');
  });
  it('should generate different account numbers for same user in different timestamps', () => {
    const userId = 123;

    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    jest.spyOn(Date, 'now').mockReturnValue(1689553123456);
    const firstAccountNumber = generateAccountNumber(userId);

    jest.spyOn(Date, 'now').mockReturnValue(1689553124456);
    const secondAccountNumber = generateAccountNumber(userId);

    expect(firstAccountNumber).not.toBe(secondAccountNumber);
  });

  it('should generate different account numbers for different users at same timestamp', () => {
    const timestamp = 1689553123456;
    jest.spyOn(Date, 'now').mockReturnValue(timestamp);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const firstUserId = 123;
    const secondUserId = 456;

    const firstAccountNumber = generateAccountNumber(firstUserId);
    const secondAccountNumber = generateAccountNumber(secondUserId);

    expect(firstAccountNumber).not.toBe(secondAccountNumber);
  });

  it('should pad user component with zeros when user ID is less than 10', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1689553123456);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const userId = 5;
    const accountNumber = generateAccountNumber(userId);

    expect(accountNumber.substring(1, 3)).toBe('05');
  });
  it('should always generate account number starting with non-zero digit', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1689553123456);

    jest.spyOn(Math, 'random').mockReturnValue(0);

    const userId = 123;
    const accountNumber = generateAccountNumber(userId);

    expect(accountNumber[0]).not.toBe('0');
  });
});
