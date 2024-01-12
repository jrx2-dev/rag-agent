import { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { FootprintsIcon, SpeakerIcon, Trash2Icon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Message, MessageTypeSchema } from '@/schemas/message';
import { Flow, StepSchema } from '@/schemas/flow';
import { cn } from '@/utils/cn';
import { useCopyToClipboard } from '@/utils/hooks/useCopyToClipboard';

import Speech from 'speak-tts';
import { ToastSuccess } from '@/utils/toast';
import { useTheme } from '@/utils/hooks/useTheme';

interface ChatMessageProps {
  message: Message;
  messageIndex: number;
  loading: boolean;
  setSteps: Dispatch<SetStateAction<Flow>>;
  open: () => void;
  speech?: typeof Speech;
  remove: (messageIndex: number) => void;
}

export default function ChatMessage({
  message,
  messageIndex,
  loading,
  setSteps,
  open,
  speech,
  remove,
}: ChatMessageProps) {
  const { theme } = useTheme();

  let icon;

  const parsedFlow = StepSchema.array().safeParse(message.flow);
  const parsedFlowSteps = parsedFlow.success ? parsedFlow.data : null;

  const [_, copy] = useCopyToClipboard();

  const isApiMessage = message.type === MessageTypeSchema.Values.apiMessage;

  if (isApiMessage) {
    icon = (
      <Image
        key={messageIndex}
        src="/bot-image.png"
        alt="AI"
        width="40"
        height="40"
        priority
        className="rounded-full"
      />
    );
  } else {
    icon = (
      <Image
        key={messageIndex}
        src="/usericon.png"
        alt="Me"
        width="30"
        height="30"
        priority
        className="rounded-full"
      />
    );
  }

  const handleSpeechClick = (message: string) => {
    if (speech?.speaking()) {
      speech.cancel();
    } else {
      speech?.speak({
        text: message,
      });
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex gap-2 items-start border rounded-lg p-2 w-fit max-w-[90%] bg-slate-200 dark:bg-slate-800 dark:text-primary overflow-scroll',
          {
            'justify-end self-end bg-green-200 dark:bg-green-700':
              !isApiMessage,
          },
        )}
      >
        {icon}
        <div className="flex items-center justify-between self-center gap-2 max-w-[50vw]">
          <div className="overflow-scroll">
            {isApiMessage && messageIndex != 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      copy(message.message || '');
                      ToastSuccess('copied!', theme);
                    }}
                  >
                    <ReactMarkdown linkTarget="_blank">
                      {message.message}
                    </ReactMarkdown>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-primary">
                  <p>Click to copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <ReactMarkdown linkTarget="_blank">
                {message.message}
              </ReactMarkdown>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            {isApiMessage && speech && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="relative"
                    onClick={() => handleSpeechClick(message.message)}
                  >
                    <SpeakerIcon className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-primary">
                  <p>Listen to the answer</p>
                </TooltipContent>
              </Tooltip>
            )}
            {parsedFlowSteps && parsedFlowSteps.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={loading}
                    className="self-end rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => {
                      setSteps(parsedFlowSteps);
                      open();
                    }}
                  >
                    <FootprintsIcon />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-primary">
                  <p>See the agent steps</p>
                </TooltipContent>
              </Tooltip>
            )}
            {!isApiMessage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={loading}
                    className={cn(
                      'self-end rounded-fulltext-green-300 dark:text-green-600',
                      {
                        'hover:text-slate-800 dark:hover:text-slate-200':
                          !loading,
                      },
                    )}
                    onClick={() => {
                      remove(messageIndex);
                    }}
                  >
                    <Trash2Icon />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-primary">
                  <p>Remove messages starting here</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
