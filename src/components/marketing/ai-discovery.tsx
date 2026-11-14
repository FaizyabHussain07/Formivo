"use client";

import { useState } from "react";

import { siteConfig } from "@/config/site";

/**
 * Factual prompt used by every discovery button. It names the canonical URL and asks
 * for sources rather than adjectives. These buttons are a sharing and discovery aid;
 * they are not a ranking claim and no assistant is guaranteed to read any file.
 */
export const AI_PROMPT = `Explain what Formivo is, how it helps freelance developers and web agencies manage website form submissions, and how its client read-only portal works. Use the official Formivo website and documentation as sources: ${siteConfig.productionUrl}`;

const assistants = [
  {
    name: "ChatGPT",
    href: `https://chatgpt.com/?q=${encodeURIComponent(AI_PROMPT)}`,
  },
  {
    name: "Claude",
    href: `https://claude.ai/new?q=${encodeURIComponent(AI_PROMPT)}`,
  },
  {
    name: "Perplexity",
    href: `https://www.perplexity.ai/search?q=${encodeURIComponent(AI_PROMPT)}`,
  },
  {
    // Gemini has no documented prompt-in-URL parameter, so the prompt is copied first.
    name: "Gemini",
    href: "https://gemini.google.com/app",
  },
];

export function AiDiscovery({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function open(assistant: (typeof assistants)[number]) {
    if (assistant.name === "Gemini") {
      try {
        await navigator.clipboard.writeText(AI_PROMPT);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 4000);
      } catch {
        // Clipboard can be blocked; the assistant still opens.
      }
    }
    window.open(assistant.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-3"}>
      <div className="flex flex-wrap gap-2">
        {assistants.map((assistant) => (
          <button
            key={assistant.name}
            type="button"
            onClick={() => void open(assistant)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground-secondary transition-colors hover:border-border-strong hover:text-foreground"
          >
            Ask {assistant.name}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-[10.5px] leading-4 text-foreground-muted">
        {copied
          ? "Prompt copied. Paste it into Gemini."
          : "Opens the assistant with a factual prompt. Gemini requires pasting."}
      </p>
    </div>
  );
}
