import { PineconeConfig } from '@/schemas/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

export const initPinecone = async (pineconeConfig: PineconeConfig) => {
  try {
    const pinecone = new Pinecone({
      environment: pineconeConfig.environment,
      apiKey: pineconeConfig.apiKey,
    });

    return pinecone;
  } catch (error) {
    console.error('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
};
