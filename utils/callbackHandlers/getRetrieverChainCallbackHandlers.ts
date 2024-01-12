import { BaseCallbackHandler } from 'langchain/callbacks';
import { ChainValues } from 'langchain/schema';
import { Step } from '@/schemas/flow';

export const getRetrieverChainCallbackHandlers = (
  trackStep: (step: Step) => void,
  tool: string,
) => {
  class RetrieverChainCallbackHandler extends BaseCallbackHandler {
    name = `${tool} -> RetrieverChainCallbackHandler`;

    handleChainEnd(_output: ChainValues) {
      _output.sourceDocuments && trackStep(_output.sourceDocuments);
    }
  }

  return new RetrieverChainCallbackHandler();
};
