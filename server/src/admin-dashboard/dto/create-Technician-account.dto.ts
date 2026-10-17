import {z} from "zod";



export const createTechnicianAccountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().trim().regex(/^\+?\d{8,15}$/, 'Invalid phone number').optional(),
    role: z.enum(["TECHNICIAN"]).default("TECHNICIAN")
})

export type CreateTechnicianAccountDto = z.infer<typeof createTechnicianAccountSchema>;