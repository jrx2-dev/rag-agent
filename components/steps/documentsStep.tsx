import { Fragment } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document } from '@/schemas/document';

interface DocumentsStepProps {
  step: Document[];
}

export default function DocumentsStep({ step }: DocumentsStepProps) {
  return (
    <Tabs className="border rounded-2xl max-w-md">
      <b className="pl-4 text-primary">Sources:</b>
      <TabsList>
        {step.map((_, i) => (
          <TabsTrigger key={`sourceTrigger-${i}`} value={`doc-${i}`}>
            Source {i + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      {step.map((doc, i) => (
        <TabsContent
          key={`sourceContent-${i}`}
          value={`doc-${i}`}
          className="border overflow-scroll"
        >
          <Fragment>
            <p className="mt-2">
              <b>Content:</b> {doc.pageContent}
            </p>
            <p className="mt-2">
              <b>Source:</b> {doc.metadata.source}
            </p>
          </Fragment>
        </TabsContent>
      ))}
    </Tabs>
  );
}
