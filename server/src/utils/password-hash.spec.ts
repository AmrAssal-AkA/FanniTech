import { describe, expect, it } from 'vitest';
import { hashPassword, comparePassword } from './password-hash.js';

describe('PasswordHash Utils', () => {
  it('should hash a password and compare correctly', async () => {
    const raw = 'my-secret-password-123';
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(raw);

    const match = await comparePassword(raw, hash);
    expect(match).toBe(true);

    const mismatch = await comparePassword('wrong-password', hash);
    expect(mismatch).toBe(false);
  });
});

