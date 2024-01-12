import { AbortCall } from '@/schemas/flow';
import { Subject } from 'rxjs';

declare global {
  var abortControllers: Record<string, Subject<AbortCall>>;
}

const verifyAbortController = (connectionId: string) => {
  if (!global.abortControllers) {
    global.abortControllers = {};
  }
  if (!global.abortControllers[connectionId]) {
    global.abortControllers[connectionId] = new Subject<AbortCall>();
  }
};

const setNextAbortCall = (cancelCall: AbortCall) => {
  verifyAbortController(cancelCall.connectionId);
  global.abortControllers[cancelCall.connectionId].next(cancelCall);
};

const getConnectionNextAbortCall = (connectionId: string) => {
  verifyAbortController(connectionId);
  return global.abortControllers[connectionId];
};

const removeAbortController = (connectionId: string) => {
  delete global.abortControllers[connectionId];
};

export { setNextAbortCall, getConnectionNextAbortCall, removeAbortController };
