import type { KeyboardEvent, RefObject } from "react";
import { Icon } from "./Icon";

export const MAX_QUERY_LENGTH = 2000;

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function Composer({ value, onChange, onSubmit, isLoading, textareaRef }: ComposerProps) {
  const canSubmit = value.trim().length > 0 && !isLoading;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter submits, Shift+Enter adds a new line.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-shadow focus-within:shadow-md"
    >
      <label htmlFor="query-input" className="sr-only">
        Your question
      </label>
      <textarea
        id="query-input"
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MAX_QUERY_LENGTH}
        rows={3}
        placeholder="Ask anything... (e.g. How does middleware work in Express?)"
        className="block min-h-[72px] w-full resize-none border-none bg-transparent p-0 text-body-md leading-relaxed text-on-surface outline-none placeholder:text-outline/70 focus-visible:outline-none"
      />

      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-surface-container-high/30 pt-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 text-label-ui text-outline">
          <span className="font-mono text-code-sm">
            {value.length.toLocaleString()} / {MAX_QUERY_LENGTH.toLocaleString()} characters
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <kbd className="rounded bg-surface-container-low px-1.5 py-0.5 font-mono text-[10px] text-on-surface">
              Enter
            </kbd>
            to submit ·
            <kbd className="rounded bg-surface-container-low px-1.5 py-0.5 font-mono text-[10px] text-on-surface">
              Shift + Enter
            </kbd>
            for newline
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="h-9 rounded-lg px-3 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary-container px-4 text-body-md font-medium text-on-primary shadow-sm transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[18px]" />
                <span>Thinking…</span>
              </>
            ) : (
              <>
                <span>Ask AI</span>
                <Icon name="send" className="text-[18px]" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
