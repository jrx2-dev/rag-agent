import { Step, Answer, AbortCall } from '@/schemas/flow';

type Connection = {
  abortController?: AbortController,
  data?: Step | Answer | AbortCall,
}

declare global {
  var connections: Record<string, Connection>;
}

const verifyConnection = (connectionId: string) => {
  if (!global.connections) {
    global.connections = {};
  }
  if (!global.connections[connectionId]) {
    global.connections[connectionId] = {}
  }
};

const setConnectionData = (connectionId: string, result: Step | Answer | AbortCall) => {
  verifyConnection(connectionId);
  global.connections[connectionId].data = result;
};

const removeConnectionData = (connectionId: string) => {
  delete global.connections[connectionId].data;
};

const setConnectionAbortControler = (connectionId: string, abortSignal: AbortController) => {
  verifyConnection(connectionId);
  global.connections[connectionId].abortController = abortSignal;
};

const getConnection = (connectionId: string) => {
  verifyConnection(connectionId);
  return global.connections[connectionId];
};

const removeConnection = (connectionId: string) => {
  delete global.connections[connectionId];
}

export { setConnectionData, removeConnectionData, setConnectionAbortControler, getConnection, removeConnection };
