import { OpenAI } from 'langchain/llms/openai';
import { DynamicTool } from 'langchain/tools';
import { getGptWrapperToolCallbackHandlers } from '../callbackHandlers';
import { Step } from '@/schemas/flow';
import { GptWrapperToolDefinition } from '@/schemas/toolDefinitions';
import { ModelNameSchema } from '@/schemas/modelNames';
import { OpenApiConfig } from '@/schemas/openai';

export const getGptWrapperTool = async (
  openAiConfig: OpenApiConfig,
  toolDefinition: GptWrapperToolDefinition,
  trackStep: (step: Step) => void,
) => {
  const { name, description, modelname } = toolDefinition;

  const openAi = new OpenAI({
    modelName: modelname,
    temperature: 0,
    openAIApiKey: openAiConfig.apiKey,
  });

  const gptWrapperTool = new DynamicTool({
    name,
    description,
    func: async (input: string) => {
      try {
        const res = await openAi.call(input);
        return res;
      } catch (error) {
        return `Error running ${name} tool.`;
      }
    },
    callbacks: [getGptWrapperToolCallbackHandlers(trackStep, name, modelname)],
  });

  return gptWrapperTool;
};

export const getWrapperTools = async (
  openAiConfig: OpenApiConfig,
  toolsDefinitions: GptWrapperToolDefinition[],
  trackStep: (step: Step) => void,
) => {
  const toolsPromises: Promise<DynamicTool>[] = [];
  toolsDefinitions.forEach((toolDefinition) => {
    toolsPromises.push(
      getGptWrapperTool(openAiConfig, toolDefinition, trackStep),
    );
  });
  const tools = await Promise.all(toolsPromises);
  return tools;
};

export const getBaseNewWrapperTool = () => ({
  name: 'GPT',
  description:
    'Useful ONLY when you need to ask questions on topics for which there is NO other specific tool.',
  modelname: ModelNameSchema.Values['gpt-3.5-turbo'],
});
