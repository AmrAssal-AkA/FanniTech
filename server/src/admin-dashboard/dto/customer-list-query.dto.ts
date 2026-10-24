import { z } from 'zod';

export const CustomerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
});

export type CustomerListQueryDto = z.infer<typeof CustomerListQuerySchema>;

export interface CustomerListItem {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  devicesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}