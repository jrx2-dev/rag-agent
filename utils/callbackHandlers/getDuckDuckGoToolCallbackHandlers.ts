import { BaseCallbackHandler } from 'langchain/callbacks';
import { Serialized } from 'langchain/load/serializable';
import { Step } from '@/schemas/flow';

export const getDuckDuckGoToolCallbackHandlers = (
  trackStep: (step: Step) => void,
  tool: string,
) => {
  class DuckDuckGoToolCallbackHandler extends BaseCallbackHandler {
    name = `${tool} -> DuckDuckGoToolCallbackHandler`;

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

  return new DuckDuckGoToolCallbackHandler();
};
