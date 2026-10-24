import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import * as zod from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const schema = zod.object({
    name: zod.string(),
    age: zod.number().min(18),
  });
  const pipe = new ZodValidationPipe(schema);

  it('should return parsed value when input is valid', () => {
    const input = { name: 'Alice', age: 25 };
    const result = pipe.transform(input, { type: 'body' });
    expect(result).toEqual(input);
  });

  it('should throw BadRequestException on Zod validation error', () => {
    const input = { name: 'Alice', age: 15 };
    try {
      pipe.transform(input, { type: 'body' });
      expect.fail('Should have thrown BadRequestException');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const res = (err as BadRequestException).getResponse() as any;
      expect(res.message).toBe('Validation failed');
      expect(res.errors).toBeDefined();
    }
  });

  it('should rethrow non-Zod errors', () => {
    const faultySchema = {
      parse: () => {
        throw new Error('Unexpected parsing crash');
      },
    } as unknown as zod.ZodSchema;
    const faultyPipe = new ZodValidationPipe(faultySchema);

    expect(() => faultyPipe.transform({}, { type: 'body' })).toThrow(
      'Unexpected parsing crash',
    );
  });
});

