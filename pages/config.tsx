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
import Bearly from '@/components/config/bearly';
import OpenAI from '@/components/config/openai';
import Pinecone from '@/components/config/pinecone';
import Github from '@/components/config/github';

export default function Config() {
  return (
    <Layout>
      <div className="text-primary rounded border p-4 mx-auto min-w-[90%] md:min-w-[50%]">
        <Card>
          <CardHeader>
            <CardTitle>Configure credentials</CardTitle>
            <CardDescription>
              Here you can set the credentials for the services that you want to
              be availables for the agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Open AI</AccordionTrigger>
                <AccordionContent>
                  <OpenAI />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Pinecone</AccordionTrigger>
                <AccordionContent>
                  <Pinecone />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Bearly (Code Interpreter)</AccordionTrigger>
                <AccordionContent>
                  <Bearly />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Github</AccordionTrigger>
                <AccordionContent>
                  <Github />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="dark:text-red-900 dark:hover:text-red-600 text-red-600 hover:font-semibold">
            Open AI is required.
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
