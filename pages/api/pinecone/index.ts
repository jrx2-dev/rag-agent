import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
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
    if (req.method === 'DELETE') {
      const form = formidable();
      const [fields] = await form.parse(req);
      const namespace = fields.namespace[0];

      const pineconeClient = await initPinecone({
        apiKey: fields.apiKey[0],
        environment: fields.environment[0],
        indexName: fields.indexName[0],
      });
      const index = pineconeClient.Index(fields.indexName[0]);
      await index.namespace(namespace).deleteAll();

      res.status(200).send('Deleted');
      return;
    }

    // i need to send the pinecone config :)
    if (req.method === 'POST') {
      const form = formidable();
      try {
        const [fields] = await form.parse(req);
        const pineconeClient = await initPinecone({
          apiKey: fields.apiKey[0],
          environment: fields.environment[0],
          indexName: fields.indexName[0],
        });
        const index = pineconeClient.Index(fields.indexName[0]);
        // const describeIndexStatsQuery = { filter: {} };
        const stats = await index.describeIndexStats();
        res.status(200).send(JSON.stringify(stats.namespaces));
      } catch (error) {
        res.status(500).send('Error getting namespaces.');
      }
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
