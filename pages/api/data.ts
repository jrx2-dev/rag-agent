import { AbortCallSchema, AnswerSchema } from '@/schemas/flow';
import { getConnection, removeConnection, removeConnectionData } from '@/utils/connection';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const {
      connectionId,
    } = req.query;

    if (req.method !== 'GET' || !connectionId) {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const connection = getConnection(connectionId as string)
    
    if (connection && connection.data) {
      const data: typeof connection.data = JSON.parse(JSON.stringify(connection.data));
      const parsedAnswer = AnswerSchema.safeParse(connection.data);
      const parsedAbort = AbortCallSchema.safeParse(connection.data);
      if (parsedAnswer.success || parsedAbort.success) {
        removeConnection(connectionId as string)
      } else {
        removeConnectionData(connectionId as string);
      }
      res.status(200).json(data);
    } else {
      res.status(200).json({});
    }
  } catch (error: any) {
    console.error('GET CALL DATA ERROR', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}