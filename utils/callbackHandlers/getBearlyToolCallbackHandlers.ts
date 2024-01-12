import { BaseCallbackHandler } from 'langchain/callbacks';
import { Serialized } from 'langchain/load/serializable';
import { Step } from '@/schemas/flow';

export const getBearlyToolCallbackHandlers = (
  trackStep: (step: Step) => void,
  tool: string,
) => {
  class BearlyToolCallbackHandler extends BaseCallbackHandler {
    name = `${tool} -> BearlyToolCallbackHandler`;

    handleToolStart(_: Serialized, input: string): void | Promise<void> {
      trackStep({
        log: `**${tool}** receives the following input:`,
      });
      trackStep({
        log: '```python\n' + input + '\n```',
      });
    }

    handleToolEnd(output: string) {
      trackStep({
        log: `**${tool}** returns the following output:`,
      });
      trackStep({
        log: '```json\n' + output + '\n```',
      });
    }
  }

  return new BearlyToolCallbackHandler();
};
