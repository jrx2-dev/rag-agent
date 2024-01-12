import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  BearlyConfig,
  BearlyToolStatus,
  BearlyToolStatusSchema,
  LOCALSTORAGE_BEARLY_CONFIG,
  LOCALSTORAGE_BEARLY_ENABLED,
} from '@/schemas/bearly';

export default function BearlyTool() {
  const [bearlyToolEnabled, setBearlyToolEnabled] =
    useLocalStorage<BearlyToolStatus>(
      LOCALSTORAGE_BEARLY_ENABLED,
      BearlyToolStatusSchema.Enum.disabled,
    );

  const [bearlyConfig] = useLocalStorage<BearlyConfig[]>(
    LOCALSTORAGE_BEARLY_CONFIG,
    [],
  );

  const bearlyEnabledChange = (checked: boolean) => {
    if (checked) {
      setBearlyToolEnabled(BearlyToolStatusSchema.Enum.enabled);
    } else {
      setBearlyToolEnabled(BearlyToolStatusSchema.Enum.disabled);
    }
  };

  return (
    <div className="flex w-full gap-4 p-4 space-x-2 items-start justify-start">
      <div className="flex items-center flex-wrap gap-2">
        <Switch
          disabled={!bearlyConfig?.length}
          id="bearlyToolEnabled"
          checked={bearlyToolEnabled === BearlyToolStatusSchema.Enum.enabled}
          onCheckedChange={bearlyEnabledChange}
        />
        <Label className="text-primary" htmlFor="bearlyToolEnabled">
          Enabled
        </Label>
      </div>
    </div>
  );
}
