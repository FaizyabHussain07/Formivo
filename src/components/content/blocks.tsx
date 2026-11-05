import Link from "next/link";

import type { ContentBlock } from "@/content/types";

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const linkPattern = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;

/** Renders inline links written as [label](/path) inside prose blocks. */
function inline(text: string) {
  const parts: (string | { label: string; href: string })[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(linkPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    parts.push({ label: match[1] ?? "", href: match[2] ?? "" });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={index}>{part}</span>
    ) : (
      <Link key={index} href={part.href} className="text-accent underline-offset-4 hover:underline">
        {part.label}
      </Link>
    ),
  );
}

/** Code stays readable without JavaScript; no highlighting dependency needed. */
function CodeBlock({ language, code, title }: { language: string; code: string; title?: string }) {
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-white/10 bg-[#0a1a17]">
      <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
        <span>{title ?? language}</span>
        <span className="font-mono text-[10px] text-slate-500">{language}</span>
      </figcaption>
      <pre className="max-w-full overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={index}
                id={block.id ?? headingId(block.text)}
                className="mt-8 scroll-mt-24 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={index}
                id={block.id ?? headingId(block.text)}
                className="mt-4 scroll-mt-24 text-lg font-semibold text-foreground"
              >
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={index} className="text-[15px] leading-7 text-foreground-secondary">
                {inline(block.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={index} className="flex flex-col gap-2 pl-1">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="relative pl-5 text-[15px] leading-7 text-foreground-secondary before:absolute before:top-[11px] before:left-0 before:size-1.5 before:rounded-full before:bg-accent/60"
                  >
                    {inline(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index} className="flex flex-col gap-2">
                {block.items.map((item, itemIndex) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] leading-7 text-foreground-secondary"
                  >
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-xs font-semibold text-foreground">
                      {itemIndex + 1}
                    </span>
                    <span>{inline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case "code":
            return (
              <CodeBlock
                key={index}
                language={block.language}
                code={block.code}
                title={block.title}
              />
            );
          case "table":
            return (
              <div
                key={index}
                className="my-4 overflow-x-auto rounded-xl border border-border bg-surface"
              >
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/60">
                      {block.headers.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border last:border-0">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={
                              cellIndex === 0
                                ? "px-4 py-3 align-top font-medium text-foreground"
                                : "px-4 py-3 align-top text-foreground-secondary"
                            }
                          >
                            {inline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "note":
            return (
              <aside
                key={index}
                className="my-4 rounded-xl border border-accent/30 bg-accent-subtle/60 px-4 py-3"
              >
                <p className="text-sm font-semibold text-foreground">{block.title}</p>
                <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                  {inline(block.text)}
                </p>
              </aside>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="my-4 border-l-2 border-accent pl-4 text-[15px] leading-7 text-foreground-secondary italic"
              >
                {block.text}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
