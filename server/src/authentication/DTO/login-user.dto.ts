import { z } from 'zod';

export const LoginUserDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(
      /^(?=.*\p{L})(?=.*\d).+$/u,
      'Password must contain at least one letter and one number',
    ),
  deviceInfo: z.string().trim().max(200).optional(),
});

export type LoginUserDtoType = z.infer<typeof LoginUserDtoSchema>;
