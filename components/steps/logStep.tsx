import ReactMarkdown from 'react-markdown';
import { Log } from '@/schemas/flow';

interface LogStepProps {
  step: Log;
}

export default function LogStep({ step }: LogStepProps) {
  return (
    <ReactMarkdown
      linkTarget="_blank"
      className="border p-4 rounded-2xl text-primary dark:bg-slate-900 bg-slate-50 max-w-md overflow-scroll"
    >
      {step.log}
    </ReactMarkdown>
  );
}
