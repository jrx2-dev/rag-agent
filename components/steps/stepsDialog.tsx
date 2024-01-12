import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DocumentsStep from '@/components/steps/documentsStep';
import LogStep from '@/components/steps/logStep';
import WrappedSourceStep from '@/components/steps/wrappedSourceStep';
import { DocumentSchema } from '@/schemas/document';
import { Step, LogSchema, WrappedSourceSchema } from '@/schemas/flow';
import { cn } from '@/utils/cn';
import { useTheme } from '@/utils/hooks/useTheme';

interface StepsDialogProps {
  steps: Step[];
  opened: boolean;
  close: () => void;
}

export default function StepsDialog({
  steps,
  opened,
  close,
}: StepsDialogProps) {
  const { theme } = useTheme();
  return (
    <Dialog open={opened}>
      <DialogContent
        className={cn({
          dark: theme === 'dark',
        })}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">Agent steps</DialogTitle>
          {steps && (
            <div className="flex flex-col gap-4 pt-4">
              {steps.map((step, index) => {
                let parsedStep;
                parsedStep = DocumentSchema.array().safeParse(step);
                if (parsedStep.success) {
                  step = parsedStep.data;
                  return <DocumentsStep key={`step-${index}`} step={step} />;
                }
                parsedStep = LogSchema.safeParse(step);
                if (parsedStep.success) {
                  step = parsedStep.data;
                  return <LogStep key={`step-${index}`} step={step} />;
                }
                parsedStep = WrappedSourceSchema.safeParse(step);
                if (parsedStep.success) {
                  step = parsedStep.data;
                  return (
                    <WrappedSourceStep key={`step-${index}`} step={step} />
                  );
                }
              })}
            </div>
          )}
        </DialogHeader>
        <DialogClose asChild>
          <Button
            variant={'outline'}
            className="IconButton bg-background text-primary"
            aria-label="Hide"
            onClick={close}
          >
            Hide
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
