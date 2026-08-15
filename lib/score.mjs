/**
 * @typedef {"pass" | "warn" | "fail"} CheckStatus
 * @typedef {{ id: string, title: string, status: CheckStatus, message: string, weight: number, fix?: string, fixId?: string }} CheckResult
 */

/**
 * @param {CheckResult[]} checks
 * @returns {{ score: number, max: number, earned: number }}
 */
export function computeScore(checks) {
  const max = checks.reduce((sum, c) => sum + c.weight, 0);
  let earned = 0;
  for (const c of checks) {
    if (c.status === "pass") earned += c.weight;
    else if (c.status === "warn") earned += c.weight * 0.5;
  }
  const score = max === 0 ? 0 : Math.round((earned / max) * 100);
  return { score, max, earned };
}

/**
 * @param {CheckResult[]} checks
 * @param {number} score
 * @returns {string}
 */
export function formatReport(checks, score) {
  const lines = [`repomark score: ${score}/100`, ""];
  for (const c of checks) {
    const icon =
      c.status === "pass" ? "PASS" : c.status === "warn" ? "WARN" : "FAIL";
    lines.push(`[${icon}] ${c.title}: ${c.message}`);
  }
  const fixes = checks.filter((c) => c.status !== "pass" && c.fix);
  if (fixes.length > 0) {
    lines.push("", "Suggested fixes:");
    for (const c of fixes) {
      lines.push(`- ${c.fix}`);
    }
  }
  return lines.join("\n");
}
