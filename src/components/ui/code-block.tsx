import { CopyButton } from "./copy-button";

/**
 * Code shown on a deliberately dark surface in both themes (like the marketing
 * reference), so the text colors are fixed rather than theme tokens.
 */
export function CodeBlock({
  code,
  language = "bash",
  title,
  className,
}: {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a1a17] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] tracking-wide text-slate-400">
          {title ?? language}
        </span>
        <CopyButton value={code} label="Copy" />
      </div>
      <pre className="max-w-full overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
