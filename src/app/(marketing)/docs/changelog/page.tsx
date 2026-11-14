import { DocPageLayout, DocProse, DocSection } from "@/components/docs/doc-page";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Changelog",
  description:
    "Product changes to Formivo, newest first: connect screen, documentation, analytics, client access and the submission endpoint.",
  path: "/docs/changelog",
});

type Entry = {
  date: string;
  title: string;
  items: string[];
};

const entries: Entry[] = [
  {
    date: "November 2026",
    title: "Connect screen and documentation",
    items: [
      "Creating a form now opens a connect screen with its endpoint, ready-made prompts for AI coding tools, and copy-ready snippets.",
      "Documentation rebuilt as a multi-page reference with sidebar navigation, search, on-page contents and previous/next links.",
      "Per-page social cards and canonical URLs across marketing pages, guides, alternatives and articles.",
      "Traffic attribution records first and last touch, so registrations can be traced to a source.",
    ],
  },
  {
    date: "October 2026",
    title: "Client access and lead workflow",
    items: [
      "A client can be granted access to several forms, each permission revocable on its own.",
      "Six lead statuses replace the original three: new, read, contacted, qualified, converted and archived.",
      "Submissions store a metadata object separately from the form values.",
      "Row Level Security enabled on every table, with dashboard queries also scoped server-side.",
    ],
  },
  {
    date: "September 2026",
    title: "Endpoint and plans",
    items: [
      "One public endpoint per form: POST-only, no key on the client.",
      "Optional Idempotency-Key header, so a retried request never creates a duplicate lead.",
      "Free, Light, Pro and Agency plans with server-enforced form, submission, client-view and export limits.",
      "CSV export restricted to paid plans and checked on the server, not in the UI.",
    ],
  },
];

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/changelog"
      title="Changelog"
      description="A running record of what changed. Entries describe shipped behaviour, not plans."
      badge="Live"
    >
      {entries.map((entry) => (
        <DocSection
          key={entry.date}
          id={entry.title.toLowerCase().replace(/\s+/g, "-")}
          title={entry.title}
          eyebrow={entry.date}
        >
          <DocProse>
            <ul className="flex flex-col gap-2">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </DocProse>
        </DocSection>
      ))}
    </DocPageLayout>
  );
}
