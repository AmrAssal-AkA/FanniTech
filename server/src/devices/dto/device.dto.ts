import { z } from 'zod';

export const CreateDeviceDtoSchema = z.object({
  deviceType: z
    .string()
    .trim()
    .min(2, { message: 'Device type must be at least 2 characters' })
    .max(50, { message: 'Device type must not exceed 50 characters' }),
  brand: z
    .string()
    .trim()
    .min(2, { message: 'Brand must be at least 2 characters' })
    .max(50, { message: 'Brand must not exceed 50 characters' }),
  model: z
    .string()
    .trim()
    .min(1, { message: 'Model must be at least 1 character' })
    .max(100, { message: 'Model must not exceed 100 characters' }),
  serialNumber: z
    .string()
    .trim()
    .min(2, { message: 'Serial number must be at least 2 characters' })
    .max(100, { message: 'Serial number must not exceed 100 characters' })
    .optional(),
});

export type CreateDeviceDtoType = z.infer<typeof CreateDeviceDtoSchema>;
