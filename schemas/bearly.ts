import { z } from 'zod';

export const LOCALSTORAGE_BEARLY_CONFIG = 'bearlyConfig';
export const LOCALSTORAGE_BEARLY_ENABLED = 'bearlyToolEnabled';

export const BearlyConfigSchema = z.object({
  apiKey: z.string().nonempty(),
});
export type BearlyConfig = z.infer<typeof BearlyConfigSchema>;

export const BearlyToolStatusSchema = z.enum(['enabled', 'disabled']);
export type BearlyToolStatus = z.infer<typeof BearlyToolStatusSchema>;
