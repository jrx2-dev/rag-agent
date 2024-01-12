# RAG Agent: AI Assistant Experiment

## Introduction

This project presents an experimental AI assistant, leveraging the power of Large Language Models (like chat-gpts LLMs from OpenAI) and integrating various tools for information retrieval and task execution. The core of this project is built using the [LangChain](https://js.langchain.com/) framework.

## Key Components

### LangChain Framework
- **Usage**: Central framework for the AI assistant.
- **Note**: LangChain Expression Language was not used due to its unavailability at the start of the project and the current lack of experimentation time.

### Pinecone Database
- **Functionality**: Serves as a vector database.
- **Features**:
  - Ingestion of PDF content and GitHub repository data.
  - Specification of namespaces for storing generated vectors, with options to create new or use existing namespaces.
  - Each namespace in Pinecone can be used to create retriever tools, keeping related knowledge under a unified tool.

### GPT Wrapper Tool
- **Purpose**: Accesses the knowledge trained into the GPT model and uses it as a source of information.

### DuckDuckGo Integration
- **Function**: Performs web searches on various topics, providing updated information beyond the data trained in the model and stored in Pinecone.

### Bearly Integration
- **Usage**: Executes Python code in a secure and isolated environment.

## Additional Features

### Server Sent Events
- **Description**: Long-life connection for asynchronous message transmission from server to client.
- **Application**: Used for sending agent responses and information about the steps followed to obtain user responses. Includes specific endpoints for initiating and canceling queries.

### RXJS Library
- **Implementation**: Manages an observable queue (similar to Redis) in memory.
- **Functionality**: Tracks agent executions for each connection, allowing subscription to specific executions (agent-user connections). New responses from the agent are sent to the user via Server Sent Events.

### Text-to-Speech and Speech-to-Text
- **Integration**: Utilizes browser capabilities for text-to-speech and speech-to-text functionalities.
- **Purpose**: Allows dictating new messages to the agent and listening to agent responses.

### Additional Technologies
- **Used Technologies**: [NextJs](https://nextjs.org/), [Tailwind](https://tailwindcss.com/), [Zod](https://zod.dev/), [Shadcn/ui](https://ui.shadcn.com/), [RxJS](https://rxjs.dev/) and other libraries.
- **Data Storage**: Due to the absence of a database for credentials or configurations, all data is stored in local storage (client side) and sent to the back with each query to instantiate the agent and necessary tools. No information is stored on the backend.

## Conclusion

This project is a blend of modern AI technologies and innovative programming techniques, aimed at exploring the capabilities of AI assistants in processing and retrieving information. It stands as a testament to the power of AI in enhancing user experience and the potential of technology in shaping the future of human-computer interaction.

This is an idea based on [myooear](https://github.com/mayooear/gpt4-pdf-chatbot-langchain) original development.

## Development

**If you run into errors, please review the troubleshooting section further down this page.**

Prelude: Please make sure you have already downloaded node on your system and the version is 18 or greater.

1. Clone the repo or download the ZIP

```
git clone [github https url]
```

2. Install packages

```
npm install
```

After installation, you should now see a `node_modules` folder.

3. Retrieve config settings

- Visit [openai](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API keys.
- Visit [pinecone](https://pinecone.io/) to create and retrieve your API keys, and also retrieve your environment and index name from the dashboard.
- Visit [github](https://github.com/settings/tokens) to retrieve a personal access token.
- Visit [bearly](https://bearly.ai/dashboard/developers) to retrieve an API key.

4. In `utils/makeStructuredChatAgentExecutor.ts` change the `prefix and suffix prompts` for your own usecase. Please verify outside this repo that you have access to `gpt-4-1106-preview` api, otherwise use `gpt-3.5-turbo` (AGENT_MODEL_NAME const).

## Run the app

You can run the app `npm run dev` to launch the local dev environment, and then type a question in the chat interface.

## Troubleshooting

In general, keep an eye out in the `issues` and `discussions` section of this repo for solutions.

**General errors**

- Make sure you're running the latest Node version. Run `node -v`
- Try a different PDF or convert your PDF to text first. It's possible your PDF is corrupted, scanned, or requires OCR to convert to text.
- Make sure you're using the same versions of LangChain and Pinecone as this repo.
- If you change `modelName` in `OpenAI`, make sure you have access to the api for the appropriate model.
- Make sure you have enough OpenAI credits and a valid card on your billings account.

**Pinecone errors**

- Check that you've set the vector dimensions to `1536`.
- Make sure your pinecone namespaces are in lowercase.
- Pinecone indexes of users on the Starter(free) plan are deleted after 7 days of inactivity. To prevent this, send an API request to Pinecone to reset the counter before 7 days.
- Retry from scratch with a new Pinecone project, index, and cloned repo.

## Credit

This repo is inspired by [gpt4-pdf-chatbot-langchain
](https://github.com/mayooear/gpt4-pdf-chatbot-langchain)

