import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "./Icon";

/** One question and the state of its answer. */
export type ChatMessage =
  | { id: number; query: string; status: "loading" }
  | { id: number; query: string; status: "success"; answer: string }
  | { id: number; query: string; status: "error"; error: string };

interface MessageProps {
  message: ChatMessage;
  onRetry: (message: ChatMessage) => void;
  /** False while another question is loading, so only one request runs at a time. */
  canRetry: boolean;
}

export function Message({ message, onRetry, canRetry }: MessageProps) {
  return (
    <article className="flex flex-col gap-3">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary-fixed px-4 py-3 text-body-md break-words whitespace-pre-wrap text-on-primary-fixed">
        {message.query}
      </div>

      {message.status === "loading" && (
        <div
          className="space-y-2.5 rounded-2xl bg-surface-container-lowest p-5 shadow-sm"
          aria-label="Waiting for the answer"
        >
          <div className="h-3 w-11/12 animate-pulse rounded-full bg-surface-container" />
          <div className="h-3 w-full animate-pulse rounded-full bg-surface-container" />
          <div className="h-3 w-3/4 animate-pulse rounded-full bg-surface-container" />
        </div>
      )}

      {message.status === "success" && (
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          {/* react-markdown doesn't render raw HTML, so model output can't inject markup. */}
          <div className="prose max-w-none text-body-lg prose-a:text-primary prose-pre:bg-inverse-surface prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {message.status === "error" && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error-container/40 p-5"
          role="alert"
        >
          <Icon name="error" className="text-[20px] text-error" />
          <div className="flex-1">
            <p className="text-body-md text-on-surface">{message.error}</p>
            <button
              type="button"
              onClick={() => onRetry(message)}
              disabled={!canRetry}
              className="mt-3 flex h-8 items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 text-body-sm font-medium text-on-surface shadow-sm hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="refresh" className="text-[16px]" />
              Try again
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
