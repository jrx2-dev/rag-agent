import { setNextCall } from '@/utils/connection';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const {
      openAiConfig,
      pineconeConfig,
      bearlyConfig,
      connectionId,
      question,
      history,
      retrievalTools,
      wrapperTools,
      duckDuckGoTools,
    } = req.body;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    setNextCall({
      openAiConfig,
      pineconeConfig,
      bearlyConfig,
      connectionId,
      question,
      history,
      retrievalTools,
      wrapperTools,
      duckDuckGoTools,
    });

    res.status(200).json('ok');
  } catch (error: any) {
    console.error('NEXT CALL ERROR', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
