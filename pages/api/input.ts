import { Call } from '@/schemas/call';
import { AbortCallSchema, AnswerSchema, Flow, Step } from '@/schemas/flow';
import { createAgent } from '@/utils/agent/makeStructuredChatAgentExecutor';
import { setConnectionAbortControler, setConnectionData } from '@/utils/connection';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const {
      openAiConfig,
      pineconeConfig,
      bearlyConfig,
      connectionId,
      question,
      history,
      retrievalTools,
      wrapperTools,
      duckDuckGoTools,
    } = req.body;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const makeAgentCall = async (call : Call) => {
      const controller = new AbortController();
      let sanitizedQuestion: string; 
      sanitizedQuestion = call.question.trim().replaceAll('\n', ' ');
        try {
          const flow: Flow = [];
          const trackStep = (step: Step) => {
            flow.push(step);
            setConnectionData(call.connectionId, step)
          };

          setConnectionAbortControler(call.connectionId, controller);

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

          setConnectionData(call.connectionId, answer)
        } catch (error) {
          if (controller.signal.aborted) {
            const abort = AbortCallSchema.parse({
              connectionId,
              query: sanitizedQuestion
            });
            setConnectionData(call.connectionId, abort)
          } else {
            console.log(error);
            const answer = AnswerSchema.parse({
              text: 'Problem starting agent. Check config.',
              flow: [],
              query: sanitizedQuestion,
            });
            setConnectionData(call.connectionId, answer)
          }
        } finally {
          sanitizedQuestion = '';
        }
    }

    makeAgentCall({
      openAiConfig,
      pineconeConfig,
      bearlyConfig,
      connectionId,
      question,
      history,
      retrievalTools,
      wrapperTools,
      duckDuckGoTools,
    })

    res.status(200).json('ok');
  } catch (error: any) {
    console.error('AGENT CALL ERROR', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
