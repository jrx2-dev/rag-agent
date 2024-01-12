import { WrappedSource } from '@/schemas/flow';

interface WrappedSourceStepProps {
  step: WrappedSource;
}

export default function WrappedSourceStep({ step }: WrappedSourceStepProps) {
  return (
    <div className="border flex gap-1 py-3 rounded-2xl text-primary dark:bg-slate-900 bg-slate-100 max-w-md">
      <b className="pl-4">Source:</b>
      <span>{step.source}</span>
    </div>
  );
}
