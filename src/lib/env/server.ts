import "server-only";

import { parseServerEnv, type ServerEnv } from "./schema";

let cached: ServerEnv | undefined;

/** Server-only configuration, including secrets. Importing this from client code fails the build. */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
