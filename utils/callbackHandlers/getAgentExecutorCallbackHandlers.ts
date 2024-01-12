import { BaseCallbackHandler } from 'langchain/callbacks';
import { AgentAction, AgentFinish } from 'langchain/schema';
import { Step } from '@/schemas/flow';

export const getAgentExecutorCallbackHandlers = (
  trackStep: (step: Step) => void,
) => {
  class AgentCallbackHandler extends BaseCallbackHandler {
    name = 'Agent';

    handleAgentAction(action: AgentAction) {
      trackStep({
        log: `**${this.name}** choose the **${action.tool}** tool.`,
      });
    }

    handleAgentEnd(action: AgentFinish) {
      trackStep({
        log: `${this.name} ended with output: `,
      });
      trackStep(action.returnValues.output);
    }
  }

  return new AgentCallbackHandler();
};
