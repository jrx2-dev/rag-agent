import { Dispatch, SetStateAction } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/cn';

interface NamespaceComboboxProps {
  namespaces: string[];
  selectedNamespace: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setNamespace: Dispatch<SetStateAction<string>>;
}

export default function NamespaceCombobox({
  namespaces,
  selectedNamespace,
  open,
  setOpen,
  setNamespace,
}: NamespaceComboboxProps) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-auto justify-between text-primary"
        >
          {selectedNamespace
            ? namespaces?.find(
                (namespace) => namespace === selectedNamespace,
              ) || <span>Select namespace...</span>
            : 'Select namespace...'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Search namespace..." className="h-9" />
          <CommandEmpty>No namespace was found.</CommandEmpty>
          <CommandGroup>
            {namespaces?.map((namespace) => (
              <CommandItem
                key={namespace}
                onSelect={(currentNamespaceValue: string) => {
                  setNamespace(
                    currentNamespaceValue === selectedNamespace
                      ? ''
                      : currentNamespaceValue,
                  );
                  setOpen(false);
                }}
              >
                {namespace}
                <Check
                  className={cn(
                    'ml-auto h-4 w-4',
                    selectedNamespace === namespace
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
