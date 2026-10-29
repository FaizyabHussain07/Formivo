import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Formivo?",
    answer:
      "A form backend for websites and client projects. You keep the form you already have; Formivo supplies the submission endpoint, validation, spam protection, storage and a dashboard where you and your client can read the leads.",
  },
  {
    question: "How do I connect an existing HTML form?",
    answer:
      "Create a form, copy its public endpoint, and set it as your form's action attribute. Formivo accepts form-encoded submissions, shows a simple thank-you page, and optionally redirects to your own page with the _redirect field.",
  },
  {
    question: "Do I need to build my own backend?",
    answer:
      "No. Validation, rate limiting, quotas and storage all happen on Formivo's side. There is nothing to deploy and no API key to manage — just the public endpoint.",
  },
  {
    question: "Can I use Formivo with React or Next.js?",
    answer:
      "Yes. Post JSON with fetch() from any client component, or submit to the same endpoint from a server action. CORS is enabled for the domains you allow on each form.",
  },
  {
    question: "Where do submissions go?",
    answer:
      "Into your workspace, scoped to the form they came from. Only you and the client viewers you invite can read them; the public endpoint can write a submission but can never read one.",
  },
  {
    question: "Is there a form builder included?",
    answer:
      "Not yet. Formivo is deliberately endpoint-first so it works with any HTML, React, Vue, PHP or plain HTTP client you already use. A builder is on the roadmap.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-foreground">
            {faq.question}
            <ChevronDown
              className="size-4 shrink-0 text-foreground-muted transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-2 max-w-3xl text-sm text-foreground-secondary">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
