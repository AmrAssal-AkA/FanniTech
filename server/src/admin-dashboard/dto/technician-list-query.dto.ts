import { z } from 'zod';

export const TechnicianListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
});

export type TechnicianListQueryDto = z.infer<typeof TechnicianListQuerySchema>;

export interface TechnicianListItem {
  id: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
  repairTickets?: {
    id: string;
    status: string;
  }[];
  activeTicketsCount?: number;
  completedTicketsCount?: number;
}

export interface TechnicianListResponse {
  data: TechnicianListItem[];
  total: number;
  page: number;
  limit: number;
}

