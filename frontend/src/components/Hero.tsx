import { Icon } from "./Icon";

export function Hero() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container-low shadow-sm">
          <Icon name="auto_awesome" filled className="text-[30px] text-primary" />
        </div>
        <span className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-tertiary-fixed-dim opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-tertiary-container" />
        </span>
      </div>

      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1 text-label-ui text-primary shadow-sm">
        <Icon name="bolt" className="text-[14px]" />
        <span className="font-medium tracking-wide uppercase">Powered by Google Gemini</span>
      </div>

      <h1 className="text-headline-xl-mobile text-on-surface sm:text-headline-xl">What would you like to know?</h1>
      <p className="mx-auto mt-2 max-w-lg text-body-lg text-on-surface-variant">
        Ask a question, explore an idea, or get help with a problem. Your AI assistant is ready.
      </p>
    </div>
  );
}
