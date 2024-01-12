import { z } from 'zod';
import { ModelNameSchema } from '@/schemas/modelNames';

export const LOCALSTORAGE_RETRIEVAL_TOOLS_KEY = 'retrievalTools';
export const LOCALSTORAGE_WRAPPER_TOOLS_KEY = 'wrapperTools';
export const LOCALSTORAGE_DUCK_DUCK_GO_TOOLS_KEY = 'duckDuckGoTools';

const ToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

const ModelToolSchema = z.object({
  modelname: ModelNameSchema,
});
// type ModelTool = z.infer<typeof ModelToolSchema>;

const APIKeySchema = z.object({
  apiKey: z.string(),
});

export const RetrieverToolDefinitionSchema = ToolDefinitionSchema.merge(
  ModelToolSchema,
)
  .extend({
    namespace: z.string(),
  })
  .refine(
    (data) =>
      data.name !== '' &&
      data.description !== '' &&
      [
        ModelNameSchema.Values['gpt-3.5-turbo'],
        ModelNameSchema.Values['gpt-4-1106-preview'],
      ].includes(data.modelname) &&
      data.namespace !== '',
  );
export type RetrieverToolDefinition = z.infer<
  typeof RetrieverToolDefinitionSchema
>;

export const GptWrapperToolDefinitionSchema =
  ToolDefinitionSchema.merge(ModelToolSchema);
export type GptWrapperToolDefinition = z.infer<
  typeof GptWrapperToolDefinitionSchema
>;

export const DuckDuckGoToolDefinitionSchema = ToolDefinitionSchema;
export type DuckDuckGoToolDefinition = z.infer<
  typeof DuckDuckGoToolDefinitionSchema
>;

export const BearlyToolDefinitionSchema = ToolDefinitionSchema.merge(
  APIKeySchema,
)
  .extend({
    apiKey: z.string(),
  })
  .refine(
    (data) => data.name !== '' && data.description !== '' && data.apiKey !== '',
  );
export type BearlyToolDefinition = z.infer<typeof BearlyToolDefinitionSchema>;
