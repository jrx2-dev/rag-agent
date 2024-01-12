import { BaseCallbackHandler } from 'langchain/callbacks';
import { Serialized } from 'langchain/load/serializable';
import { Step } from '@/schemas/flow';

export const getRetrieverToolCallbackHandlers = (
  trackStep: (step: Step) => void,
  tool: string,
) => {
  class RetrieverToolCallbackHandler extends BaseCallbackHandler {
    name = `${tool} -> RetrieverToolCallbackHandler`;

    handleToolStart(_: Serialized, input: string): void | Promise<void> {
      trackStep({
        log: `**${tool}** receives input: ${input}`,
      });
    }

    handleToolEnd(output: string) {
      trackStep({
        log: `**${tool}** returns the output: ${output}`,
      });
    }
  }

  return new RetrieverToolCallbackHandler();
};
