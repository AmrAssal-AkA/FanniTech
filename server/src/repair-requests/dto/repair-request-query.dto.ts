import { z } from 'zod';
import { RepairRequestStatus } from '../../prisma/generated/client.js';

export const RepairRequestQueryDtoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.nativeEnum(RepairRequestStatus).optional(),
});

export type RepairRequestQueryDtoType = z.infer<
  typeof RepairRequestQueryDtoSchema
>;
