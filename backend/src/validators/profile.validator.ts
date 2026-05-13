import {z} from 'zod'

const GenderEnum = z.enum(['male', 'female', 'other']);

export const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    bio: z.string().max(500).optional(),
    dob: z.string().refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        
        // Check if valid date
        if (isNaN(birthDate.getTime())) return false;

        // Age calculation logic
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        // Birthday iss saal abhi tak aaya hai ya nahi check karein
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 18;
    }, 
    {
        message: "You must be at least 18 years old to use this app",
    }),
    gender : GenderEnum,
    gender_preference : GenderEnum,
    location: z.object({
        lat: z.number(),
        long: z.number()
    }).optional(),
    interests: z.array(z.string()).min(1,"Select at least one interest"),
    images: z.array(z.url()).min(4,"Upload at least four photos"),
});
