import { Dispatch, SetStateAction } from 'react';

import { RetrieverToolDefinition } from '@/schemas/toolDefinitions';
import { cn } from '@/utils/cn';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

interface RetrievalToolsListProps {
  namespaces: string[];
  retrievalTools: RetrieverToolDefinition[];
  setRetrievalTools: Dispatch<
    SetStateAction<RetrieverToolDefinition[] | undefined>
  >;
}

export default function RetrievalToolsList({
  namespaces,
  retrievalTools,
  setRetrievalTools,
}: RetrievalToolsListProps) {
  const deleteRetrievalTool = (retrievalTool: RetrieverToolDefinition) => {
    const filteredRetrievalTools = retrievalTools.filter(
      (rt) => rt.namespace !== retrievalTool.namespace,
    );
    setRetrievalTools(filteredRetrievalTools);
  };

  return (
    <>
      {!!retrievalTools.length ? (
        <div className="mx-auto flex gap-2 flex-wrap justify-center">
          {retrievalTools.map((tool) => (
            <Card
              key={tool.namespace}
              className={cn('flex flex-col w-full', {
                'border-red-600 bg-red-50': !namespaces.includes(
                  tool.namespace,
                ),
              })}
            >
              <CardHeader className="flex">
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription className="break-all">
                  <b>Namespace:</b> {tool.namespace}{' '}
                  {!namespaces.includes(tool.namespace) && (
                    <span className="text-red-600">( Deleted )</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{tool.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm">{tool.modelname}</span>
                <Button
                  variant="destructive"
                  onClick={() => deleteRetrievalTool(tool)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mx-auto flex justify-center bg-background">
          No Retrieval Tools configured.
        </div>
      )}
    </>
  );
}
