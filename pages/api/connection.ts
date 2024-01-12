import type { NextApiRequest, NextApiResponse } from 'next';
import { createAgent } from '@/utils/agent/makeStructuredChatAgentExecutor';
import { getConnectionNextCalls, removeConnection } from '@/utils/connection';
import { AbortCallSchema, AnswerSchema, Flow, Step } from '@/schemas/flow';
import {
  getConnectionNextAbortCall,
  removeAbortController,
} from '@/utils/abortCall';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const connectionId = req.query['connectionId'];
  if (!connectionId) {
    return res.status(400).json({ message: 'Bad request! :(' });
  }

  // Set headers to allow SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Encoding', 'none');

  res.flushHeaders();

  let controller: AbortController;
  let sanitizedQuestion: string; 

  const calls = getConnectionNextCalls(connectionId as string).subscribe(
    async (call) => {
      if (call.connectionId === connectionId) {
        sanitizedQuestion = call.question.trim().replaceAll('\n', ' ');
        try {
          const flow: Flow = [];
          const trackStep = (step: Step) => {
            flow.push(step);
            res.write(`data: ${JSON.stringify(step)}\n\n`);
          };

          controller = new AbortController();

          const agent = await createAgent(
            call.openAiConfig,
            call.pineconeConfig,
            call.bearlyConfig,
            call.history,
            call.retrievalTools,
            call.wrapperTools,
            call.duckDuckGoTools,
            trackStep,
          );
          const results = await agent.call({
            input: sanitizedQuestion,
            signal: controller.signal,
          });
          const answer = AnswerSchema.parse({
            text: results.output,
            flow: flow,
            query: sanitizedQuestion,
          });

          res.write(`data: ${JSON.stringify(answer)}\n\n`);
        } catch (error) {
          if (controller.signal.aborted) {
            const abort = AbortCallSchema.parse({
              connectionId,
              query: sanitizedQuestion
            });
            res.write(`data: ${JSON.stringify(abort)}\n\n`);
          } else {
            console.log(error);
            const answer = AnswerSchema.parse({
              text: 'Problem starting agent. Check config.',
              flow: [],
              query: sanitizedQuestion,
            });
            res.write(`data: ${JSON.stringify(answer)}\n\n`);
          }
        } finally {
          sanitizedQuestion = '';
        }
      }
    },
  );

  const aborts = getConnectionNextAbortCall(connectionId as string).subscribe(
    (abortCall) => {
      if (abortCall.connectionId === connectionId && !!controller) {
        controller.abort();
      }
    },
  );

  // Set up a listener for when the client closes the connection
  res.on('close', () => {
    calls.unsubscribe();
    removeConnection(connectionId as string);
    aborts.unsubscribe();
    removeAbortController(connectionId as string);
    res.end();
  });
}
