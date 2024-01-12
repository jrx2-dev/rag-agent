import { Subject } from 'rxjs';
import { Call } from '@/schemas/call';

declare global {
  var connections: Record<string, Subject<Call>>;
}

const verifyConnection = (connectionId: string) => {
  if (!global.connections) {
    global.connections = {};
  }
  if (!global.connections[connectionId]) {
    global.connections[connectionId] = new Subject<Call>();
  }
};

const setNextCall = (call: Call) => {
  verifyConnection(call.connectionId);
  global.connections[call.connectionId].next(call);
};

const getConnectionNextCalls = (connectionId: string) => {
  verifyConnection(connectionId);
  return global.connections[connectionId];
};

const removeConnection = (connectionId: string) => {
  delete global.connections[connectionId];
};

export { setNextCall, getConnectionNextCalls, removeConnection };
