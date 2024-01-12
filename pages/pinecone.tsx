import { ChangeEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Layout from '@/components/layouts/layout';
import { LoadingDots } from '@/components/ui/loading-dots';
import NamespaceCombobox from '@/components/namespaces/namespaceCombobox';
import useGetNamespaces from '@/utils/hooks/useGetPineconeNamespaces';
import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { useTheme } from '@/utils/hooks/useTheme';
import { ToastError } from '@/utils/toast';
import { LOCALSTORAGE_OPEN_API_CONFIG, OpenApiConfig } from '@/schemas/openai';
import { GithubConfig, LOCALSTORAGE_GITHUB_CONFIG } from '@/schemas/github';
import {
  LOCALSTORAGE_RETRIEVAL_TOOLS_KEY,
  RetrieverToolDefinition,
} from '@/schemas/toolDefinitions';

const MAX_PDF_MB_SIZE = 2;

export default function Pinecone() {
  const { theme } = useTheme();

  const [openAiConfig] = useLocalStorage<OpenApiConfig[]>(
    LOCALSTORAGE_OPEN_API_CONFIG,
    [],
  );

  const [githubConfig] = useLocalStorage<[GithubConfig] | []>(
    LOCALSTORAGE_GITHUB_CONFIG,
    [],
  );

  const [retrievalTools] = useLocalStorage<RetrieverToolDefinition[]>(
    LOCALSTORAGE_RETRIEVAL_TOOLS_KEY,
    [],
  );

  const [repo, setRepo] = useState<string>('');
  const [branch, setBranch] = useState<string>('');

  const { namespaces, namespacesError, pineconeConfig, loading, refresh } =
    useGetNamespaces();

  const isLowercaseAndNumbers = (input: string): boolean => {
    return /^[a-z0-9_-]+$/.test(input) || input === '';
  };

  const [openNamespacesCombobox, setOpenNamespacesCombobox] = useState(false);
  const [namespace, setNamespace] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [fetching, setFetching] = useState(false);

  const setPdfFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const pdf = event.target.files[0];
      setFile(pdf);
    } else {
      setFile(null);
    }
  };

  const savePdfData = async () => {
    if (!file || file.size / 1024 ** 2 > MAX_PDF_MB_SIZE) {
      ToastError('PDF max size ==> 30 mb !!!', theme);
      return;
    }

    setFetching(true);
    const body = new FormData();
    body.append('pdf', file);
    body.append('namespace', namespace);
    body.append('openAiKey', openAiConfig[0]?.apiKey!);
    body.append('apiKey', pineconeConfig?.apiKey!);
    body.append('environment', pineconeConfig?.environment!);
    body.append('indexName', pineconeConfig?.indexName!);
    await fetch('/api/pinecone/upload-pdf', {
      method: 'POST',
      body,
    });
    setFetching(false);
    refresh();
  };

  const deleteNamespace = async () => {
    if (!!retrievalTools.find((rt) => rt.namespace === namespace)) {
      ToastError('Namespace on use.\nRemove retrieval tool first!', theme);
      return;
    }

    setFetching(true);
    const body = new FormData();
    body.append('namespace', namespace);
    body.append('apiKey', pineconeConfig?.apiKey!);
    body.append('environment', pineconeConfig?.environment!);
    body.append('indexName', pineconeConfig?.indexName!);
    await fetch('/api/pinecone', {
      method: 'DELETE',
      body,
    });
    setFetching(false);
    refresh();
  };

  const saveRepoData = async () => {
    setFetching(true);

    const body = new FormData();
    body.append('namespace', namespace);
    body.append('accessToken', githubConfig[0]?.accessToken!);
    body.append('openAiKey', openAiConfig[0]?.apiKey!);
    body.append('branch', branch);
    body.append('repo', repo);
    body.append('apiKey', pineconeConfig?.apiKey!);
    body.append('environment', pineconeConfig?.environment!);
    body.append('indexName', pineconeConfig?.indexName!);
    await fetch('/api/pinecone/upload-github-repo', {
      method: 'POST',
      body,
    });
    setFetching(false);
    refresh();
  };

  return (
    <Layout>
      <div className="mx-auto flex flex-col gap-4 sm:w-2/3 lg:w-[50%] rounded border p-4 items-start justify-evenly">
        {loading && (
          <div className="flex w-full items-center gap-2">
            <div className="flex w-full max-w-lg space-x-2 gap-4 text-primary">
              Loading Pinecone namespaces
              <LoadingDots />
            </div>
          </div>
        )}
        {namespaces && (
          <>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Pinecone namespaces</CardTitle>
                <CardDescription>
                  Select or create a new namespace to store data from sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex w-full items-center gap-2 justify-between">
                  <div className="flex flex-col w-full max-w-md space-x-2 gap-4">
                    <NamespaceCombobox
                      namespaces={namespaces}
                      setNamespace={(e) => {
                        setNamespace(e);
                      }}
                      selectedNamespace={namespace}
                      open={openNamespacesCombobox}
                      setOpen={setOpenNamespacesCombobox}
                    />
                  </div>
                  <Button
                    className="self-end"
                    variant="destructive"
                    disabled={!namespaces.includes(namespace) || fetching}
                    onClick={async () => {
                      await deleteNamespace();
                    }}
                  >
                    Delete namespace
                  </Button>
                </div>
                {!!openAiConfig.length && (
                  <div className="flex flex-col text-primary w-full mt-8">
                    <Input
                      type="text"
                      name="namespace"
                      value={namespace}
                      onChange={(e) => {
                        if (isLowercaseAndNumbers(e.target.value)) {
                          setNamespace(e.target.value);
                        } else {
                          ToastError(
                            'Character not allowed.\nUse only: [a-z],[0-9],-,_',
                            theme,
                          );
                        }
                      }}
                      placeholder="Here you can specify a new namespace to store your data..."
                      className="w-full text-primary"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            {openAiConfig.length > 0 && namespaces ? (
              <div className="flex flex-col text-primary w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Sources</CardTitle>
                    <CardDescription>
                      You can store data from the following sources:
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>PDF</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col w-full items-center gap-4">
                            <div className="self-start text-small dark:text-red-900 dark:hover:text-red-600 text-red-600 hover:font-semibold">
                              If the namespace already exists, the info is added
                              to the existing data.
                            </div>
                            <Input
                              className="text-primary file:text-primary"
                              type="file"
                              name="pdf"
                              onChange={setPdfFile}
                              accept="application/pdf"
                            />
                            <Button
                              className="flex self-end text-primary"
                              variant="outline"
                              type="submit"
                              onClick={savePdfData}
                              disabled={!namespace || !file || fetching}
                            >
                              Save PDF content into namespace
                              {fetching && (
                                <Loader2 className="ml-2 animate-spin text-primary" />
                              )}
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      {!!githubConfig.length && (
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Github</AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-col w-full items-center gap-4">
                              <div className="self-start text-small dark:text-red-900 dark:hover:text-red-600 text-red-600 hover:font-semibold">
                                If the namespace already exists, the new info
                                replaces the existing data.
                              </div>
                              <Label
                                className="text-primary self-start"
                                htmlFor="repo"
                              >
                                Repo
                              </Label>
                              <Input
                                name="repo"
                                className="text-primary"
                                type="text"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value.trim())}
                              />
                              <div className="flex w-full justify-between">
                                <div className="flex flex-col gap-4 min-w-[50%]">
                                  <Label
                                    className="text-primary"
                                    htmlFor="branch"
                                  >
                                    Branch
                                  </Label>
                                  <Input
                                    name="branch"
                                    className="text-primary"
                                    type="text"
                                    value={branch}
                                    onChange={(e) =>
                                      setBranch(e.target.value.trim())
                                    }
                                  />
                                </div>
                                <Button
                                  className="self-end text-primary"
                                  variant="outline"
                                  type="submit"
                                  onClick={saveRepoData}
                                  disabled={
                                    !namespace || !repo || !branch || fetching
                                  }
                                >
                                  Save repo content into namespace
                                  {fetching && (
                                    <Loader2 className="ml-2 animate-spin text-primary" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                  <CardFooter className="dark:text-red-900 dark:hover:text-red-600 text-red-600 hover:font-semibold">
                    Take care when insert/replace/remove data.
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="flex w-full items-center gap-2">
                <div className="flex justify-center w-full max-w-lg space-x-2 gap-4 text-red-700">
                  Can&apos;t create namespaces. Open Ai settings not found.
                  Check config.
                </div>
              </div>
            )}
          </>
        )}
        {namespacesError && (
          <div className="flex w-full items-center gap-2">
            <div className="flex justify-center w-full max-w-lg space-x-2 gap-4 text-red-700">
              {namespacesError} Check config.
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
