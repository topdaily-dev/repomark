import path from "node:path";

import { buildFixSuggestions, runChecks } from "./checks.mjs";
import { applyFixes, formatFixResults } from "./fix.mjs";
import { parseFlags } from "./flags.mjs";
import { computeScore, formatReport } from "./score.mjs";

const HELP = `repomark — README / OSS repo health checker

Usage:
  repomark check [dir] [--min N] [--json]
  repomark fix [dir] [--dry-run] [--json]
  repomark --help

Commands:
  check     Score repo health (default command if omitted with a path)
  fix       Create missing SECURITY.md, CONTRIBUTING.md, LICENSE, etc.

Flags:
  --min N     Fail (exit 1) if score is below N (default: 70)
  --json      Emit machine-readable JSON
  --dry-run   Preview fixes without writing files

Examples:
  repomark check .
  repomark check ./my-oss --min 80
  repomark fix . --dry-run
  repomark fix .

Missing badges? Pair with badgekit:
  npx @topdaily-dev/badgekit row ci npm license --owner OWNER --repo REPO --npm PACKAGE

CI integration:
  uses: topdaily-dev/repomark-action@v1
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
    const dryRun = Boolean(options["dry-run"]);
    const checks = runChecks(dir);
    const fixResults = applyFixes(dir, checks, { dryRun });
    const suggestions = buildFixSuggestions(checks);

    if (options.json) {
      console.log(
        JSON.stringify({ dir, dryRun, fixes: fixResults, suggestions }, null, 2),
      );
    } else {
      console.log(formatFixResults(fixResults));
      if (suggestions.length > 0) {
        console.log("\nManual follow-ups:");
        for (const s of suggestions) console.log(`- ${s}`);
      }
      console.log(
        "\nTip: generate badge rows with npx @topdaily-dev/badgekit row …",
      );
    }
    return 0;
  }

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
      console.log("Run: repomark fix . --dry-run");
    } else {
      console.log(`Meets --min ${min}.`);
    }
  }

  return score < min ? 1 : 0;
}
