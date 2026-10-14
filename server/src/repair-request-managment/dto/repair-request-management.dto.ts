import { z } from 'zod';
import {
  RepairRequestStatus,
  RepairTicketPriority,
  RepairTicketStatus,
} from '../../prisma/generated/client.js';

const optionalNotes = z.string().trim().max(2000).optional();

export const AcceptRepairRequestDtoSchema = z.object({
  priority: z.nativeEnum(RepairTicketPriority).default(RepairTicketPriority.MEDIUM),
  technicianId: z.string().uuid().optional(),
});
export type AcceptRepairRequestDtoType = z.infer<typeof AcceptRepairRequestDtoSchema>;

export const RejectRepairRequestDtoSchema = z.object({ reason: z.string().trim().min(5).max(500) });
export type RejectRepairRequestDtoType = z.infer<typeof RejectRepairRequestDtoSchema>;

export const AssignTechnicianDtoSchema = z.object({ technicianId: z.string().uuid() });
export type AssignTechnicianDtoType = z.infer<typeof AssignTechnicianDtoSchema>;

export const StartDiagnosisDtoSchema = z.object({ notes: optionalNotes });
export type StartDiagnosisDtoType = z.infer<typeof StartDiagnosisDtoSchema>;

export const StartRepairDtoSchema = z.object({
  diagnosis: z.string().trim().min(5).max(2000),
  notes: optionalNotes,
});
export type StartRepairDtoType = z.infer<typeof StartRepairDtoSchema>;

export const MarkReadyForPickupDtoSchema = z.object({
  repairNotes: z.string().trim().min(5).max(2000),
  notes: optionalNotes,
});
export type MarkReadyForPickupDtoType = z.infer<typeof MarkReadyForPickupDtoSchema>;

export const MarkUnrepairableDtoSchema = z.object({
  reason: z.string().trim().min(5).max(2000),
  notes: optionalNotes,
});
export type MarkUnrepairableDtoType = z.infer<typeof MarkUnrepairableDtoSchema>;

export const UpdateTicketStatusDtoSchema = z.object({ notes: optionalNotes });
export type UpdateTicketStatusDtoType = z.infer<typeof UpdateTicketStatusDtoSchema>;

export const ListRepairRequestsQueryDtoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.nativeEnum(RepairRequestStatus).optional(),
});
export type ListRepairRequestsQueryDtoType = z.infer<typeof ListRepairRequestsQueryDtoSchema>;

export const ListTicketsQueryDtoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.nativeEnum(RepairTicketStatus).optional(),
  priority: z.nativeEnum(RepairTicketPriority).optional(),
  technicianId: z.string().uuid().optional(),
  assignedToMe: z.coerce.boolean().optional(),
});
export type ListTicketsQueryDtoType = z.infer<typeof ListTicketsQueryDtoSchema>;
