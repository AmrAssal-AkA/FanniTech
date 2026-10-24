import { z } from 'zod';

export const UpdateTechnicianNotesDtoSchema = z.object({
  diagnosis: z.string().trim().max(2000).optional(),
  repairNotes: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type UpdateTechnicianNotesDtoType = z.infer<
  typeof UpdateTechnicianNotesDtoSchema
>;

