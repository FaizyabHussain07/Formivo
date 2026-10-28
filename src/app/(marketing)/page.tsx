import { ArrowRight, Inbox, Lock, Users } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Inbox,
    title: "One endpoint per form",
    description: "Point any HTML form at a Formivo endpoint. Submissions are validated and stored.",
  },
  {
    icon: Lock,
    title: "Secure by default",
    description: "Ownership checks, rate limits, and spam protection on every submission.",
  },
  {
    icon: Users,
    title: "Read-only client access",
    description: "Share specific forms with clients without exposing the rest of your account.",
  },
];

const snippet = `<form action="https://formivo.faizyab.me/api/f/YOUR_ENDPOINT" method="POST">
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>`;

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              The form backend for developers who ship for clients.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-foreground-secondary">{siteConfig.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup" size="lg">
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/docs" size="lg" variant="secondary">
                Read the docs
              </ButtonLink>
            </div>
          </div>
          <figure className="min-w-0 rounded-lg border border-border bg-foreground p-5 shadow-sm">
            <figcaption className="mb-3 font-mono text-xs text-foreground-muted">
              index.html
            </figcaption>
            <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-background">
              <code>{snippet}</code>
            </pre>
          </figure>
        </Container>
      </section>
      <section aria-labelledby="features-heading">
        <Container className="py-16 sm:py-20">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
            Everything after the submit button
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Card className="h-full">
                  <CardHeader>
                    <Icon className="mb-2 size-5 text-accent" aria-hidden="true" />
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{description}</CardDescription>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
