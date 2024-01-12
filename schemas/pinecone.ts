import { z } from 'zod';

export const LOCALSTORAGE_PINECONE_CONFIG = 'pineconeConfig';

export const PineconeConfigSchema = z.object({
  apiKey: z.string().nonempty(),
  environment: z.string().nonempty(),
  indexName: z.string().nonempty(),
});
export type PineconeConfig = z.infer<typeof PineconeConfigSchema>;
