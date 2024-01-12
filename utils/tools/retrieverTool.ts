import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAI } from 'langchain/llms/openai';
import { VectorDBQAChain } from 'langchain/chains';
import { DynamicTool } from 'langchain/tools';
import {
  getRetrieverChainCallbackHandlers,
  getRetrieverToolCallbackHandlers,
} from '../callbackHandlers';
import { initPinecone } from '@/utils/pinecone-client';
import { Step } from '@/schemas/flow';
import { RetrieverToolDefinition } from '@/schemas/toolDefinitions';
import { PineconeConfig } from '@/schemas/pinecone';
import { OpenApiConfig } from '@/schemas/openai';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';

export const getRetrieverTool = async (
  openAiConfig: OpenApiConfig,
  pineconeIndex: Index<RecordMetadata>,
  toolDefinition: RetrieverToolDefinition,
  trackStep: (step: Step) => void,
) => {
  const { namespace, name, description, modelname } = toolDefinition;

  const pineconeStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: openAiConfig.apiKey }),
    {
      pineconeIndex: pineconeIndex,
      textKey: 'text',
      namespace: namespace,
    },
  );

  const chainModel = new OpenAI({
    modelName: modelname,
    temperature: 0,
    openAIApiKey: openAiConfig.apiKey,
  });

  const vectorChain = VectorDBQAChain.fromLLM(chainModel, pineconeStore, {
    returnSourceDocuments: true,
    callbacks: [getRetrieverChainCallbackHandlers(trackStep, name)],
  });

  const retrieverTool = new DynamicTool({
    name,
    description,
    func: async (input) => {
      try {
        const { text } = await vectorChain.call({
          query: input,
        });
        return text;
      } catch (error) {
        return `Error running ${name} tool.`;
      }
    },
    callbacks: [getRetrieverToolCallbackHandlers(trackStep, name)],
  });

  return retrieverTool;
};

export const getRetrieverTools = async (
  openAiConfig: OpenApiConfig,
  pineconeConfig: PineconeConfig,
  toolsDefinitions: RetrieverToolDefinition[],
  trackStep: (step: Step) => void,
) => {
  const toolsPromises: Promise<DynamicTool>[] = [];

  try {
    const pineconeClient = await initPinecone(pineconeConfig);
    const pineconeIndex = pineconeClient.Index(pineconeConfig.indexName);
    toolsDefinitions.forEach((toolDefinition) => {
      toolsPromises.push(
        getRetrieverTool(
          openAiConfig,
          pineconeIndex,
          toolDefinition,
          trackStep,
        ),
      );
    });
    const tools = await Promise.all(toolsPromises);
    return tools;
  } catch (error) {
    console.log(error);
    return [];
  }
};
