import { Alert } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";

export function SecretReveal({ secret }: { secret: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Alert tone="warning" title="Copy this secret now">
        This is the only time Formivo shows this secret. Store it on your server as an environment
        variable — never in client-side JavaScript, a repository, or a public page.
      </Alert>
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between">
        <code className="min-w-0 overflow-x-auto font-mono text-xs break-all text-foreground sm:text-sm">
          {secret}
        </code>
        <CopyButton value={secret} label="Copy secret" />
      </div>
    </div>
  );
}
