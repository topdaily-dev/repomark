import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { runChecks } from "./checks.mjs";
import { computeScore } from "./score.mjs";
import { applyFixes, formatFixResults } from "./fix.mjs";

/**
 * @param {Record<string, string>} files
 */
function withTempRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repomark-fix-"));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

describe("applyFixes", () => {
  it("creates missing policy files", () => {
    const dir = withTempRepo({
      "README.md": "# Demo\n\nEnough description text for the readme check to pass easily.\n",
    });
    const checks = runChecks(dir);
    const results = applyFixes(dir, checks, { dryRun: false });
    assert.ok(results.some((r) => r.path === "LICENSE" && r.action === "created"));
    assert.ok(results.some((r) => r.path === "SECURITY.md" && r.action === "created"));
    assert.equal(fs.existsSync(path.join(dir, "LICENSE")), true);
  });

  it("dry-run does not write files", () => {
    const dir = withTempRepo({});
    const checks = runChecks(dir);
    const results = applyFixes(dir, checks, { dryRun: true });
    assert.ok(results.some((r) => r.action === "would-create"));
    assert.equal(fs.existsSync(path.join(dir, "LICENSE")), false);
  });

  it("skips existing files", () => {
    const dir = withTempRepo({ LICENSE: "custom" });
    const results = applyFixes(
      dir,
      [
        {
          id: "license",
          title: "License",
          status: "fail",
          message: "missing",
          weight: 15,
          fixId: "license",
        },
      ],
      { dryRun: false },
    );
    assert.ok(results.some((r) => r.path === "LICENSE" && r.action === "skipped"));
    assert.equal(fs.readFileSync(path.join(dir, "LICENSE"), "utf8"), "custom");
  });

  it("formats fix output", () => {
    const text = formatFixResults([
      { path: "LICENSE", action: "created" },
      { path: "SECURITY.md", action: "would-create" },
    ]);
    assert.match(text, /created LICENSE/);
    assert.match(text, /would create SECURITY.md/);
  });
});

describe("fixture repos", () => {
  const fixturesRoot = path.resolve("test/fixtures");

  it("scores minimal fixture low", () => {
    const dir = path.join(fixturesRoot, "minimal");
    const checks = runChecks(dir);
    const { score } = computeScore(checks);
    assert.ok(score < 70, `expected low score, got ${score}`);
  });

  it("scores healthy fixture high", () => {
    const dir = path.join(fixturesRoot, "healthy");
    const checks = runChecks(dir);
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
    assert.equal(byId.readme.status, "pass");
    assert.equal(byId.license.status, "pass");
    assert.equal(byId["code-of-conduct"].status, "pass");
    assert.equal(byId.dependabot.status, "pass");
  });
});
