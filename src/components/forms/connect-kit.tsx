"use client";

import {
  Atom,
  Boxes,
  Braces,
  Bot,
  Check,
  Copy,
  FileCode2,
  Flame,
  Layers,
  MousePointer2,
  Orbit,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  Triangle,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import {
  buildPrompt,
  PROMPT_TARGETS,
  PROMPT_TOOLS,
  type PromptTargetId,
  type PromptToolId,
} from "@/lib/forms/ai-prompts";
import { cn } from "@/lib/utils/cn";

const targetIcons: Record<PromptTargetId, typeof FileCode2> = {
  html: FileCode2,
  react: Atom,
  nextjs: Layers,
  vue: Boxes,
  svelte: Flame,
  astro: Rocket,
  javascript: Braces,
  php: Server,
};

const toolIcons: Record<PromptToolId, typeof Terminal> = {
  "claude-code": Terminal,
  cursor: MousePointer2,
  copilot: Bot,
  codex: Terminal,
  opencode: Braces,
  antigravity: Orbit,
  windsurf: Wind,
  v0: Triangle,
};

function snippetFor(endpoint: string, id: "html" | "fetch" | "curl"): string {
  if (id === "html") {
    return `<form action="${endpoint}" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>

  <!-- optional: send visitors to your own page after submit -->
  <input type="hidden" name="_redirect" value="https://your-site.com/thanks" />

  <button type="submit">Send</button>
</form>`;
  }

  if (id === "fetch") {
    return `const res = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Please call me back.",
    metadata: { page: window.location.pathname },
  }),
});

const data = await res.json();
if (!res.ok) throw new Error(data.error.message);`;
  }

  return `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-1042" \\
  -d '{"name":"Ada Lovelace","email":"ada@example.com","message":"Please call me back."}'`;
}

export function ConnectKit({
  endpoint,
  formName,
}: {
  endpoint: string;
  formName?: string;
}) {
  const [tool, setTool] = useState<PromptToolId>("claude-code");
  const [target, setTarget] = useState<PromptTargetId>("react");
  const [snippet, setSnippet] = useState<"html" | "fetch" | "curl">("html");

  const activeTool = PROMPT_TOOLS.find((item) => item.id === tool) ?? PROMPT_TOOLS[0]!;
  const activeTarget = PROMPT_TARGETS.find((item) => item.id === target) ?? PROMPT_TARGETS[0]!;

  const prompt = useMemo(
    () => buildPrompt({ toolId: tool, targetId: target, endpoint, formName }),
    [tool, target, endpoint, formName],
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Endpoint */}
      <section
        aria-labelledby="endpoint-heading"
        className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1a17] text-slate-100"
      >
        <div className="flex flex-col gap-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold tracking-wide text-emerald-300">
                POST
              </span>
              <span
                id="endpoint-heading"
                className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase"
              >
                Your endpoint
              </span>
            </div>
            <CopyButton value={endpoint} label="Copy endpoint" />
          </div>

          <p className="font-mono text-[12.5px] leading-relaxed break-all text-emerald-50 sm:text-sm">
            {endpoint}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/10 pt-3 text-[11.5px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
              No API key
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
              Safe to publish in HTML
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
              Returns 201 with a lead id
            </span>
          </div>
        </div>
      </section>

      {/* AI prompt builder */}
      <section aria-labelledby="ai-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="ai-heading"
            className="flex items-center gap-2 text-base font-semibold text-foreground"
          >
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            Build it with your AI agent
          </h2>
          <p className="max-w-2xl text-sm text-foreground-secondary">
            Pick the tool you use and the stack you are wiring. The prompt already contains your
            endpoint, the payload shape, the error contract and the rules that keep the form safe.
          </p>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {PROMPT_TOOLS.map((item) => {
            const Icon = toolIcons[item.id];
            const active = item.id === tool;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTool(item.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "border-accent/40 bg-accent-subtle text-accent-hover"
                    : "border-border bg-surface text-foreground-secondary hover:border-border-strong hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
              Stack
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {PROMPT_TARGETS.map((item) => {
                const Icon = targetIcons[item.id];
                const active = item.id === target;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTarget(item.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-accent/40 bg-accent-subtle/60"
                        : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        active ? "text-accent-hover" : "text-foreground-muted",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13px] font-medium text-foreground">{item.name}</span>
                      <span className="text-[11.5px] leading-snug text-foreground-muted">
                        {item.summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                Prompt for {activeTool.name}
              </p>
              <CopyButton value={prompt} label="Copy prompt" />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="flex flex-col gap-1 border-b border-border bg-surface-muted/60 px-4 py-2.5">
                <p className="text-[12px] font-medium text-foreground">
                  {activeTarget.name} · {activeTool.name}
                </p>
                <p className="text-[11.5px] leading-snug text-foreground-muted">
                  Produces {activeTarget.produces}. {activeTool.summary}.
                </p>
              </div>
              <pre className="max-h-[380px] max-w-full overflow-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-foreground-secondary">
                {prompt}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Manual snippets */}
      <section aria-labelledby="snippets-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="snippets-heading" className="text-base font-semibold text-foreground">
            Or paste it yourself
          </h2>
          <p className="text-sm text-foreground-secondary">
            Three starting points, all with your endpoint already filled in.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Snippet type">
          {(
            [
              ["html", "HTML form"],
              ["fetch", "JavaScript fetch"],
              ["curl", "cURL"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSnippet(id)}
              aria-pressed={snippet === id}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                snippet === id
                  ? "border-accent/40 bg-accent-subtle text-accent-hover"
                  : "border-border bg-surface text-foreground-secondary hover:border-border-strong hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <CodeBlock
          code={snippetFor(endpoint, snippet)}
          language={snippet === "curl" ? "bash" : snippet === "html" ? "html" : "javascript"}
          title={snippet === "html" ? "contact.html" : snippet === "fetch" ? "submit.js" : "terminal"}
        />
      </section>
    </div>
  );
}
