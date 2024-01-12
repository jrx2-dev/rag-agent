import { z } from 'zod';
import { ModelNameSchema } from './modelNames';

export const LOCALSTORAGE_OPEN_API_CONFIG = 'openApiConfig';

export const OpenApiConfigSchema = z.object({
  apiKey: z.string().nonempty(),
  modelname: ModelNameSchema,
});
export type OpenApiConfig = z.infer<typeof OpenApiConfigSchema>;
