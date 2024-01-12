import { z } from 'zod';
import { HistorySchema } from '@/schemas//history';
import {
  DuckDuckGoToolDefinitionSchema,
  GptWrapperToolDefinitionSchema,
  RetrieverToolDefinitionSchema,
} from '@/schemas/toolDefinitions';
import { PineconeConfigSchema } from './pinecone';
import { OpenApiConfigSchema } from './openai';
import { BearlyConfigSchema } from './bearly';

const CallSchema = z.object({
  openAiConfig: OpenApiConfigSchema,
  pineconeConfig: PineconeConfigSchema,
  bearlyConfig: BearlyConfigSchema,
  connectionId: z.string(),
  question: z.string(),
  history: HistorySchema,
  retrievalTools: RetrieverToolDefinitionSchema.array(),
  wrapperTools: GptWrapperToolDefinitionSchema.array().max(1),
  duckDuckGoTools: DuckDuckGoToolDefinitionSchema.array().max(1),
});

export type Call = z.infer<typeof CallSchema>;
