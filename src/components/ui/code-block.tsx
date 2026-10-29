import { CopyButton } from "./copy-button";

export function CodeBlock({
  code,
  language = "bash",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#070d18]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-foreground-muted">{title ?? language}</span>
        <CopyButton value={code} label="Copy" />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground-secondary">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
