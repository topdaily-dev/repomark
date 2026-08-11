import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildFixSuggestions, runChecks } from "./checks.mjs";
import { parseFlags } from "./flags.mjs";
import { computeScore, formatReport } from "./score.mjs";

/**
 * @param {Record<string, string>} files
 */
function withTempRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repomark-"));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

describe("parseFlags", () => {
  it("parses boolean and string flags", () => {
    const parsed = parseFlags([".", "--json", "--min", "80", "--dry-run"]);
    assert.equal(parsed.positional[0], ".");
    assert.equal(parsed.options.json, true);
    assert.equal(parsed.options.min, "80");
    assert.equal(parsed.options["dry-run"], true);
  });
});

describe("computeScore", () => {
  it("scores pass/warn/fail weights", () => {
    const { score } = computeScore([
      {
        id: "a",
        title: "A",
        status: "pass",
        message: "",
        weight: 50,
      },
      {
        id: "b",
        title: "B",
        status: "warn",
        message: "",
        weight: 50,
      },
    ]);
    assert.equal(score, 75);
  });
});

describe("formatReport", () => {
  it("includes score and suggested fixes", () => {
    const text = formatReport(
      [
        {
          id: "license",
          title: "License",
          status: "fail",
          message: "missing",
          weight: 10,
          fix: "Add LICENSE",
        },
      ],
      40,
    );
    assert.match(text, /score: 40\/100/);
    assert.match(text, /\[FAIL\] License/);
    assert.match(text, /Add LICENSE/);
  });
});

describe("runChecks", () => {
  it("fails empty directory hard on README and license", () => {
    const dir = withTempRepo({});
    const checks = runChecks(dir);
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
    assert.equal(byId.readme.status, "fail");
    assert.equal(byId.license.status, "fail");
  });

  it("passes a healthy OSS layout", () => {
    const dir = withTempRepo({
      "README.md":
        "# Demo\n\nDemo is a sample CLI for testing repo health checks with enough text.\n\n[![CI](https://img.shields.io/badge/ci-passing-brightgreen)](https://example.com)\n\n## Contributing\n\nPRs welcome.\n",
      LICENSE: "MIT",
      "CONTRIBUTING.md": "# Contributing\n",
      "SECURITY.md": "# Security\nReport to security@example.com\n",
      "package.json": JSON.stringify({
        name: "demo",
        description: "demo package",
        license: "MIT",
        repository: { type: "git", url: "https://github.com/acme/demo.git" },
        engines: { node: ">=20" },
      }),
      ".github/workflows/ci.yml": "name: CI\non: push\njobs: {}\n",
      ".github/ISSUE_TEMPLATE/bug.md": "---\nname: Bug\n---\n",
    });
    const checks = runChecks(dir);
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
    assert.equal(byId.readme.status, "pass");
    assert.equal(byId.badges.status, "pass");
    assert.equal(byId.license.status, "pass");
    assert.equal(byId.contributing.status, "pass");
    assert.equal(byId.security.status, "pass");
    assert.equal(byId["package-json"].status, "pass");
    assert.equal(byId.ci.status, "pass");
    assert.equal(byId["issue-templates"].status, "pass");
    const { score } = computeScore(checks);
    assert.ok(score >= 90, `expected high score, got ${score}`);
  });

  it("suggests badgekit when badges missing", () => {
    const dir = withTempRepo({
      "README.md":
        "# Demo\n\nA short description that is long enough to pass the description check for tests.\n",
      LICENSE: "MIT",
    });
    const checks = runChecks(dir);
    const badges = checks.find((c) => c.id === "badges");
    assert.equal(badges?.status, "warn");
    assert.match(String(badges?.fix), /badgekit/);
    const suggestions = buildFixSuggestions(checks);
    assert.ok(suggestions.some((s) => s.includes("badgekit")));
  });
});
