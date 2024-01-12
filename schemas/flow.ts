import { z } from 'zod';
import { DocumentSchema } from './document';

export const LogSchema = z.object({
  log: z.string(),
});
export type Log = z.infer<typeof LogSchema>;

export const WrappedSourceSchema = z.object({
  source: z.string(),
});
export type WrappedSource = z.infer<typeof WrappedSourceSchema>;

export const StepSchema = z.union([
  LogSchema,
  WrappedSourceSchema,
  DocumentSchema.array(),
]);
export type Step = z.infer<typeof StepSchema>;

export const FlowSchema = StepSchema.array();
export type Flow = z.infer<typeof FlowSchema>;

export const AnswerSchema = z.object({
  text: z.string(),
  flow: FlowSchema,
  query: z.string(),
});
export type Answer = z.infer<typeof AnswerSchema>;

export const AbortCallSchema = z.object({
  connectionId: z.string(),
  query: z.string().optional()
});
export type AbortCall = z.infer<typeof AbortCallSchema>;
