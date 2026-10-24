import { z } from 'zod';

export const CreateRepairRequestDtoSchema = z.object({
  deviceId: z
    .string()
    .uuid({ message: 'Invalid deviceId format, must be a UUID' }),
  problem: z
    .string()
    .trim()
    .min(3, { message: 'Problem summary must be at least 3 characters' })
    .max(150, { message: 'Problem summary must not exceed 150 characters' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(2000, { message: 'Description must not exceed 2000 characters' }),
});

export type CreateRepairRequestDtoType = z.infer<
  typeof CreateRepairRequestDtoSchema
>;
