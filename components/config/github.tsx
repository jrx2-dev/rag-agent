import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastError } from '@/utils/toast';
import { useTheme } from '@/utils/hooks/useTheme';
import {
  GithubConfig,
  GithubConfigSchema,
  LOCALSTORAGE_GITHUB_CONFIG,
} from '@/schemas/github';

const emptyConfig: GithubConfig = {
  accessToken: '',
};

export default function Github() {
  const { theme } = useTheme();

  const [githubConfig, setGithubConfig] = useLocalStorage<[GithubConfig] | []>(
    LOCALSTORAGE_GITHUB_CONFIG,
    [],
  );

  const [newGithubConfig, setNewGithubConfig] =
    useState<GithubConfig>(emptyConfig);

  const notValidConfig = useMemo(() => {
    try {
      GithubConfigSchema.parse(newGithubConfig);
      return false;
    } catch (error) {
      return true;
    }
  }, [newGithubConfig]);

  const configHasNotChanges = useMemo(() => {
    return !(
      githubConfig?.length > 0 &&
      JSON.stringify(githubConfig[0]) !== JSON.stringify(newGithubConfig)
    );
  }, [githubConfig, newGithubConfig]);

  useEffect(() => {
    if (githubConfig && githubConfig[0]) {
      setNewGithubConfig(githubConfig[0]);
    } else {
      setNewGithubConfig(emptyConfig);
    }
  }, [githubConfig]);

  const saveGithubConfig = () => {
    try {
      if (!notValidConfig) {
        setGithubConfig([newGithubConfig!]);
      }
    } catch (error) {
      ToastError('All fields are required!', theme);
    }
  };

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setNewGithubConfig((currentConfig) => {
      return {
        ...currentConfig!,
        [field]: e.target.value,
      };
    });
  };

  const loadCurrentConfig = () => {
    console.log('load');
    setNewGithubConfig(githubConfig[0] || emptyConfig);
  };

  const removeConfig = () => {
    setNewGithubConfig(emptyConfig);
    setGithubConfig([]);
  };

  return (
    <div className="mx-auto flex gap-4 w-2/3 items-start justify-evenly">
      <div className="flex flex-col items-center flex-wrap justify-center gap-4">
        <div className="flex w-full items-center gap-2">
          <Label className="min-w-max text-primary" htmlFor="accessToken">
            Access Token
          </Label>
          <Input
            type="password"
            name="accessToken"
            value={newGithubConfig.accessToken}
            onChange={(e) => handleFieldChange(e, 'accessToken')}
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
            disabled={!githubConfig?.length}
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
            onClick={saveGithubConfig}
            disabled={
              !githubConfig?.length
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
