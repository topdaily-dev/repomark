import path from "node:path";

import { buildFixSuggestions, runChecks } from "./checks.mjs";
import { parseFlags } from "./flags.mjs";
import { computeScore, formatReport } from "./score.mjs";

const HELP = `repomark — README / OSS repo health checker

Usage:
  repomark check [dir] [--min N] [--json]
  repomark fix [dir] [--dry-run]
  repomark --help

Commands:
  check     Score repo health (default command if omitted with a path)
  fix       Print suggested fixes (dry-run only in v0.1 — never writes files)

Flags:
  --min N     Fail (exit 1) if score is below N (default: 70)
  --json      Emit machine-readable JSON
  --dry-run   Required for fix in v0.1 (explicit no-write mode)

Examples:
  repomark check .
  repomark check ./my-oss --min 80
  repomark check . --json
  repomark fix . --dry-run

Missing badges? Pair with badgekit:
  npx @topdaily-dev/badgekit row ci npm license --owner OWNER --repo REPO --npm PACKAGE
`;

/**
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
export async function runCli(argv) {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    console.log(HELP);
    return 0;
  }

  let command = argv[0];
  let rest = argv.slice(1);

  if (command !== "check" && command !== "fix") {
    // Allow `repomark .` as shorthand for check
    if (command.startsWith("-") || command.includes("/") || command === ".") {
      rest = argv;
      command = "check";
    } else {
      throw new Error(`Unknown command: ${command}\n\n${HELP}`);
    }
  }

  const { options, positional } = parseFlags(rest);
  const dir = path.resolve(positional[0] || ".");

  if (command === "fix") {
    if (!options["dry-run"]) {
      throw new Error(
        "fix currently only supports --dry-run (no file writes in v0.1).\nRun: repomark fix --dry-run",
      );
    }
    const checks = runChecks(dir);
    const suggestions = buildFixSuggestions(checks);
    if (options.json) {
      console.log(JSON.stringify({ dir, suggestions }, null, 2));
    } else if (suggestions.length === 0) {
      console.log("No fixes suggested — repo looks healthy.");
    } else {
      console.log(`Suggested fixes for ${dir}:\n`);
      for (const s of suggestions) console.log(`- ${s}`);
      console.log(
        "\nTip: generate badge rows with npx @topdaily-dev/badgekit row …",
      );
    }
    return 0;
  }

  // check
  const minRaw = options.min;
  const min =
    minRaw === undefined || minRaw === true ? 70 : Number.parseInt(String(minRaw), 10);
  if (Number.isNaN(min) || min < 0 || min > 100) {
    throw new Error("--min must be a number between 0 and 100");
  }

  const checks = runChecks(dir);
  const { score } = computeScore(checks);

  if (options.json) {
    console.log(JSON.stringify({ dir, score, min, checks }, null, 2));
  } else {
    console.log(formatReport(checks, score));
    console.log("");
    if (score < min) {
      console.log(`Below --min ${min} (score ${score}).`);
    } else {
      console.log(`Meets --min ${min}.`);
    }
  }

  return score < min ? 1 : 0;
}
