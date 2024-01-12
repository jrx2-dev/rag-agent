import { DynamicTool } from 'langchain/tools';
import { Step } from '@/schemas/flow';
import { BearlyToolDefinition } from '@/schemas/toolDefinitions';
import { BearlyCodeInterpreterAPI } from '../BearlyCodeInterpreterAPI';
import { getBearlyToolCallbackHandlers } from '../callbackHandlers';

export const getBaseBearlyTool = (apiKey: string): BearlyToolDefinition => ({
  name: 'Bearly Code Interpreter',
  description:
    'Useful ONLY when you need to execute python code in a sandbox environment and get the results from that execution. The input for this tool must be ONLY the pure python script to be executed, the contents will be in main.py and it should not be in markdown format.',
  apiKey,
});

export const getBearlyTool = async (
  toolDefinition: BearlyToolDefinition,
  trackStep: (step: Step) => void,
) => {
  const { name, description, apiKey } = toolDefinition;

  const bearlyTool = new DynamicTool({
    name,
    description,
    func: async (input: string) => {
      try {
        const bearlyCodeInterpeterAPI = new BearlyCodeInterpreterAPI(apiKey);
        const response = await bearlyCodeInterpeterAPI._run(input);
        return JSON.stringify(response, null, 2);
      } catch (error) {
        return `Error running ${name} tool.`;
      }
    },
    callbacks: [getBearlyToolCallbackHandlers(trackStep, name)],
  });

  return bearlyTool;
};

export const getBearlyTools = async (
  toolsDefinitions: BearlyToolDefinition[],
  trackStep: (step: Step) => void,
) => {
  const toolsPromises: Promise<DynamicTool>[] = [];
  toolsDefinitions.forEach((toolDefinition) => {
    toolsPromises.push(getBearlyTool(toolDefinition, trackStep));
  });
  const tools = await Promise.all(toolsPromises);
  return tools;
};
