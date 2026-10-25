import { createEnvValidator } from './env-validator';

describe('createEnvValidator', () => {
  const validate = createEnvValidator({
    DATABASE_URL: { required: true },
    JWT_SECRET: { required: true, minLength: 16 },
    PORT: { type: 'number', default: 3000 },
    DEBUG: { type: 'boolean', default: false },
    MODE: { oneOf: ['dev', 'prod'], default: 'dev' },
    FRONTEND_URL: { default: '' },
  });
  const valid = { DATABASE_URL: 'mysql://x', JWT_SECRET: 'a'.repeat(32) };

  const messageOf = (cfg: Record<string, unknown>) => {
    try {
      validate(cfg);
    } catch (e) {
      return (e as Error).message;
    }
    return '';
  };

  it('Valid configuration → pass, apply default value', () => {
    const out = validate(valid);
    expect(out.PORT).toBe(3000);
    expect(out.DEBUG).toBe(false);
    expect(out.MODE).toBe('dev');
    expect(out.FRONTEND_URL).toBe('');
  });

  it('Missing required variables → error message names variables', () => {
    expect(() => validate({ JWT_SECRET: 'a'.repeat(32) })).toThrow(/DATABASE_URL/);
  });

  it('empty string is considered not set', () => {
    expect(() => validate({ ...valid, DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
  });

  it('Type coercion for numbers and booleans', () => {
    const out = validate({ ...valid, PORT: '4000', DEBUG: 'TRUE' });
    expect(out.PORT).toBe(4000);
    expect(out.DEBUG).toBe(true);
  });

  it('Value wrong type or outside list → error', () => {
    expect(() => validate({ ...valid, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => validate({ ...valid, DEBUG: 'maybe' })).toThrow(/DEBUG/);
    expect(() => validate({ ...valid, MODE: 'staging' })).toThrow(/MODE/);
  });

  it('Multiple errors are grouped into one message', () => {
    const msg = messageOf({ PORT: 'abc' });
    expect(msg).toMatch(/DATABASE_URL/);
    expect(msg).toMatch(/JWT_SECRET/);
    expect(msg).toMatch(/PORT/);
  });

  it('Error messages DO NOT contain values (avoid exposing secrets to logs)', () => {
    const shortSecret = 'ngan-thoi';
    expect(messageOf({ ...valid, JWT_SECRET: shortSecret })).not.toContain(shortSecret);

    const badPort = 'sensitive-value';
    const msg = messageOf({ ...valid, PORT: badPort });
    expect(msg).toContain('PORT');
    expect(msg).not.toContain(badPort);
  });
});