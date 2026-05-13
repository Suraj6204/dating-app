import { z } from 'zod';

const TypeEnum = z.enum(['like', 'dislike']);

export const swipeSchema = z.object({
    type: TypeEnum
});

