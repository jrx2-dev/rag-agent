import { v4 } from 'uuid';
import { useRef, useState, useEffect } from 'react';
import { MicIcon, MicOffIcon } from 'lucide-react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import Speech from 'speak-tts';

import ChatMessage from '@/components/chat/chatMessage';
import Layout from '@/components/layouts/layout';
import StepsDialog from '@/components/steps/stepsDialog';
import { Button } from '@/components/ui/button';
import { LoadingDots } from '@/components/ui/loading-dots';
import { Textarea } from '@/components/ui/TextArea';
import {
  Flow,
  AnswerSchema,
  StepSchema,
  AbortCall,
  AbortCallSchema,
} from '@/schemas/flow';
import { Message, MessageTypeSchema } from '@/schemas/message';
import { History } from '@/schemas/history';
import {
  DuckDuckGoToolDefinition,
  LOCALSTORAGE_DUCK_DUCK_GO_TOOLS_KEY,
  LOCALSTORAGE_RETRIEVAL_TOOLS_KEY,
  LOCALSTORAGE_WRAPPER_TOOLS_KEY,
  RetrieverToolDefinition,
} from '@/schemas/toolDefinitions';
import {
  LOCALSTORAGE_PINECONE_CONFIG,
  PineconeConfig,
} from '@/schemas/pinecone';
import { LOCALSTORAGE_OPEN_API_CONFIG, OpenApiConfig } from '@/schemas/openai';
import { Call } from '@/schemas/call';
import {
  BearlyConfig,
  BearlyToolStatus,
  BearlyToolStatusSchema,
  LOCALSTORAGE_BEARLY_CONFIG,
  LOCALSTORAGE_BEARLY_ENABLED,
} from '@/schemas/bearly';
import { ToastError } from '@/utils/toast';
import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { useTheme } from '@/utils/hooks/useTheme';

const initialMessageState: {
  messages: Message[];
  history: History;
} = {
  messages: [
    {
      type: MessageTypeSchema.Values.apiMessage,
      message: 'Hi, what would you like to ask?',
    },
  ],
  history: [],
};

export default function Home() {
  const { theme } = useTheme();

  const [connectionId] = useState<string>(v4());
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedMessages, setSavedMessages] = useLocalStorage<
    {
      messages: Message[];
      history: History;
    }[]
  >('messages', [initialMessageState]);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    history: History;
  }>(initialMessageState);

  useEffect(() => {
    if (savedMessages?.length) setMessageState(savedMessages[0]);
  }, [savedMessages]);

  const [steps, setSteps] = useState<Flow>([]);
  const [flowDialogOpen, setFlowDialogOpen] = useState<boolean>(false);

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [openAiConfig] = useLocalStorage<OpenApiConfig[]>(
    LOCALSTORAGE_OPEN_API_CONFIG,
    [],
  );

  const [pineconeConfig] = useLocalStorage<PineconeConfig[]>(
    LOCALSTORAGE_PINECONE_CONFIG,
    [],
  );

  const [bearlyConfig] = useLocalStorage<BearlyConfig[]>(
    LOCALSTORAGE_BEARLY_CONFIG,
    [],
  );

  const [bearlyToolEnabled] = useLocalStorage<BearlyToolStatus>(
    LOCALSTORAGE_BEARLY_ENABLED,
    BearlyToolStatusSchema.Enum.disabled,
  );

  const [retrievalTools] = useLocalStorage<RetrieverToolDefinition[]>(
    LOCALSTORAGE_RETRIEVAL_TOOLS_KEY,
    [],
  );

  const [wrapperTools] = useLocalStorage<RetrieverToolDefinition[]>(
    LOCALSTORAGE_WRAPPER_TOOLS_KEY,
    [],
  );

  const [duckDuckGoTools] = useLocalStorage<DuckDuckGoToolDefinition[] | []>(
    LOCALSTORAGE_DUCK_DUCK_GO_TOOLS_KEY,
    [],
  );

  useEffect(() => {
    const fetchData = () => {
      let connection = new EventSource(
        `api/connection?connectionId=${connectionId}`,
      );

      connection.addEventListener(
        'message',
        function (e) {
          const parsedAnswer = AnswerSchema.safeParse(JSON.parse(e.data));
          if (parsedAnswer.success) {
            const data = parsedAnswer.data;
            setSavedMessages((state) => [
              {
                messages: [
                  ...(state?.length ? state[0].messages : []),
                  {
                    type: MessageTypeSchema.Values.apiMessage,
                    message: data.text,
                    flow: data.flow,
                  },
                ],
                history: [
                  ...(state?.length ? state[0].history : []),
                  [data.query, data.text],
                ],
              },
            ]);
            setFlowDialogOpen(false);
            setLoading(false);
          }
          const parsedStep = StepSchema.safeParse(JSON.parse(e.data));
          if (parsedStep.success) {
            const data = parsedStep.data;
            setSteps((state) => [...state, data]);
            setFlowDialogOpen(true);
          }
          const parsedAbort = AbortCallSchema.safeParse(JSON.parse(e.data));
          if (parsedAbort.success) {
            const data = parsedAbort.data;
            setSavedMessages((state) => {
              state?.length && state[0].messages.pop();
              return [
                {
                  messages: [...(state ? state[0].messages : [])],
                  history: [...(state ? state[0].history : [])],
                },
              ];
            });
            setFlowDialogOpen(false);
            setLoading(false);
            setQuery(data.query || '')
          }
        },
        false,
      );

      connection.addEventListener(
        'error',
        function (error) {
          console.error('CONNECTION ERROR', error);
          setLoading(false);
        },
        false,
      );
      return connection;
    };
    const connection = fetchData();

    textAreaRef.current?.focus();

    return () => {
      if (connection) {
        connection.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }, [messageState]);

  const sendCall = async (question: string) => {
    try {
      setSteps([]);
      await fetch('api/input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openAiConfig: openAiConfig[0],
          pineconeConfig: pineconeConfig[0],
          bearlyConfig:
            bearlyToolEnabled === BearlyToolStatusSchema.Enum.enabled
              ? bearlyConfig[0]
              : null,
          connectionId,
          question: query,
          history: history,
          retrievalTools: retrievalTools,
          wrapperTools: wrapperTools,
          duckDuckGoTools: duckDuckGoTools,
        } as Call),
      });
      setQuery('');
    } catch (error) {
      console.error('SEND CALL ERROR', error);
      setLoading(false);
      setQuery(question);
      setSavedMessages((state) => {
        state?.length && state[0].messages.pop();
        return [
          {
            messages: [...(state ? state[0].messages : [])],
            history: [...(state ? state[0].history : [])],
          },
        ];
      });
      setError(
        'An error occurred while submitting the call. Please try again.',
      );
    }
  };

  const abortCall = async (connectionId: string) => {
    await fetch('api/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionId,
      } as AbortCall),
    });
  };

  const removeUserMessage = (messageIndex: number) => {
    setSavedMessages((state) => {
      return [
        {
          messages: [...(state ? state[0].messages.slice(0, messageIndex) : [])],
          history: [...(state ? state[0].history.slice(0, Math.floor(messageIndex/2)) : [])],
        },
      ];
    });
  }

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();
    setError(null);

    if (!query) {
      ToastError('Please input a question', theme);
      return;
    }

    const question = query.trim();
    setSavedMessages((state) => [
      {
        messages: [
          ...(state?.length ? state[0].messages : []),
          {
            type: MessageTypeSchema.Values.userMessage,
            message: question,
          },
        ],
        history: [...(state?.length ? state[0].history : [])],
      },
    ]);

    setLoading(true);
    sendCall(question);
  }

  //prevent empty submissions and allow new lines
  const handleEnter = (e: any) => {
    // if (e.key === 'Enter' && query) {
    if (e.keyCode == 13 && !e.shiftKey && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter' && !query) {
      e.preventDefault();
    }
  };

  // needed to render just for client side
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  //voice to query
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setQuery(transcript);
  }, [transcript]);

  const handleClickMicroButton = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      SpeechRecognition.startListening();
    }
  };

  // answer to voice
  const [speech, setSpeech] = useState<typeof Speech>();

  useEffect(() => {
    const speech = new Speech();
    speech.init({
      ...(navigator.language.includes('en')
        ? { voice: 'Google UK English Female' }
        : navigator.language.includes('es')
        ? { voice: 'Google español' }
        : {}),
    });
    setSpeech(speech);
  }, []);

  return (
    <Layout>
      {openAiConfig && openAiConfig.length > 0 ? (
        <div className="mx-auto flex flex-col gap-4 w-5/6 md:w-2/3">
          <div
            ref={messageListRef}
            className="flex flex-col gap-2 border rounded-lg p-2 bg-slate-100 dark:bg-slate-900"
          >
            {messages.map((message, index) => (
              <ChatMessage
                key={`chatMessage-${index}`}
                message={message}
                messageIndex={index}
                loading={loading}
                open={() => setFlowDialogOpen(true)}
                setSteps={setSteps}
                speech={speech}
                remove={removeUserMessage}
              />
            ))}
          </div>
          <StepsDialog
            steps={steps}
            opened={flowDialogOpen}
            close={() => setFlowDialogOpen(false)}
          />
          <div className="border rounded-lg p-2 bg-slate-100 dark:bg-slate-900">
            <form
              onSubmit={handleSubmit}
              className="flex items-start justify-start gap-2"
            >
              <Textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={
                  loading
                    ? 'Waiting for response...'
                    : 'What tools you have available?'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-primary"
              />
              <div className="flex flex-col">
                <Button
                  variant="outline"
                  className="flex items-center justify-center w-12 h-10"
                  type="submit"
                  disabled={loading || listening}
                >
                  {loading ? (
                    <LoadingDots />
                  ) : (
                    // Send icon SVG in input field
                    <svg
                      className="w-8 h-7 rotate-90"
                      fill="grey"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  )}
                </Button>
                {isClient && browserSupportsSpeechRecognition && (
                  <Button
                    type="button"
                    disabled={loading}
                    className="flex items-center justify-center w-12 h-10"
                    variant="outline"
                    onClick={handleClickMicroButton}
                  >
                    {!listening ? (
                      <MicIcon className="text-green-700" />
                    ) : (
                      <MicOffIcon className="text-red-700" />
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-4">
            {!!history.length ? (
              <Button
                variant={'ghost'}
                className="max-w-fit self-end font-normal text-slate-600 hover:text-primary"
                disabled={loading}
                onClick={() => {
                  setSavedMessages([initialMessageState]);
                }}
              >
                Clear conversation
              </Button>
            ) : null}
            {loading ? (
              <Button
                variant={'destructive'}
                disabled={!loading}
                className="max-w-fit self-end"
                onClick={() => abortCall(connectionId)}
              >
                Abort
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mx-auto flex flex-col gap-4 w-2/3 rounded border p-4 items-center mt-8">
          <div className="flex flex-col justify-center w-full max-w-sm gap-2 text-red-700">
            <p>Can&apos;t chat with agent.</p>
            <p>Open Ai settings not found. Check config.</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
