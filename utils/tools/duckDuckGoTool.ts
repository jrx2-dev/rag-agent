import { OpenAI } from 'langchain/llms/openai';
import { DynamicTool } from 'langchain/tools';
import { getDuckDuckGoToolCallbackHandlers } from '../callbackHandlers';
import { Step } from '@/schemas/flow';
import { DuckDuckGoToolDefinition } from '@/schemas/toolDefinitions';
import { ModelNameSchema } from '@/schemas/modelNames';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { WebBrowser } from 'langchain/tools/webbrowser';
import DuckDuckGoSearchApi from '../DuckDuckGoSearchAPI';
import { OpenApiConfig } from '@/schemas/openai';

export const getBaseDuckDuckGoTool = (): DuckDuckGoToolDefinition => ({
  name: 'Duck Duck Go',
  description:
    'Useful when you want to make a web search (ONLY TEXT) for a topic.',
});

export const getDuckDuckGoTool = async (
  openAiConfig: OpenApiConfig,
  toolDefinition: DuckDuckGoToolDefinition,
  trackStep: (step: Step) => void,
) => {
  const { name, description } = toolDefinition;
  const modelName = ModelNameSchema.Values['gpt-3.5-turbo'] + '-16k'; // JFBCW

  const model = new OpenAI({
    modelName,
    temperature: 0,
    openAIApiKey: openAiConfig.apiKey,
  });
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: openAiConfig.apiKey,
  });

  const duckDuckGoTool = new DynamicTool({
    name,
    description,
    func: async (input: string) => {
      try {
        const browserTool = new WebBrowser({ model, embeddings });
        const sitesToVisit = await DuckDuckGoSearchApi.text(input, 3);
        return await browserTool.call(
          sitesToVisit.map((site) => `"${site.href}", "${input}"`).join(','),
        );
      } catch (error) {
        return `Error running ${name} tool.`;
      }
    },
    callbacks: [getDuckDuckGoToolCallbackHandlers(trackStep, name)],
  });

  return duckDuckGoTool;
};

export const getDuckDuckGoTools = async (
  openAiConfig: OpenApiConfig,
  toolsDefinitions: DuckDuckGoToolDefinition[],
  trackStep: (step: Step) => void,
) => {
  const toolsPromises: Promise<DynamicTool>[] = [];
  toolsDefinitions.forEach((toolDefinition) => {
    toolsPromises.push(
      getDuckDuckGoTool(openAiConfig, toolDefinition, trackStep),
    );
  });
  const tools = await Promise.all(toolsPromises);
  return tools;
};
