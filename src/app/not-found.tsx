import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center focus:outline-none">
        <Container className="py-24 text-center">
          <p className="font-mono text-sm text-foreground-muted">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-3 text-foreground-secondary">
            The page you requested does not exist or has moved.
          </p>
          <ButtonLink href="/" variant="secondary" className="mt-8">
            Back to home
          </ButtonLink>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
