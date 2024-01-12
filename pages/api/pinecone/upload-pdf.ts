import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
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
      const [fields, files] = await form.parse(req);

      const pdf = files.pdf[0];
      const namespace = fields.namespace[0];

      let buffer = fs.readFileSync(pdf.filepath);
      let blob = new Blob([buffer]);

      const pdfLoader = new PDFLoader(blob);
      const rawDocs = await pdfLoader.load();

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
