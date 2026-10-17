import { z } from 'zod';

export const updateTechnicianSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  phone: z.string().trim().regex(/^\+?\d{8,15}$/, 'Invalid phone number').optional().nullable(),
});

export type UpdateTechnicianDto = z.infer<typeof updateTechnicianSchema>;

export const resetTechnicianPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type ResetTechnicianPasswordDto = z.infer<typeof resetTechnicianPasswordSchema>;

export const transferTechnicianTicketsSchema = z.object({
  targetTechnicianId: z.string().uuid('Invalid target technician ID'),
});

export type TransferTechnicianTicketsDto = z.infer<typeof transferTechnicianTicketsSchema>;

