import { useEffect, useState } from 'react';

import { ModelName, ModelNameSchema } from '@/schemas/modelNames';
import {
  GptWrapperToolDefinition,
  LOCALSTORAGE_WRAPPER_TOOLS_KEY,
} from '@/schemas/toolDefinitions';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { getBaseNewWrapperTool } from '@/utils/tools/gptWrapperTool';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function WrapperTools() {
  const [wrapperTools, setWrapperTools] = useLocalStorage<
    [GptWrapperToolDefinition] | []
  >(LOCALSTORAGE_WRAPPER_TOOLS_KEY, []);

  const [newWrapperTool, setNewWrapperTool] =
    useState<GptWrapperToolDefinition>();

  useEffect(() => {
    if (wrapperTools && wrapperTools.length > 0) {
      setNewWrapperTool(wrapperTools[0]);
    } else if (wrapperTools) {
      setNewWrapperTool(getBaseNewWrapperTool());
    }
  }, [wrapperTools]);

  const gptModelChange = (
    modelName: ModelName,
    newWrapperTool: GptWrapperToolDefinition,
  ) => {
    const newValue = {
      ...newWrapperTool,
      ...{ modelname: ModelNameSchema.Values[modelName] },
    };
    setNewWrapperTool(newValue);
    setWrapperTools([newValue]);
  };

  const gptEnabledChange = (
    checked: boolean,
    newWrapperTool: [GptWrapperToolDefinition] | [],
  ) => {
    if (checked) {
      setWrapperTools(newWrapperTool);
    } else {
      setWrapperTools([]);
    }
  };

  return (
    <div className="flex w-full gap-4 p-4 space-x-2 items-start justify-between">
      {wrapperTools && (
        <div className="flex items-center flex-wrap gap-2">
          <Switch
            id="gptToolEnabled"
            checked={!!wrapperTools.length}
            onCheckedChange={(checked) =>
              gptEnabledChange(checked, newWrapperTool ? [newWrapperTool] : [])
            }
          />
          <Label className="text-primary" htmlFor="gptToolEnabled">
            Enabled
          </Label>
        </div>
      )}
      {newWrapperTool && (
        <RadioGroup
          defaultValue={newWrapperTool.modelname}
          className="flex gap-4"
          onValueChange={(value) =>
            gptModelChange(value as ModelName, newWrapperTool)
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
      )}
    </div>
  );
}
