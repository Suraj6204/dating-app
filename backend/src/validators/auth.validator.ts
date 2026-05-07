import {z} from 'zod'

export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email({message: 'Invalid email address'}),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

export type SignupInput = z.infer<typeof signupSchema>;