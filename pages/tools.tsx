import Layout from '@/components/layouts/layout';
import WrapperTools from '@/components/tools/wrapperTools';
import DuckDuckGoTools from '@/components/tools/duckDuckGoTools';
import RetrievalTools from '@/components/tools/retrievalTools';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { LOCALSTORAGE_OPEN_API_CONFIG, OpenApiConfig } from '@/schemas/openai';
import BearlyTool from '@/components/tools/bearlyTool';

const tabsConfigurations: {
  title: string;
  component: () => JSX.Element;
}[] = [
  {
    title: 'GPT Tool',
    component: WrapperTools,
  },
  {
    title: 'DuckDuckGo',
    component: DuckDuckGoTools,
  },
  {
    title: 'Bearly (Code Interpreter)',
    component: BearlyTool,
  },
  {
    title: 'Retrievers',
    component: RetrievalTools,
  },
];

export default function Tools() {
  const [openAiConfig] = useLocalStorage<OpenApiConfig[]>(
    LOCALSTORAGE_OPEN_API_CONFIG,
    [],
  );
  return (
    <Layout>
      <div className="mx-auto flex flex-col gap-4 sm:w-2/3 lg:w-[50%] rounded border p-4 items-start justify-evenly">
        {openAiConfig?.length ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Agent Tools</CardTitle>
              <CardDescription>
                Here you can configure agent available tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-center overflow-scroll">
                <Accordion
                  type="single"
                  collapsible
                  className="text-primary w-full"
                >
                  {tabsConfigurations.map((tab, i) => (
                    <AccordionItem value={`item-${i + 1}`} key={i}>
                      <AccordionTrigger>{tab.title}</AccordionTrigger>
                      <AccordionContent>
                        <tab.component />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto flex flex-col rounded border p-4 items-center">
            <div className="flex flex-col justify-center w-full max-w-sm gap-2 text-red-700">
              <p>Can&apos;t use Tools.</p>
              <p>Open Ai settings not found. Check config.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
