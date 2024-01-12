import { setNextAbortCall } from '@/utils/abortCall';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { connectionId } = req.body;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    setNextAbortCall({
      connectionId,
    });

    res.status(200).json('ok');
  } catch (error: any) {
    console.error('ABORT CALL ERROR', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
