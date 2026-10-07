import {z} from 'zod';


export const CreateUserDtoSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format'),
  name: z.string().trim().min(2).max(20).regex(/^[\p{L}\s'-]+$/u, 'Name must contain only letters and spaces'),
  password: z.string().min(8).max(20).regex(/^(?=.*\p{L})(?=.*\d).+$/u, 'Password must contain at least one letter and one number'),
  phone: z.string().trim().regex(/^\+?\d{8,15}$/, 'Invalid phone number').optional(),
  deviceInfo: z.string().trim().max(200).optional(),
  role: z.enum(['CUSTOMER']).optional(),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDtoSchema>;