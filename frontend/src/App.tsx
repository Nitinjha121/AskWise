import { useEffect, useRef, useState } from "react";
import { askQuery } from "./api";
import { Composer } from "./components/Composer";
import { Hero } from "./components/Hero";
import { Message, type ChatMessage } from "./components/Message";
import { SuggestionGrid } from "./components/SuggestionGrid";

function App() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isEmpty = messages.length === 0;
  const isLoading = messages.some((message) => message.status === "loading");

  // Scroll down only when a new question is added, not when an older message
  // is retried or answered, so the page doesn't jump while you're reading.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const updateMessage = (next: ChatMessage) => {
    setMessages((current) => current.map((message) => (message.id === next.id ? next : message)));
  };

  const fetchAnswer = async (id: number, query: string) => {
    try {
      const answer = await askQuery(query);
      updateMessage({ id, query, status: "success", answer });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      updateMessage({ id, query, status: "error", error: message });
    }
  };

  const submit = () => {
    const query = draft.trim();
    if (!query) return;

    const id = Date.now();
    setMessages((current) => [...current, { id, query, status: "loading" }]);
    setDraft("");
    void fetchAnswer(id, query);
  };

  const retry = (message: ChatMessage) => {
    updateMessage({ id: message.id, query: message.query, status: "loading" });
    void fetchAnswer(message.id, message.query);
  };

  const pickSuggestion = (prompt: string) => {
    setDraft(prompt);
    textareaRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-background font-sans text-on-surface antialiased">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 via-surface-container-high/40 to-transparent blur-3xl"
        />

        {isEmpty ? (
          // Welcome screen: shown until the first question is sent.
          <div className="pt-10">
            <Hero />
            <SuggestionGrid onPick={pickSuggestion} />
          </div>
        ) : (
          // Conversation: takes the welcome screen's place and pushes the input to the bottom.
          <section className="flex flex-1 flex-col gap-8 pt-10 pb-4" aria-live="polite">
            {messages.map((message) => (
              <Message key={message.id} message={message} onRetry={retry} canRetry={!isLoading} />
            ))}
            <div ref={bottomRef} />
          </section>
        )}

        <div
          className={
            isEmpty
              ? "mt-8 pb-10"
              : "sticky bottom-0 bg-gradient-to-t from-background from-80% to-transparent pt-4 pb-4"
          }
        >
          <Composer
            value={draft}
            onChange={setDraft}
            onSubmit={submit}
            isLoading={isLoading}
            textareaRef={textareaRef}
          />
          <p className="mt-3 text-center text-caption text-outline">
            AI-generated responses may contain inaccuracies. Review important information before relying on it.
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;
