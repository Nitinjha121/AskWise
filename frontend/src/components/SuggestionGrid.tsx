import { Icon } from "./Icon";

interface Suggestion {
  icon: string;
  title: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  { icon: "menu_book", title: "Explain a concept", prompt: "Explain how JWT authentication works in simple terms." },
  { icon: "terminal", title: "Write some code", prompt: "Show me a TypeScript function to validate an email address." },
  { icon: "explore", title: "Explore an idea", prompt: "What are the best practices for designing REST APIs?" },
  { icon: "bug_report", title: "Solve a problem", prompt: "Help me debug a Node.js API request timeout issue." }
];

export function SuggestionGrid({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.title}
          type="button"
          onClick={() => onPick(suggestion.prompt)}
          className="group relative flex items-start justify-between gap-3 overflow-hidden rounded-xl bg-surface-container-lowest p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary transition-colors group-hover:bg-primary-fixed">
              <Icon name={suggestion.icon} className="text-[20px]" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-headline-sm font-semibold text-on-surface">{suggestion.title}</span>
              <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">{suggestion.prompt}</p>
            </div>
          </div>
          <div className="flex h-6 w-6 shrink-0 translate-x-1 items-center justify-center rounded-full bg-surface-container-low text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Icon name="arrow_forward" className="text-[16px]" />
          </div>
        </button>
      ))}
    </div>
  );
}
