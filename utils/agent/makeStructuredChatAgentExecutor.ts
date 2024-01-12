import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { BufferWindowMemory, ChatMessageHistory } from 'langchain/memory';
import { getWrapperTools } from '@/utils/tools/gptWrapperTool';
import { getRetrieverTools } from '@/utils/tools/retrieverTool';
import { getAgentExecutorCallbackHandlers } from '../callbackHandlers';
import { Step } from '@/schemas/flow';
import {
  DuckDuckGoToolDefinition,
  GptWrapperToolDefinition,
  RetrieverToolDefinition,
} from '@/schemas/toolDefinitions';
import { getDuckDuckGoTools } from '../tools/duckDuckGoTool';
import { PineconeConfig } from '@/schemas/pinecone';
import { OpenApiConfig } from '@/schemas/openai';
import { getBaseBearlyTool, getBearlyTools } from '../tools/bearlyTool';
import { BearlyConfig } from '@/schemas/bearly';

export const createAgent = async (
  openAiConfig: OpenApiConfig,
  pineconeConfig: PineconeConfig,
  bearlyConfig: BearlyConfig,
  history: [string, string][],
  retrievalTools: RetrieverToolDefinition[],
  wrapperTools: GptWrapperToolDefinition[],
  duckDuckGoTools: DuckDuckGoToolDefinition[],
  trackStep: (step: Step) => void,
) => {
  const agentRetrieverTools = pineconeConfig
    ? await getRetrieverTools(
        openAiConfig,
        pineconeConfig,
        retrievalTools,
        trackStep,
      )
    : [];

  const agentGptWrapperTools = await getWrapperTools(
    openAiConfig,
    wrapperTools,
    trackStep,
  );

  const webBrowserTool = await getDuckDuckGoTools(
    openAiConfig,
    duckDuckGoTools,
    trackStep,
  );

  const bearlyTool = bearlyConfig
    ? await getBearlyTools([getBaseBearlyTool(bearlyConfig.apiKey)], trackStep)
    : [];

  const initExecutorMemory = (chatHistory: [string, string][] = []) => {
    const getChatMessages = (chatHistory: [string, string][] = []) => {
      const postMessages: (HumanMessage | AIMessage)[] = [];
      chatHistory.forEach((ch) => {
        postMessages.push(new HumanMessage(ch[0]));
        postMessages.push(new AIMessage(ch[1]));
      });
      return postMessages;
    };

    const chatMessages = getChatMessages(chatHistory);

    const memory = new BufferWindowMemory({
      memoryKey: 'chat_history',
      outputKey: 'output',
      chatHistory: new ChatMessageHistory(chatMessages),
      aiPrefix: 'Agent',
      humanPrefix: 'Human',
    });

    return memory;
  };

  const agentModel = new ChatOpenAI({
    modelName: openAiConfig.modelname,
    temperature: 0,
    openAIApiKey: openAiConfig.apiKey,
  });

  const agentTools = [
    ...agentRetrieverTools,
    ...agentGptWrapperTools,
    ...webBrowserTool,
    ...bearlyTool,
  ];

  const memory = initExecutorMemory(history);

  const agent = await initializeAgentExecutorWithOptions(
    agentTools,
    agentModel,
    {
      agentType: 'structured-chat-zero-shot-react-description',
      returnIntermediateSteps: true,
      maxIterations: 5,
      memory: memory,
      agentArgs: {
        prefix: `You are a AI agent and your duty is give an answer to the following question USING ONLY information obtained from the available tools you have available and the existent information in the chat history between you (Agent) and the user (Human), these are the only information and knowdlege sources for you.
        REFRAIN from using any additional source or knowledge. If it is not possible to make an answer using ONLY these sources, just say that you don't know the answer.
      Chat History:
      {chat_history}
      These are the only tool you have available:`,
        suffix: `Reminder to ALWAYS use the above format. The value of the field "action_input" when you give the "Final Answer" to the user must be a string or a string representation using markdown syntax. The "Final Answer" must be in the user language. Answer the question using ONLY information received from tools OR from the chat history. DO NOT use information or knowdlege that is part of your initial programming to make an answer, this last one is THE MOST IMPORTANT TO REMEMBER!. Begin!`,
        inputVariables: ['agent_scratchpad', 'chat_history', 'input'],
        callbacks: [getAgentExecutorCallbackHandlers(trackStep)],
      },
      callbacks: [getAgentExecutorCallbackHandlers(trackStep)],
    },
  );

  return agent;
};
