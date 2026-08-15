import fs from "node:fs";
import path from "node:path";

import { FIX_TEMPLATES } from "./templates.mjs";

/**
 * @typedef {import("./score.mjs").CheckResult} CheckResult
 * @typedef {{ path: string; action: "created" | "skipped" | "would-create"; reason?: string }} FixResult
 */

/**
 * @param {string} root
 * @param {CheckResult[]} checks
 * @param {{ dryRun?: boolean }} options
 * @returns {FixResult[]}
 */
export function applyFixes(root, checks, options = {}) {
  const { dryRun = false } = options;
  /** @type {FixResult[]} */
  const results = [];

  for (const check of checks) {
    if (check.status === "pass" || !check.fixId) {
      continue;
    }

    const template = FIX_TEMPLATES[check.fixId];
    if (!template) {
      continue;
    }

    const target = path.join(root, template.path);
    if (fs.existsSync(target)) {
      results.push({
        path: template.path,
        action: "skipped",
        reason: "already exists",
      });
      continue;
    }

    if (dryRun) {
      results.push({ path: template.path, action: "would-create" });
      continue;
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, template.content, "utf8");
    results.push({ path: template.path, action: "created" });
  }

  return results;
}

/**
 * @param {FixResult[]} results
 * @returns {string}
 */
export function formatFixResults(results) {
  if (results.length === 0) {
    return "No auto-fixes available — repo looks healthy or files already exist.";
  }

  const lines = [];
  for (const r of results) {
    if (r.action === "created") {
      lines.push(`+ created ${r.path}`);
    } else if (r.action === "would-create") {
      lines.push(`  would create ${r.path}`);
    } else {
      lines.push(`  skipped ${r.path} (${r.reason ?? "unchanged"})`);
    }
  }
  return lines.join("\n");
}
