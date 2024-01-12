import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import {
  LOCALSTORAGE_PINECONE_CONFIG,
  PineconeConfig,
  PineconeConfigSchema,
} from '@/schemas/pinecone';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastError } from '@/utils/toast';
import { useTheme } from '@/utils/hooks/useTheme';
import {
  LOCALSTORAGE_RETRIEVAL_TOOLS_KEY,
  RetrieverToolDefinition,
} from '@/schemas/toolDefinitions';

const emptyConfig: PineconeConfig = {
  apiKey: '',
  environment: '',
  indexName: '',
};

export default function Pinecone() {
  const { theme } = useTheme();

  const [retrievalTools, setRetrievalTools] = useLocalStorage<
    RetrieverToolDefinition[]
  >(LOCALSTORAGE_RETRIEVAL_TOOLS_KEY, []);

  const [pineconeConfig, setPineconeConfig] = useLocalStorage<
    [PineconeConfig] | []
  >(LOCALSTORAGE_PINECONE_CONFIG, []);

  const [newPineconeConfig, setNewPineconeConfig] =
    useState<PineconeConfig>(emptyConfig);

  const notValidConfig = useMemo(() => {
    try {
      PineconeConfigSchema.parse(newPineconeConfig);
      return false;
    } catch (error) {
      return true;
    }
  }, [newPineconeConfig]);

  const configHasNotChanges = useMemo(() => {
    return !(
      pineconeConfig?.length > 0 &&
      JSON.stringify(pineconeConfig[0]) !== JSON.stringify(newPineconeConfig)
    );
  }, [pineconeConfig, newPineconeConfig]);

  useEffect(() => {
    if (pineconeConfig && pineconeConfig.length > 0) {
      setNewPineconeConfig(pineconeConfig[0] || emptyConfig);
    } else {
      setNewPineconeConfig(emptyConfig);
    }
  }, [pineconeConfig]);

  const savePineconeConfig = () => {
    try {
      if (!notValidConfig) {
        setPineconeConfig([newPineconeConfig!]);
      }
    } catch (error) {
      ToastError('All fields are required!', theme);
    }
  };

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setNewPineconeConfig((currentConfig) => {
      return {
        ...currentConfig!,
        [field]: e.target.value,
      };
    });
  };

  const loadCurrentConfig = () => {
    pineconeConfig && setNewPineconeConfig(pineconeConfig[0] || emptyConfig);
  };

  const removeConfig = () => {
    if (!!retrievalTools.length) {
      ToastError('Remove retrieval tools first!', theme);
      return;
    }
    setNewPineconeConfig(emptyConfig);
    setPineconeConfig([]);
    setRetrievalTools([]);
  };

  return (
    <div className="mx-auto flex gap-4 w-2/3 items-start justify-evenly">
      <div className="flex flex-col items-center flex-wrap justify-center gap-2">
        <div className="flex w-full items-center gap-2">
          <Label className="min-w-max text-primary" htmlFor="apiKey">
            Api Key
          </Label>
          <Input
            type="password"
            name="apiKey"
            value={newPineconeConfig.apiKey}
            onChange={(e) => handleFieldChange(e, 'apiKey')}
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            className="w-full text-primary"
          />
        </div>
        <div className="flex w-full items-center gap-2">
          <Label className="min-w-max text-primary" htmlFor="environment">
            Environment
          </Label>
          <Input
            type="text"
            name="environment"
            value={newPineconeConfig.environment}
            onChange={(e) => handleFieldChange(e, 'environment')}
            placeholder="us-east-1-aws"
            className="w-full text-primary"
          />
        </div>
        <div className="flex w-full items-center gap-2">
          <Label className="min-w-max text-primary" htmlFor="indexName">
            Index Name
          </Label>
          <Input
            type="text"
            name="indexName"
            value={newPineconeConfig.indexName}
            onChange={(e) => handleFieldChange(e, 'indexName')}
            placeholder="my-index"
            className="w-full text-primary"
          />
        </div>
        <div className="flex content-evenly gap-2">
          <Button
            className="self-end"
            variant="destructive"
            type="submit"
            onClick={removeConfig}
            disabled={!pineconeConfig?.length}
          >
            Remove
          </Button>
          <Button
            className="self-end"
            variant="secondary"
            type="submit"
            onClick={loadCurrentConfig}
            disabled={configHasNotChanges}
          >
            Reload
          </Button>
          <Button
            className="self-end"
            variant="default"
            type="submit"
            onClick={savePineconeConfig}
            disabled={
              !pineconeConfig?.length
                ? notValidConfig
                : configHasNotChanges || notValidConfig
            }
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
