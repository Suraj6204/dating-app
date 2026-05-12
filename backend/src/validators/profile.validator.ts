import {z} from 'zod'

const GenderEnum = z.enum(['male', 'female', 'other']);

export const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500).optional(),
    dob: z.string().refine((date)=> !isNaN(Date.parse(date)) , {
        message: "Invalid date format",
    }),
    gender : GenderEnum,
    gender_preference : GenderEnum,
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    interests: z.array(z.string()).min(1,"Select at least one interest"),
    images: z.array(z.url()).min(4,"Upload at least four photos"),
});
