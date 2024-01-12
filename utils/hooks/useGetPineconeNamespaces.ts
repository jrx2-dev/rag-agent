import {
  LOCALSTORAGE_PINECONE_CONFIG,
  PineconeConfig,
} from '@/schemas/pinecone';
import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

const useGetNamespaces = () => {
  const [namespaces, setNamespaces] = useState<string[]>();
  const [namespacesError, setNamespacesError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const [pineconeConfig, setPineconeConfig] = useLocalStorage<
    [PineconeConfig] | []
  >(LOCALSTORAGE_PINECONE_CONFIG, []);
  const [currentConfig, setCurrentConfig] = useState<PineconeConfig>();

  const refresh = () =>
    setPineconeConfig((config) => JSON.parse(JSON.stringify(config)));

  useEffect(() => {
    if (pineconeConfig?.length > 0) {
      setNamespaces(undefined);
      setNamespacesError(undefined);
      setLoading(true);
      setCurrentConfig(pineconeConfig[0]);
      const body = new FormData();
      body.append('apiKey', pineconeConfig[0]?.apiKey!);
      body.append('environment', pineconeConfig[0]?.environment!);
      body.append('indexName', pineconeConfig[0]?.indexName!);
      fetch('/api/pinecone', {
        method: 'POST',
        body,
      })
        .then((response) => response.json())
        .then((namespaces) => {
          setNamespaces(Object.keys(namespaces));
          setNamespacesError(undefined);
        })
        .catch(() => {
          setNamespaces(undefined);
          setNamespacesError('Error getting pinecone namespaces.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setNamespaces(undefined);
      setNamespacesError('Pinecone config not detected.');
      setLoading(false);
    }
  }, [pineconeConfig]);

  return {
    namespaces,
    namespacesError,
    pineconeConfig: currentConfig,
    loading,
    refresh,
  };
};

export default useGetNamespaces;
