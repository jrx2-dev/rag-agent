import { BaseCallbackHandler } from 'langchain/callbacks';
import { Serialized } from 'langchain/load/serializable';
import { Step, WrappedSource } from '@/schemas/flow';
import { ModelName } from '@/schemas/modelNames';

export const getGptWrapperToolCallbackHandlers = (
  trackStep: (step: Step) => void,
  tool: string,
  modelName: ModelName,
) => {
  class GptWrapperToolCallbackHandler extends BaseCallbackHandler {
    name = `${tool} -> GptWrapperToolCallbackHandler`;

    handleToolStart(_: Serialized, input: string): void | Promise<void> {
      trackStep({
        log: `**${tool}** receives input: ${input}`,
      });
    }

    handleToolEnd(output: string) {
      const newWrappedSource: WrappedSource = {
        source: modelName,
      };
      trackStep(newWrappedSource);
      trackStep({
        log: `**${tool}** returns the output: ${output}`,
      });
    }
  }

  return new GptWrapperToolCallbackHandler();
};
