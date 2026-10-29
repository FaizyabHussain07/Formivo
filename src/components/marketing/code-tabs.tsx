"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils/cn";

export type CodeTab = {
  id: string;
  label: string;
  language: string;
  code: string;
};

export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Integration examples"
        className="flex w-fit items-center gap-1 rounded-lg border border-border bg-surface p-1"
      >
        {tabs.map((tab) => {
          const selected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`code-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`code-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                selected
                  ? "bg-accent-subtle text-accent-hover"
                  : "text-foreground-secondary hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`code-panel-${current.id}`}
        aria-labelledby={`code-tab-${current.id}`}
      >
        <CodeBlock code={current.code} language={current.language} title={current.label} />
      </div>
    </div>
  );
}
