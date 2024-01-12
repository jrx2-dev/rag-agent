import {
  DuckDuckGoToolDefinition,
  LOCALSTORAGE_DUCK_DUCK_GO_TOOLS_KEY,
} from '@/schemas/toolDefinitions';
import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { getBaseDuckDuckGoTool } from '@/utils/tools/duckDuckGoTool';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function DuckDuckGoTools() {
  const [duckDuckGoTools, setDuckDuckGoTools] = useLocalStorage<
    DuckDuckGoToolDefinition[] | []
  >(LOCALSTORAGE_DUCK_DUCK_GO_TOOLS_KEY, []);

  const duckDuckGoEnabledChange = (checked: boolean) => {
    if (checked) {
      setDuckDuckGoTools([getBaseDuckDuckGoTool()]);
    } else {
      setDuckDuckGoTools([]);
    }
  };

  return (
    <div className="flex w-full gap-4 p-4 space-x-2 items-start justify-start">
      {duckDuckGoTools && (
        <div className="flex items-center flex-wrap gap-2">
          <Switch
            id="duckDuckGoToolEnabled"
            checked={!!duckDuckGoTools.length}
            onCheckedChange={duckDuckGoEnabledChange}
          />
          <Label className="text-primary" htmlFor="duckDuckGoToolEnabled">
            Enabled
          </Label>
        </div>
      )}
    </div>
  );
}
