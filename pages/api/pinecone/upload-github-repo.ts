import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import {
  GithubRepoLoader,
  GithubRepoLoaderParams,
} from 'langchain/document_loaders/web/github';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { initPinecone } from '@/utils/pinecone-client';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === 'POST') {
      const form = formidable();
      const [fields] = await form.parse(req);

      const repo = fields.repo[0];
      const branch = fields.branch[0];
      const accessToken = fields.accessToken[0];
      const namespace = fields.namespace[0];

      const loader = new GithubRepoLoader(repo, {
        accessToken,
        branch,
        recursive: false,
        unknown: 'warn',
        // maxConcurrency: 5, // Defaults to 2 (need update langchain package)
      } as GithubRepoLoaderParams);
      const rawDocs = await loader.load();

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await textSplitter.splitDocuments(rawDocs);

      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: fields.openAiKey[0],
      });
      const pineconeClient = await initPinecone({
        apiKey: fields.apiKey[0],
        environment: fields.environment[0],
        indexName: fields.indexName[0],
      });

      const index = pineconeClient.Index(fields.indexName[0]);
      await index.namespace(namespace).deleteAll();

      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        namespace: namespace,
        textKey: 'text',
      });

      res.status(201).send('Done');
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
