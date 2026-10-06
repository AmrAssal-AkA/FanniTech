import {z} from 'zod';

 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const nameRegex = /^[a-zA-Z\s]+$/; 


export const CreateUserDtoSchema = z.object({
    email: z.string().regex(emailRegex, 'Invalid email format'),
    name: z.string().regex(nameRegex, 'Name must contain only letters and spaces').min(1),
    password: z.string().regex(passwordRegex, 'Password must be at least 8 characters long and contain at least one letter and one number'),
    phone: z.string().optional()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDtoSchema>;