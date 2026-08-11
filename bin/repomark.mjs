#!/usr/bin/env node

import { runCli } from "../lib/cli.mjs";

try {
  const code = await runCli(process.argv.slice(2));
  process.exitCode = typeof code === "number" ? code : 0;
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
