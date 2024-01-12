import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastError } from '@/utils/toast';
import { useTheme } from '@/utils/hooks/useTheme';
import {
  BearlyConfig,
  BearlyConfigSchema,
  BearlyToolStatus,
  BearlyToolStatusSchema,
  LOCALSTORAGE_BEARLY_CONFIG,
  LOCALSTORAGE_BEARLY_ENABLED,
} from '@/schemas/bearly';

const emptyConfig: BearlyConfig = {
  apiKey: '',
};

export default function Bearly() {
  const { theme } = useTheme();

  const [_, setBearlyToolEnabled] = useLocalStorage<BearlyToolStatus>(
    LOCALSTORAGE_BEARLY_ENABLED,
    BearlyToolStatusSchema.Enum.disabled,
  );

  const [bearlyConfig, setBearlyConfig] = useLocalStorage<[BearlyConfig] | []>(
    LOCALSTORAGE_BEARLY_CONFIG,
    [],
  );

  const [newBearlyConfig, setNewBearlyConfig] =
    useState<BearlyConfig>(emptyConfig);

  const notValidConfig = useMemo(() => {
    try {
      BearlyConfigSchema.parse(newBearlyConfig);
      return false;
    } catch (error) {
      return true;
    }
  }, [newBearlyConfig]);

  const configHasNotChanges = useMemo(() => {
    return !(
      bearlyConfig?.length > 0 &&
      JSON.stringify(bearlyConfig[0]) !== JSON.stringify(newBearlyConfig)
    );
  }, [bearlyConfig, newBearlyConfig]);

  useEffect(() => {
    if (bearlyConfig && bearlyConfig.length > 0) {
      setNewBearlyConfig(bearlyConfig[0] || emptyConfig);
    } else {
      setNewBearlyConfig(emptyConfig);
    }
  }, [bearlyConfig]);

  const saveBearlyConfig = () => {
    try {
      if (!notValidConfig) {
        setBearlyConfig([newBearlyConfig!]);
      }
    } catch (error) {
      ToastError('All fields are required!', theme);
    }
  };

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setNewBearlyConfig((currentConfig) => {
      return {
        ...currentConfig!,
        [field]: e.target.value,
      };
    });
  };

  const loadCurrentConfig = () => {
    console.log('load');
    setNewBearlyConfig(bearlyConfig[0] || emptyConfig);
  };

  const removeConfig = () => {
    setNewBearlyConfig(emptyConfig);
    setBearlyConfig([]);
    setBearlyToolEnabled(BearlyToolStatusSchema.Enum.disabled);
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
            value={newBearlyConfig.apiKey}
            onChange={(e) => handleFieldChange(e, 'apiKey')}
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            className="w-full text-primary"
          />
        </div>
        <div className="flex content-evenly gap-2">
          <Button
            className="self-end"
            variant="destructive"
            type="submit"
            onClick={removeConfig}
            disabled={!bearlyConfig?.length}
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
            onClick={saveBearlyConfig}
            disabled={
              !bearlyConfig?.length
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
