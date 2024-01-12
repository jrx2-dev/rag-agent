import { z } from 'zod';

export const ModelNameSchema = z.enum(['gpt-4-1106-preview', 'gpt-3.5-turbo']);
export type ModelName = z.infer<typeof ModelNameSchema>;
