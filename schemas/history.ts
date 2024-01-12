import { z } from 'zod';

export const HistorySchema = z.tuple([z.string(), z.string()]).array();
export type History = z.infer<typeof HistorySchema>;
