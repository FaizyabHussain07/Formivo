export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail fast on malformed configuration. Providers left unset are allowed and surface
    // an explicit "not configured" state at their service boundary instead.
    const { getServerEnv } = await import("@/lib/env/server");
    getServerEnv();
  }
}
