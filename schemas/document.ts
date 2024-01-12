import { type Document as LangchainDocument } from 'langchain/document';
import { z } from 'zod';

export const DocumentSchema = z.object({
  pageContent: z.string(),
  metadata: z.record(z.any()),
}) satisfies z.ZodType<LangchainDocument>;
export type Document = z.infer<typeof DocumentSchema>;
