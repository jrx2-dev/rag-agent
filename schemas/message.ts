import { z } from 'zod';
import { FlowSchema } from '@/schemas/flow';

export const MessageTypeSchema = z.enum(['apiMessage', 'userMessage']);

const MessageSchema = z.object({
  type: MessageTypeSchema,
  message: z.string(),
  flow: z.optional(FlowSchema),
});
export type Message = z.infer<typeof MessageSchema>;
