import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import {
  LOCALSTORAGE_OPEN_API_CONFIG,
  OpenApiConfig,
  OpenApiConfigSchema,
} from '@/schemas/openai';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ModelName, ModelNameSchema } from '@/schemas/modelNames';
import { ToastError } from '@/utils/toast';
import { useTheme } from '@/utils/hooks/useTheme';

const emptyConfig: OpenApiConfig = {
  apiKey: '',
  modelname: 'gpt-3.5-turbo',
};

export default function OpenAI() {
  const { theme } = useTheme();

  const [openApiConfig, setOpenApiConfig] = useLocalStorage<
    [OpenApiConfig] | []
  >(LOCALSTORAGE_OPEN_API_CONFIG, []);

  const [newOpenApiConfig, setNewOpenApiConfig] =
    useState<OpenApiConfig>(emptyConfig);

  const gptModelChange = (
    modelName: ModelName,
    newOpenApiConfig: OpenApiConfig,
  ) => {
    const newValue = {
      ...newOpenApiConfig,
      ...{ modelname: ModelNameSchema.Values[modelName] },
    };
    setNewOpenApiConfig(newValue);
  };

  const notValidConfig = useMemo(() => {
    try {
      OpenApiConfigSchema.parse(newOpenApiConfig);
      return false;
    } catch (error) {
      return true;
    }
  }, [newOpenApiConfig]);

  const configHasNotChanges = useMemo(() => {
    return !(
      openApiConfig?.length > 0 &&
      JSON.stringify(openApiConfig[0]) !== JSON.stringify(newOpenApiConfig)
    );
  }, [openApiConfig, newOpenApiConfig]);

  useEffect(() => {
    if (openApiConfig && openApiConfig[0]) {
      setNewOpenApiConfig(openApiConfig[0]);
    } else {
      setNewOpenApiConfig(emptyConfig);
    }
  }, [openApiConfig]);

  const saveOpenApiConfig = () => {
    try {
      if (!notValidConfig) {
        setOpenApiConfig([newOpenApiConfig]);
      }
    } catch (error) {
      ToastError('All fields are required!', theme);
    }
  };

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setNewOpenApiConfig((currentConfig) => {
      return {
        ...currentConfig!,
        [field]: e.target.value,
      };
    });
  };

  const loadCurrentConfig = () => {
    console.log('load');
    setNewOpenApiConfig(openApiConfig[0] || emptyConfig);
  };

  const removeConfig = () => {
    setNewOpenApiConfig(emptyConfig);
    setOpenApiConfig([]);
  };

  return (
    <div className="mx-auto flex gap-4 w-2/3 items-start justify-evenly">
      <div className="flex flex-col items-center flex-wrap justify-center gap-4">
        <div className="flex w-full items-center gap-2">
          <Label className="min-w-max text-primary" htmlFor="apiKey">
            Api Key
          </Label>
          <Input
            type="password"
            name="apiKey"
            value={newOpenApiConfig.apiKey}
            onChange={(e) => handleFieldChange(e, 'apiKey')}
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            className="w-full text-primary"
          />
        </div>
        <RadioGroup
          value={newOpenApiConfig.modelname}
          className="flex gap-4"
          onValueChange={(value) =>
            gptModelChange(value as ModelName, newOpenApiConfig)
          }
        >
          <div className="flex items-center space-x-2 flex-wrap justify-center gap-2">
            <RadioGroupItem
              value={ModelNameSchema.Values['gpt-3.5-turbo']}
              id={ModelNameSchema.Values['gpt-3.5-turbo']}
            />
            <Label
              className="text-primary"
              htmlFor={ModelNameSchema.Values['gpt-3.5-turbo']}
            >
              {ModelNameSchema.Values['gpt-3.5-turbo']}
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-wrap justify-center gap-2">
            <RadioGroupItem
              value={ModelNameSchema.Values['gpt-4-1106-preview']}
              id={ModelNameSchema.Values['gpt-4-1106-preview']}
            />
            <Label
              className="text-primary"
              htmlFor={ModelNameSchema.Values['gpt-4-1106-preview']}
            >
              {ModelNameSchema.Values['gpt-4-1106-preview']}
            </Label>
          </div>
        </RadioGroup>
        <div className="flex content-evenly gap-2">
          <Button
            className="self-end"
            variant="destructive"
            type="submit"
            onClick={removeConfig}
            disabled={!openApiConfig?.length}
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
            onClick={saveOpenApiConfig}
            disabled={
              !openApiConfig?.length
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
