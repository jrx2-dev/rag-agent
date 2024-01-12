import { useEffect, useState } from 'react';
import NamespaceCombobox from '@/components/namespaces/namespaceCombobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';

import { ModelName, ModelNameSchema } from '@/schemas/modelNames';
import {
  LOCALSTORAGE_RETRIEVAL_TOOLS_KEY,
  RetrieverToolDefinition,
  RetrieverToolDefinitionSchema,
} from '@/schemas/toolDefinitions';

import RetrievalToolsList from '@/components/tools/retrievalToolsList';
import useGetNamespaces from '@/utils/hooks/useGetPineconeNamespaces';
import { LoadingDots } from '@/components/ui/loading-dots';
import { ToastError } from '@/utils/toast';
import { useTheme } from '@/utils/hooks/useTheme';

const toolDescriptionPlaceholder =
  'Useful for when you need to ask questions about...';

export default function RetrievalTools() {
  const { theme } = useTheme();

  const { namespaces, namespacesError, loading } = useGetNamespaces();
  const [openNamespacesCombobox, setOpenNamespacesCombobox] = useState(false);

  const [nameSpace, setNameSpace] = useState('');
  const [description, setDescription] = useState(toolDescriptionPlaceholder);
  const [name, setName] = useState('');
  const [model, setModel] = useState<ModelName>(
    ModelNameSchema.Values['gpt-3.5-turbo'],
  );

  const [retrievalTools, setRetrievalTools] = useLocalStorage<
    RetrieverToolDefinition[]
  >(LOCALSTORAGE_RETRIEVAL_TOOLS_KEY, []);
  const [newRetrievalTool, setNewRetrievalTool] =
    useState<RetrieverToolDefinition>();

  useEffect(() => {
    setNewRetrievalTool({
      name: name,
      description: description,
      modelname: ModelNameSchema.Values[model],
      namespace: nameSpace,
    });
  }, [nameSpace, description, name, model, setNewRetrievalTool]);

  const isValidNewRetrievalTool = (
    newRetrievalTool: RetrieverToolDefinition,
  ) => {
    try {
      RetrieverToolDefinitionSchema.parse(newRetrievalTool);
      const isValid =
        !!newRetrievalTool.namespace &&
        retrievalTools.filter(
          (rt) => rt.namespace === newRetrievalTool.namespace,
        ).length === 0;
      if (!isValid) ToastError('An unused namespace is required!', theme);
      return isValid;
    } catch (error) {
      console.error(error);
      ToastError('All fields are required!', theme);
      return false;
    }
  };

  const saveRetrievalTool = () => {
    if (newRetrievalTool && isValidNewRetrievalTool(newRetrievalTool)) {
      setRetrievalTools([...retrievalTools, newRetrievalTool]);
      setNameSpace('');
      setDescription('');
      setName('');
      setModel(ModelNameSchema.Values['gpt-3.5-turbo']);
    }
  };

  return (
    <>
      {loading && (
        <div className="mx-auto flex flex-col gap-4 w-full rounded border p-4 items-center">
          <div className="flex w-full max-w-sm space-x-2 gap-4 text-primary">
            Loading Pinecone namespaces
            <LoadingDots />
          </div>
        </div>
      )}
      {namespaces && !!namespaces.length && (
        <Tabs defaultValue="addTool">
          <TabsList>
            <TabsTrigger value="addTool">Add Tool</TabsTrigger>
            <TabsTrigger value="listTools">List Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="addTool" className="p-0">
            <div className="flex flex-col gap-4 py-2 items-center bg-background">
              <div className="flex flex-col w-full max-w-sm space-x-2 gap-4">
                <Label className="text-primary">Pinecone namespace</Label>
                <NamespaceCombobox
                  namespaces={namespaces}
                  setNamespace={setNameSpace}
                  selectedNamespace={nameSpace}
                  open={openNamespacesCombobox}
                  setOpen={setOpenNamespacesCombobox}
                />
              </div>
              <div className="flex flex-col w-full max-w-sm space-x-2 gap-4">
                <Label className="text-primary" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  className="text-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={toolDescriptionPlaceholder}
                />
              </div>
              <div className="flex flex-col w-full max-w-sm space-x-2 gap-4">
                <Label className="text-primary">Name</Label>
                <Input
                  className="text-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="name"
                  placeholder="Best Tool"
                />
              </div>
              <div className="flex flex-col w-full max-w-sm space-x-2 gap-4">
                <Label className="text-primary">Model</Label>
                <RadioGroup
                  value={model}
                  onValueChange={(e) => setModel(e as ModelName)}
                  defaultValue={ModelNameSchema.Values['gpt-3.5-turbo']}
                >
                  <div className="flex items-center space-x-2">
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
                  <div className="flex items-center space-x-2">
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
              </div>
              <div className="flex w-full justify-end max-w-sm space-x-2 gap-4 mt-8">
                <Button
                  className="text-primary"
                  variant="outline"
                  onClick={saveRetrievalTool}
                >
                  Add retrieval tool
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="listTools" className="p-0">
            <RetrievalToolsList
              namespaces={namespaces}
              retrievalTools={retrievalTools}
              setRetrievalTools={setRetrievalTools}
            />
          </TabsContent>
        </Tabs>
      )}
      {namespacesError && (
        <div className="mx-auto flex flex-col gap-4 w-2/3 rounded border p-4 items-center mt-8">
          <div className="flex justify-center w-full max-w-sm space-x-2 gap-4 text-red-700">
            {namespacesError} Check config.
          </div>
        </div>
      )}
    </>
  );
}
